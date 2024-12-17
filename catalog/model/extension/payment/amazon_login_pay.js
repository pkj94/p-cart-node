const uksort = require("locutus/php/array/uksort");
const uniqid = require("locutus/php/misc/uniqid");
const http_build_query = require("locutus/php/url/http_build_query");
const { parseStringPromise } = require('xml2js');

module.exports = class ModelExtensionPaymentAmazonLoginPay extends Model {
    LOG_FILENAME = "amazon_pay.log";

    async getMethod() {
        // Do nothing, as Amazon Pay is a separate checkout flow, not a payment option in OpenCart.
    }

    async verifyOrder() {
        if (!(this.session.data['apalwa']['pay']['order'])) {
            this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/confirm', '', true));
        }
    }

    async verifyShipping() {
        if (!(this.session.data['apalwa']['pay']['shipping_method']) || !(this.session.data['apalwa']['pay']['address']) || !(this.session.data['shipping_method'])) {
            this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/address', '', true));
        }
    }

    async verifyCart() {
        if ((!await this.cart.hasProducts() && !(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
            await this.cartRedirect();
        }

        const products = await this.cart.getProducts();

        for (let product of products) {
            product_total = 0;

            for (let product_2 of products) {
                if (product_2['product_id'] == product['product_id']) {
                    product_total += product_2['quantity'];
                }
            }

            if (product['minimum'] > product_total) {
                await this.cartRedirect();
            }
        }
    }

    async verifyLogin() {
        // capital L in Amazon cookie name is required, do not alter for coding standards
        if (!(this.request.cookie['amazon_Login_state_cache']) || !(this.session.data['apalwa']['pay']['profile'])) {
            this.session.data['apalwa'] = this.session.data['apalwa'] || {};
            this.session.data['apalwa']['login'] = this.session.data['apalwa']['login'] || {};
            this.session.data['apalwa']['login']['error'] = this.language.get('error_login');

            this.response.setRedirect(await this.url.link('extension/module/amazon_login/error', '', true));
        }
    }

    async verifyTotal() {
        const set_minimum = this.config.get('payment_amazon_login_pay_minimum_total');

        const minimum = set_minimum > 0 ? set_minimum : 0.01;

        if (minimum > await this.cart.getSubTotal() || !(await this.isTotalPositive())) {
            await this.cartRedirect(sprintf(this.language.get('error_minimum'), this.currency.format(minimum, this.session.data['currency'])));
        }
    }

    async verifyReference() {
        if (!(this.session.data['apalwa']['pay']['order_reference_id'])) {
            await this.cartRedirect(this.language.get('error_process_order'));
        }
    }

    async verifyOrderSessionData() {
        const keys = [
            'profile',
            'address',
            'order_reference_id',
            'shipping_methods',
            'shipping_method'
        ];

        for (let key of keys) {
            if (!(this.session.data['apalwa']['pay'][key])) {
                throw await this.loggedException("Missing session data: " + key, this.language.get('error_process_order'));
            }
        }
    }

    async cartRedirect(message = null, return_value = false) {
        delete this.session.data['apalwa']['pay'];
        delete this.session.data['order_id'];

        if (message) {
            this.session.data['error'] = message;
        }
        await this.session.save(this.session.data);
        if (return_value) {
            return await this.url.link('checkout/cart', '', true);
        } else {
            this.response.setRedirect(await this.url.link('checkout/cart', '', true));
        }
    }

    async getTotals(total_data) {
        this.load.model('setting/extension', this);

        let results = await this.model_setting_extension.getExtensions('total');
        results = results.sort((a, b) => this.config.get('total_' + a['code'] + '_sort_order') - this.config.get('total_' + b['code'] + '_sort_order'));

        for (let result of results) {
            if (Number(this.config.get('total_' + result['code'] + '_status'))) {
                this.load.model('extension/total/' + result['code'], this);

                // We have to put the totals in an array so that they pass by reference.
                total_data = await this['model_extension_total_' + result['code']].getTotal(total_data);
            }
        }
        total_data['totals'] = total_data['totals'].map(a => {
            a.text = this.currency.format(value['value'], this.session.data['currency']);
            return a;
        }).sort((a, b) => a.sort_order - b.sort_order);
    }

    async isTotalPositive() {
        // Totals
        let totals = [];
        let taxes = await this.cart.getTaxes();
        let total = 0;

        // Because __call can not keep var references so we put them into an array.
        let total_data = {
            'totals': totals,
            'taxes': taxes,
            'total': total
        };

        total_data = await this.getTotals(total_data);
        total = total_data.total;
        return total > 0;
    }

    async makeOrder() {
        await this.verifyOrderSessionData();

        let totals = [];
        let taxes = await this.cart.getTaxes();
        let total = 0;

        // Because __call can not keep var references so we put them into an array.
        let total_data = {
            'totals': totals,
            'taxes': taxes,
            'total': total
        };

        total_data = await this.getTotals(total_data);
        totals = total_data.totals;
        total = total_data.total;
        taxes = total_data.taxes;
        const order_data = {};
        order_data['totals'] = totals;

        await this.load.language('checkout/checkout');

        order_data['invoice_prefix'] = this.config.get('config_invoice_prefix');
        order_data['store_id'] = this.config.get('config_store_id');
        order_data['store_name'] = this.config.get('config_name');

        if (order_data['store_id']) {
            order_data['store_url'] = this.config.get('config_url');
        } else {
            if (this.request.server['HTTPS']) {
                order_data['store_url'] = HTTPS_SERVER;
            } else {
                order_data['store_url'] = HTTP_SERVER;
            }
        }

        const profile = this.session.data['apalwa']['pay']['profile'];
        const address = this.session.data['apalwa']['pay']['address'];
        const shipping_method = this.session.data['apalwa']['pay']['shipping_method'];

        order_data['customer_id'] = (profile['customer_id']) ? profile['customer_id'] : 0;
        order_data['customer_group_id'] = profile['customer_group_id'];
        order_data['firstname'] = profile['firstname'];
        order_data['lastname'] = profile['lastname'];
        order_data['email'] = profile['email'];
        order_data['telephone'] = (address['telephone']) ? address['telephone'] : '';
        order_data['custom_field'] = {};

        // The payment address details are empty, and shall be provided later when the order gets authorized
        order_data['payment_firstname'] = ""; //address['firstname'];
        order_data['payment_lastname'] = ""; //address['lastname'];
        order_data['payment_company'] = ""; //address['company'];
        order_data['payment_company_id'] = ""; //address['company_id'];
        order_data['payment_tax_id'] = ""; //address['tax_id'];
        order_data['payment_address_1'] = ""; //address['address_1'];
        order_data['payment_address_2'] = ""; //address['address_2'];
        order_data['payment_city'] = ""; //address['city'];
        order_data['payment_postcode'] = ""; //address['postcode'];
        order_data['payment_zone'] = ""; //address['zone'];
        order_data['payment_zone_id'] = 0; //address['zone_id'];
        order_data['payment_country'] = ""; //address['country'];
        order_data['payment_country_id'] = 0; //address['country_id'];
        order_data['payment_address_format'] = ""; //address['address_format'];
        order_data['payment_custom_field'] = {};

        order_data['payment_method'] = this.language.get('text_lpa');
        order_data['payment_code'] = 'amazon_login_pay';

        order_data['shipping_firstname'] = address['firstname'];
        order_data['shipping_lastname'] = address['lastname'];
        order_data['shipping_company'] = address['company'];
        order_data['shipping_address_1'] = address['address_1'];
        order_data['shipping_address_2'] = address['address_2'];
        order_data['shipping_city'] = address['city'];
        order_data['shipping_postcode'] = address['postcode'];
        order_data['shipping_zone'] = address['zone'];
        order_data['shipping_zone_id'] = address['zone_id'];
        order_data['shipping_country'] = address['country'];
        order_data['shipping_country_id'] = address['country_id'];
        order_data['shipping_address_format'] = address['address_format'];
        order_data['shipping_method'] = this.session.data['apalwa']['pay']['shipping_method']['title'];

        if ((shipping_method['code'])) {
            order_data['shipping_code'] = shipping_method['code'];
        } else {
            order_data['shipping_code'] = '';
        }

        order_data['products'] = [];

        for (let product of await this.cart.getProducts()) {
            const option_data = [];

            for (let option of product['option']) {
                option_data.push({
                    'product_option_id': option['product_option_id'],
                    'product_option_value_id': option['product_option_value_id'],
                    'option_id': option['option_id'],
                    'option_value_id': option['option_value_id'],
                    'name': option['name'],
                    'value': option['value'],
                    'type': option['type']
                });
            }

            order_data['products'].push({
                'product_id': product['product_id'],
                'name': product['name'],
                'model': product['model'],
                'option': option_data,
                'download': product['download'],
                'quantity': product['quantity'],
                'subtract': product['subtract'],
                'price': product['price'],
                'text_price': this.currency.format(product['price'], this.session.data['currency']),
                'total': product['total'],
                'text_total': this.currency.format(product['total'], this.session.data['currency']),
                'tax': this.tax.getTax(product['price'], product['tax_class_id']),
                'reward': product['reward']
            });
        }

        // Gift Voucher
        order_data['vouchers'] = [];

        if ((this.session.data['vouchers'])) {
            for (let voucher of this.session.data['vouchers']) {
                order_data['vouchers'].push({
                    'description': voucher['description'],
                    'code': oc_token(10),
                    'to_name': voucher['to_name'],
                    'to_email': voucher['to_email'],
                    'from_name': voucher['from_name'],
                    'from_email': voucher['from_email'],
                    'voucher_theme_id': voucher['voucher_theme_id'],
                    'message': voucher['message'],
                    'amount': voucher['amount']
                });
            }
        }

        order_data['comment'] = (this.session.data['comment']) ? this.session.data['comment'] : '';
        order_data['total'] = total_data['total'];

        if ((this.request.cookie['tracking'])) {
            order_data['tracking'] = this.request.server.cookie['tracking'];

            const subtotal = await this.cart.getSubTotal();

            // Affiliate
            const affiliate_info = await this.model_account_customer.getAffiliateByTracking(this.request.cookie['tracking']);

            if (affiliate_info.customer_id) {
                order_data['affiliate_id'] = affiliate_info['customer_id'];
                order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
            } else {
                order_data['affiliate_id'] = 0;
                order_data['commission'] = 0;
            }

            // Marketing
            this.load.model('checkout/marketing', this);

            const marketing_info = await this.model_checkout_marketing.getMarketingByCode(this.request.cookie['tracking']);

            if (marketing_info.marketing_id) {
                order_data['marketing_id'] = marketing_info['marketing_id'];
            } else {
                order_data['marketing_id'] = 0;
            }
        } else {
            order_data['affiliate_id'] = 0;
            order_data['commission'] = 0;
            order_data['marketing_id'] = 0;
            order_data['tracking'] = '';
        }

        order_data['language_id'] = this.config.get('config_language_id');
        order_data['currency_id'] = this.currency.getId(this.session.data['currency']);
        order_data['currency_code'] = this.session.data['currency'];
        order_data['currency_value'] = this.currency.getValue(this.session.data['currency']);
        order_data['ip'] = this.request.server.headers['x-forwarded-for'] || (
            this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                this.request.server.socket.remoteAddress ||
                this.request.server.connection.socket.remoteAddress) : '');

        if ((this.request.server.headers['x-forwarded-for'] || this.request.server.connection.remoteAddress)) {
            order_data['forwarded_ip'] = (this.request.server.headers['x-forwarded-for'] || this.request.server.connection.remoteAddress);
        } else if ((this.request.server['HTTP_CLIENT_IP'])) {
            order_data['forwarded_ip'] = this.request.server['HTTP_CLIENT_IP'];
        } else {
            order_data['forwarded_ip'] = '';
        }

        if (useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source) {
            order_data['user_agent'] = useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source;
        } else {
            order_data['user_agent'] = '';
        }

        if ((this.request.server.headers['accept-language'])) {
            order_data['accept_language'] = this.request.server.headers['accept-language'];
        } else {
            order_data['accept_language'] = '';
        }

        return order_data;
    }

    async getWidgetJs() {
        let amazon_payment_js = '';
        if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
            if (this.config.get('payment_amazon_login_pay_payment_region') == 'GBP') {
                amazon_payment_js = 'https://static-eu.payments-amazon.com/OffAmazonPayments/uk/sandbox/lpa/js/Widgets.js';
            } else if (this.config.get('payment_amazon_login_pay_payment_region') == 'USD') {
                amazon_payment_js = 'https://static-na.payments-amazon.com/OffAmazonPayments/us/sandbox/js/Widgets.js';
            } else {
                amazon_payment_js = 'https://static-eu.payments-amazon.com/OffAmazonPayments/de/sandbox/lpa/js/Widgets.js';
            }
        } else {
            if (this.config.get('payment_amazon_login_pay_payment_region') == 'GBP') {
                amazon_payment_js = 'https://static-eu.payments-amazon.com/OffAmazonPayments/uk/lpa/js/Widgets.js';
            } else if (this.config.get('payment_amazon_login_pay_payment_region') == 'USD') {
                amazon_payment_js = 'https://static-na.payments-amazon.com/OffAmazonPayments/us/js/Widgets.js';
            } else {
                amazon_payment_js = 'https://static-eu.payments-amazon.com/OffAmazonPayments/de/lpa/js/Widgets.js';
            }
        }

        return amazon_payment_js + '?sellerId=' + this.config.get('payment_amazon_login_pay_merchant_id');
    }

    async submitOrderDetails(order_reference_id, order_id, currency_code, text_version) {
        this.load.model('checkout/order', this);

        const order_info = await this.model_checkout_order.getOrder(order_id);

        if (!(order_info.order_id)) {
            throw await this.loggedException("Order not found!", this.language.get('error_process_order'));
        }

        return await this.postCurl("SetOrderReferenceDetails", {
            'AmazonOrderReferenceId': order_reference_id,
            'OrderReferenceAttributes.OrderTotal.CurrencyCode': currency_code,
            'OrderReferenceAttributes.OrderTotal.Amount': this.currency.convert(order_info['total'], this.config.get('config_currency'), currency_code),
            'OrderReferenceAttributes.PlatformId': await this.getPlatformId(),
            'OrderReferenceAttributes.SellerOrderAttributes.SellerOrderId': order_id,
            'OrderReferenceAttributes.SellerOrderAttributes.StoreName': order_info['store_name'],
            'OrderReferenceAttributes.SellerOrderAttributes.CustomInformation': text_version
        });
    }

    async confirmOrder(order_reference_id) {
        await this.postCurl("ConfirmOrderReference", {
            'AmazonOrderReferenceId': order_reference_id,
            'SuccessUrl': await this.url.link('extension/payment/amazon_login_pay/mfa_success', '', true),
            'FailureUrl': await this.url.link('extension/payment/amazon_login_pay/mfa_failure', '', true)
            //  'AuthorizationAmount'
        });
    }

    async authorizeOrder(order) {
        const capture_now = this.config.get('payment_amazon_login_pay_mode') == 'payment';

        return (await this.postCurl("Authorize", {
            'AmazonOrderReferenceId': order.AmazonOrderReferenceId,
            'AuthorizationReferenceId': 'auth_' + uniqid(),
            'AuthorizationAmount.Amount': order.OrderTotal.Amount,
            'AuthorizationAmount.CurrencyCode': order.OrderTotal.CurrencyCode,
            'TransactionTimeout': 0,
            'CaptureNow': capture_now
        }))
            .ResponseBody
            .AuthorizeResult
            .AuthorizationDetails;
    }

    async fetchOrderId(order_reference_id) {
        return (await this.postCurl("GetOrderReferenceDetails", {
            'AmazonOrderReferenceId': order_reference_id
        }))
            .ResponseBody
            .GetOrderReferenceDetailsResult
            .OrderReferenceDetails
            .SellerOrderAttributes
            .SellerOrderId;
    }

    async fetchOrder(order_reference_id) {
        return (await this.postCurl("GetOrderReferenceDetails", {
            'AmazonOrderReferenceId': order_reference_id
        }))
            .ResponseBody
            .GetOrderReferenceDetailsResult
            .OrderReferenceDetails;
    }

    async captureOrder(amazon_authorization_id, total, currency) {
        return (await this.postCurl("Capture", {
            'AmazonAuthorizationId': amazon_authorization_id,
            'CaptureReferenceId': 'capture_' + uniqid(),
            'CaptureAmount.Amount': total,
            'CaptureAmount.CurrencyCode': currency
        }))
            .ResponseBody
            .CaptureResult
            .CaptureDetails;
    }

    async cancelOrder(order_reference_id, reason) {
        await this.postCurl("CancelOrderReference", {
            'AmazonOrderReferenceId': order_reference_id,
            'CancelationReason': reason
        });
    }

    async closeOrder(order_reference_id, reason) {
        await this.postCurl("CloseOrderReference", {
            'AmazonOrderReferenceId': order_reference_id,
            'ClosureReason': reason
        });
    }

    async isOrderInState(order_reference_id, states = []) {
        return states.includes(await this.fetchOrder(order_reference_id).OrderReferenceStatus.State);
    }

    async findOrAddOrder(order) {
        const order_id = order.SellerOrderAttributes.SellerOrderId;

        const order_reference_id = order.AmazonOrderReferenceId;

        const find_sql = "SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order` WHERE order_id=" + order_id + " AND amazon_order_reference_id='" + this.db.escape(order_reference_id) + "'";

        const find_result = await this.db.query(find_sql);

        if (find_result.num_rows > 0) {
            return find_result.row['amazon_login_pay_order_id'];
        }

        const insert = {
            'order_id': order_id,
            'amazon_order_reference_id': "'" + this.db.escape(order_reference_id) + "'",
            'amazon_authorization_id': "''",
            'free_shipping': this.isShippingFree(order_id),
            'date_added': "'" + date('Y-m-d H:i:s', new Date(order.CreationTimestamp)) + "'",
            'modified': "'" + date('Y-m-d H:i:s', strtotime(order.OrderReferenceStatus.LastUpdateTimestamp)) + "'",
            'currency_code': "'" + this.db.escape(order.OrderTotal.CurrencyCode) + "'",
            'total': order.OrderTotal.Amount
        };

        const row = [];

        for (let [key, value] of Object.entries(insert)) {
            row.push("`" + key + "`=" + value);
        }

        await this.db.query("INSERT INTO `" + DB_PREFIX + "amazon_login_pay_order` SET " + implode(',', row));

        return this.db.getLastId();
    }

    async getOrderByOrderId(order_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order` WHERE `order_id`=" + order_id;

        const result = await this.db.query(sql);

        if (result.num_rows > 0) {
            return result.row;
        }

        return null;
    }

    async addAuthorization(amazon_login_pay_order_id, authorization) {
        const capture_id = authorization.IdList.member;

        const type = authorization.CaptureNow == 'true' ? 'capture' : 'authorization';

        const amount = type == 'capture' ?
            authorization.CapturedAmount.Amount :
            authorization.AuthorizationAmount.Amount;

        const authorization_id = authorization.AmazonAuthorizationId;

        const transaction = {
            'amazon_login_pay_order_id': amazon_login_pay_order_id,
            'amazon_authorization_id': authorization_id,
            'amazon_capture_id': capture_id,
            'amazon_refund_id': '',
            'date_added': date('Y-m-d H:i:s', new Date(authorization.CreationTimestamp)),
            'type': type,
            'status': authorization.AuthorizationStatus.State,
            'amount': amount
        };

        await this.addTransaction(transaction);

        const capture_status = type == 'capture';

        await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order` SET `amazon_authorization_id`='" + this.db.escape(authorization_id) + "' WHERE `amazon_login_pay_order_id`='" + this.db.escape(amazon_login_pay_order_id) + "'");

        await this.updateCapturedStatus(amazon_login_pay_order_id, capture_status);
    }

    async updateCapturedStatus(amazon_login_pay_order_id, status) {
        await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order` SET `capture_status`=" + status + " WHERE `amazon_login_pay_order_id`='" + this.db.escape(amazon_login_pay_order_id) + "'");
    }

    async findCapture(amazon_capture_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE amazon_capture_id='" + this.db.escape(amazon_capture_id) + "'";

        return (await this.db.query(sql)).num_rows > 0;
    }

    async addTransaction(data) {
        const insert = {
            'amazon_login_pay_order_id': data['amazon_login_pay_order_id'],
            'amazon_authorization_id': "'" + this.db.escape(data['amazon_authorization_id']) + "'",
            'amazon_capture_id': "'" + this.db.escape(data['amazon_capture_id']) + "'",
            'amazon_refund_id': "'" + this.db.escape(data['amazon_refund_id']) + "'",
            'date_added': "'" + this.db.escape(data['date_added']) + "'",
            'type': "'" + this.db.escape(data['type']) + "'",
            'status': "'" + this.db.escape(data['status']) + "'",
            'amount': data['amount']
        };

        const row = [];

        for (let [key, value] of Object.entries(insert)) {
            row.push("`" + key + "`=" + value);
        }

        await this.db.query("INSERT INTO `" + DB_PREFIX + "amazon_login_pay_order_transaction` SET " + implode(',', row));
    }

    async isShippingFree(order_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "order_total` WHERE order_id=" + order_id + " AND `value`=0.0000 AND `code`='shipping'";

        return (await this.db.query(sql)).num_rows > 0;
    }

    async getPlatformId() {
        if (this.config.get('payment_amazon_login_pay_payment_region') == 'USD') {
            return 'A3GK1RS09H3A7D';
        } else {
            return 'A3EIRX2USI2KJV';
        }
    }

    async parseIpnBody(json) {
        const data = this.parseJson(json);
        const message = this.parseJson(data.Message);
        let xml;
        try {
            xml = await xml2js.parseStringPromise(message.NotificationData);
        } catch (e) {
            await this.debugLog("ERROR", e.message);
            throw new Error(e.message);
        }
        return xml;
    }

    async parseJson(json) {
        let message;
        try {
            message = JSON.parse(json);
        }
        catch (error) {
            throw new Error("Error with message - content is not in JSON format. Error: " + error.message);
        }
        return message;
    }

    async updateStatus(amazon_id, type, status) {
        await this.db.query("UPDATE `" + DB_PREFIX + "amazon_login_pay_order_transaction` SET `status` = '" + this.db.escape(status) + "' WHERE `amazon_" + type + "_id` = '" + this.db.escape(amazon_id) + "' AND `type` = '" + this.db.escape(type) + "'");
    }
    async findOCOrderId(amazon_authorization_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order` WHERE amazon_order_reference_id='" + this.db.escape(amazon_authorization_id) + "'";
        result = await this.db.query(sql);
        if (result.num_rows > 0) {
            return result.row['order_id'];
        }
    }
    async findAOrderId(amazon_authorization_id) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "amazon_login_pay_order` WHERE amazon_order_reference_id='" + this.db.escape(amazon_authorization_id) + "'";
        result = await this.db.query(sql);
        if (result.num_rows > 0) {
            return result.row['amazon_login_pay_order_id'];
        }
    }
    async getTotalCaptured(amazon_login_pay_order_id) {
        const query = await this.db.query("SELECT SUM(`amount`) AS `total` FROM `" + DB_PREFIX + "amazon_login_pay_order_transaction` WHERE `amazon_login_pay_order_id` = '" + amazon_login_pay_order_id + "' AND (`type` = 'capture' OR `type` = 'refund') AND (`status` = 'Completed' OR `status` = 'Closed')");

        return query.row['total'];
    }

    async authorizationIpn(xml) {
        let status = xml.AuthorizationDetails.AuthorizationStatus.State;
        let amazon_authorization_id = xml.AuthorizationDetails.AmazonAuthorizationId;
        await this.updateStatus(amazon_authorization_id, 'authorization', status);
        if (status == 'Declined' || status == 'Closed') {
            await this.debugLog("NOTICE", status + ': ' + xml.AuthorizationDetails.AuthorizationStatus.ReasonCode);
        }
        return (status == 'Closed' && xml.AuthorizationDetails.AuthorizationStatus.ReasonCode == 'MaxCapturesProcessed');
    }

    async captureIpn(xml) {
        let status = xml.CaptureDetails.CaptureStatus.State;
        let amazon_capture_id = xml.CaptureDetails.AmazonCaptureId;
        await this.updateStatus(amazon_capture_id, 'capture', status);
        if (status == 'Declined' || status == 'Canceled' || status == 'Closed') {
            await this.debugLog("NOTICE", status + ': ' + xml.CaptureDetails.CaptureStatus.ReasonCode);
        }
    }

    async refundIpn(xml) {
        let status = xml.RefundDetails.RefundStatus.State;
        let amazon_refund_id = xml.RefundDetails.AmazonRefundId;
        await this.updateStatus(amazon_refund_id, 'refund', status);
        if (status == 'Declined') {
            await this.debugLog("NOTICE", status + ': ' + xml.RefundDetails.RefundStatus.ReasonCode);
        }
    }

    async updatePaymentAddress(order_id, amazon_address) {
        const address = await this.amazonAddressToOcAddress(amazon_address);

        const data = {
            'payment_firstname': "'" + this.db.escape(address['firstname']) + "'",
            'payment_lastname': "'" + this.db.escape(address['lastname']) + "'",
            'payment_company': "'" + this.db.escape(address['company']) + "'",
            'payment_address_1': "'" + this.db.escape(address['address_1']) + "'",
            'payment_address_2': "'" + this.db.escape(address['address_2']) + "'",
            'payment_city': "'" + this.db.escape(address['city']) + "'",
            'payment_postcode': "'" + this.db.escape(address['postcode']) + "'",
            'payment_zone': "'" + this.db.escape(address['zone']) + "'",
            'payment_zone_id': address['zone_id'],
            'payment_country': "'" + this.db.escape(address['country']) + "'",
            'payment_country_id': address['country_id'],
            'payment_address_format': "'" + this.db.escape(address['address_format']) + "'",
            'payment_custom_field': "'{}'"
        };

        const update = [];

        for (let [key, value] of Object.entries(data)) {
            update.push("`" + key + "`=" + value);
        }

        let sql = "UPDATE `" + DB_PREFIX + "order` SET " + update.join(",") + " WHERE `order_id`=" + order_id;

        await this.db.query(sql);
    }

    async amazonAddressToOcAddress(amazon_address, default_telephone = '0000000') {
        const full_name = amazon_address.Name.split(' ');
        amazon_address.FirstName = full_name.shift();
        amazon_address.LastName = full_name.join(' ');

        const lines = [amazon_address.AddressLine1, amazon_address.AddressLine2, amazon_address.AddressLine3];

        const address_line_1 = lines.shift();
        const address_line_2 = lines.join(' ');

        const country_info = await this.getCountryInfo(amazon_address);
        const zone_info = await this.getZoneInfo(amazon_address, country_info);

        return {
            'firstname': amazon_address.FirstName,
            'lastname': amazon_address.LastName,
            'company': '',
            'company_id': '',
            'tax_id': '',
            'city': amazon_address.City,
            'telephone': (amazon_address.Phone) ? amazon_address.Phone : default_telephone,
            'postcode': amazon_address.PostalCode,
            'country': country_info['country'],
            'country_id': country_info['country_id'],
            'zone': zone_info['name'],
            'zone_code': zone_info['code'],
            'zone_id': zone_info['zone_id'],
            'address_1': address_line_1,
            'address_2': address_line_2,
            'iso_code_2': country_info['iso_code_2'],
            'iso_code_3': country_info['iso_code_3'],
            'address_format': country_info['address_format']
        };
    }

    async getAddress(order_reference_id) {
        if (!(this.session.data['apalwa']['login']['access_token'])) {
            await this.debugLog("ERROR", this.language.get('error_shipping_methods'));

            throw new Error(this.language.get('error_shipping_methods'));
        }

        const result = await this.postCurl("GetOrderReferenceDetails", {
            'AmazonOrderReferenceId': order_reference_id,
            'AccessToken': this.session.data['apalwa']['login']['access_token']
        });

        const amazon_address = result
            .ResponseBody
            .GetOrderReferenceDetailsResult
            .OrderReferenceDetails
            .Destination
            .PhysicalDestination;

        const order_buyer = result
            .ResponseBody
            .GetOrderReferenceDetailsResult
            .OrderReferenceDetails
            .Buyer;

        const order_telephone = (order_buyer.Phone) ? order_buyer.Phone : '0000000';

        return await this.amazonAddressToOcAddress(amazon_address, order_telephone);
    }

    async getCountryInfo(amazon_address) {
        let sql = "SELECT * FROM `" + DB_PREFIX + "country` WHERE LOWER(`iso_code_2`)='" + this.db.escape(strtolower(amazon_address.CountryCode)) + "' AND status=1 LIMIT 1";

        const result = await this.db.query(sql);

        if (result.num_rows > 0) {
            return {
                'country_id': result.row['country_id'],
                'country': result.row['name'],
                'iso_code_2': result.row['iso_code_2'],
                'iso_code_3': result.row['iso_code_3'],
                'address_format': result.row['address_format']
            };
        }

        return {
            'country_id': 0,
            'country': '',
            'iso_code_2': '',
            'iso_code_3': '',
            'address_format': ''
        };
    }

    async getZoneInfo(amazon_address, country_info) {
        if ((amazon_address.StateOrRegion)) {
            let sql = "SELECT `zone_id`, `code`, `name` FROM `" + DB_PREFIX + "zone` WHERE (LOWER(`name`) LIKE '" + this.db.escape(strtolower(amazon_address.StateOrRegion)) + "' OR LOWER(`code`) LIKE '" + this.db.escape(strtolower(amazon_address.StateOrRegion)) + "') AND `country_id` = " + country_info['country_id'] + " LIMIT 1";

            const result = await this.db.query(sql);

            if (result.num_rows > 0) {
                return {
                    'zone_id': result.row['zone_id'],
                    'name': result.row['name'],
                    'code': result.row['code']
                };
            }
        }

        return {
            'zone_id': 0,
            'name': '',
            'code': ''
        };
    }

    async getCurlUrl() {
        if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
            if (this.config.get('payment_amazon_login_pay_payment_region') == 'USD') {
                return 'https://mws.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01/';
            } else {
                return 'https://mws-eu.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01/';
            }
        } else {
            if (this.config.get('payment_amazon_login_pay_payment_region') == 'USD') {
                return 'https://mws.amazonservices.com/OffAmazonPayments/2013-01-01/';
            } else {
                return 'https://mws-eu.amazonservices.com/OffAmazonPayments/2013-01-01/';
            }
        }
    }

    async encodeURIComponent(value) {
        return encodeURIComponent(value).replaceAll('%7E', '~');
    }

    async calculateStringToSignV2(url, params) {
        let data = 'POST';
        data += "\n";
        let endpoint = new URL(url);
        data += endpoint.host;
        data += "\n";
        let uri = Object.keys(endpoint).filter(a => a == 'path').length ? endpoint['path'] : null;
        if (!(uri)) {
            uri = "/";
        }
        let uriencoded = uri.split("/").map(a => this.encodeURIComponent(a)).join("/");
        data += uriencoded;
        data += "\n";
        params = uksort(params, 'strcmp');
        data += http_build_query(params, '', '&');
        return data;
    }

    async makePost(url, action, extra = {}) {
        const params = {};

        params['AWSAccessKeyId'] = this.config.get('payment_amazon_login_pay_access_key');
        params['Action'] = action;
        params['SellerId'] = this.config.get('payment_amazon_login_pay_merchant_id');
        params['SignatureMethod'] = 'HmacSHA256';
        params['SignatureVersion'] = 2;
        params['Timestamp'] = date('c', new Date());
        params['Version'] = '2013-01-01';

        for (let [key, value] of Object.entries(extra)) {
            params[key] = value;
        }

        const query = await this.calculateStringToSignV2(url, params);

        params['Signature'] = btoa(hash_hmac('sha256', query, this.config.get('payment_amazon_login_pay_access_secret'), true));

        return http_build_query(params);
    }

    async postCurl(action, params = {}) {
        const url = await this.getCurlUrl();
        const post = await this.makePost(url, action, params);
        await this.debugLog("URL", url);
        await this.debugLog("POST", post);
        try {
            const response = await require('axios').post(url, post, {
                headers: { 'User-Agent': this.request.headers['user-agent'], 'Content-Type': 'application/json' },
                httpsAgent: new (require('https').Agent)({ rejectUnauthorized: true }),
                timeout: 30000
            });
            await this.debugLog("SUCCESS", response.data);
            const result = {
                Status: response.status
            };
            const responseBody = await parseStringPromise(response.data); responseBody.registerXPathNamespace = (prefix, ns) => {
                // Simple implementation for namespace registration 
                this.namespaces = this.namespaces || {};
                this.namespaces[prefix] = ns;
            };
            result.ResponseBody = responseBody;
            if (responseBody.Error) {
                throw new Error(responseBody.Error.Message[0]);
            }
            return result;
        } catch (error) {
            const debug = { 'axios_error': error.message, 'response_status': error.response ? error.response.status : null, 'response_data': error.response ? error.response.data : null };
            await this.debugLog("ERROR", debug);
            throw new Error(this.language.get('error_process_order'));
        }
    }

    async loggedException(log_message, error_message) {
        const id = uniqid();

        await this.debugLog("ERROR", log_message, id);

        return new Error("#" + id + ": " + error_message);
    }

    async debugLog(type, data, id = null) {
        if (!this.config.get('payment_amazon_login_pay_debug')) {
            return;
        }
        let message = typeof data === 'object' ? JSON.stringify(data) : data;
        const stackTrace = new Error().stack;
        message += '\n' + stackTrace;
        const logMessage = `${id ? `[${id}]: ` : ''}${type} ---> ${message}`; console.log(logMessage); // Print to console 
        const log = new Log(this.LOG_FILENAME);

        await log.write((id ? '[' + id + ']: ' : '') + type + " ---> " + message);

    }
}
