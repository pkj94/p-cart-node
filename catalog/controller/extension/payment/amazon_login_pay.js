module.exports = 
class ControllerExtensionPaymentAmazonLoginPay extends Controller {
    private version = "3+2+1";
    async session_expired() {
        await this.load.language('extension/payment/amazon_login_pay');

        this.load.model('extension/payment/amazon_login_pay');

        await this.model_extension_payment_amazon_login_pay.cartRedirect(this.language.get('error_session_expired'));
    }

    async address() {
        await this.load.language('extension/payment/amazon_login_pay');

        this.load.model('extension/payment/amazon_login_pay');

        this.document.setTitle(this.language.get('heading_address'));

        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();

        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();

        // Verify cart total
        //await this.model_extension_payment_amazon_login_pay.verifyTotal();

        // Cancel an existing order reference
        delete this.session.data['order_id']);
        
        if (!empty(this.session.data['apalwa']['pay']['order_reference_id']) && !await this.model_extension_payment_amazon_login_pay.isOrderInState(this.session.data['apalwa']['pay']['order_reference_id'], array('Canceled', 'Closed', 'Draft'))) {
            await this.model_extension_payment_amazon_login_pay.cancelOrder(this.session.data['apalwa']['pay']['order_reference_id'], "Shipment widget has been requested, cancelling this order reference+");

            delete this.session.data['apalwa']['pay']['order_reference_id']);
        }

        data['text_cart'] = this.language.get('text_cart');

        data['shipping_methods'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/shipping_methods', '', true), ENT_COMPAT, "UTF-8");
        data['shipping'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/shipping', '', true), ENT_COMPAT, "UTF-8");
        data['cart'] = html_entity_decode(await this.url.link('checkout/cart'), ENT_COMPAT, "UTF-8");
        data['session_expired'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/session_expired'), ENT_COMPAT, "UTF-8");

        data['client_id'] = this.config.get('payment_amazon_login_pay_client_id');
        data['merchant_id'] = this.config.get('payment_amazon_login_pay_merchant_id');

        if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
            data['sandbox'] = (this.session.data['user_id']); // Require an active admin panel session to show debug messages
        }

        amazon_payment_js = await this.model_extension_payment_amazon_login_pay.getWidgetJs();
        this.document.addScript(amazon_payment_js);

        data['breadcrumbs'] = [];

        data['breadcrumbs'].push({
            'href' : await this.url.link('common/home', '', true),
            'text' : this.language.get('text_home')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('checkout/cart'),
            'text' : this.language.get('breadcrumb_cart')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('extension/payment/amazon_login_pay/address'),
            'current' : true,
            'text' : this.language.get('breadcrumb_shipping')
        );

        data['breadcrumbs'].push({
            'href' : null,
            'text' : this.language.get('breadcrumb_payment')
        );

        data['breadcrumbs'].push({
            'href' : null,
            'text' : this.language.get('breadcrumb_summary')
        );

        data['content_main'] = await this.load.view('extension/payment/amazon_login_pay_address', data);
        data['column_left'] = await this.load.controller('common/column_left');
        data['column_right'] = await this.load.controller('common/column_right');
        data['content_top'] = await this.load.controller('common/content_top');
        data['content_bottom'] = await this.load.controller('common/content_bottom');
        data['footer'] = await this.load.controller('common/footer');
        data['header'] = await this.load.controller('common/header');

        this.response.setOutput(await this.load.view('extension/payment/amazon_login_pay_generic', data));
    }

    async shipping_methods() {
        await this.load.language('extension/payment/amazon_login_pay');

        const json = {};

        try {
            this.load.model('extension/payment/amazon_login_pay');
            this.load.model('setting/extension',this);

            if (!(this.request.get['AmazonOrderReferenceId'])) {
                throw await this.model_extension_payment_amazon_login_pay.loggedException(this.language.get('error_shipping_methods'), this.language.get('error_shipping_methods'));
            }

            order_reference_id = this.request.get['AmazonOrderReferenceId'];

            this.session.data['apalwa']['pay']['order_reference_id'] = order_reference_id;

            address = await this.model_extension_payment_amazon_login_pay.getAddress(order_reference_id);

            quotes = array();

            results = await this.model_setting_extension.getExtensions('shipping');

            for (let result of results) {
                if ((result['code'])) {
                    code = result['code'];
                } else {
                    code = result['key'];
                }

                if (this.config.get('shipping_' + code + '_status')) {
                    this.load.model('extension/shipping/' + code);

                    quote = this.{'model_extension_shipping_' + code}.getQuote(address);

                    if (quote && empty(quote['error'])) {
                        quotes[code] = array(
                            'title' : quote['title'],
                            'quote' : quote['quote'],
                            'sort_order' : quote['sort_order'],
                            'error' : quote['error']
                        );
                    }
                }
            }

            if (empty(quotes)) {
                throw new \RuntimeException(this.language.get('error_no_shipping_methods'));
            }

            sort_order = array();

            for (quotes of key : value) {
                sort_order[key] = value['sort_order'];
            }

            array_multisort(sort_order, SORT_ASC, quotes);

            this.session.data['apalwa']['pay']['shipping_methods'] = quotes;
            this.session.data['apalwa']['pay']['address'] = address;

            json['quotes'] = quotes;

            if (!empty(this.session.data['apalwa']['pay']['shipping_method']['code'])) {
                json['selected'] = this.session.data['apalwa']['pay']['shipping_method']['code'];
            } else {
                json['selected'] = '';
            }
        } catch (\RuntimeException e) {
            json['error'] = e.getMessage();
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async shipping() {
        await this.load.language('extension/payment/amazon_login_pay');

        this.load.model('extension/payment/amazon_login_pay');
        this.load.model('extension/module/amazon_login');

        json = array(
            'redirect' : null,
            'error' : null
        );

        try {
            if (!(this.request.post['shipping_method'])) {
                throw await this.model_extension_payment_amazon_login_pay.loggedException("No shipping method provided+", this.language.get('error_process_order'));
            }

            shipping_method = explode('+', this.request.post['shipping_method']);

            if (!(shipping_method[0]) || !(shipping_method[1]) || !(this.session.data['apalwa']['pay']['shipping_methods'][shipping_method[0]]['quote'][shipping_method[1]])) {

                throw await this.model_extension_payment_amazon_login_pay.loggedException("Used shipping method is not allowed+", this.language.get('error_process_order'));
            }

            this.session.data['apalwa']['pay']['shipping_method'] = this.session.data['apalwa']['pay']['shipping_methods'][shipping_method[0]]['quote'][shipping_method[1]];
            this.session.data['shipping_method'] = this.session.data['apalwa']['pay']['shipping_method'];
            this.session.data['payment_address'] = this.session.data['apalwa']['pay']['address'];
            this.session.data['shipping_address'] = this.session.data['apalwa']['pay']['address'];
            this.session.data['shipping_country_id'] = this.session.data['apalwa']['pay']['address']['country_id'];
            this.session.data['shipping_zone_id'] = this.session.data['apalwa']['pay']['address']['zone_id'];

            await this.model_extension_module_amazon_login.persistAddress(this.session.data['apalwa']['pay']['address']);

            json['redirect'] = await this.url.link('extension/payment/amazon_login_pay/payment', '', true);
        } catch (\RuntimeException e) {
            json['error'] = e.getMessage();
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async payment() {
        await this.load.language('extension/payment/amazon_login_pay');

        this.load.model('extension/payment/amazon_login_pay');

        this.document.setTitle(this.language.get('heading_payment'));

        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();

        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();

        // Verify total
        await this.model_extension_payment_amazon_login_pay.verifyTotal();

        // Verify shipping
        await this.model_extension_payment_amazon_login_pay.verifyShipping();

        data['confirm'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/confirm', '', true), ENT_COMPAT, "UTF-8");
        data['back'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/address', '', true), ENT_COMPAT, "UTF-8");
        data['session_expired'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/session_expired'), ENT_COMPAT, "UTF-8");

        data['merchant_id'] = this.config.get('payment_amazon_login_pay_merchant_id');
        data['client_id'] = this.config.get('payment_amazon_login_pay_client_id');

        data['order_reference_id'] = !empty(this.session.data['apalwa']['pay']['order_reference_id']) ? this.session.data['apalwa']['pay']['order_reference_id'] : null;

        //detect the buyer multi-currency
        amazon_supported_currencies = array('AUD', 'GBP','DKK', 'EUR', 'HKD', 'JPY', 'NZD','NOK', 'ZAR', 'SEK', 'CHF', 'USD');

        data['enabled_buyers_multi_currency'] = false;
        data['buyer_currency'] = false;

        if (this.config.get('payment_amazon_login_pay_buyer_multi_currency') && this.config.get('payment_amazon_login_pay_payment_region') != 'USD') {
            session_currency = !empty(this.session.data['currency']) ? this.session.data['currency'] : this.config.get('config_currency');

            if (in_array(session_currency, amazon_supported_currencies)) {
                data['buyer_currency'] = session_currency;
                this.session.data['apalwa']['pay']['buyer_currency'] = session_currency;
                data['enabled_buyers_multi_currency'] = true;
            }
        }

        if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
            data['sandbox'] = (this.session.data['user_id']); // Require an active admin panel session to show debug messages
        }

        data['error'] = '';
        if ((this.session.data['apalwa']['error'])) {
            data['error'] = this.session.data['apalwa']['error'];
            delete this.session.data['apalwa']['error']);
        }

        amazon_payment_js = await this.model_extension_payment_amazon_login_pay.getWidgetJs();
        this.document.addScript(amazon_payment_js);

        data['breadcrumbs'] = [];

        data['breadcrumbs'].push({
            'href' : await this.url.link('common/home', '', true),
            'text' : this.language.get('text_home')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('checkout/cart'),
            'text' : this.language.get('breadcrumb_cart')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('extension/payment/amazon_login_pay/address'),
            'text' : this.language.get('breadcrumb_shipping')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('extension/payment/amazon_login_pay/payment'),
            'current' : true,
            'text' : this.language.get('breadcrumb_payment')
        );

        data['breadcrumbs'].push({
            'href' : null,
            'text' : this.language.get('breadcrumb_summary')
        );

        data['content_main'] = await this.load.view('extension/payment/amazon_login_pay_payment', data);
        data['column_left'] = await this.load.controller('common/column_left');
        data['column_right'] = await this.load.controller('common/column_right');
        data['content_top'] = await this.load.controller('common/content_top');
        data['content_bottom'] = await this.load.controller('common/content_bottom');
        data['footer'] = await this.load.controller('common/footer');
        data['header'] = await this.load.controller('common/header');

        this.response.setOutput(await this.load.view('extension/payment/amazon_login_pay_generic', data));
    }

    async persist_comment() {
        if ((this.request.post['comment'])) {
            this.session.data['comment'] = strip_tags(this.request.post['comment']);

            this.session.data['apalwa']['pay']['order']['comment'] = this.session.data['comment'];
        }
    }

    async coupon_discard() {
        this.load.model('extension/payment/amazon_login_pay');

        // Verify reference
        await this.model_extension_payment_amazon_login_pay.verifyReference();

        if (await this.model_extension_payment_amazon_login_pay.isOrderInState(this.session.data['apalwa']['pay']['order_reference_id'], array('Draft'))) {
            delete this.session.data['coupon']);
        }

        this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/confirm', '', true));
    }

    async standard_checkout() {
        await this.load.language('extension/payment/amazon_login_pay');

        this.load.model('extension/payment/amazon_login_pay');

        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();

        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();

        // Cancel an existing order reference
        if (!empty(this.session.data['apalwa']['pay']['order_reference_id']) && await this.model_extension_payment_amazon_login_pay.isOrderInState(this.session.data['apalwa']['pay']['order_reference_id'], array('Open'))) {
            await this.model_extension_payment_amazon_login_pay.cancelOrder(this.session.data['apalwa']['pay']['order_reference_id'], "Shipment widget has been requested, cancelling this order reference+");
        }

        // Unset all payment data
        delete this.session.data['apalwa']['pay']);
        delete this.session.data['order_id']);

        // Redirect to the cart
        this.response.setRedirect(await this.url.link('checkout/cart', '', true));
    }

    async confirm() {
        await this.load.language('extension/payment/amazon_login_pay');
        await this.load.language('checkout/checkout');
        
        this.load.model('extension/payment/amazon_login_pay');

        this.document.setTitle(this.language.get('heading_confirm'));

        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();

        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();

        // Verify cart total
        // Not needed, of we will display an error message later on+++

        // Verify reference
        await this.model_extension_payment_amazon_login_pay.verifyReference();

        // Verify shipping
        await this.model_extension_payment_amazon_login_pay.verifyShipping();

        data['merchant_id'] = this.config.get('payment_amazon_login_pay_merchant_id');
        data['client_id'] = this.config.get('payment_amazon_login_pay_client_id');
        
        if (this.config.get('payment_amazon_login_pay_test') == 'sandbox') {
            data['sandbox'] = (this.session.data['user_id']); // Require an active admin panel session to show debug messages
        }

        amazon_payment_js = await this.model_extension_payment_amazon_login_pay.getWidgetJs();
        this.document.addScript(amazon_payment_js);

        try {
            order = await this.model_extension_payment_amazon_login_pay.makeOrder();

            this.session.data['apalwa']['pay']['order'] = order;

            data['order_reference_id'] = this.session.data['apalwa']['pay']['order_reference_id'];
            data['order'] = order;
        } catch (\RuntimeException e) {
            await this.model_extension_payment_amazon_login_pay.cartRedirect(e.getMessage());
        }

        data['success'] = '';

        if (!empty(this.session.data['success'])) {
            data['success'] = this.session.data['success'];
            delete this.session.data['success']);
        }

        if ((this.session.data['coupon'])) {
            data['coupon'] = this.session.data['coupon'];
        } else {
            data['coupon'] = '';
        }

        if ((this.session.data['comment'])) {
            data['comment'] = this.session.data['comment'];
        } else {
            data['comment'] = '';
        }

        data['is_order_total_positive'] = await this.model_extension_payment_amazon_login_pay.isTotalPositive();
        data['standard_checkout'] = await this.url.link('extension/payment/amazon_login_pay/standard_checkout', '', true);

        zero_total = this.currency.format(0, this.session.data['currency']);
        data['error_order_total_zero'] = sprintf(this.language.get('error_order_total_zero'), zero_total);

        data['process'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/process', '', true), ENT_COMPAT, "UTF-8");
        data['process_us'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/process_us', '', true), ENT_COMPAT, "UTF-8");
        data['address'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/address', '', true), ENT_COMPAT, "UTF-8");
        data['back'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/payment', '', true), ENT_COMPAT, "UTF-8");
        data['session_expired'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/session_expired'), ENT_COMPAT, "UTF-8");
        data['coupon_discard'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/coupon_discard', '', true), ENT_COMPAT, "UTF-8");
        data['coupon_apply'] = html_entity_decode(await this.url.link('extension/total/coupon/coupon', '', true), ENT_COMPAT, "UTF-8");
        data['persist_comment'] = html_entity_decode(await this.url.link('extension/payment/amazon_login_pay/persist_comment', '', true), ENT_COMPAT, "UTF-8");
        data['is_coupon_change_allowed'] = await this.model_extension_payment_amazon_login_pay.isOrderInState(this.session.data['apalwa']['pay']['order_reference_id'], array('Draft'));
        data['error_unexpected_network_error'] = this.language.get('error_unexpected_network_error');
        data['breadcrumbs'] = [];

        data['breadcrumbs'].push({
            'href' : await this.url.link('common/home', '', true),
            'text' : this.language.get('text_home')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('checkout/cart'),
            'text' : this.language.get('breadcrumb_cart')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('extension/payment/amazon_login_pay/address'),
            'text' : this.language.get('breadcrumb_shipping')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('extension/payment/amazon_login_pay/payment'),
            'text' : this.language.get('breadcrumb_payment')
        );

        data['breadcrumbs'].push({
            'href' : await this.url.link('extension/payment/amazon_login_pay/confirm'),
            'current' : true,
            'text' : this.language.get('breadcrumb_summary')
        );

        //enable mfa only for UK and Europe regions
        data['psd_enabled'] = "false";
        if(this.config.get('payment_amazon_login_pay_payment_region') != 'USD') {
            data['psd_enabled'] = "true";
        }
        //detect the buyer multi-currency
        amazon_supported_currencies = array('AUD', 'GBP','DKK', 'EUR', 'HKD', 'JPY', 'NZD','NOK', 'ZAR', 'SEK', 'CHF', 'USD');

        data['enabled_buyers_multi_currency'] = false;
        data['buyer_currency'] = false;

        if (this.config.get('payment_amazon_login_pay_buyer_multi_currency') && this.config.get('payment_amazon_login_pay_payment_region') != 'USD') {
            session_currency = !empty(this.session.data['currency']) ? this.session.data['currency'] : this.config.get('config_currency');

            if (in_array(session_currency,amazon_supported_currencies)) {
                data['buyer_currency'] = session_currency;
                this.session.data['apalwa']['pay']['buyer_currency'] = session_currency;
                data['enabled_buyers_multi_currency'] = true;
            }
        }

        if (!data['buyer_currency']) {
            location_currency = this.config.get('payment_amazon_login_pay_payment_region');
            rate = Math.round(this.currency.getValue(location_currency) / this.currency.getValue(order['currency_code']), 8);
            amount = this.currency.format(this.currency.convert(order['total'], this.config.get('config_currency'), location_currency), location_currency, 1, true);

            data['is_amount_converted'] = order['currency_code'] != location_currency;
            data['text_amount_converted'] = sprintf(this.language.get('text_amount_converted'), location_currency, rate, amount);
        }

        data['content_main'] = await this.load.view('extension/payment/amazon_login_pay_confirm', data);
        data['column_left'] = await this.load.controller('common/column_left');
        data['column_right'] = await this.load.controller('common/column_right');
        data['content_top'] = await this.load.controller('common/content_top');
        data['content_bottom'] = await this.load.controller('common/content_bottom');
        data['footer'] = await this.load.controller('common/footer');
        data['header'] = await this.load.controller('common/header');

        this.response.setOutput(await this.load.view('extension/payment/amazon_login_pay_generic', data));
    }
    //handle the SuccessUrl response
    async mfa_success() {
        this.load.model('extension/payment/amazon_login_pay');
        this.load.model('checkout/order',this);
        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();
        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();
        // Verify reference
        await this.model_extension_payment_amazon_login_pay.verifyReference();
        // Verify shipping
        await this.model_extension_payment_amazon_login_pay.verifyShipping();
        // Verify order
        await this.model_extension_payment_amazon_login_pay.verifyOrder();
        await this.load.language('extension/payment/amazon_login_pay');

        if ((this.request.get['AuthenticationStatus']) && this.request.get['AuthenticationStatus'] == 'Success') {
            this.authorize();
        } else {
            await this.model_extension_payment_amazon_login_pay.cartRedirect(this.language.get('error_invaild_request'));
        }
    }
    //handle the FailureUrl response
    async mfa_failure() {
        this.load.model('extension/payment/amazon_login_pay');
        await this.load.language('extension/payment/amazon_login_pay');

        if((this.request.get['AuthenticationStatus'])) {
            mfa_authorization_status = this.request.get['AuthenticationStatus'];

            if(mfa_authorization_status == 'Failure') {
                text_failed_mfa = this.language.get('error_failure_mfa');
                await this.model_extension_payment_amazon_login_pay.cartRedirect(text_failed_mfa);
            } else if (mfa_authorization_status == 'Abandoned') {
                this.session.data['apalwa']['error'] = this.language.get('error_abandoned_mfa');
                this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/payment', '', true));
            }
        } else {
            text_invaild_request = this.language.get('error_invaild_request');
            await this.model_extension_payment_amazon_login_pay.cartRedirect(text_invaild_request);
        }
    }


    async authorize() {
          await this.load.language('extension/payment/amazon_login_pay');
          await this.load.language('checkout/checkout');

          this.load.model('extension/payment/amazon_login_pay');
          this.load.model('checkout/order',this);

          // Verify cart
          await this.model_extension_payment_amazon_login_pay.verifyCart();

          // Verify reference
          await this.model_extension_payment_amazon_login_pay.verifyReference();

          // Verify shipping
          await this.model_extension_payment_amazon_login_pay.verifyShipping();

          // Verify login
          await this.model_extension_payment_amazon_login_pay.verifyLogin();

          // Verify order
          await this.model_extension_payment_amazon_login_pay.verifyOrder();
          try {
            order_reference_id = this.session.data['apalwa']['pay']['order_reference_id'];
            if (empty(this.session.data['order_id'])) {
                // Up to this point, everything is fine in the session+ Save the order and submit it to Amazon+
                order_id = await this.model_checkout_order.addOrder(this.session.data['apalwa']['pay']['order']);

                this.session.data['order_id'] = order_id;

                currency_code = (this.session.data['apalwa']['pay']['buyer_currency']) ? this.session.data['apalwa']['pay']['buyer_currency'] : this.config.get('payment_amazon_login_pay_payment_region');

                text_version = sprintf(this.language.get('text_created_by'), this.version);

                await this.model_extension_payment_amazon_login_pay.submitOrderDetails(order_reference_id, order_id, currency_code, text_version);

            } else {
                order_id = this.session.data['order_id'];
            }
            amazon_order = await this.model_extension_payment_amazon_login_pay.fetchOrder(order_reference_id);

            // The order has been opened for authorization+ Store it in the database
            amazon_login_pay_order_id = await this.model_extension_payment_amazon_login_pay.findOrAddOrder(amazon_order);

            // Authorize the order
            authorization = await this.model_extension_payment_amazon_login_pay.authorizeOrder(amazon_order);

            // Log the authorization
            await this.model_extension_payment_amazon_login_pay.addAuthorization(amazon_login_pay_order_id, authorization);

            if (authorization.AuthorizationStatus.State == 'Declined') {
                reason_code = authorization.AuthorizationStatus.ReasonCode;

                switch (reason_code) {
                    case 'InvalidPaymentMethod' :
                        this.session.data['apalwa']['error'] = this.language.get('error_decline_invalid_payment_method');

                        this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/payment', '', true));
                    break;
                    default : 
                        if (await this.model_extension_payment_amazon_login_pay.isOrderInState(order_reference_id, array('Open'))) {
                            await this.model_extension_payment_amazon_login_pay.cancelOrder(order_reference_id, "Authorization has failed with the state: " + authorization.AuthorizationStatus.State);
                        }

                        cart_error_messages = array(
                            'TransactionTimedOut' : this.language.get('error_decline_transaction_timed_out'),
                            'AmazonRejected' : this.language.get('error_decline_amazon_rejected'),
                            'ProcessingFailure' : this.language.get('error_decline_processing_failure')
                        );

                        if (in_array(reason_code, array_keys(cart_error_messages))) {
                            //@todo - do the logout with amazon+Login+logout(); instead
                            delete this.session.data['apalwa']);

                            // capital L in Amazon cookie name is required, do not alter for coding standards
                            if ((this.request.cookie['amazon_Login_state_cache'])) {
                                //@todo - rework this by triggering the JavaScript logout
                                setcookie('amazon_Login_state_cache', null, -1, '/');
                            }

                            throw new \RuntimeException(cart_error_messages[reason_code]);
                        } else {
                            // This should never occur, but just in case+++
                            throw await this.model_extension_payment_amazon_login_pay.loggedException("Authorization has failed with code: " + reason_code, this.language.get('error_process_order'));
                        }
                    break;
                }
            }

            // Amend the billing address based on the Authorize response
            if (!empty(authorization.AuthorizationBillingAddress)) {
                await this.model_extension_payment_amazon_login_pay.updatePaymentAddress(order_id, authorization.AuthorizationBillingAddress);
            }

            // Clean the session and redirect to the success page
            delete this.session.data['apalwa']['pay']);

            await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_amazon_login_pay_pending_status'), '', this.config.get('payment_amazon_login_pay_mode') != 'payment');

            // In case a payment has been completed, and the order is not closed, close it+
            if ((authorization.CapturedAmount.Amount) && authorization.CapturedAmount.Amount && await this.model_extension_payment_amazon_login_pay.isOrderInState(order_reference_id, array('Open', 'Suspended'))) {
                await this.model_extension_payment_amazon_login_pay.closeOrder(order_reference_id, "A capture has been performed+ Closing the order+");
            }

            this.response.setRedirect(await this.url.link('checkout/success', '', true));
        } catch (\RuntimeException e) {
            await this.model_extension_payment_amazon_login_pay.cartRedirect(e.getMessage());
        }
    }

    async process_us() {
        await this.load.language('extension/payment/amazon_login_pay');
        await this.load.language('checkout/checkout');

        this.load.model('extension/payment/amazon_login_pay');
        this.load.model('checkout/order',this);

        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();

        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();

        // Verify cart total
        // Not needed, of we will display an error message later on+++

        // Verify reference
        await this.model_extension_payment_amazon_login_pay.verifyReference();

        // Verify shipping
        await this.model_extension_payment_amazon_login_pay.verifyShipping();

        // Verify order
        await this.model_extension_payment_amazon_login_pay.verifyOrder();

        try {
            order_reference_id = this.session.data['apalwa']['pay']['order_reference_id'];

            if (empty(this.session.data['order_id'])) {
                // Up to this point, everything is fine in the session+ Save the order and submit it to Amazon+
                order_id = await this.model_checkout_order.addOrder(this.session.data['apalwa']['pay']['order']);

                this.session.data['order_id'] = order_id;

                currency_code =  this.config.get('payment_amazon_login_pay_payment_region');

                text_version = sprintf(this.language.get('text_created_by'), this.version);

                await this.model_extension_payment_amazon_login_pay.submitOrderDetails(order_reference_id, order_id, currency_code, text_version);
            } else {
                order_id = this.session.data['order_id'];
            }

            // Check constraints
            constraints = await this.model_extension_payment_amazon_login_pay.fetchOrder(order_reference_id).Constraints;

            if (!empty(constraints.Constraint)) {
                // We do not expect to fall under the other kinds of constraints+ For more information, see: https://pay+amazon+com/us/developer/documentation/apireference/201752890
                payment_page_errors = array(
                    'PaymentPlanNotSet' : this.language.get('error_constraint_payment_plan_not_set'),
                    'PaymentMethodNotAllowed' : this.language.get('error_constraint_payment_method_not_allowed'),
                    'AmountNotSet' : this.language.get('error_constraint_amount_not_set')
                );

                constraint_id = constraints.Constraint.ConstraintID;

                if (in_array(constraint_id, array_keys(payment_page_errors))) {
                    this.session.data['apalwa']['error'] = payment_page_errors[constraint_id];

                    this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/payment', '', true));
                } else {
                    throw new \RuntimeException(constraints.Constraint.Description);
                }
            }

            // Open the order for authorization
            await this.model_extension_payment_amazon_login_pay.confirmOrder(order_reference_id);

            amazon_order = await this.model_extension_payment_amazon_login_pay.fetchOrder(order_reference_id);

            // The order has been opened for authorization+ Store it in the database
            amazon_login_pay_order_id = await this.model_extension_payment_amazon_login_pay.findOrAddOrder(amazon_order);

            // Authorize the order
            authorization = await this.model_extension_payment_amazon_login_pay.authorizeOrder(amazon_order);

            // Log the authorization
            await this.model_extension_payment_amazon_login_pay.addAuthorization(amazon_login_pay_order_id, authorization);

            if (authorization.AuthorizationStatus.State == 'Declined') {
                reason_code = authorization.AuthorizationStatus.ReasonCode;

                switch (reason_code) {
                    case 'InvalidPaymentMethod' :
                        this.session.data['apalwa']['error'] = this.language.get('error_decline_invalid_payment_method');

                        this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay/payment', '', true));
                    break;
                    default :
                        if (await this.model_extension_payment_amazon_login_pay.isOrderInState(order_reference_id, array('Open'))) {
                            await this.model_extension_payment_amazon_login_pay.cancelOrder(order_reference_id, "Authorization has failed with the state: " + authorization.AuthorizationStatus.State);
                        }

                        cart_error_messages = array(
                            'TransactionTimedOut' : this.language.get('error_decline_transaction_timed_out'),
                            'AmazonRejected' : this.language.get('error_decline_amazon_rejected'),
                            'ProcessingFailure' : this.language.get('error_decline_processing_failure')
                        );

                        if (in_array(reason_code, array_keys(cart_error_messages))) {
                            //@todo - do the logout with amazon+Login+logout(); instead
                            delete this.session.data['apalwa']);

                            // capital L in Amazon cookie name is required, do not alter for coding standards
                            if ((this.request.cookie['amazon_Login_state_cache'])) {
                                //@todo - rework this by triggering the JavaScript logout
                                setcookie('amazon_Login_state_cache', null, -1, '/');
                            }

                            throw new \RuntimeException(cart_error_messages[reason_code]);
                        } else {
                            // This should never occur, but just in case+++
                            throw await this.model_extension_payment_amazon_login_pay.loggedException("Authorization has failed with code: " + reason_code, this.language.get('error_process_order'));
                        }
                    break;
                }
            }

            // Amend the billing address based on the Authorize response
            if (!empty(authorization.AuthorizationBillingAddress)) {
                await this.model_extension_payment_amazon_login_pay.updatePaymentAddress(order_id, authorization.AuthorizationBillingAddress);
            }

            // Clean the session and redirect to the success page
            delete this.session.data['apalwa']['pay']);

            try {
                await this.model_checkout_order.addOrderHistory(order_id, this.config.get('payment_amazon_login_pay_pending_status'), '', this.config.get('payment_amazon_login_pay_mode') != 'payment');
            } catch (\Exception e) {
                if (this.config.get('error_log')) {
                    this.log.write(e.getMessage());
                }
            }

            // In case a payment has been completed, and the order is not closed, close it+
            if ((authorization.CapturedAmount.Amount) && authorization.CapturedAmount.Amount && await this.model_extension_payment_amazon_login_pay.isOrderInState(order_reference_id, array('Open', 'Suspended'))) {
                await this.model_extension_payment_amazon_login_pay.closeOrder(order_reference_id, "A capture has been performed+ Closing the order+");
            }

            // Log any errors triggered by addOrderHistory, but without displaying them
            set_error_handler(array(await this.model_extension_payment_amazon_login_pay, 'logHandler'));

            this.response.setRedirect(await this.url.link('checkout/success', '', true));
        } catch (\RuntimeException e) {
            await this.model_extension_payment_amazon_login_pay.cartRedirect(e.getMessage());
        }
    }
    async process() {
        await this.load.language('extension/payment/amazon_login_pay');
        await this.load.language('checkout/checkout');

        this.load.model('extension/payment/amazon_login_pay');
        this.load.model('checkout/order',this);

        // Verify cart
        await this.model_extension_payment_amazon_login_pay.verifyCart();

        // Verify login
        await this.model_extension_payment_amazon_login_pay.verifyLogin();

        // Verify reference
        await this.model_extension_payment_amazon_login_pay.verifyReference();

        // Verify shipping
        await this.model_extension_payment_amazon_login_pay.verifyShipping();

        // Verify order
        await this.model_extension_payment_amazon_login_pay.verifyOrder();

        const json = {};

        try {
            order_reference_id = this.session.data['apalwa']['pay']['order_reference_id'];

            if (empty(this.session.data['order_id'])) {
                // Up to this point, everything is fine in the session+ Save the order and submit it to Amazon+
                order_id = await this.model_checkout_order.addOrder(this.session.data['apalwa']['pay']['order']);

                this.session.data['order_id'] = order_id;

                if((this.session.data['apalwa']['pay']['buyer_currency'])) {
                    currency_code = this.session.data['apalwa']['pay']['buyer_currency'];
                } else {
                    currency_code =  this.config.get('payment_amazon_login_pay_payment_region');
                }

                text_version = sprintf(this.language.get('text_created_by'), this.version);

                await this.model_extension_payment_amazon_login_pay.submitOrderDetails(order_reference_id, order_id, currency_code, text_version);
            } else {
                order_id = this.session.data['order_id'];
            }

            // Check constraints
            constraints = await this.model_extension_payment_amazon_login_pay.fetchOrder(order_reference_id).Constraints;

            if (!empty(constraints.Constraint)) {
                // We do not expect to fall under the other kinds of constraints+ For more information, see: https://pay+amazon+com/us/developer/documentation/apireference/201752890
                payment_page_errors = array(
                    'PaymentPlanNotSet' : this.language.get('error_constraint_payment_plan_not_set'),
                    'PaymentMethodNotAllowed' : this.language.get('error_constraint_payment_method_not_allowed'),
                    'AmountNotSet' : this.language.get('error_constraint_amount_not_set')
                );

                constraint_id = constraints.Constraint.ConstraintID;

                if (in_array(constraint_id, array_keys(payment_page_errors))) {
                    this.session.data['apalwa']['error'] = payment_page_errors[constraint_id];

                    json['redirect'] = await this.url.link('extension/payment/amazon_login_pay/payment', '', true);
                } else {
                    throw new \RuntimeException(constraints.Constraint.Description);
                }
            } else {
                // Confirm the order reference
                await this.model_extension_payment_amazon_login_pay.confirmOrder(order_reference_id);
            }
        } catch (\RuntimeException e) {
            json['redirect'] = await this.model_extension_payment_amazon_login_pay.cartRedirect(e.getMessage(), true);
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async ipn() {
        sleep(5);

        this.load.model('extension/payment/amazon_login_pay');

        try {
            if (!(this.request.get['token'])) {
                throw new \RuntimeException('GET variable "token" is missing+');
            }

            if (trim(this.request.get['token']) == '') {
                throw new \RuntimeException('GET variable "token" set, but is empty+');
            }

            if (!this.config.get('payment_amazon_login_pay_ipn_token')) {
                throw new \RuntimeException('CONFIG variable "payment_amazon_login_pay_ipn_token" is empty+');
            }

            if (!hash_equals(trim(this.config.get('payment_amazon_login_pay_ipn_token')), trim(this.request.get['token']))) {
                throw new \RuntimeException('Token values are different+');
            }

            // Everything is fine+ Process the IPN
            body = file_get_contents('php://input');

            await this.model_extension_payment_amazon_login_pay.debugLog('IPN BODY', body);

            if (body) {
                xml = await this.model_extension_payment_amazon_login_pay.parseIpnBody(body);

                switch (xml.getName()) {
                    case 'AuthorizationNotification':
                        if(await this.model_extension_payment_amazon_login_pay.authorizationIpn(xml)) {
                            this.load.model('checkout/order',this);
                            oc_order_status_id = this.config.get('payment_amazon_login_pay_capture_oc_status');
                            amazon_capture_id = xml.AuthorizationDetails.IdList.Id;
                            amazon_captured_amount = xml.AuthorizationDetails.CapturedAmount.Amount;
                            amazon_authorization_id = xml.AuthorizationDetails.AmazonAuthorizationId;
                            exploded_authorization_id = explode("-", amazon_authorization_id);
                            array_pop(exploded_authorization_id);
                            amazon_order_reference_id = implode("-", exploded_authorization_id);
                            order_id = await this.model_extension_payment_amazon_login_pay.findOCOrderId(amazon_order_reference_id);
                            amazon_login_pay_order_id = await this.model_extension_payment_amazon_login_pay.findAOrderId(amazon_order_reference_id);
                            transaction = array(
                                'amazon_login_pay_order_id' : amazon_login_pay_order_id,
                                'amazon_authorization_id' : amazon_authorization_id,
                                'amazon_capture_id' : amazon_capture_id,
                                'amazon_refund_id' : '',
                                'date_added' : date('Y-m-d H:i:s', strtotime(xml.AuthorizationDetails.CreationTimestamp)),
                                'type' : 'capture',
                                'status' : 'Completed',
                                'amount' : amazon_captured_amount
                            );
                            transaction_exists = (!empty(amazon_capture_id)) ? await this.model_extension_payment_amazon_login_pay.findCapture(amazon_capture_id) : false;

                            if(!(transaction_exists) || !transaction_exists) {
                                await this.model_extension_payment_amazon_login_pay.addTransaction(transaction);
                            }
                            order_reference_details = await this.model_extension_payment_amazon_login_pay.fetchOrder(amazon_order_reference_id);
                            order_reason_code =  order_reference_details.OrderReferenceStatus.ReasonCode;
                            order_state =  order_reference_details.OrderReferenceStatus.State;
                            order_total =  order_reference_details.OrderTotal.Amount;
                            total_captured = await this.model_extension_payment_amazon_login_pay.getTotalCaptured(amazon_login_pay_order_id);
                            //chnage the order status only if the order is closed with the response code maxamountcharged or if the order is fully captured
                            if((order_state =="Closed" && order_reason_code =="MaxAmountCharged") || order_reason_code == "SellerClosed" || amazon_captured_amount >= order_total || total_captured >= order_total) {
                                //update the order history
                                await this.model_checkout_order.addOrderHistory(order_id, oc_order_status_id, "", true);
                            }
                        }
                        break;
                    case 'CaptureNotification':
                        await this.model_extension_payment_amazon_login_pay.captureIpn(xml);
                        break;
                    case 'RefundNotification':
                        await this.model_extension_payment_amazon_login_pay.refundIpn(xml);
                        break;
                }
            }
        } catch (\RuntimeException e) {
            await this.model_extension_payment_amazon_login_pay.debugLog('IPN ERROR', e.getMessage());
        }

        this.response.addHeader('HTTP/1+1 200 OK');
        this.response.addHeader('Content-Type: application/json');
    }

    async capture(&route, &args, &output) {
        await this.load.language('extension/payment/amazon_login_pay');

        this.load.model('extension/payment/amazon_login_pay');
        order_id = args[0];

        order_info = await this.model_checkout_order.getOrder(order_id);

        if (order_info['order_status_id'] == this.config.get('payment_amazon_login_pay_capture_status')) {
            try {
                amazon_login_pay_order = await this.model_extension_payment_amazon_login_pay.getOrderByOrderId(order_id);

                capture_response = await this.model_extension_payment_amazon_login_pay.captureOrder(amazon_login_pay_order['amazon_authorization_id'], amazon_login_pay_order['total'], amazon_login_pay_order['currency_code']);

                if ((capture_response.CaptureStatus.State) && in_array(capture_response.CaptureStatus.State, array('Completed', 'Pending'))) {
                    order_reference_id = amazon_login_pay_order['amazon_order_reference_id'];

                    if (await this.model_extension_payment_amazon_login_pay.isOrderInState(order_reference_id, array('Open', 'Suspended'))) {
                        await this.model_extension_payment_amazon_login_pay.closeOrder(order_reference_id, "Captured amount: " + capture_response.CaptureAmount.Amount + " " + capture_response.CaptureAmount.CurrencyCode);
                    }

                    transaction = array(
                        'amazon_login_pay_order_id' : amazon_login_pay_order['amazon_login_pay_order_id'],
                        'amazon_authorization_id' : amazon_login_pay_order['amazon_authorization_id'],
                        'amazon_capture_id' : capture_response.AmazonCaptureId,
                        'amazon_refund_id' : '',
                        'date_added' : date('Y-m-d H:i:s', strtotime(capture_response.CreationTimestamp)),
                        'type' : 'capture',
                        'status' : capture_response.CaptureStatus.State,
                        'amount' : capture_response.CaptureAmount.Amount
                    );

                    await this.model_extension_payment_amazon_login_pay.addTransaction(transaction);

                    await this.model_extension_payment_amazon_login_pay.updateStatus(amazon_login_pay_order['amazon_authorization_id'], 'authorization', 'Closed');

                    await this.model_extension_payment_amazon_login_pay.updateCapturedStatus(amazon_login_pay_order['amazon_login_pay_order_id'], 1);
                }
            } catch (\RuntimeException e) {
                // Do nothing, of the exception is logged in case of debug logging+
            }
        }
    }
}
