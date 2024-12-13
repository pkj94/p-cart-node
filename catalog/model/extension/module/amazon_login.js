const uniqid = require("locutus/php/misc/uniqid");
const { del } = require("request");

module.exports = class ModelExtensionModuleAmazonLogin extends Model {
    LOG_FILENAME = "amazon_login.log";
    URL_PROFILE = "https://%s/user/profile";
    URL_TOKENINFO = "https://%s/auth/o2/tokeninfo?access_token=%s";

    async fetchProfile(access_token) {
        let url = sprintf(this.URL_PROFILE, await this.getApiDomainName());

        const profile = await this.curlGet(url, [
            'Authorization: bearer ' + access_token
        ]);

        if ((profile.error)) {
            await this.debugLog("ERROR", this.language.get('error_login'));

            throw new Error(this.language.get('error_login'));
        }

        const full_name = profile.name.split(' ');
        profile.first_name = full_name.shift();
        profile.last_name = full_name.join(' ');

        return profile;
    }

    async verifyAccessToken(access_token) {
        let url = sprintf(this.URL_TOKENINFO, await this.getApiDomainName(), encodeURIComponent(access_token));

        const token = await this.curlGet(url);

        if (!(token.aud) || token.aud != this.config.get('payment_amazon_login_pay_client_id')) {
            await this.debugLog("ERROR", this.language.get('error_login'));

            throw new Error(this.language.get('error_login'));
        }

        return true;
    }

    async loginProfile(amazon_profile) {
        this.load.model('account/address', this);
        this.load.model('account/customer', this);
        this.load.model('account/customer_group', this);

        const customer_info = await this.model_account_customer.getCustomerByEmail(amazon_profile.email);

        // Create non-existing customer
        if (!(customer_info.customer_id)) {
            data = {
                'customer_group_id': this.config.get('config_customer_group_id'),
                'firstname': amazon_profile.first_name,
                'lastname': amazon_profile.last_name,
                'email': amazon_profile.email,
                'telephone': '0000000',
                'password': uniqid(Math.random(), true)
            };

            const customer_id = await this.model_account_customer.addCustomer(data);

            const customer_info = await this.model_account_customer.getCustomer(customer_id);

            await this.debugLog("CREATED_CUSTOMER", customer_info);
        }

        // Customer is not logged in. Do a forced login.
        if (!await this.customer.isLogged()) {
            // If forced login fails, throw an exception
            await this.forceLoginCustomer(customer_info);

            await this.debugLog("LOGGED_IN", customer_info);
        }

        // Set shipping and payment addresses for tax calculation
        if (this.config.get('config_tax_customer') == 'payment') {
            const payment_address = await this.model_account_address.getAddress(customer_info['customer_id']);

            if (payment_address) {
                this.session.data['payment_address'] = payment_address;
            }
        }

        if (this.config.get('config_tax_customer') == 'shipping') {
            const shipping_address = await this.model_account_address.getAddress(customer_info['customer_id']);

            if (shipping_address) {
                this.session.data['shipping_address'] = shipping_address;
            }
        }

        // Return the used customer corresponding to amazon_profile. This may NOT be the same customer as the one who is currently logged in. This is acceptable.
        return customer_info;
    }

    async persistAddress(address) {
        if (!await this.customer.isLogged()) {
            return;
        }

        this.load.model('account/address', this);

        const addresses = await this.model_account_address.getAddresses();

        if (!await this.addressMatches(address, addresses)) {
            await this.model_account_address.addAddress(await this.customer.getId(), address);
        }
    }

    async addressMatches(new1, addresses) {
        for (let address of addresses) {
            if (this.addressMatch(new1, address, Object.keys(address))) {
                return true;
            }
        }

        return false;
    }

    async addressMatch(a1, a2, keys) {
        // Remove 'custom_field' from keys
        const index = keys.indexOf('custom_field');
        if (index > -1) {
            keys.splice(index, 1);
        }

        // Extract values for the specified keys
        const filterKeys = (obj) => {
            return keys.reduce((filtered, key) => {
                if (obj.hasOwnProperty(key)) {
                    filtered[key] = obj[key];
                }
                return filtered;
            }, {});
        };

        const filteredA1 = filterKeys(a1);
        const filteredA2 = filterKeys(a2);

        // Compare the filtered objects
        for (const key in filteredA1) {
            if (filteredA1[key] !== filteredA2[key]) {
                return false;
            }
        }

        return Object.keys(filteredA1).length === Object.keys(filteredA2).length;
    }


    async forceLoginCustomer(customer_info) {
        if (!await this.customer.login(customer_info['email'], '', true)) {
            await this.model_account_customer.addLoginAttempt(customer_info['email']);

            if (!customer_info['status']) {
                await this.debugLog("ERROR", this.language.get('error_approved'));

                throw new Error(this.language.get('error_approved'));
            } else {
                await this.debugLog("ERROR", this.language.get('error_login'));

                throw new Error(this.language.get('error_login'));
            }
        } else {
            await this.model_account_customer.deleteLoginAttempts(customer_info['email']);

            if (this.config.get('config_customer_activity')) {
                this.load.model('account/activity', this);

                const activity_data = {
                    'customer_id': customer_info['customer_id'],
                    'name': customer_info['firstname'] + ' ' + customer_info['lastname']
                };

                await this.model_account_activity.addActivity('login', activity_data);
            }
        }
    }

    async getApiDomainName() {
        if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
            switch (this.config.get('payment_amazon_login_pay_payment_region')) {
                case "GBP":
                    return "api.sandbox.amazon.co.uk";
                case "EUR":
                    return "api.sandbox.amazon.de";
                default:
                    return "api.sandbox.amazon.com";
            }
        } else {
            switch (this.config.get('payment_amazon_login_pay_payment_region')) {
                case "GBP":
                    return "api.amazon.co.uk";
                case "EUR":
                    return "api.amazon.de";
                default:
                    return "api.amazon.com";
            }
        }
    }


    async curlGet(url, headers = []) {
        await this.debugLog("URL", url);

        try {
            const response = await require('axios').get(url, {
                headers: {
                    'User-Agent': this.request.headers['user-agent'],
                    ...headers.reduce((acc, header) => ({ ...acc, ...header }), {})
                },
                timeout: 30000,
                httpsAgent: new (require('https').Agent)({
                    port: 443,
                    rejectUnauthorized: true // Equivalent to CURLOPT_SSL_VERIFYPEER = true
                })
            });

            this.debugLog("SUCCESS", response.data);
            return response.data;
        } catch (error) {
            const debug = {
                status: error.response ? error.response.status : null,
                headers: error.response ? error.response.headers : null,
                data: error.response ? error.response.data : null,
                message: error.message
            };

            await this.debugLog("ERROR", debug);
            throw new Error(this.language.get('error_login'));
        }
    }


    async debugLog(type, data) {
        if (!this.config.get('payment_amazon_login_pay_debug')) {
            return;
        }
        let message
        if (Array.isArray(data)) {
            message = JSON.stringify(data);
        } else {
            message = data;
        }

        const log = new Log(this.LOG_FILENAME);

        await log.write(type + " --. " + message);

    }
}
