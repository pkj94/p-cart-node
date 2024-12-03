const mt_rand = require("locutus/php/math/mt_rand");
const uniqid = require("locutus/php/misc/uniqid");
const html_entity_decode = require("locutus/php/strings/html_entity_decode");
const str_repeat = require("locutus/php/strings/str_repeat");

module.exports = class ControllerExtensionPaymentAmazonLoginPay extends Controller {
	version = '3.2.1';
	error = {};

	async index() {
		const data = {};

		await this.load.language('extension/payment/amazon_login_pay');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		this.load.model('extension/payment/amazon_login_pay', this);

		await this.model_extension_payment_amazon_login_pay.install();

		this.trimIntegrationDetails();

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_amazon_login_pay', this.request.post);

			await this.model_extension_payment_amazon_login_pay.deleteEvents();
			await this.model_extension_payment_amazon_login_pay.addEvents();

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			if ((this.request.post['language_reload'])) {
				this.response.setRedirect(await this.url.link('extension/payment/amazon_login_pay', 'user_token=' + this.session.data['user_token'], true));
			} else {
				this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
			}
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['error_merchant_id'])) {
			data['error_merchant_id'] = this.error['error_merchant_id'];
		} else {
			data['error_merchant_id'] = '';
		}

		if ((this.error['error_access_key'])) {
			data['error_access_key'] = this.error['error_access_key'];
		} else {
			data['error_access_key'] = '';
		}

		if ((this.error['error_access_secret'])) {
			data['error_access_secret'] = this.error['error_access_secret'];
		} else {
			data['error_access_secret'] = '';
		}

		if ((this.error['error_client_secret'])) {
			data['error_client_secret'] = this.error['error_client_secret'];
		} else {
			data['error_client_secret'] = '';
		}

		if ((this.error['error_client_id'])) {
			data['error_client_id'] = this.error['error_client_id'];
		} else {
			data['error_client_id'] = '';
		}

		if ((this.error['error_minimum_total'])) {
			data['error_minimum_total'] = this.error['error_minimum_total'];
		} else {
			data['error_minimum_total'] = '';
		}

		if ((this.error['error_curreny'])) {
			data['error_curreny'] = this.error['error_curreny'];
		} else {
			data['error_curreny'] = '';
		}

		data['heading_title'] = this.language.get('heading_title') + ' ' + this.version;

		data['https_catalog'] = HTTPS_CATALOG;

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
			'href': await this.url.link('extension/payment/amazon_login_pay', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/amazon_login_pay', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_amazon_login_pay_merchant_id'])) {
			data['payment_amazon_login_pay_merchant_id'] = this.request.post['payment_amazon_login_pay_merchant_id'];
		} else if (this.config.get('payment_amazon_login_pay_merchant_id')) {
			data['payment_amazon_login_pay_merchant_id'] = this.config.get('payment_amazon_login_pay_merchant_id');
		} else {
			data['payment_amazon_login_pay_merchant_id'] = '';
		}

		if ((this.request.post['payment_amazon_login_pay_access_key'])) {
			data['payment_amazon_login_pay_access_key'] = this.request.post['payment_amazon_login_pay_access_key'];
		} else if (this.config.get('payment_amazon_login_pay_access_key')) {
			data['payment_amazon_login_pay_access_key'] = this.config.get('payment_amazon_login_pay_access_key');
		} else {
			data['payment_amazon_login_pay_access_key'] = '';
		}

		if ((this.request.post['payment_amazon_login_pay_access_secret'])) {
			data['payment_amazon_login_pay_access_secret'] = this.request.post['payment_amazon_login_pay_access_secret'];
		} else if (this.config.get('payment_amazon_login_pay_access_secret')) {
			data['payment_amazon_login_pay_access_secret'] = this.config.get('payment_amazon_login_pay_access_secret');
		} else {
			data['payment_amazon_login_pay_access_secret'] = '';
		}

		if ((this.request.post['payment_amazon_login_pay_client_id'])) {
			data['payment_amazon_login_pay_client_id'] = this.request.post['payment_amazon_login_pay_client_id'];
		} else if (this.config.get('payment_amazon_login_pay_client_id')) {
			data['payment_amazon_login_pay_client_id'] = this.config.get('payment_amazon_login_pay_client_id');
		} else {
			data['payment_amazon_login_pay_client_id'] = '';
		}

		if ((this.request.post['payment_amazon_login_pay_client_secret'])) {
			data['payment_amazon_login_pay_client_secret'] = this.request.post['payment_amazon_login_pay_client_secret'];
		} else if (this.config.get('payment_amazon_login_pay_client_secret')) {
			data['payment_amazon_login_pay_client_secret'] = this.config.get('payment_amazon_login_pay_client_secret');
		} else {
			data['payment_amazon_login_pay_client_secret'] = '';
		}

		if ((this.request.post['payment_amazon_login_pay_test'])) {
			data['payment_amazon_login_pay_test'] = this.request.post['payment_amazon_login_pay_test'];
		} else if (this.config.get('payment_amazon_login_pay_test')) {
			data['payment_amazon_login_pay_test'] = this.config.get('payment_amazon_login_pay_test');
		} else {
			data['payment_amazon_login_pay_test'] = 'sandbox';
		}

		if ((this.request.post['payment_amazon_login_pay_mode'])) {
			data['payment_amazon_login_pay_mode'] = this.request.post['payment_amazon_login_pay_mode'];
		} else if (this.config.get('payment_amazon_login_pay_mode')) {
			data['payment_amazon_login_pay_mode'] = this.config.get('payment_amazon_login_pay_mode');
		} else {
			data['payment_amazon_login_pay_mode'] = 'payment';
		}

		if ((this.request.post['payment_amazon_login_pay_checkout'])) {
			data['payment_amazon_login_pay_checkout'] = this.request.post['payment_amazon_login_pay_checkout'];
		} else if (this.config.get('payment_amazon_login_pay_checkout')) {
			data['payment_amazon_login_pay_checkout'] = this.config.get('payment_amazon_login_pay_checkout');
		} else {
			data['payment_amazon_login_pay_checkout'] = 'payment';
		}

		if ((this.request.post['payment_amazon_login_pay_payment_region'])) {
			data['payment_amazon_login_pay_payment_region'] = this.request.post['payment_amazon_login_pay_payment_region'];
		} else if (this.config.get('payment_amazon_login_pay_payment_region')) {
			data['payment_amazon_login_pay_payment_region'] = this.config.get('payment_amazon_login_pay_payment_region');
		} else if (['EUR', 'GBP', 'USD'].includes(this.config.get('config_currency'))) {
			data['payment_amazon_login_pay_payment_region'] = this.config.get('config_currency');
		} else {
			data['payment_amazon_login_pay_payment_region'] = 'USD';
		}
		let ld = '';
		if (data['payment_amazon_login_pay_payment_region'] == 'EUR') {
			data['payment_amazon_login_pay_language'] = 'de-DE';
			data['sp_id'] = 'AW93DIZMWSDWS';
			data['locale'] = 'EUR';
			ld = 'AW93DIZMWSDWS';
		} else if (data['payment_amazon_login_pay_payment_region'] == 'GBP') {
			data['payment_amazon_login_pay_language'] = 'en-GB';
			data['sp_id'] = 'AW93DIZMWSDWS';
			data['locale'] = 'GBP';
			ld = 'AW93DIZMWSDWS';
		} else {
			data['payment_amazon_login_pay_language'] = 'en-US';
			data['sp_id'] = 'A3GK1RS09H3A7D';
			data['locale'] = 'US';
			ld = 'A3GK1RS09H3A7D';
		}

		if ((this.request.post['payment_amazon_login_pay_language'])) {
			data['payment_amazon_login_pay_language'] = this.request.post['payment_amazon_login_pay_language'];
		} else if (this.config.get('payment_amazon_login_pay_language')) {
			data['payment_amazon_login_pay_language'] = this.config.get('payment_amazon_login_pay_language');
		}

		if ((this.request.post['payment_amazon_login_pay_capture_status'])) {
			data['payment_amazon_login_pay_capture_status'] = this.request.post['payment_amazon_login_pay_capture_status'];
		} else if (this.config.get('payment_amazon_login_pay_capture_status')) {
			data['payment_amazon_login_pay_capture_status'] = this.config.get('payment_amazon_login_pay_capture_status');
		} else {
			data['payment_amazon_login_pay_capture_status'] = '';
		}

		if ((this.request.post['payment_amazon_login_pay_pending_status'])) {
			data['payment_amazon_login_pay_pending_status'] = this.request.post['payment_amazon_login_pay_pending_status'];
		} else if (this.config.get('payment_amazon_login_pay_pending_status')) {
			data['payment_amazon_login_pay_pending_status'] = this.config.get('payment_amazon_login_pay_pending_status');
		} else {
			data['payment_amazon_login_pay_pending_status'] = '0';
		}

		if ((this.request.post['payment_amazon_login_pay_capture_oc_status'])) {
			data['payment_amazon_login_pay_capture_oc_status'] = this.request.post['payment_amazon_login_pay_capture_oc_status'];
		} else if (this.config.get('payment_amazon_login_pay_capture_oc_status')) {
			data['payment_amazon_login_pay_capture_oc_status'] = this.config.get('payment_amazon_login_pay_capture_oc_status');
		} else {
			data['payment_amazon_login_pay_capture_oc_status'] = '0';
		}

		if ((this.request.post['payment_amazon_login_pay_ipn_token'])) {
			data['payment_amazon_login_pay_ipn_token'] = this.request.post['payment_amazon_login_pay_ipn_token'];
		} else if (this.config.get('payment_amazon_login_pay_ipn_token')) {
			data['payment_amazon_login_pay_ipn_token'] = this.config.get('payment_amazon_login_pay_ipn_token');
		} else {
			data['payment_amazon_login_pay_ipn_token'] = sha1(uniqid(mt_rand(), 1));
		}

		data['ipn_url'] = HTTPS_CATALOG + '?route=extension/payment/amazon_login_pay/ipn&token=' + data['payment_amazon_login_pay_ipn_token'];

		if ((this.request.post['payment_amazon_login_pay_minimum_total'])) {
			data['payment_amazon_login_pay_minimum_total'] = this.request.post['payment_amazon_login_pay_minimum_total'];
		} else if (this.config.get('payment_amazon_login_pay_minimum_total')) {
			data['payment_amazon_login_pay_minimum_total'] = this.config.get('payment_amazon_login_pay_minimum_total');
		} else {
			data['payment_amazon_login_pay_minimum_total'] = '0.01';
		}

		if ((this.request.post['payment_amazon_login_pay_geo_zone'])) {
			data['payment_amazon_login_pay_geo_zone'] = this.request.post['payment_amazon_login_pay_geo_zone'];
		} else if (this.config.get('payment_amazon_login_pay_geo_zone')) {
			data['payment_amazon_login_pay_geo_zone'] = this.config.get('payment_amazon_login_pay_geo_zone');
		} else {
			data['payment_amazon_login_pay_geo_zone'] = '0';
		}
		if ((this.request.post['payment_amazon_login_pay_buyer_multi_currency'])) {
			data['payment_amazon_login_pay_buyer_multi_currency'] = this.request.post['payment_amazon_login_pay_buyer_multi_currency'];
		} else if (this.config.get('payment_amazon_login_pay_buyer_multi_currency')) {
			data['payment_amazon_login_pay_buyer_multi_currency'] = this.config.get('payment_amazon_login_pay_buyer_multi_currency');
		} else {
			data['payment_amazon_login_pay_buyer_multi_currency'] = '0';
		}
		//list available currencies for buyer multi-currency feature
		this.load.model('localisation/currency', this);
		const store_buyer_currencies = [];
		const oc_currencies = await this.model_localisation_currency.getCurrencies();
		const amazon_supported_currencies = ['AUD', 'GBP', 'DKK', 'EUR', 'HKD', 'JPY', 'NZD', 'NOK', 'ZAR', 'SEK', 'CHF', 'USD'];
		for (let amazon_supported_currency of amazon_supported_currencies) {
			if ((oc_currencies[amazon_supported_currency]) && oc_currencies[amazon_supported_currency]['status'] == '1') {
				store_buyer_currencies.push(amazon_supported_currency);
			}
		}
		await this.load.language('common/column_left');
		data['help_buyer_multi_currency'] = (store_buyer_currencies) ? sprintf(this.language.get('help_buyer_multi_currency'), store_buyer_currencies.join(', ')) : this.language.get('help_buyer_multi_currency_no_available_currency');
		data['text_info_buyer_multi_currencies'] = sprintf(this.language.get('text_info_buyer_multi_currencies'), this.session.data['user_token'], this.language.get('text_system'), this.language.get('text_localisation'), this.language.get('text_currency'));
		data['help_capture_oc_status'] = sprintf(this.language.get('help_capture_oc_status'), this.language.get('text_sale'), this.language.get('text_order'), this.language.get('button_view'));

		if ((this.request.post['payment_amazon_login_pay_debug'])) {
			data['payment_amazon_login_pay_debug'] = this.request.post['payment_amazon_login_pay_debug'];
		} else if (this.config.get('payment_amazon_login_pay_debug')) {
			data['payment_amazon_login_pay_debug'] = this.config.get('payment_amazon_login_pay_debug');
		} else {
			data['payment_amazon_login_pay_debug'] = '0';
		}

		if ((this.request.post['payment_amazon_login_pay_sort_order'])) {
			data['payment_amazon_login_pay_sort_order'] = this.request.post['payment_amazon_login_pay_sort_order'];
		} else if (this.config.get('payment_amazon_login_pay_sort_order')) {
			data['payment_amazon_login_pay_sort_order'] = this.config.get('payment_amazon_login_pay_sort_order');
		} else {
			data['payment_amazon_login_pay_sort_order'] = '0';
		}

		if ((this.request.post['payment_amazon_login_pay_status'])) {
			data['payment_amazon_login_pay_status'] = this.request.post['payment_amazon_login_pay_status'];
		} else if (this.config.get('payment_amazon_login_pay_status')) {
			data['payment_amazon_login_pay_status'] = this.config.get('payment_amazon_login_pay_status');
		} else {
			data['payment_amazon_login_pay_status'] = '0';
		}

		if ((this.request.post['payment_amazon_login_pay_declined_code'])) {
			data['payment_amazon_login_pay_declined_code'] = this.request.post['payment_amazon_login_pay_declined_code'];
		} else if (this.config.get('payment_amazon_login_pay_declined_code')) {
			data['payment_amazon_login_pay_declined_code'] = this.config.get('payment_amazon_login_pay_declined_code');
		} else {
			data['payment_amazon_login_pay_declined_code'] = '';
		}

		this.load.model('localisation/geo_zone', this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		data['declined_codes'] = [this.language.get('text_amazon_invalid'), this.language.get('text_amazon_rejected'), this.language.get('text_amazon_timeout')];

		data['unique_id'] = 'pc-' + this.config.get('config_name').toLowerCase().replaceAll(' ', '-') + '_' + mt_rand();
		data['allowed_login_domain'] = html_entity_decode(HTTPS_CATALOG);
		data['login_redirect_urls'] = [];
		data['login_redirect_urls'].push(HTTPS_CATALOG + '?route=payment/amazon_login/login');
		data['login_redirect_urls'].push(HTTPS_CATALOG + '?route=payment/amazon_pay/login');
		data['store_name'] = this.config.get('config_name');
		data['simple_path_language'] = data['payment_amazon_login_pay_language'].replaceAll('-', '_');

		if (data['payment_amazon_login_pay_payment_region'] == 'USD') {
			data['registration_url'] = "https://payments.amazon.com/register?registration_source=SPPL&spId=" + ld;

			data['languages'] = {
				'en-US': this.language.get('text_us')
			};
		} else {
			data['registration_url'] = "https://payments-eu.amazon.com/register?registration_source=SPPL&spId=" + ld;

			data['languages'] = {
				'de-DE': this.language.get('text_de'),
				'es-ES': this.language.get('text_es'),
				'fr-FR': this.language.get('text_fr'),
				'it-IT': this.language.get('text_it'),
				'en-GB': this.language.get('text_uk')
			};
		}

		data['payment_regions'] = {
			'EUR': this.language.get('text_eu_region'),
			'GBP': this.language.get('text_uk_region'),
			'USD': this.language.get('text_us_region')
		};

		data['has_ssl'] = (this.request.server['HTTPS']);

		data['has_modify_permission'] = await this.user.hasPermission('modify', 'extension/payment/amazon_login_pay');
		data['text_generic_password'] = str_repeat('*', 32);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/amazon_login_pay', data));
	}

	async install() {
		this.load.model('extension/payment/amazon_login_pay', this);
		await this.model_extension_payment_amazon_login_pay.install();
		await this.model_extension_payment_amazon_login_pay.deleteEvents();
		await this.model_extension_payment_amazon_login_pay.addEvents();
	}

	async uninstall() {
		this.load.model('extension/payment/amazon_login_pay', this);
		this.load.model('setting/event', this);
		await this.model_extension_payment_amazon_login_pay.uninstall();
		await this.model_extension_payment_amazon_login_pay.deleteEvents();
	}

	async order() {

		if (this.config.get('payment_amazon_login_pay_status')) {

			this.load.model('extension/payment/amazon_login_pay', this);

			const amazon_login_pay_order = await this.model_extension_payment_amazon_login_pay.getOrder(this.request.get['order_id']);

			if ((amazon_login_pay_order.amazon_login_pay_order_id)) {

				await this.load.language('extension/payment/amazon_login_pay');

				amazon_login_pay_order['total_captured'] = await this.model_extension_payment_amazon_login_pay.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

				amazon_login_pay_order['total_formatted'] = this.currency.format(amazon_login_pay_order['total'], amazon_login_pay_order['currency_code'], true, true);
				amazon_login_pay_order['total_captured_formatted'] = this.currency.format(amazon_login_pay_order['total_captured'], amazon_login_pay_order['currency_code'], true, true);

				data['amazon_login_pay_order'] = amazon_login_pay_order;

				data['order_id'] = this.request.get['order_id'];
				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/amazon_login_pay_order', data);
			}
		}
	}

	async cancel() {
		await this.load.language('extension/payment/amazon_login_pay');
		const json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '') {
			this.load.model('extension/payment/amazon_login_pay', this);

			const amazon_login_pay_order = await this.model_extension_payment_amazon_login_pay.getOrder(this.request.post['order_id']);

			const cancel_response = await this.model_extension_payment_amazon_login_pay.cancel(amazon_login_pay_order);

			await this.model_extension_payment_amazon_login_pay.logger(cancel_response);

			if (cancel_response['status'] == 'Completed') {
				await this.model_extension_payment_amazon_login_pay.addTransaction(amazon_login_pay_order['amazon_login_pay_order_id'], 'cancel', cancel_response['status'], 0.00);
				await this.model_extension_payment_amazon_login_pay.updateCancelStatus(amazon_login_pay_order['amazon_login_pay_order_id'], 1);
				json['msg'] = this.language.get('text_cancel_ok');
				json['data'] = {};
				json['data']['date_added'] = date("Y-m-d H:i:s");
				json['data']['type'] = 'cancel';
				json['data']['status'] = cancel_response['status'];
				json['data']['amount'] = this.currency.format(0.00, amazon_login_pay_order['currency_code'], true, true);
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (cancel_response['StatuesDetail']) && (cancel_response['StatuesDetail']) ? cancel_response['StatuesDetail'] : 'Unable to cancel';
			}
		} else {
			json['error'] = true;
			json['msg'] = this.language.get('error_data_missing');
		}

		this.response.setOutput(json);
	}

	async capture() {
		await this.load.language('extension/payment/amazon_login_pay');
		const json = {};

		if ((this.request.post['order_id']) && this.request.post['order_id'] != '' && (this.request.post['amount']) && this.request.post['amount'] > 0) {
			this.load.model('extension/payment/amazon_login_pay', this);

			const amazon_login_pay_order = await this.model_extension_payment_amazon_login_pay.getOrder(this.request.post['order_id']);

			const capture_response = await this.model_extension_payment_amazon_login_pay.capture(amazon_login_pay_order, this.request.post['amount']);
			await this.model_extension_payment_amazon_login_pay.logger(capture_response);

			if (capture_response['status'] == 'Completed' || capture_response['status'] == 'Pending') {
				await this.model_extension_payment_amazon_login_pay.addTransaction(amazon_login_pay_order['amazon_login_pay_order_id'], 'capture', capture_response['status'], this.request.post['amount'], capture_response['AmazonAuthorizationId'], capture_response['AmazonCaptureId']);

				await this.model_extension_payment_amazon_login_pay.updateAuthorizationStatus(capture_response['AmazonAuthorizationId'], 'Closed');

				const total_captured = await this.model_extension_payment_amazon_login_pay.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);

				if (total_captured > 0) {
					const order_reference_id = amazon_login_pay_order['amazon_order_reference_id'];

					if (await this.model_extension_payment_amazon_login_pay.isOrderInState(order_reference_id, array('Open', 'Suspended'))) {
						await this.model_extension_payment_amazon_login_pay.closeOrderRef(order_reference_id);
					}
				}
				let capture_status = 0;
				if (total_captured >= amazon_login_pay_order['total']) {
					await this.model_extension_payment_amazon_login_pay.updateCaptureStatus(amazon_login_pay_order['amazon_login_pay_order_id'], 1);
					capture_status = 1;
					json['msg'] = this.language.get('text_capture_ok_order');
				} else {
					capture_status = 0;
					json['msg'] = this.language.get('text_capture_ok');
				}

				json['data'] = {};
				json['data']['date_added'] = date("Y-m-d H:i:s");
				json['data']['type'] = 'capture';
				json['data']['status'] = capture_response['status'];
				json['data']['amazon_authorization_id'] = capture_response['AmazonAuthorizationId'];
				json['data']['amazon_capture_id'] = capture_response['AmazonCaptureId'];
				json['data']['amount'] = this.currency.format(this.request.post['amount'], amazon_login_pay_order['currency_code'], true, true);
				json['data']['capture_status'] = capture_status;
				json['data']['total'] = this.currency.format(total_captured, amazon_login_pay_order['currency_code'], true, true);
				json['error'] = false;
			} else {
				json['error'] = true;
				json['msg'] = (capture_response['status_detail']) && (capture_response['status_detail']) ? capture_response['status_detail'] : 'Unable to capture';
			}
		} else {
			json['error'] = true;
			json['msg'] = this.language.get('error_data_missing');
		}

		this.response.setOutput(json);
	}

	async refund() {
		await this.load.language('extension/payment/amazon_login_pay');
		const json = {};
		json['msg'] = [];
		json['data'] = [];
		json['error_msg'] = [];
		if ((this.request.post['order_id']) && (this.request.post['order_id'])) {
			this.load.model('extension/payment/amazon_login_pay', this);

			const amazon_login_pay_order = await this.model_extension_payment_amazon_login_pay.getOrder(this.request.post['order_id']);

			const refund_response = await this.model_extension_payment_amazon_login_pay.refund(amazon_login_pay_order, this.request.post['amount']);

			await this.model_extension_payment_amazon_login_pay.logger(refund_response);

			let refund_status = '';
			let total_captured = '';
			let total_refunded = '';

			for (let response of refund_response) {
				if (response['status'] == 'Pending') {
					await this.model_extension_payment_amazon_login_pay.addTransaction(amazon_login_pay_order['amazon_login_pay_order_id'], 'refund', response['status'], response['amount'] * -1, response['amazon_authorization_id'], response['amazon_capture_id'], response['AmazonRefundId']);

					const total_refunded = await this.model_extension_payment_amazon_login_pay.getTotalRefunded(amazon_login_pay_order['amazon_login_pay_order_id']);
					const total_captured = await this.model_extension_payment_amazon_login_pay.getTotalCaptured(amazon_login_pay_order['amazon_login_pay_order_id']);
					let refund_status = 0;
					if (total_captured <= 0 && amazon_login_pay_order['capture_status'] == 1) {
						await this.model_extension_payment_amazon_login_pay.updateRefundStatus(amazon_login_pay_order['amazon_login_pay_order_id'], 1);
						refund_status = 1;
						json['msg'].push(this.language.get('text_refund_ok_order') + '<br />');
					} else {
						refund_status = 0;
						json['msg'].push(this.language.get('text_refund_ok') + '<br />');
					}

					const data = {};
					data['date_added'] = date("Y-m-d H:i:s");
					data['type'] = 'refund';
					data['status'] = response['status'];
					data['amazon_authorization_id'] = response['amazon_authorization_id'];
					data['amazon_capture_id'] = response['amazon_capture_id'];
					data['amazon_refund_id'] = response['AmazonRefundId'];
					data['amount'] = this.currency.format((response['amount'] * -1), amazon_login_pay_order['currency_code'], true, true);
					json['data'].push(data);
				} else {
					json['error'] = true;
					json['error_msg'].push((response['status_detail']) && (response['status_detail']) ? response['status_detail'] : 'Unable to refund');
				}
			}
			json['refund_status'] = refund_status;
			json['total_captured'] = this.currency.format(total_captured, amazon_login_pay_order['currency_code'], true, true);
			json['total_refunded'] = this.currency.format(total_refunded, amazon_login_pay_order['currency_code'], true, true);
		} else {
			json['error'] = true;
			json['error_msg'].push(this.language.get('error_data_missing'));
		}
		this.response.setOutput(json);
	}

	trimIntegrationDetails() {
		const integration_keys = [
			'payment_amazon_login_pay_merchant_id',
			'payment_amazon_login_pay_access_key',
			'payment_amazon_login_pay_access_secret',
			'payment_amazon_login_pay_client_id',
			'payment_amazon_login_pay_client_secret'
		];

		for (let [key, value] of Object.entries(this.request.post)) {
			if (integration_keys.includes(key)) {
				this.request.post[key] = value.trim();
			}
		}
	}

	async validate() {
		this.load.model('localisation/currency', this);

		if (!await this.user.hasPermission('modify', 'extension/payment/amazon_login_pay')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_amazon_login_pay_merchant_id']) {
			this.error['error_merchant_id'] = this.language.get('error_merchant_id');
		}

		if (!this.request.post['payment_amazon_login_pay_access_key']) {
			this.error['error_access_key'] = this.language.get('error_access_key');
		}

		if (!Object.keys(this.error).length) {
			this.load.model('extension/payment/amazon_login_pay', this);
			const errors = await this.model_extension_payment_amazon_login_pay.validateDetails(this.request.post);
			if ((errors['error_code']) && errors['error_code'] == 'InvalidParameterValue') {
				this.error['error_merchant_id'] = errors['status_detail'];
			} else if ((errors['error_code']) && errors['error_code'] == 'InvalidAccessKeyId') {
				this.error['error_access_key'] = errors['status_detail'];
			}
		}

		if (!this.request.post['payment_amazon_login_pay_access_secret']) {
			this.error['error_access_secret'] = this.language.get('error_access_secret');
		}

		if (!this.request.post['payment_amazon_login_pay_client_id']) {
			this.error['error_client_id'] = this.language.get('error_client_id');
		}

		if (!this.request.post['payment_amazon_login_pay_client_secret']) {
			this.error['error_client_secret'] = this.language.get('error_client_secret');
		}

		if (this.request.post['payment_amazon_login_pay_minimum_total'] <= 0) {
			this.error['error_minimum_total'] = this.language.get('error_minimum_total');
		}

		if ((this.request.post['amazon_login_pay_region'])) {
			const currency_code = this.request.post['amazon_login_pay_region'];

			const currency = await this.model_localisation_currency.getCurrency(await this.currency.getId(currency_code));

			if (!currency.currency_id || currency['status'] != '1') {
				this.error['error_curreny'] = sprintf(this.language.get('error_curreny'), currency_code);
			}
		}

		return Object.keys(this.error).length ? false : true
	}

}
