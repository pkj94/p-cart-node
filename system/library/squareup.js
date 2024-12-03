const uniqid = require('locutus/php/misc/uniqid');

module.exports = class Squareup {
    constructor(registry) {
        this.session = registry.get('session');
        this.url = registry.get('url');
        this.config = registry.get('config');
        this.log = registry.get('log');
        this.customer = registry.get('customer');
        this.currency = registry.get('currency');
        this.registry = registry;
        this.API_URL = 'https://connect.squareup.com';
        this.API_VERSION = 'v2';
        this.ENDPOINT_ADD_CARD = 'customers/%s/cards';
        this.ENDPOINT_AUTH = 'oauth2/authorize';
        this.ENDPOINT_CAPTURE_TRANSACTION = 'locations/%s/transactions/%s/capture';
        this.ENDPOINT_CUSTOMERS = 'customers';
        this.ENDPOINT_DELETE_CARD = 'customers/%s/cards/%s';
        this.ENDPOINT_GET_TRANSACTION = 'locations/%s/transactions/%s';
        this.ENDPOINT_LOCATIONS = 'locations';
        this.ENDPOINT_REFRESH_TOKEN = 'oauth2/clients/%s/access-token/renew';
        this.ENDPOINT_REFUND_TRANSACTION = 'locations/%s/transactions/%s/refund';
        this.ENDPOINT_TOKEN = 'oauth2/token';
        this.ENDPOINT_TRANSACTIONS = 'locations/%s/transactions';
        this.ENDPOINT_VOID_TRANSACTION = 'locations/%s/transactions/%s/void';
        this.PAYMENT_FORM_URL = 'https://js.squareup.com/v2/paymentform';
        this.SCOPE = 'MERCHANT_PROFILE_READ PAYMENTS_READ SETTLEMENTS_READ CUSTOMERS_READ CUSTOMERS_WRITE';
        this.VIEW_TRANSACTION_URL = 'https://squareup.com/dashboard/sales/transactions/%s/by-unit/%s';
        this.SQUARE_INTEGRATION_ID = 'sqi_65a5ac54459940e3600a8561829fd970';
    }


    async api(requestData) {
        let url = `https://${this.API_URL}`;

        if (!requestData.no_version) {
            url += `/${this.API_VERSION}`;
        }

        url += `/${requestData.endpoint}`;

        const headers = {};

        if (requestData.content_type) {
            headers['Content-Type'] = requestData.content_type;
        } else {
            headers['Content-Type'] = 'application/json';
        }

        if (requestData.auth_type) {
            let token;
            if (!requestData.token) {
                if (this.config.payment_squareup_enable_sandbox) {
                    token = this.config.payment_squareup_sandbox_token;
                } else {
                    token = this.config.payment_squareup_access_token;
                }
            } else {
                token = requestData.token;
            }
            headers['Authorization'] = `${requestData.auth_type} ${token}`;
        }

        if (requestData.headers) {
            Object.assign(headers, requestData.headers);
        }

        let params = null;
        if (requestData.parameters && Array.isArray(requestData.parameters) && requestData.parameters.length) {
            params = await this.encodeParameters(requestData.parameters, headers['Content-Type']);
        }

        try {
            const response = await require('axios')({
                method: requestData.method,
                url,
                headers,
                data: params,
                params: requestData.method === 'GET' && params ? params : null,
                timeout: 15000 // 15 seconds timeout
            });

            await this.debug('SQUAREUP RESULT:', response.data);

            if (response.data.errors) {
                throw new Error(`Squareup API Error: ${response.data.errors}`);
            } else {
                return response.data;
            }
        } catch (error) {
            await this.debug('Squareup API Axios Error:', error.message);
            throw new Error(`CURL error: ${error.message}`);
        }
    }


    async verifyToken(access_token) {
        try {
            let request_data = {
                'method': 'GET',
                'endpoint': this.ENDPOINT_LOCATIONS,
                'auth_type': 'Bearer',
                'token': access_token
            };

            await this.api(request_data);
        } catch (e) {
            return false;
            // In case some other error occurred
            // throw e;
        }

        return true;
    }

    async authLink(client_id) {
        let state = await this.authState();

        let redirect_uri = (await this.url.link('extension/payment/squareup/oauth_callback', 'user_token=' + this.session.data['user_token'], true)).replaceAll('&amp;', '&');

        this.session.data['payment_squareup_oauth_redirect'] = redirect_uri;

        let params = {
            'client_id': client_id,
            'response_type': 'code',
            'scope': this.SCOPE,
            'locale': 'en-US',
            'session': 'false',
            'state': state,
            'redirect_uri': redirect_uri
        };
        await this.session.save(this.session.data);
        return this.API_URL + '/' + this.ENDPOINT_AUTH + '?' + http_build_query(params);
    }

    async fetchLocations(access_token, first_location_id) {
        let request_data = {
            'method': 'GET',
            'endpoint': this.ENDPOINT_LOCATIONS,
            'auth_type': 'Bearer',
            'token': access_token
        };

        const api_result = await this.api(request_data);

        const locations = api_result['locations'].filter(a => this.filterLocation(a));

        if (!locations.length) {
            let first_location = locations[0];
            first_location_id = first_location['id'];
        } else {
            first_location_id = null;
        }

        return locations;
    }

    async exchangeCodeForAccessToken(code) {
        let request_data = {
            'method': 'POST',
            'endpoint': this.ENDPOINT_TOKEN,
            'no_version': true,
            'parameters': {
                'client_id': this.config.get('payment_squareup_client_id'),
                'client_secret': this.config.get('payment_squareup_client_secret'),
                'redirect_uri': this.session.data['payment_squareup_oauth_redirect'],
                'code': code
            }
        };

        return await this.api(request_data);
    }

    async debug(text) {
        if (this.config.get('payment_squareup_debug')) {
            await this.log.write(text);
        }
    }

    async refreshToken() {
        let request_data = {
            'method': 'POST',
            'endpoint': sprintf(this.ENDPOINT_REFRESH_TOKEN, this.config.get('payment_squareup_client_id')),
            'no_version': true,
            'auth_type': 'Client',
            'token': this.config.get('payment_squareup_client_secret'),
            'parameters': {
                'access_token': this.config.get('payment_squareup_access_token')
            }
        };

        return await this.api(request_data);
    }

    async addCard(square_customer_id, card_data) {
        let request_data = {
            'method': 'POST',
            'endpoint': sprintf(this.ENDPOINT_ADD_CARD, square_customer_id),
            'auth_type': 'Bearer',
            'parameters': card_data
        };

        const result = await this.api(request_data);

        return {
            'id': result['card']['id'],
            'card_brand': result['card']['card_brand'],
            'last_4': result['card']['last_4']
        };
    }

    async deleteCard(square_customer_id, card) {
        let request_data = {
            'method': 'DELETE',
            'endpoint': sprintf(this.ENDPOINT_DELETE_CARD, square_customer_id, card),
            'auth_type': 'Bearer'
        };

        return this.api(request_data);
    }

    async addLoggedInCustomer() {
        let request_data = {
            'method': 'POST',
            'endpoint': this.ENDPOINT_CUSTOMERS,
            'auth_type': 'Bearer',
            'parameters': {
                'given_name': this.customer.getFirstName(),
                'family_name': this.customer.getLastName(),
                'email_address': this.customer.getEmail(),
                'phone_number': this.customer.getTelephone(),
                'reference_id': this.customer.getId()
            }
        };

        const result = await this.api(request_data);

        return {
            'customer_id': await this.customer.getId(),
            'sandbox': this.config.get('payment_squareup_enable_sandbox'),
            'square_customer_id': result['customer']['id']
        };
    }

    async addTransaction(data) {
        let location_id = this.config.get('payment_squareup_location_id');
        if (this.config.get('payment_squareup_enable_sandbox')) {
            location_id = this.config.get('payment_squareup_sandbox_location_id');
        }

        let request_data = {
            'method': 'POST',
            'endpoint': sprintf(this.ENDPOINT_TRANSACTIONS, location_id),
            'auth_type': 'Bearer',
            'parameters': data
        };

        const result = await this.api(request_data);

        return result['transaction'];
    }

    async getTransaction(location_id, transaction_id) {
        let request_data = {
            'method': 'GET',
            'endpoint': sprintf(this.ENDPOINT_GET_TRANSACTION, location_id, transaction_id),
            'auth_type': 'Bearer'
        };

        const result = await this.api(request_data);

        return result['transaction'];
    }

    async captureTransaction(location_id, transaction_id) {
        let request_data = {
            'method': 'POST',
            'endpoint': sprintf(this.ENDPOINT_CAPTURE_TRANSACTION, location_id, transaction_id),
            'auth_type': 'Bearer'
        };

        await this.api(request_data);

        return await this.getTransaction(location_id, transaction_id);
    }

    async voidTransaction(location_id, transaction_id) {
        let request_data = {
            'method': 'POST',
            'endpoint': sprintf(this.ENDPOINT_VOID_TRANSACTION, location_id, transaction_id),
            'auth_type': 'Bearer'
        };

        await this.api(request_data);

        return await this.getTransaction(location_id, transaction_id);
    }

    async refundTransaction(location_id, transaction_id, reason, amount, currency, tender_id) {
        let request_data = {
            'method': 'POST',
            'endpoint': sprintf(this.ENDPOINT_REFUND_TRANSACTION, location_id, transaction_id),
            'auth_type': 'Bearer',
            'parameters': {
                'idempotency_key': uniqid(),
                'tender_id': tender_id,
                'reason': reason,
                'amount_money': {
                    'amount': await this.lowestDenomination(amount, currency),
                    'currency': currency
                }
            }
        };

        await this.api(request_data);

        return await this.getTransaction(location_id, transaction_id);
    }

    async lowestDenomination(value, currency) {
        let power = this.currency.getDecimalPlace(currency);

        value = parseInt(value);

        return parseInt(value * Math.pow(10, power));
    }

    async standardDenomination(value, currency) {
        let power = this.currency.getDecimalPlace(currency);

        value = parseInt(value);
        return parseFloat(value / Math.pow(10, power));
    }

    async filterLocation(location) {
        if (!(location['capabilities'].length)) {
            return false;
        }

        return location['capabilities'].includes('CREDIT_CARD_PROCESSING');
    }

    async encodeParameters(params, content_type) {
        switch (content_type) {
            case 'application/json':
                return params;
            case 'application/x-www-form-urlencoded':
                return http_build_query(params);
            default:
            case 'multipart/form-data':
                // curl will handle the params as multipart form data if we just leave it as an array
                return params;
        }
    }

    async authState() {
        if (!this.session.data['payment_squareup_oauth_state']) {
            this.session.data['payment_squareup_oauth_state'] = crypto.randomBytes(32).toString('hex');
        }
        await this.session.save(this.session.data);
        return this.session.data['payment_squareup_oauth_state'];
    }
}