const mt_rand = require("locutus/php/math/mt_rand");
const parse_url = require("locutus/php/url/parse_url");

module.exports = class ControllerExtensionPaymentSquareup extends Controller {
    error = {};

    async index() {
        const data = {};
        await this.load.language('extension/payment/squareup');

        this.load.model('extension/payment/squareup', this);
        this.load.model('setting/setting', this);

        this.load.library('squareup', this);
        let server = HTTP_SERVER;
        if (this.request.server['HTTPS']) {
            server = HTTPS_SERVER;
        }

        const previous_setting = await this.model_setting_setting.getSetting('payment_squareup');
        let first_location_id = null;
        try {
            if (this.config.get('payment_squareup_access_token')) {
                if (!await this.squareup.verifyToken(this.config.get('payment_squareup_access_token'))) {
                    // console.log('HI-----------1')

                    delete previous_setting['payment_squareup_merchant_id'];
                    delete previous_setting['payment_squareup_merchant_name'];
                    delete previous_setting['payment_squareup_access_token'];
                    delete previous_setting['payment_squareup_access_token_expires'];
                    delete previous_setting['payment_squareup_locations'];
                    delete previous_setting['payment_squareup_sandbox_locations'];

                    this.config.set('payment_squareup_merchant_id', null);
                } else {
                    // console.log('HI-----------2')

                    if (!this.config.get('payment_squareup_locations')) {
                        first_location_id = null;

                        previous_setting['payment_squareup_locations'] = await this.squareup.fetchLocations(this.config.get('payment_squareup_access_token'), first_location_id);
                        previous_setting['payment_squareup_location_id'] = first_location_id;
                    }
                }
            }

            if (!this.config.get('payment_squareup_sandbox_locations') && this.config.get('payment_squareup_sandbox_token')) {
                previous_setting['payment_squareup_sandbox_locations'] = await this.squareup.fetchLocations(this.config.get('payment_squareup_sandbox_token'), first_location_id);
                previous_setting['payment_squareup_sandbox_location_id'] = first_location_id;
            }

            await this.model_setting_setting.editSetting('payment_squareup', previous_setting);
        } catch (e) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': sprintf(this.language.get('text_location_error'), e.getMessage())
            });
        }


        const previous_config = new Config();

        for (let [key, value] of Object.entries(previous_setting)) {
            previous_config.set(key, value);
        }

        if (this.request.server['method'] == 'POST' && await this.validate()) {
            await this.model_setting_setting.editSetting('payment_squareup', array_merge(previous_setting, this.request.post));

            this.session.data['success'] = this.language.get('text_success');
            await this.session.save(this.session.data);

            if ((this.request.get['save_and_auth'])) {
                this.response.setRedirect(await this.squareup.authLink(this.request.post['payment_squareup_client_id']));
            } else {
                this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
            }
        }

        this.document.setTitle(this.language.get('heading_title'));

        data['error_status'] = this.getValidationError('status');
        data['error_display_name'] = this.getValidationError('display_name');
        data['error_client_id'] = this.getValidationError('client_id');
        data['error_client_secret'] = this.getValidationError('client_secret');
        data['error_delay_capture'] = this.getValidationError('delay_capture');
        data['error_sandbox_client_id'] = this.getValidationError('sandbox_client_id');
        data['error_sandbox_token'] = this.getValidationError('sandbox_token');
        data['error_location'] = this.getValidationError('location');
        data['error_cron_email'] = this.getValidationError('cron_email');
        data['error_cron_acknowledge'] = this.getValidationError('cron_acknowledge');

        data['payment_squareup_status'] = this.getSettingValue('payment_squareup_status');
        data['payment_squareup_status_authorized'] = this.getSettingValue('payment_squareup_status_authorized');
        data['payment_squareup_status_captured'] = this.getSettingValue('payment_squareup_status_captured');
        data['payment_squareup_status_voided'] = this.getSettingValue('payment_squareup_status_voided');
        data['payment_squareup_status_failed'] = this.getSettingValue('payment_squareup_status_failed');
        data['payment_squareup_display_name'] = this.getSettingValue('payment_squareup_display_name');
        data['payment_squareup_client_id'] = this.getSettingValue('payment_squareup_client_id');
        data['payment_squareup_client_secret'] = this.getSettingValue('payment_squareup_client_secret');
        data['payment_squareup_enable_sandbox'] = this.getSettingValue('payment_squareup_enable_sandbox');
        data['payment_squareup_debug'] = this.getSettingValue('payment_squareup_debug');
        data['payment_squareup_sort_order'] = this.getSettingValue('payment_squareup_sort_order');
        data['payment_squareup_total'] = this.getSettingValue('payment_squareup_total');
        data['payment_squareup_geo_zone_id'] = this.getSettingValue('payment_squareup_geo_zone_id');
        data['payment_squareup_sandbox_client_id'] = this.getSettingValue('payment_squareup_sandbox_client_id');
        data['payment_squareup_sandbox_token'] = this.getSettingValue('payment_squareup_sandbox_token');
        data['payment_squareup_locations'] = this.getSettingValue('payment_squareup_locations', previous_config.get('payment_squareup_locations'));
        data['payment_squareup_location_id'] = this.getSettingValue('payment_squareup_location_id');
        data['payment_squareup_sandbox_locations'] = this.getSettingValue('payment_squareup_sandbox_locations', previous_config.get('payment_squareup_sandbox_locations'));
        data['payment_squareup_sandbox_location_id'] = this.getSettingValue('payment_squareup_sandbox_location_id');
        data['payment_squareup_delay_capture'] = this.getSettingValue('payment_squareup_delay_capture');
        data['payment_squareup_recurring_status'] = this.getSettingValue('payment_squareup_recurring_status');
        data['payment_squareup_cron_email_status'] = this.getSettingValue('payment_squareup_cron_email_status');
        data['payment_squareup_cron_email'] = this.getSettingValue('payment_squareup_cron_email', this.config.get('config_email'));
        data['payment_squareup_cron_token'] = this.getSettingValue('payment_squareup_cron_token');
        data['payment_squareup_cron_acknowledge'] = this.getSettingValue('payment_squareup_cron_acknowledge', null, true);
        data['payment_squareup_notify_recurring_success'] = this.getSettingValue('payment_squareup_notify_recurring_success');
        data['payment_squareup_notify_recurring_fail'] = this.getSettingValue('payment_squareup_notify_recurring_fail');
        data['payment_squareup_merchant_id'] = this.getSettingValue('payment_squareup_merchant_id', previous_config.get('payment_squareup_merchant_id'));
        data['payment_squareup_merchant_name'] = this.getSettingValue('payment_squareup_merchant_name', previous_config.get('payment_squareup_merchant_name'));

        if (previous_config.get('payment_squareup_access_token') && previous_config.get('payment_squareup_access_token_expires')) {
            const expiration_time = moment(previousConfig.get('payment_squareup_access_token_expires'), 'YYYY-MM-DDTHH:mm:ssZ');
            const now = moment();
            const delta = expiration_time.diff(now);
            const expiration_date_formatted = expiration_time.format('dddd, MMMM Do, YYYY h:mm:ss A, z');
            if (delta < 0) {
                this.pushAlert({
                    'type': 'danger',
                    'icon': 'exclamation-circle',
                    'text': sprintf(this.language.get('text_token_expired'), await this.url.link('extension/payment/squareup/refresh_token', 'user_token=' + this.session.data['user_token'], true))
                });
            } else if (delta < (5 * 24 * 60 * 60)) { // token is valid, just about to expire
                this.pushAlert({
                    'type': 'warning',
                    'icon': 'exclamation-circle',
                    'text': sprintf(this.language.get('text_token_expiry_warning'), expiration_date_formatted, await this.url.link('extension/payment/squareup/refresh_token', 'user_token=' + this.session.data['user_token'], true))
                });
            }

            data['access_token_expires_time'] = expiration_date_formatted;
        } else if (previous_config.get('payment_squareup_client_id')) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': sprintf(this.language.get('text_token_revoked'), await this.squareup.authLink(previous_config.get('payment_squareup_client_id')))
            });

            data['access_token_expires_time'] = this.language.get('text_na');
        }

        if (previous_config.get('payment_squareup_client_id')) {
            data['payment_squareup_auth_link'] = await this.squareup.authLink(previous_config.get('payment_squareup_client_id'));
        } else {
            data['payment_squareup_auth_link'] = null;
        }

        data['payment_squareup_redirect_uri'] = (await this.url.link('extension/payment/squareup/oauth_callback', '', true)).replaceAll('&amp;', '&');
        data['payment_squareup_refresh_link'] = await this.url.link('extension/payment/squareup/refresh_token', 'user_token=' + this.session.data['user_token'], true);

        if (this.config.get('payment_squareup_enable_sandbox')) {
            this.pushAlert({
                'type': 'warning',
                'icon': 'exclamation-circle',
                'text': this.language.get('text_sandbox_enabled')
            });
        }
        if ((this.error['warning'])) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': this.error['warning']
            });
        }

        // Insert success message from the session
        if ((this.session.data['success'])) {
            this.pushAlert({
                'type': 'success',
                'icon': 'exclamation-circle',
                'text': this.session.data['success']
            });

            delete this.session.data['success'];
        }
        if (this.request.server.protocol == 'https') {
            // Push the SSL reminder alert
            this.pushAlert({
                'type': 'info',
                'icon': 'lock',
                'text': this.language.get('text_notification_ssl')
            });
        } else {
            // Push the SSL reminder alert
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': this.language.get('error_no_ssl')
            });
        }

        let tabs = [
            'tab-transaction',
            'tab-setting',
            'tab-recurring',
            'tab-cron'
        ];

        if ((this.request.get['tab']) && tabs.includes(this.request.get['tab'])) {
            data['tab'] = this.request.get['tab'];
        } else if ((this.error['cron_email']) || (this.error['cron_acknowledge'])) {
            data['tab'] = 'tab-cron';
        } else if (this.error) {
            data['tab'] = 'tab-setting';
        } else {
            data['tab'] = tabs[1];
        }
        data['breadcrumbs'] = [];

        data['breadcrumbs'].push({
            'text': this.language.get('text_home'),
            'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
        });

        data['breadcrumbs'].push({
            'text': this.language.get('text_extension'),
            'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
        });

        data['breadcrumbs'].push({
            'text': this.language.get('heading_title'),
            'href': await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true)
        });

        data['action'] = html_entity_decode(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        data['action_save_auth'] = html_entity_decode(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'] + '&save_and_auth=1', true));
        data['cancel'] = html_entity_decode(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
        data['url_list_transactions'] = html_entity_decode(await this.url.link('extension/payment/squareup/transactions', 'user_token=' + this.session.data['user_token'] + '&page={PAGE}', true));

        this.load.model('localisation/language', this);
        data['languages'] = [];
        const languages = await this.model_localisation_language.getLanguages();

        for (let [code, language] of Object.entries(languages)) {
            data['languages'].push({
                'language_id': language['language_id'],
                'name': language['name'] + (language['code'] == this.config.get('config_language') ? this.language.get('text_default') : ''),
                'image': 'language/' + language['code'] + '/' + language['code'] + '.png'
            });
        }
        this.load.model('localisation/order_status', this);
        data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

        this.load.model('localisation/geo_zone', this);
        data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

        data['payment_squareup_cron_command'] = '/node  ' + DIR_SYSTEM + 'library/squareup/cron.js ' + parse_url(server, 'PHP_URL_HOST') + ' 443 > /dev/null 2> /dev/null';

        if (!this.config.get('payment_squareup_cron_token')) {
            data['payment_squareup_cron_token'] = md5(mt_rand());
        }

        data['payment_squareup_cron_url'] = 'https://' + parse_url(server, 'PHP_URL_HOST') + expressPath.dirname(parse_url(server, 'PHP_URL_PATH')) + '/?route=extension/recurring/squareup/recurring&cron_token={CRON_TOKEN}';

        data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

        // API login
        this.load.model('user/api', this);

        const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

        if (api_info && await this.user.hasPermission('modify', 'sale/order')) {
            // const session = new Session(this.request.server.session);

            // await session.start();

            await this.model_user_api.deleteApiSessionBySessionId(session.getId());

            await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

            this.session.data['api_id'] = api_info['api_id'];

            data['api_token'] = this.session.getId();
        } else {
            data['api_token'] = '';
        }

        data['header'] = await this.load.controller('common/header');
        data['column_left'] = await this.load.controller('common/column_left');
        data['footer'] = await this.load.controller('common/footer');

        data['alerts'] = this.pullAlerts();

        this.clearAlerts();

        this.response.setOutput(await this.load.view('extension/payment/squareup', data));
    }

    async transaction_info() {
        await this.load.language('extension/payment/squareup');

        this.load.model('extension/payment/squareup', this);

        this.load.library('squareup');
        let squareup_transaction_id = 0;
        if ((this.request.get['squareup_transaction_id'])) {
            squareup_transaction_id = this.request.get['squareup_transaction_id'];
        } else {
            squareup_transaction_id = 0;
        }

        const transaction_info = await this.model_extension_payment_squareup.getTransaction(squareup_transaction_id);

        if (!(transaction_info)) {
            this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        }

        this.document.setTitle(sprintf(this.language.get('heading_title_transaction'), transaction_info['transaction_id']));

        data['alerts'] = this.pullAlerts();

        this.clearAlerts();

        data['text_edit'] = sprintf(this.language.get('heading_title_transaction'), transaction_info['transaction_id']);

        let amount = this.currency.format(transaction_info['transaction_amount'], transaction_info['transaction_currency']);

        data['confirm_capture'] = sprintf(this.language.get('text_confirm_capture'), amount);
        data['confirm_void'] = sprintf(this.language.get('text_confirm_void'), amount);
        data['confirm_refund'] = this.language.get('text_confirm_refund');
        data['insert_amount'] = sprintf(this.language.get('text_insert_amount'), amount, transaction_info['transaction_currency']);
        data['text_loading'] = this.language.get('text_loading_short');

        data['billing_address_company'] = transaction_info['billing_address_company'];
        data['billing_address_street'] = transaction_info['billing_address_street_1'] + ' ' + transaction_info['billing_address_street_2'];
        data['billing_address_city'] = transaction_info['billing_address_city'];
        data['billing_address_postcode'] = transaction_info['billing_address_postcode'];
        data['billing_address_province'] = transaction_info['billing_address_province'];
        data['billing_address_country'] = transaction_info['billing_address_country'];

        data['transaction_id'] = transaction_info['transaction_id'];
        data['merchant'] = transaction_info['merchant_id'];
        data['order_id'] = transaction_info['order_id'];
        data['type'] = transaction_info['transaction_type'];
        data['amount'] = amount;
        data['currency'] = transaction_info['transaction_currency'];
        data['browser'] = transaction_info['device_browser'];
        data['ip'] = transaction_info['device_ip'];
        data['date_created'] = date(this.language.get('datetime_format'), new Date(transaction_info['created_at']));

        data['cancel'] = await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'] + '&tab=tab-transaction', true);

        data['url_order'] = await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + transaction_info['order_id'], true);
        data['url_void'] = await this.url.link('extension/payment/squareup' + '/void', 'user_token=' + this.session.data['user_token'] + '&preserve_alert=true&squareup_transaction_id=' + transaction_info['squareup_transaction_id'], true);
        data['url_capture'] = await this.url.link('extension/payment/squareup' + '/capture', 'user_token=' + this.session.data['user_token'] + '&preserve_alert=true&squareup_transaction_id=' + transaction_info['squareup_transaction_id'], true);
        data['url_refund'] = await this.url.link('extension/payment/squareup' + '/refund', 'user_token=' + this.session.data['user_token'] + '&preserve_alert=true&squareup_transaction_id=' + transaction_info['squareup_transaction_id'], true);
        data['url_transaction'] = sprintf(
            this.squareup.VIEW_TRANSACTION_URL,
            transaction_info['transaction_id'],
            transaction_info['location_id']
        );

        data['is_authorized'] = in_array(transaction_info['transaction_type'], array('AUTHORIZED'));
        data['is_captured'] = in_array(transaction_info['transaction_type'], array('CAPTURED'));

        data['has_refunds'] = transaction_info['is_refunded'];

        if (data['has_refunds']) {
            let refunds = JSON.parse(transaction_info['refunds']);

            data['refunds'] = [];

            data['text_refunds'] = sprintf(this.language.get('text_refunds'), count(refunds));

            for (let refund of refunds) {
                let amount = this.currency.format(
                    await this.squareup.standardDenomination(
                        refund['amount_money']['amount'],
                        refund['amount_money']['currency']
                    ),
                    refund['amount_money']['currency']
                );

                let fee = this.currency.format(
                    await this.squareup.standardDenomination(
                        refund['processing_fee_money']['amount'],
                        refund['processing_fee_money']['currency']
                    ),
                    refund['processing_fee_money']['currency']
                );

                data['refunds'].push({
                    'date_created': date(this.language.get('datetime_format'), new Date(refund['created_at'])),
                    'reason': refund['reason'],
                    'status': refund['status'],
                    'amount': amount,
                    'fee': fee
                });
            }
        }

        data['breadcrumbs'] = [];

        data['breadcrumbs'].push({
            'text': this.language.get('text_home'),
            'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
        });

        data['breadcrumbs'].push({
            'text': this.language.get('text_extension'),
            'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
        });

        data['breadcrumbs'].push({
            'text': this.language.get('heading_title'),
            'href': await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true)
        });

        data['breadcrumbs'].push({
            'text': sprintf(this.language.get('heading_title_transaction'), transaction_info['squareup_transaction_id']),
            'href': await this.url.link('extension/payment/squareup/transaction_info', 'user_token=' + this.session.data['user_token'] + '&squareup_transaction_id=' + squareup_transaction_id, true)
        });

        data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

        // API login
        this.load.model('user/api', this);

        const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

        if (api_info && await this.user.hasPermission('modify', 'sale/order')) {
            const session = new Session(this.request.server.session);

            await session.start();

            await this.model_user_api.deleteApiSessionBySessionId(session.getId());

            await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

            session.data['api_id'] = api_info['api_id'];

            data['api_token'] = session.getId();
        } else {
            data['api_token'] = '';
        }

        data['header'] = await this.load.controller('common/header');
        data['column_left'] = await this.load.controller('common/column_left');
        data['footer'] = await this.load.controller('common/footer');

        this.response.setOutput(await this.load.view('extension/payment/squareup_transaction_info', data));
    }

    async transactions() {
        await this.load.language('extension/payment/squareup');

        this.load.model('extension/payment/squareup', this);
        let page = 1;
        if ((this.request.get['page'])) {
            page = Number(this.request.get['page']);
        }
        let result = {
            'transactions': [],
            'pagination': ''
        };

        let filter_data = {
            'start': (page - 1) * Number(this.config.get('config_limit_admin')),
            'limit': Number(this.config.get('config_limit_admin'))
        };

        if ((this.request.get['order_id'])) {
            filter_data['order_id'] = this.request.get['order_id'];
        }

        const transactions_total = await this.model_extension_payment_squareup.getTotalTransactions(filter_data);
        const transactions = await this.model_extension_payment_squareup.getTransactions(filter_data);

        this.load.model('sale/order', this);

        for (let transaction of transactions) {
            let amount = this.currency.format(transaction['transaction_amount'], transaction['transaction_currency']);

            const order_info = await this.model_sale_order.getOrder(transaction['order_id']);

            result['transactions'].push({
                'squareup_transaction_id': transaction['squareup_transaction_id'],
                'transaction_id': transaction['transaction_id'],
                'url_order': await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + transaction['order_id'], true),
                'url_void': await this.url.link('extension/payment/squareup/void', 'user_token=' + this.session.data['user_token'] + '&squareup_transaction_id=' + transaction['squareup_transaction_id'], true),
                'url_capture': await this.url.link('extension/payment/squareup/capture', 'user_token=' + this.session.data['user_token'] + '&squareup_transaction_id=' + transaction['squareup_transaction_id'], true),
                'url_refund': await this.url.link('extension/payment/squareup/refund', 'user_token=' + this.session.data['user_token'] + '&squareup_transaction_id=' + transaction['squareup_transaction_id'], true),
                'confirm_capture': sprintf(this.language.get('text_confirm_capture'), amount),
                'confirm_void': sprintf(this.language.get('text_confirm_void'), amount),
                'confirm_refund': this.language.get('text_confirm_refund'),
                'insert_amount': sprintf(this.language.get('text_insert_amount'), amount, transaction['transaction_currency']),
                'order_id': transaction['order_id'],
                'type': transaction['transaction_type'],
                'num_refunds': JSON.parse(transaction['refunds']).length,
                'amount': amount,
                'customer': order_info['firstname'] + ' ' + order_info['lastname'],
                'ip': transaction['device_ip'],
                'date_created': date(this.language.get('datetime_format'), strtotime(transaction['created_at'])),
                'url_info': await this.url.link('extension/payment/squareup/transaction_info', 'user_token=' + this.session.data['user_token'] + '&squareup_transaction_id=' + transaction['squareup_transaction_id'], true)
            });
        }

        const pagination = new Pagination();
        pagination.total = transactions_total;
        pagination.page = page;
        pagination.limit = Number(this.config.get('config_limit_admin'));
        pagination.url = '{page}';

        result['pagination'] = pagination.render();

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(result);
    }

    async refresh_token() {
        await this.load.language('extension/payment/squareup');

        if (!await this.user.hasPermission('modify', 'extension/payment/squareup')) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': this.language.get('error_permission')
            });

            this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        }

        this.load.model('setting/setting', this);

        this.load.library('squareup');

        try {
            const response = await this.squareup.refreshToken();

            if (!(response['access_token']) || !(response['token_type']) || !(response['expires_at']) || !(response['merchant_id']) ||
                response['merchant_id'] != this.config.get('payment_squareup_merchant_id')) {
                this.pushAlert({
                    'type': 'danger',
                    'icon': 'exclamation-circle',
                    'text': this.language.get('error_refresh_access_token')
                });
            } else {
                const settings = await this.model_setting_setting.getSetting('payment_squareup');

                settings['payment_squareup_access_token'] = response['access_token'];
                settings['payment_squareup_access_token_expires'] = response['expires_at'];

                await this.model_setting_setting.editSetting('payment_squareup', settings);

                this.pushAlert({
                    'type': 'success',
                    'icon': 'exclamation-circle',
                    'text': this.language.get('text_refresh_access_token_success')
                });
            }
        } catch (e) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': sprintf(this.language.get('error_token'), e.getMessage())
            });
        }

        this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
    }

    async oauth_callback() {
        await this.load.language('extension/payment/squareup');

        if (!await this.user.hasPermission('modify', 'extension/payment/squareup')) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': this.language.get('error_permission')
            });

            this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        }

        this.load.model('setting/setting', this);

        this.load.library('squareup');

        if ((this.request.get['error']) || (this.request.get['error_description'])) {
            // auth error
            if (this.request.get['error'] == 'access_denied' && this.request.get['error_description'] == 'user_denied') {
                // user rejected giving auth permissions to his store
                this.pushAlert({
                    'type': 'warning',
                    'icon': 'exclamation-circle',
                    'text': this.language.get('error_user_rejected_connect_attempt')
                });
            }

            this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        }

        // verify parameters for the redirect from Square (against random url crawling)
        if (!(this.request.get['state']) || !(this.request.get['code']) || !(this.request.get['response_type'])) {
            // missing or wrong info
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': this.language.get('error_possible_xss')
            });

            this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        }

        // verify the state (against cross site requests)
        if (!(this.session.data['payment_squareup_oauth_state']) || this.session.data['payment_squareup_oauth_state'] != this.request.get['state']) {
            // state mismatch
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': this.language.get('error_possible_xss')
            });

            this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
        }

        try {
            const token = await this.squareup.exchangeCodeForAccessToken(this.request.get['code']);

            const previous_setting = await this.model_setting_setting.getSetting('payment_squareup');

            let first_location_id = null;

            previous_setting['payment_squareup_locations'] = await this.squareup.fetchLocations(token['access_token'], first_location_id);

            if (
                !(previous_setting['payment_squareup_location_id']) ||
                ((previous_setting['payment_squareup_location_id']) && !in_array(
                    previous_setting['payment_squareup_location_id'],
                    previous_setting['payment_squareup_locations'].map(location => location['id'])
                ))
            ) {
                previous_setting['payment_squareup_location_id'] = first_location_id;
            }

            if (!this.config.get('payment_squareup_sandbox_locations') && this.config.get('payment_squareup_sandbox_token')) {
                previous_setting['payment_squareup_sandbox_locations'] = await this.squareup.fetchLocations(this.config.get('payment_squareup_sandbox_token'), first_location_id);
                previous_setting['payment_squareup_sandbox_location_id'] = first_location_id;
            }

            previous_setting['payment_squareup_merchant_id'] = token['merchant_id'];
            previous_setting['payment_squareup_merchant_name'] = ''; // only available in v1 of the API, not populated for now
            previous_setting['payment_squareup_access_token'] = token['access_token'];
            previous_setting['payment_squareup_access_token_expires'] = token['expires_at'];

            await this.model_setting_setting.editSetting('payment_squareup', previous_setting);

            delete this.session.data['payment_squareup_oauth_state'];
            delete this.session.data['payment_squareup_oauth_redirect'];

            this.pushAlert({
                'type': 'success',
                'icon': 'exclamation-circle',
                'text': this.language.get('text_refresh_access_token_success')
            });
        } catch (e) {
            this.pushAlert({
                'type': 'danger',
                'icon': 'exclamation-circle',
                'text': sprintf(this.language.get('error_token'), e.getMessage())
            });
        }

        this.response.setRedirect(await this.url.link('extension/payment/squareup', 'user_token=' + this.session.data['user_token'], true));
    }

    async capture() {
        await this.transactionAction(async (transaction_info, json) => {
            const updated_transaction = await this.squareup.captureTransaction(transaction_info['location_id'], transaction_info['transaction_id']);

            let status = updated_transaction['tenders'][0]['card_details']['status'];
            this.load.model('extension/payment/squareup', this);

            await this.model_extension_payment_squareup.updateTransaction(transaction_info['squareup_transaction_id'], status);

            json['order_history_data'] = {
                'notify': 1,
                'order_id': transaction_info['order_id'],
                'order_status_id': await this.model_extension_payment_squareup.getOrderStatusId(transaction_info['order_id'], status),
                'comment': this.language.get('squareup_status_comment_' + strtolower(status)),
            };

            json['success'] = this.language.get('text_success_capture');
        });
    }

    async void() {
        await this.transactionAction(async (transaction_info, json) => {
            const updated_transaction = await this.squareup.voidTransaction(transaction_info['location_id'], transaction_info['transaction_id']);

            let status = updated_transaction['tenders'][0]['card_details']['status'];
            this.load.model('extension/payment/squareup', this);

            await this.model_extension_payment_squareup.updateTransaction(transaction_info['squareup_transaction_id'], status);

            json['order_history_data'] = {
                'notify': 1,
                'order_id': transaction_info['order_id'],
                'order_status_id': await this.model_extension_payment_squareup.getOrderStatusId(transaction_info['order_id'], status),
                'comment': this.language.get('squareup_status_comment_' + strtolower(status)),
            };

            json['success'] = this.language.get('text_success_void');
        });
    }

    async refund() {
        await this.transactionAction(async (transaction_info, json) => {
            let reason = this.language.get('text_no_reason_provided');
            if ((this.request.post['reason'])) {
                reason = this.request.post['reason'];
            } else {
                reason = this.language.get('text_no_reason_provided');
            }
            let amount = 0;
            if ((this.request.post['amount'])) {
                amount = this.request.post['amount'].replace(new RegExp('~[^0-9\.\,]~'), '');

                if (amount.indexOf(',') != -1 && amount.indexOf('.') != -1) {
                    amount = amount.replace(',', '');
                } else if (amount.indexOf(',') != -1 && amount.indexOf('.') == -1) {
                    amount = amount.replace(',', '.');
                } else {
                    amount = amount;
                }
            } else {
                amount = 0;
            }

            let currency = transaction_info['transaction_currency'];
            let tenders = JSON.parse(transaction_info['tenders']);
            this.load.library('squareup');

            const updated_transaction = await this.squareup.refundTransaction(transaction_info['location_id'], transaction_info['transaction_id'], reason, amount, currency, tenders[0]['id']);

            let status = updated_transaction['tenders'][0]['card_details']['status'];

            let refunds = [];

            if ((updated_transaction['refunds'])) {
                refunds = updated_transaction['refunds'];
            }
            this.load.model('extension/payment/squareup', this);

            await this.model_extension_payment_squareup.updateTransaction(transaction_info['squareup_transaction_id'], status, refunds);

            let last_refund = refunds.pop();
            let refunded_amount;
            if (last_refund) {
                refunded_amount = this.currency.format(
                    await this.squareup.standardDenomination(
                        last_refund['amount_money']['amount'],
                        last_refund['amount_money']['currency']
                    ),
                    last_refund['amount_money']['currency']
                );

                let comment = sprintf(this.language.get('text_refunded_amount'), refunded_amount, last_refund['status'], last_refund['reason']);

                json['order_history_data'] = {
                    'notify': 1,
                    'order_id': transaction_info['order_id'],
                    'order_status_id': await this.model_extension_payment_squareup.getOrderStatusId(transaction_info['order_id']),
                    'comment': comment,
                };

                json['success'] = this.language.get('text_success_refund');
            } else {
                json['error'] = this.language.get('error_no_refund');
            }
        });
    }

    async order() {
        const data = {};
        await this.load.language('extension/payment/squareup');

        data['url_list_transactions'] = html_entity_decode(await this.url.link('extension/payment/squareup/transactions', 'user_token=' + this.session.data['user_token'] + '&order_id=' + this.request.get['order_id'] + '&page={PAGE}', true));
        data['user_token'] = this.session.data['user_token'];
        data['order_id'] = this.request.get['order_id'];

        data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

        // API login
        this.load.model('user/api', this);

        const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

        if (api_info && await this.user.hasPermission('modify', 'sale/order')) {
            const session = new Session(this.request.server.session);

            await session.start();

            await this.model_user_api.deleteApiSessionBySessionId(session.getId());

            await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

            session.data['api_id'] = api_info['api_id'];

            data['api_token'] = session.getId();
        } else {
            data['api_token'] = '';
        }

        return await this.load.view('extension/payment/squareup_order', data);
    }

    async install() {
        this.load.model('extension/payment/squareup', this);

        await this.model_extension_payment_squareup.createTables();
    }

    async uninstall() {
        this.load.model('extension/payment/squareup', this);

        await this.model_extension_payment_squareup.dropTables();
    }

    async recurringButtons() {
        const data = {};
        if (!await this.user.hasPermission('modify', 'sale/recurring')) {
            return;
        }

        this.load.model('extension/payment/squareup', this);

        await this.load.language('extension/payment/squareup');
        let order_recurring_id = 0;
        if ((this.request.get['order_recurring_id'])) {
            order_recurring_id = this.request.get['order_recurring_id'];
        } else {
            order_recurring_id = 0;
        }

        const recurring_info = await this.model_sale_recurring.getRecurring(order_recurring_id);

        data['button_text'] = this.language.get('button_cancel_recurring');

        if (recurring_info['status'] == this.model_extension_payment_squareup.RECURRING_ACTIVE) {
            data['order_recurring_id'] = order_recurring_id;
        } else {
            data['order_recurring_id'] = '';
        }

        this.load.model('sale/order', this);

        const order_info = await this.model_sale_order.getOrder(recurring_info['order_id']);

        data['order_id'] = recurring_info['order_id'];
        data['store_id'] = order_info['store_id'];
        data['order_status_id'] = order_info['order_status_id'];
        data['comment'] = this.language.get('text_order_history_cancel');
        data['notify'] = 1;

        data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

        // API login
        this.load.model('user/api', this);

        const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

        if (api_info && await this.user.hasPermission('modify', 'sale/order')) {
            const session = new Session(this.request.server.session);

            await session.start();

            await this.model_user_api.deleteApiSessionBySessionId(session.getId());

            await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

            session.data['api_id'] = api_info['api_id'];

            data['api_token'] = session.getId();
        } else {
            data['api_token'] = '';
        }

        data['cancel'] = html_entity_decode(await this.url.link('extension/payment/squareup/recurringCancel', 'order_recurring_id=' + order_recurring_id + '&user_token=' + this.session.data['user_token'], true));

        return await this.load.view('extension/payment/squareup_recurring_buttons', data);
    }

    async recurringCancel() {
        await this.load.language('extension/payment/squareup');

        const json = {};

        if (!await this.user.hasPermission('modify', 'sale/recurring')) {
            json['error'] = this.language.get('error_permission_recurring');
        } else {
            this.load.model('sale/recurring', this);
            let order_recurring_id = 0;
            if ((this.request.get['order_recurring_id'])) {
                order_recurring_id = this.request.get['order_recurring_id'];
            }

            const recurring_info = await this.model_sale_recurring.getRecurring(order_recurring_id);

            if (recurring_info) {
                this.load.model('extension/payment/squareup', this);

                await this.model_extension_payment_squareup.editOrderRecurringStatus(order_recurring_id, this.model_extension_payment_squareup.RECURRING_CANCELLED);

                json['success'] = this.language.get('text_canceled_success');

            } else {
                json['error'] = this.language.get('error_not_found');
            }
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async validate() {
        if (!await this.user.hasPermission('modify', 'extension/payment/squareup')) {
            this.error['warning'] = this.language.get('error_permission');
        }

        if (!(this.request.post['payment_squareup_client_id']) || this.request.post['payment_squareup_client_id'].length > 32) {
            this.error['client_id'] = this.language.get('error_client_id');
        }

        if (!(this.request.post['payment_squareup_client_secret']) || this.request.post['payment_squareup_client_secret'].length > 50) {
            this.error['client_secret'] = this.language.get('error_client_secret');
        }

        if ((this.request.post['payment_squareup_enable_sandbox'])) {
            if (!(this.request.post['payment_squareup_sandbox_client_id']) || this.request.post['payment_squareup_sandbox_client_id'].length > 42) {
                this.error['sandbox_client_id'] = this.language.get('error_sandbox_client_id');
            }

            if (!(this.request.post['payment_squareup_sandbox_token']) || this.request.post['payment_squareup_sandbox_token'].length > 42) {
                this.error['sandbox_token'] = this.language.get('error_sandbox_token');
            }

            if (this.config.get('payment_squareup_merchant_id') && !this.config.get('payment_squareup_sandbox_locations')) {
                this.error['warning'] = this.language.get('text_no_appropriate_locations_warning');
            }

            if (this.config.get('payment_squareup_sandbox_locations') && (this.request.post['payment_squareup_sandbox_location_id']) && !this.config.get('payment_squareup_sandbox_locations').map((location) => location['id']).includes(this.request.post['payment_squareup_sandbox_location_id'])) {
                this.error['location'] = this.language.get('error_no_location_selected');
            }
        } else {
            if (this.config.get('payment_squareup_merchant_id') && !this.config.get('payment_squareup_locations')) {
                this.error['warning'] = this.language.get('text_no_appropriate_locations_warning');
            }

            if (this.config.get('payment_squareup_locations') && (this.request.post['payment_squareup_location_id']) && !this.config.get('payment_squareup_locations').map((location) => location['id']).includes(this.request.post['payment_squareup_location_id'])) {
                this.error['location'] = this.language.get('error_no_location_selected');
            }
        }

        if ((this.request.post['payment_squareup_cron_email_status'])) {
            if (!isEmailValid(this.request.post['payment_squareup_cron_email'])) {
                this.error['cron_email'] = this.language.get('error_invalid_email');
            }
        }

        if (!(this.request.get['save_and_auth']) && !(this.request.post['payment_squareup_cron_acknowledge'])) {
            this.error['cron_acknowledge'] = this.language.get('error_cron_acknowledge');
        }

        if (Object.keys(this.error) && !(this.error['warning'])) {
            this.error['warning'] = this.language.get('error_form');
        }

        return Object.keys(this.error).length ? false : true
    }

    async transactionAction(callback) {
        await this.load.language('extension/payment/squareup');

        this.load.model('extension/payment/squareup', this);

        this.load.library('squareup');

        const json = {};

        if (!await this.user.hasPermission('modify', 'extension/payment/squareup')) {
            json['error'] = this.language.get('error_permission');
        }
        let squareup_transaction_id = 0;
        if ((this.request.get['squareup_transaction_id'])) {
            squareup_transaction_id = this.request.get['squareup_transaction_id'];
        }

        const transaction_info = await this.model_extension_payment_squareup.getTransaction(squareup_transaction_id);

        if (!(transaction_info)) {
            json['error'] = this.language.get('error_transaction_missing');
        } else {
            try {
                callback(transaction_info, json);
            } catch (e) {
                json['error'] = e.getMessage();
            }
        }

        if ((this.request.get['preserve_alert'])) {
            if ((json['error'])) {
                this.pushAlert({
                    'type': 'danger',
                    'icon': 'exclamation-circle',
                    'text': json['error']
                });
            }

            if ((json['success'])) {
                this.pushAlert({
                    'type': 'success',
                    'icon': 'exclamation-circle',
                    'text': json['success']
                });
            }
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async pushAlert(alert) {
        this.session.data['payment_squareup_alerts'].push(alert);
    }

    async pullAlerts() {
        if ((this.session.data['payment_squareup_alerts'])) {
            return this.session.data['payment_squareup_alerts'];
        } else {
            return [];
        }
    }

    async clearAlerts() {
        delete this.session.data['payment_squareup_alerts'];
        await this.session.save(this.session.data);
    }

    getSettingValue(key, default1 = null, checkbox = false) {
        if (checkbox) {
            if (this.request.server['method'] == 'POST' && !(this.request.post[key])) {
                return default1;
            } else {
                return this.config.get(key);
            }
        }

        if ((this.request.post[key])) {
            return this.request.post[key];
        } else if (this.config.has(key)) {
            return this.config.get(key);
        } else {
            return default1;
        }
    }

    async getValidationError(key) {
        if ((this.error[key])) {
            return this.error[key];
        } else {
            return '';
        }
    }
}
