const array_replace_recursive = require("locutus/php/array/array_replace_recursive");
const strtotime = require("locutus/php/datetime/strtotime");
const mt_rand = require("locutus/php/math/mt_rand");
const uniqid = require("locutus/php/misc/uniqid");
const sha1 = require("locutus/php/strings/sha1");
const str_replace = require("locutus/php/strings/str_replace");

module.exports = class ControllerExtensionPaymentPayPal extends Controller {
	error = {};

	constructor(registry) {
		super(registry);


	}
	async init() {
		if (!(this.config.get('paypal_version')) || ((this.config.get('paypal_version')) && (this.config.get('paypal_version') < '3.0.0'))) {
			await this.uninstall();
			await this.install();
		}
	}
	async index() {
		const data = {};
		let server = HTTP_SERVER;
		let catalog = HTTP_CATALOG;
		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			server = HTTPS_SERVER;
			catalog = HTTPS_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		let config_setting = _config.get('paypal_setting');

		let cache_data = await this.cache.get('paypal');

		await this.cache.delete('paypal');

		if (cache_data && (cache_data['environment']) && (cache_data['authorization_code']) && (cache_data['shared_id']) && (cache_data['seller_nonce']) && (this.request.get['merchantIdInPayPal'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let environment = cache_data['environment'];

			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': cache_data['shared_id'],
				'environment': environment,
				'partner_attribution_id': config_setting['partner'][environment]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'authorization_code',
				'code': cache_data['authorization_code'],
				'code_verifier': cache_data['seller_nonce']
			};

			await paypal.setAccessToken(token_info);

			const result = await paypal.getSellerCredentials(config_setting['partner'][environment]['partner_id']);

			let client_id = '';
			let secret = '';

			if ((result['client_id']) && (result['client_secret'])) {
				client_id = result['client_id'];
				secret = result['client_secret'];
			}

			paypal_info = {
				'partner_id': config_setting['partner'][environment]['partner_id'],
				'client_id': client_id,
				'secret': secret,
				'environment': environment,
				'partner_attribution_id': config_setting['partner'][environment]['partner_attribution_id']
			};

			paypal = new PayPal(paypal_info);

			token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			let callback_token = sha1(uniqid(mt_rand(), 1));
			let webhook_token = sha1(uniqid(mt_rand(), 1));
			let cron_token = sha1(uniqid(mt_rand(), 1));

			const webhook_info = {
				'url': catalog + '?route=extension/payment/paypal&webhook_token=' + webhook_token,
				'event_types': [
					{ 'name': 'PAYMENT.AUTHORIZATION.CREATED' },
					{ 'name': 'PAYMENT.AUTHORIZATION.VOIDED' },
					{ 'name': 'PAYMENT.CAPTURE.COMPLETED' },
					{ 'name': 'PAYMENT.CAPTURE.DENIED' },
					{ 'name': 'PAYMENT.CAPTURE.PENDING' },
					{ 'name': 'PAYMENT.CAPTURE.REFUNDED' },
					{ 'name': 'PAYMENT.CAPTURE.REVERSED' },
					{ 'name': 'CHECKOUT.ORDER.COMPLETED' },
					{ 'name': 'VAULT.PAYMENT-TOKEN.CREATED' }
				]
			};

			result = await paypal.createWebhook(webhook_info);

			let webhook_id = '';

			if ((result['id'])) {
				webhook_id = result['id'];
			}

			if (await paypal.hasErrors()) {
				const error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}

			let merchant_id = this.request.get['merchantIdInPayPal'];

			this.load.model('setting/setting', this);

			let setting = await this.model_setting_setting.getSetting('payment_paypal');

			setting['payment_paypal_environment'] = environment;
			setting['payment_paypal_client_id'] = client_id;
			setting['payment_paypal_secret'] = secret;
			setting['payment_paypal_merchant_id'] = merchant_id;
			setting['payment_paypal_webhook_id'] = webhook_id;
			setting['payment_paypal_status'] = 1;
			setting['payment_paypal_total'] = 0;
			setting['payment_paypal_geo_zone_id'] = 0;
			setting['payment_paypal_sort_order'] = 0;
			setting['payment_paypal_setting']['general']['callback_token'] = callback_token;
			setting['payment_paypal_setting']['general']['webhook_token'] = webhook_token;
			setting['payment_paypal_setting']['general']['cron_token'] = cron_token;

			this.load.model('localisation/country', this);

			const country = await this.model_localisation_country.getCountry(this.config.get('config_country_id'));

			setting['payment_paypal_setting']['general']['country_code'] = country['iso_code_2'];

			let currency_code = this.config.get('config_currency');
			let currency_value = this.currency.getValue(this.config.get('config_currency'));

			if ((config_setting['currency'][currency_code]['status'])) {
				setting['payment_paypal_setting']['general']['currency_code'] = currency_code;
				setting['payment_paypal_setting']['general']['currency_value'] = currency_value;
			}

			if ((config_setting['currency'][currency_code]['card_status'])) {
				setting['payment_paypal_setting']['general']['card_currency_code'] = currency_code;
				setting['payment_paypal_setting']['general']['card_currency_value'] = currency_value;
			}

			await this.model_setting_setting.editSetting('payment_paypal', setting);
		}

		if ((this.request.get['merchantIdInPayPal']) && !this.error.warning) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		if (!this.config.get('payment_paypal_client_id')) {
			await this.auth();
		} else {
			await this.dashboard();
		}
	}

	async auth() {
		const data = {};
		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['partner_url'] = str_replace('&amp;', '%26', await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		data['callback_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/callback', 'user_token=' + this.session.data['user_token'], true));
		data['connect_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/connect', 'user_token=' + this.session.data['user_token'], true));
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['authorization_type'] = 'automatic';
		data['environment'] = 'production';

		data['seller_nonce'] = this.token(50);

		data['configure_url'] = {
			'production': {
				'ppcp': 'https://www.paypal.com/bizsignup/partner/entry?partnerId=' + data['setting']['partner']['production']['partner_id'] + '&partnerClientId=' + data['setting']['partner']['production']['client_id'] + '&features=PAYMENT,REFUND,ACCESS_MERCHANT_INFORMATION,VAULT,BILLING_AGREEMENT&product=PPCP,ADVANCED_VAULTING&capabilities=PAYPAL_WALLET_VAULTING_ADVANCED&integrationType=FO&returnToPartnerUrl=' + data['partner_url'] + '&displayMode=minibrowser&sellerNonce=' + data['seller_nonce'],
				'express_checkout': 'https://www.paypal.com/bizsignup/partner/entry?partnerId=' + data['setting']['partner']['production']['partner_id'] + '&partnerClientId=' + data['setting']['partner']['production']['client_id'] + '&features=PAYMENT,REFUND,ACCESS_MERCHANT_INFORMATION,VAULT,BILLING_AGREEMENT&product=EXPRESS_CHECKOUT,ADVANCED_VAULTING&capabilities=PAYPAL_WALLET_VAULTING_ADVANCED&integrationType=FO&returnToPartnerUrl=' + data['partner_url'] + '&displayMode=minibrowser&sellerNonce=' + data['seller_nonce']
			},
			'sandbox': {
				'ppcp': 'https://www.sandbox.paypal.com/bizsignup/partner/entry?partnerId=' + data['setting']['partner']['sandbox']['partner_id'] + '&partnerClientId=' + data['setting']['partner']['sandbox']['client_id'] + '&features=PAYMENT,REFUND,ACCESS_MERCHANT_INFORMATION,VAULT,BILLING_AGREEMENT&product=PPCP,ADVANCED_VAULTING&capabilities=PAYPAL_WALLET_VAULTING_ADVANCED&integrationType=FO&returnToPartnerUrl=' + data['partner_url'] + '&displayMode=minibrowser&sellerNonce=' + data['seller_nonce'],
				'express_checkout': 'https://www.sandbox.paypal.com/bizsignup/partner/entry?partnerId=' + data['setting']['partner']['sandbox']['partner_id'] + '&partnerClientId=' + data['setting']['partner']['sandbox']['client_id'] + '&features=PAYMENT,REFUND,ACCESS_MERCHANT_INFORMATION,VAULT,BILLING_AGREEMENT&product=EXPRESS_CHECKOUT,ADVANCED_VAULTING&capabilities=PAYPAL_WALLET_VAULTING_ADVANCED&integrationType=FO&returnToPartnerUrl=' + data['partner_url'] + '&displayMode=minibrowser&sellerNonce=' + data['seller_nonce']
			}
		};

		data['text_checkout_express'] = sprintf(this.language.get('text_checkout_express'), data['configure_url'][data['environment']]['express_checkout']);
		data['text_support'] = sprintf(this.language.get('text_support'), this.request.server['HTTP_HOST']);

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/auth', data));
	}

	async dashboard() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);
		this.load.model('setting/setting', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['sale_analytics_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/getSaleAnalytics', 'user_token=' + this.session.data['user_token'], true));
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		if (Number(this.config.get('payment_paypal_status')) != null) {
			data['status'] = Number(this.config.get('payment_paypal_status'));
		} else {
			data['status'] = 1;
		}

		if (data['setting']['button']['product']['status'] || data['setting']['button']['cart']['status'] || data['setting']['button']['checkout']['status']) {
			data['button_status'] = 1;
		} else {
			data['button_status'] = 0;
		}

		if (data['setting']['googlepay_button']['product']['status'] || data['setting']['googlepay_button']['cart']['status'] || data['setting']['googlepay_button']['checkout']['status']) {
			data['googlepay_button_status'] = 1;
		} else {
			data['googlepay_button_status'] = 0;
		}

		if (data['setting']['applepay_button']['product']['status'] || data['setting']['applepay_button']['cart']['status'] || data['setting']['applepay_button']['checkout']['status']) {
			data['applepay_button_status'] = 1;
		} else {
			data['applepay_button_status'] = 0;
		}

		if (data['setting']['card']['status']) {
			data['card_status'] = 1;
		} else {
			data['card_status'] = 0;
		}

		if (data['setting']['message']['home']['status'] || data['setting']['message']['product']['status'] || data['setting']['message']['cart']['status'] || data['setting']['message']['checkout']['status']) {
			data['message_status'] = 1;
		} else {
			data['message_status'] = 0;
		}

		let paypal_sale_total = await this.model_extension_payment_paypal.getTotalSales();

		data['paypal_sale_total'] = this.currency.format(paypal_sale_total, this.config.get('config_currency'));

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/dashboard', data));
	}

	async general() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['disconnect_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/disconnect', 'user_token=' + this.session.data['user_token'], true));
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		if (Number(this.config.get('payment_paypal_status')) != null) {
			data['status'] = Number(this.config.get('payment_paypal_status'));
		} else {
			data['status'] = 1;
		}

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');

		data['text_connect'] = sprintf(this.language.get('text_connect'), data['merchant_id'], data['client_id'], data['secret'], data['webhook_id'], data['environment']);

		data['total'] = this.config.get('payment_paypal_total');
		data['geo_zone_id'] = this.config.get('payment_paypal_geo_zone_id');
		data['sort_order'] = this.config.get('payment_paypal_sort_order');

		this.load.model('localisation/geo_zone', this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		data['cron_url'] = data['catalog'] + '?route=extension/payment/paypal&cron_token=' + data['setting']['general']['cron_token'];

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/general', data));
	}

	async button() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/paypal.js');
		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_attribution_id'] = data['setting']['partner'][data['environment']]['partner_attribution_id'];

		let country = await this.model_extension_payment_paypal.getCountryByCode(data['setting']['general']['country_code']);

		data['locale'] = this.config.get('config_language').replace(new RegExp('/-(.+?)+/'), '') + '_' + country['iso_code_2'];

		data['currency_code'] = data['setting']['general']['currency_code'];
		data['currency_value'] = data['setting']['general']['currency_value'];

		data['decimal_place'] = data['setting']['currency'][data['currency_code']]['decimal_place'];

		if (data['client_id'] && data['secret']) {
			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': data['client_id'],
				'secret': data['secret'],
				'environment': data['environment'],
				'partner_attribution_id': data['setting']['partner'][data['environment']]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			data['client_token'] = await paypal.getClientToken();

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}
		}

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/button', data));
	}

	async googlepay_button() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/paypal.js');
		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');
		this.document.addScript('https://pay.google.com/gp/p/js/pay.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_attribution_id'] = data['setting']['partner'][data['environment']]['partner_attribution_id'];

		let country = await this.model_extension_payment_paypal.getCountryByCode(data['setting']['general']['country_code']);

		data['locale'] = this.config.get('config_language').replace(new RegExp('/-(.+?)+/'), '') + '_' + country['iso_code_2'];

		data['currency_code'] = data['setting']['general']['currency_code'];
		data['currency_value'] = data['setting']['general']['currency_value'];

		data['decimal_place'] = data['setting']['currency'][data['currency_code']]['decimal_place'];

		if (data['client_id'] && data['secret']) {
			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': data['client_id'],
				'secret': data['secret'],
				'environment': data['environment'],
				'partner_attribution_id': data['setting']['partner'][data['environment']]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			data['client_token'] = await paypal.getClientToken();

			if (paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}
		}

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/googlepay_button', data));
	}

	async applepay_button() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/paypal.js');
		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');
		this.document.addScript('https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['applepay_download_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/downloadAssociationFile', 'user_token=' + this.session.data['user_token'], true));
		data['applepay_download_host_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/downloadHostAssociationFile', 'user_token=' + this.session.data['user_token'], true));
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_attribution_id'] = data['setting']['partner'][data['environment']]['partner_attribution_id'];

		let country = await this.model_extension_payment_paypal.getCountryByCode(data['setting']['general']['country_code']);

		data['locale'] = this.config.get('config_language').replace(new RegExp('/-(.+?)+/'), '') + '_' + country['iso_code_2'];

		data['currency_code'] = data['setting']['general']['currency_code'];
		data['currency_value'] = data['setting']['general']['currency_value'];

		data['decimal_place'] = data['setting']['currency'][data['currency_code']]['decimal_place'];

		if (data['client_id'] && data['secret']) {
			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': data['client_id'],
				'secret': data['secret'],
				'environment': data['environment'],
				'partner_attribution_id': data['setting']['partner'][data['environment']]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			data['client_token'] = await paypal.getClientToken();

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (errors of error) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}
		}

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/applepay_button', data));
	}

	async card() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/card.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/paypal.js');
		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_attribution_id'] = data['setting']['partner'][data['environment']]['partner_attribution_id'];

		let country = await this.model_extension_payment_paypal.getCountryByCode(data['setting']['general']['country_code']);

		data['locale'] = this.config.get('config_language').replace(new RegExp('/-(.+?)+/'), '') + '_' + country['iso_code_2'];

		data['currency_code'] = data['setting']['general']['currency_code'];
		data['currency_value'] = data['setting']['general']['currency_value'];

		data['decimal_place'] = data['setting']['currency'][data['currency_code']]['decimal_place'];

		if (data['client_id'] && data['secret']) {
			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': data['client_id'],
				'secret': data['secret'],
				'environment': data['environment'],
				'partner_attribution_id': data['setting']['partner'][data['environment']]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			data['client_token'] = await paypal.getClientToken();

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}
		}

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/card', data));
	}

	async message_configurator() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/paypal.js');
		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');
		this.document.addScript('https://www.paypalobjects.com/merchant-library/merchant-configurator.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_client_id'] = data['setting']['partner'][data['environment']]['client_id'];
		data['partner_attribution_id'] = data['setting']['partner'][data['environment']]['partner_attribution_id'];

		country = await this.model_extension_payment_paypal.getCountryByCode(data['setting']['general']['country_code']);

		data['locale'] = this.config.get('config_language').replace(new RegExp('/-(.+?)+/'), '') + '_' + country['iso_code_2'];

		data['currency_code'] = data['setting']['general']['currency_code'];
		data['currency_value'] = data['setting']['general']['currency_value'];

		data['decimal_place'] = data['setting']['currency'][data['currency_code']]['decimal_place'];

		if (data['client_id'] && data['secret']) {
			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': data['client_id'],
				'secret': data['secret'],
				'environment': data['environment'],
				'partner_attribution_id': data['setting']['partner'][data['environment']]['partner_attribution_id']
			};

			const paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			data['client_token'] = await paypal.getClientToken();

			if (paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}
		}

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/message_configurator', data));
	}

	async message_setting() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');
		this.document.addStyle('view/stylesheet/paypal/bootstrap-switch.css');

		this.document.addScript('view/javascript/paypal/paypal.js');
		this.document.addScript('view/javascript/paypal/bootstrap-switch.js');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		data['client_id'] = this.config.get('payment_paypal_client_id');
		data['secret'] = this.config.get('payment_paypal_secret');
		data['merchant_id'] = this.config.get('payment_paypal_merchant_id');
		data['webhook_id'] = this.config.get('payment_paypal_webhook_id');
		data['environment'] = this.config.get('payment_paypal_environment');
		data['partner_client_id'] = data['setting']['partner'][data['environment']]['client_id'];
		data['partner_attribution_id'] = data['setting']['partner'][data['environment']]['partner_attribution_id'];

		let country = await this.model_extension_payment_paypal.getCountryByCode(data['setting']['general']['country_code']);

		data['locale'] = this.config.get('config_language').replace(new RegExp('/-(.+?)+/'), '') + '_' + country['iso_code_2'];

		data['currency_code'] = data['setting']['general']['currency_code'];
		data['currency_value'] = data['setting']['general']['currency_value'];

		data['decimal_place'] = data['setting']['currency'][data['currency_code']]['decimal_place'];

		if (country['iso_code_2'] == 'GB') {
			data['text_message_alert'] = this.language.get('text_message_alert_uk');
			data['text_message_footnote'] = this.language.get('text_message_footnote_uk');
		} else if (country['iso_code_2'] == 'US') {
			data['text_message_alert'] = this.language.get('text_message_alert_us');
			data['text_message_footnote'] = this.language.get('text_message_footnote_us');
		}

		if (data['client_id'] && data['secret']) {
			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'client_id': data['client_id'],
				'secret': data['secret'],
				'environment': data['environment'],
				'partner_attribution_id': data['setting']['partner'][data['environment']]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			data['client_token'] = await paypal.getClientToken();

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}
		}

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/message_setting', data));
	}

	async order_status() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/order_status', data));
	}

	async contact() {
		const data = {};
		if (!this.config.get('payment_paypal_client_id')) {
			this.response.setRedirect(await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true));
		}

		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		this.document.addStyle('view/stylesheet/paypal/paypal.css');

		this.document.setTitle(this.language.get('heading_title_main'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extensions'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title_main'),
			'href': await this.url.link('extension/payment/paypal', 'user_token=' + this.session.data['user_token'], true)
		});

		// Action
		data['href_dashboard'] = await this.url.link('extension/payment/paypal/dashboard', 'user_token=' + this.session.data['user_token'], true);
		data['href_general'] = await this.url.link('extension/payment/paypal/general', 'user_token=' + this.session.data['user_token'], true);
		data['href_button'] = await this.url.link('extension/payment/paypal/button', 'user_token=' + this.session.data['user_token'], true);
		data['href_googlepay_button'] = await this.url.link('extension/payment/paypal/googlepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_applepay_button'] = await this.url.link('extension/payment/paypal/applepay_button', 'user_token=' + this.session.data['user_token'], true);
		data['href_card'] = await this.url.link('extension/payment/paypal/card', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_configurator'] = await this.url.link('extension/payment/paypal/message_configurator', 'user_token=' + this.session.data['user_token'], true);
		data['href_message_setting'] = await this.url.link('extension/payment/paypal/message_setting', 'user_token=' + this.session.data['user_token'], true);
		data['href_order_status'] = await this.url.link('extension/payment/paypal/order_status', 'user_token=' + this.session.data['user_token'], true);
		data['href_contact'] = await this.url.link('extension/payment/paypal/contact', 'user_token=' + this.session.data['user_token'], true);

		data['action'] = await this.url.link('extension/payment/paypal/save', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);
		data['contact_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/sendContact', 'user_token=' + this.session.data['user_token'], true));
		data['agree_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/agree', 'user_token=' + this.session.data['user_token'], true));

		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			data['server'] = HTTPS_SERVER;
			data['catalog'] = HTTPS_CATALOG;
		} else {
			data['server'] = HTTP_SERVER;
			data['catalog'] = HTTP_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		data['setting'] = _config.get('paypal_setting');

		data['setting'] = array_replace_recursive(data['setting'], this.config.get('payment_paypal_setting'));

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		let result = await this.model_extension_payment_paypal.checkVersion(VERSION, data['setting']['version']);

		if ((result['href'])) {
			data['text_version'] = sprintf(this.language.get('text_version'), result['href']);
		} else {
			data['text_version'] = '';
		}

		let agree_status = await this.model_extension_payment_paypal.getAgreeStatus();

		if (!agree_status) {
			this.error['warning'] = this.language.get('error_agree');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypal/contact', data));
	}

	async save() {
		const data = {};
		await this.load.language('extension/payment/paypal');

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			let setting = await this.model_setting_setting.getSetting('payment_paypal');

			setting = array_replace_recursive(setting, this.request.post);

			await this.model_setting_setting.editSetting('payment_paypal', setting);

			data['success'] = this.language.get('success_save');
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async connect() {
		await this.load.language('extension/payment/paypal');
		let server = HTTP_SERVER;
		let catalog = HTTP_CATALOG;
		if ((this.request.server['HTTPS']) && ((this.request.server['HTTPS'] == 'on') || (this.request.server['HTTPS'] == '1'))) {
			server = HTTPS_SERVER;
			catalog = HTTPS_CATALOG;
		}

		const _config = new Config();
		await _config.load('paypal');

		let config_setting = _config.get('paypal_setting');

		if ((this.request.post['environment']) && (this.request.post['client_id']) && (this.request.post['client_secret']) && (this.request.post['merchant_id'])) {
			this.load.model('extension/payment/paypal', this);

			let environment = this.request.post['environment'];
			let client_id = this.request.post['client_id'];
			let secret = this.request.post['client_secret'];
			let merchant_id = this.request.post['merchant_id'];

			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'partner_id': config_setting['partner'][environment]['partner_id'],
				'client_id': client_id,
				'secret': secret,
				'environment': environment,
				'partner_attribution_id': config_setting['partner'][environment]['partner_attribution_id']
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			let result = await paypal.setAccessToken(token_info);

			if (result) {
				let callback_token = sha1(uniqid(mt_rand(), 1));
				let webhook_token = sha1(uniqid(mt_rand(), 1));
				let cron_token = sha1(uniqid(mt_rand(), 1));

				let webhook_info = {
					'url': catalog + '?route=extension/payment/paypal&webhook_token=' + webhook_token,
					'event_types': [
						{ 'name': 'PAYMENT.AUTHORIZATION.CREATED' },
						{ 'name': 'PAYMENT.AUTHORIZATION.VOIDED' },
						{ 'name': 'PAYMENT.CAPTURE.COMPLETED' },
						{ 'name': 'PAYMENT.CAPTURE.DENIED' },
						{ 'name': 'PAYMENT.CAPTURE.PENDING' },
						{ 'name': 'PAYMENT.CAPTURE.REFUNDED' },
						{ 'name': 'PAYMENT.CAPTURE.REVERSED' },
						{ 'name': 'CHECKOUT.ORDER.COMPLETED' },
						{ 'name': 'VAULT.PAYMENT-TOKEN.CREATED' }
					]
				};

				result = await paypal.createWebhook(webhook_info);

				let webhook_id = '';

				if ((result['id'])) {
					webhook_id = result['id'];
				}

				if (await paypal.hasErrors()) {
					let error_messages = [];

					let errors = await paypal.getErrors();

					for (let error of errors) {
						if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
							error['message'] = this.language.get('error_timeout');
						}

						if ((error['details'][0]['description'])) {
							error_messages.push(error['details'][0]['description']);
						} else if ((error['message'])) {
							error_messages.push(error['message']);
						}

						await this.model_extension_payment_paypal.log(error, error['message']);
					}

					this.error['warning'] = error_messages.join(' ');
				}

				if (!this.error.warning) {
					this.load.model('setting/setting', this);

					let setting = await this.model_setting_setting.getSetting('payment_paypal');

					setting['payment_paypal_environment'] = environment;
					setting['payment_paypal_client_id'] = client_id;
					setting['payment_paypal_secret'] = secret;
					setting['payment_paypal_merchant_id'] = merchant_id;
					setting['payment_paypal_webhook_id'] = webhook_id;
					setting['payment_paypal_status'] = 1;
					setting['payment_paypal_total'] = 0;
					setting['payment_paypal_geo_zone_id'] = 0;
					setting['payment_paypal_sort_order'] = 0;
					setting['payment_paypal_setting']['general']['callback_token'] = callback_token;
					setting['payment_paypal_setting']['general']['webhook_token'] = webhook_token;
					setting['payment_paypal_setting']['general']['cron_token'] = cron_token;

					this.load.model('localisation/country', this);

					let country = await this.model_localisation_country.getCountry(this.config.get('config_country_id'));

					setting['payment_paypal_setting']['general']['country_code'] = country['iso_code_2'];

					let currency_code = this.config.get('config_currency');
					let currency_value = this.currency.getValue(this.config.get('config_currency'));

					if ((config_setting['currency'][currency_code]['status'])) {
						setting['payment_paypal_setting']['general']['currency_code'] = currency_code;
						setting['payment_paypal_setting']['general']['currency_value'] = currency_value;
					}

					if ((config_setting['currency'][currency_code]['card_status'])) {
						setting['payment_paypal_setting']['general']['card_currency_code'] = currency_code;
						setting['payment_paypal_setting']['general']['card_currency_value'] = currency_value;
					}

					await this.model_setting_setting.editSetting('payment_paypal', setting);
				}
			} else {
				this.error['warning'] = this.language.get('error_connect');
			}
		} else {
			this.error['warning'] = this.language.get('error_connect');
		}
		const data = {};
		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async disconnect() {
		const data = {};
		this.load.model('setting/setting', this);

		let setting = await this.model_setting_setting.getSetting('payment_paypal');

		setting['payment_paypal_client_id'] = '';
		setting['payment_paypal_secret'] = '';
		setting['payment_paypal_merchant_id'] = '';
		setting['payment_paypal_webhook_id'] = '';

		await this.model_setting_setting.editSetting('payment_paypal', setting);

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async callback() {
		const cache_data = data = {};
		if ((this.request.post['environment']) && (this.request.post['authorization_code']) && (this.request.post['shared_id']) && (this.request.post['seller_nonce'])) {
			cache_data['environment'] = this.request.post['environment'];
			cache_data['authorization_code'] = this.request.post['authorization_code'];
			cache_data['shared_id'] = this.request.post['shared_id'];
			cache_data['seller_nonce'] = this.request.post['seller_nonce'];

			await this.cache.set('paypal', cache_data, 30);
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async getSaleAnalytics() {
		await this.load.language('extension/payment/paypal');

		const data = {};

		this.load.model('extension/payment/paypal', this);

		data['all_sale'] = {};
		data['paypal_sale'] = {};
		data['xaxis'] = {};

		data['all_sale']['label'] = this.language.get('text_all_sales');
		data['paypal_sale']['label'] = this.language.get('text_paypal_sales');
		data['all_sale']['data'] = [];
		data['paypal_sale']['data'] = [];
		let range = 'day';
		if ((this.request.get['range'])) {
			range = this.request.get['range'];
		}
		let results;
		switch (range) {
			default:
			case 'day':
				results = await this.model_extension_payment_paypal.getTotalSalesByDay();

				for (let [key, value] of Object.entries(results)) {
					data['all_sale']['data'].push([key, value['total']]);
					data['paypal_sale']['data'].push([key, value['paypal_total']]);
				}

				for (let i = 0; i < 24; i++) {
					data['xaxis'].push([i, i]);
				}

				break;
			case 'week':
				results = await this.model_extension_payment_paypal.getTotalSalesByWeek();

				for (let [key, value] of Object.entries(results)) {
					data['all_sale']['data'].push([key, value['total']]);
					data['paypal_sale']['data'].push([key, value['paypal_total']]);
				}

				let date_start = strtotime('-' + date('w') + ' days');

				for (let i = 0; i < 7; i++) {
					let date1 = date('Y-m-d', date_start + (i * 86400));

					data['xaxis'].push([date('w', strtotime(date)), date('D', strtotime(date1))]);
				}

				break;
			case 'month':
				results = await this.model_extension_payment_paypal.getTotalSalesByMonth();

				for (let [key, value] of Object.entries(results)) {
					data['all_sale']['data'].push([key, value['total']]);
					data['paypal_sale']['data'].push([key, value['paypal_total']]);
				}

				for (let i = 1; i <= date('t'); i++) {
					let date1 = date('Y') + '-' + date('m') + '-' + i;

					data['xaxis'].push([date('j', strtotime(date)), date('d', strtotime(date))]);
				}

				break;
			case 'year':
				results = await this.model_extension_payment_paypal.getTotalSalesByYear();

				for (let [key, value] of Object.entries(results)) {
					data['all_sale']['data'].push([key, value['total']]);
					data['paypal_sale']['data'].push([key, value['paypal_total']]);
				}

				for (let i = 1; i <= 12; i++) {
					data['xaxis'].push([i, date('M', mktime(0, 0, 0, i))]);
				}

				break;
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async downloadAssociationFile() {
		let environment = this.config.get('payment_paypal_environment');
		let file = 'https://www.paypalobjects.com/sandbox/apple-developer-merchantid-domain-association';

		if (environment == 'production') {
			file = 'https://www.paypalobjects.com/.well-known/apple-developer-merchantid-domain-association';

			const response = await require('axios').head(url);
			let file_headers = response.headers;

			if (file_headers[0].indexOf('404') !== -1) {
				file = 'https://www.paypalobjects.com/.well-known/apple-developer-merchantid-domain-association.txt';
			}
		} else {
			file = 'https://www.paypalobjects.com/sandbox/apple-developer-merchantid-domain-association';
		}

		this.response.addHeader('Content-Description: File Transfer');
		this.response.addHeader('Content-Type: text/plain');
		this.response.addHeader('Content-Disposition: attachment; filename="' + expressPath.basename(file, '.txt') + '"');
		this.response.addHeader('Expires: 0');
		this.response.addHeader('Cache-Control: must-revalidate');
		this.response.addHeader('Pragma: public');

		this.response.setFile(file);
	}

	async downloadHostAssociationFile() {
		const data = {};
		await this.load.language('extension/payment/paypal');

		let environment = this.config.get('payment_paypal_environment');
		let file = 'https://www.paypalobjects.com/sandbox/apple-developer-merchantid-domain-association';
		if (environment == 'production') {
			file = 'https://www.paypalobjects.com/.well-known/apple-developer-merchantid-domain-association';

			const response = await require('axios').head(url);
			let file_headers = response.headers;

			if (file_headers[0].indexOf('404') !== -1) {
				file = 'https://www.paypalobjects.com/.well-known/apple-developer-merchantid-domain-association.txt';
			}
		} else {
			file = 'https://www.paypalobjects.com/sandbox/apple-developer-merchantid-domain-association';
		}

		let content = fs.readFileSync(file);

		if (content) {
			let dir = DIR_APPLICATION.replace('admin/', '.well-known/');

			if (!is_file(dir)) {
				fs.mkdirSync(dir);
			}

			if (is_file(dir)) {
				fs.wirteFileSync(dir + expressPath.basename(file, '.txt'), content);
			}

			data['success'] = this.language.get('success_download_host');
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async sendContact() {
		const data = {};
		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		if ((this.request.post['payment_paypal_setting']['contact'])) {
			await this.model_extension_payment_paypal.sendContact(this.request.post['payment_paypal_setting']['contact']);

			data['success'] = this.language.get('success_send');
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async agree() {
		const data = {};
		await this.load.language('extension/payment/paypal');

		this.load.model('extension/payment/paypal', this);

		await this.model_extension_payment_paypal.setAgreeStatus();

		data['success'] = this.language.get('success_agree');

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async install() {
		this.load.model('extension/payment/paypal', this);

		await this.model_extension_payment_paypal.install();

		this.load.model('setting/event', this);

		await this.model_setting_event.deleteEventByCode('paypal_order_info');
		await this.model_setting_event.deleteEventByCode('paypal_header');
		await this.model_setting_event.deleteEventByCode('paypal_extension_get_extensions');
		await this.model_setting_event.deleteEventByCode('paypal_order_delete_order');
		await this.model_setting_event.deleteEventByCode('paypal_customer_delete_customer');

		await this.model_setting_event.addEvent('paypal_order_info', 'admin/view/sale/order_info/before', 'extension/payment/paypal/order_info_before');
		await this.model_setting_event.addEvent('paypal_header', 'catalog/controller/common/header/before', 'extension/payment/paypal/header_before');
		await this.model_setting_event.addEvent('paypal_extension_get_extensions', 'catalog/model/setting/extension/getExtensions/after', 'extension/payment/paypal/extension_get_extensions_after');
		await this.model_setting_event.addEvent('paypal_order_delete_order', 'catalog/model/checkout/order/deleteOrder/before', 'extension/payment/paypal/order_delete_order_before');
		await this.model_setting_event.addEvent('paypal_customer_delete_customer', 'admin/model/customer/customer/deleteCustomer/before', 'extension/payment/paypal/customer_delete_customer_before');

		const _config = new Config();
		await _config.load('paypal');

		let config_setting = _config.get('paypal_setting');
		let setting = {};
		setting['paypal_version'] = config_setting['version'];

		this.load.model('setting/setting', this);

		await this.model_setting_setting.editSetting('paypal_version', setting);
	}

	async uninstall() {
		this.load.model('extension/payment/paypal', this);

		await this.model_extension_payment_paypal.uninstall();

		this.load.model('setting/event', this);

		await this.model_setting_event.deleteEventByCode('paypal_order_info');
		await this.model_setting_event.deleteEventByCode('paypal_header');
		await this.model_setting_event.deleteEventByCode('paypal_extension_get_extensions');
		await this.model_setting_event.deleteEventByCode('paypal_order_delete_order');
		await this.model_setting_event.deleteEventByCode('paypal_customer_delete_customer');

		this.load.model('setting/setting', this);

		await this.model_setting_setting.deleteSetting('paypal_version');
	}

	async customer_delete_customer_before(route, data) {
		this.load.model('extension/payment/paypal', this);

		let customer_id = data[0];

		await this.model_extension_payment_paypal.deletePayPalCustomerTokens(customer_id);
	}

	async order_info_before(route, data) {
		if (Number(this.config.get('payment_paypal_status')) && (this.request.get['order_id'])) {
			await this.load.language('extension/payment/paypal', 'extension_payment_paypal');

			this.load.model('extension/payment/paypal', this);

			data['order_id'] = this.request.get['order_id'];

			const paypal_order_info = await this.model_extension_payment_paypal.getPayPalOrder(data['order_id']);

			if (paypal_order_info.transaction_id) {
				data['transaction_id'] = paypal_order_info['transaction_id'];
				data['transaction_status'] = paypal_order_info['transaction_status'];

				if (paypal_order_info['environment'] == 'production') {
					data['transaction_url'] = 'https://www.paypal.com/activity/payment/' + data['transaction_id'];
				} else {
					data['transaction_url'] = 'https://www.sandbox.paypal.com/activity/payment/' + data['transaction_id'];
				}

				data['info_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/getPaymentInfo', 'user_token=' + this.session.data['user_token'] + '&order_id=' + data['order_id'], true));
				data['capture_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/capturePayment', 'user_token=' + this.session.data['user_token'], true));
				data['reauthorize_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/reauthorizePayment', 'user_token=' + this.session.data['user_token'], true));
				data['void_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/voidPayment', 'user_token=' + this.session.data['user_token'], true));
				data['refund_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/refundPayment', 'user_token=' + this.session.data['user_token'], true));

				data['tabs'].push({
					'code': 'paypal',
					'title': this.language.get('extension_payment_paypal').get('heading_title_main'),
					'content': await this.load.view('extension/payment/paypal/order', data)
				});
			}
		}
		// return data;
	}

	async getPaymentInfo() {
		let content = '';
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.get['order_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			data['order_id'] = this.request.get['order_id'];

			const paypal_order_info = await this.model_extension_payment_paypal.getPayPalOrder(data['order_id']);

			if (paypal_order_info.transaction_id) {
				data['transaction_id'] = paypal_order_info['transaction_id'];
				data['transaction_status'] = paypal_order_info['transaction_status'];

				if (paypal_order_info['environment'] == 'production') {
					data['transaction_url'] = 'https://www.paypal.com/activity/payment/' + data['transaction_id'];
				} else {
					data['transaction_url'] = 'https://www.sandbox.paypal.com/activity/payment/' + data['transaction_id'];
				}

				data['info_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/getPaymentInfo', 'user_token=' + this.session.data['user_token'] + '&order_id=' + data['order_id'], true));
				data['capture_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/capturePayment', 'user_token=' + this.session.data['user_token'], true));
				data['reauthorize_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/reauthorizePayment', 'user_token=' + this.session.data['user_token'], true));
				data['void_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/voidPayment', 'user_token=' + this.session.data['user_token'], true));
				data['refund_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/refundPayment', 'user_token=' + this.session.data['user_token'], true));

				content = await this.load.view('extension/payment/paypal/order', data);
			}
		}

		this.response.setOutput(content);
	}

	async capturePayment() {
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.post['order_id']) && (this.request.post['transaction_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let order_id = this.request.post['order_id'];
			let transaction_id = this.request.post['transaction_id'];

			const _config = new Config();
			await _config.load('paypal');

			let config_setting = _config.get('paypal_setting');

			let setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));

			let client_id = this.config.get('payment_paypal_client_id');
			let secret = this.config.get('payment_paypal_secret');
			let environment = this.config.get('payment_paypal_environment');
			let partner_id = setting['partner'][environment]['partner_id'];
			let partner_attribution_id = setting['partner'][environment]['partner_attribution_id'];
			let transaction_method = setting['general']['transaction_method'];

			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'partner_id': partner_id,
				'client_id': client_id,
				'secret': secret,
				'environment': environment,
				'partner_attribution_id': partner_attribution_id
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			let result = await paypal.setPaymentCapture(transaction_id);

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}

			if ((result['id']) && (result['status']) && !this.error.warning) {
				let transaction_id = result['id'];
				let transaction_status = 'completed';

				let paypal_order_data = {
					'order_id': order_id,
					'transaction_id': transaction_id,
					'transaction_status': transaction_status
				};

				await this.model_extension_payment_paypal.editPayPalOrder(paypal_order_data);

				data['success'] = this.language.get('success_capture_payment');
			}
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async reauthorizePayment() {
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.post['order_id']) && (this.request.post['transaction_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let order_id = this.request.post['order_id'];
			let transaction_id = this.request.post['transaction_id'];

			const _config = new Config();
			await _config.load('paypal');

			let config_setting = _config.get('paypal_setting');

			let setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));

			let client_id = this.config.get('payment_paypal_client_id');
			let secret = this.config.get('payment_paypal_secret');
			let environment = this.config.get('payment_paypal_environment');
			let partner_id = setting['partner'][environment]['partner_id'];
			let partner_attribution_id = setting['partner'][environment]['partner_attribution_id'];
			let transaction_method = setting['general']['transaction_method'];

			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'partner_id': partner_id,
				'client_id': client_id,
				'secret': secret,
				'environment': environment,
				'partner_attribution_id': partner_attribution_id
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			let result = await paypal.setPaymentReauthorize(transaction_id);

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}

			if ((result['id']) && (result['status']) && !this.error.warning) {
				let transaction_id = result['id'];
				let transaction_status = 'created';

				await this.model_extension_payment_paypal.deletePayPalOrder(order_id);

				let paypal_order_data = {
					'order_id': order_id,
					'transaction_id': transaction_id,
					'transaction_status': transaction_status
				};

				await this.model_extension_payment_paypal.editPayPalOrder(paypal_order_data);

				data['success'] = this.language.get('success_reauthorize_payment');
			}
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async voidPayment() {
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.post['order_id']) && (this.request.post['transaction_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let order_id = this.request.post['order_id'];
			let transaction_id = this.request.post['transaction_id'];

			const _config = new Config();
			await _config.load('paypal');

			let config_setting = _config.get('paypal_setting');

			let setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));

			let client_id = this.config.get('payment_paypal_client_id');
			let secret = this.config.get('payment_paypal_secret');
			let environment = this.config.get('payment_paypal_environment');
			let partner_id = setting['partner'][environment]['partner_id'];
			let partner_attribution_id = setting['partner'][environment]['partner_attribution_id'];
			let transaction_method = setting['general']['transaction_method'];

			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'partner_id': partner_id,
				'client_id': client_id,
				'secret': secret,
				'environment': environment,
				'partner_attribution_id': partner_attribution_id
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			let result = await paypal.setPaymentVoid(transaction_id);

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}

			if (!this.error.warning) {
				let transaction_status = 'voided';

				await this.model_extension_payment_paypal.deletePayPalOrder(order_id);

				let paypal_order_data = {
					'order_id': order_id,
					'transaction_status': transaction_status
				};

				await this.model_extension_payment_paypal.editPayPalOrder(paypal_order_data);

				data['success'] = this.language.get('success_void_payment');
			}
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async refundPayment() {
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.post['order_id']) && (this.request.post['transaction_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let order_id = this.request.post['order_id'];
			let transaction_id = this.request.post['transaction_id'];

			const _config = new Config();
			await _config.load('paypal');

			let config_setting = _config.get('paypal_setting');

			let setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));

			let client_id = this.config.get('payment_paypal_client_id');
			let secret = this.config.get('payment_paypal_secret');
			let environment = this.config.get('payment_paypal_environment');
			let partner_id = setting['partner'][environment]['partner_id'];
			let partner_attribution_id = setting['partner'][environment]['partner_attribution_id'];
			let transaction_method = setting['general']['transaction_method'];

			const PayPal = require(DIR_SYSTEM + 'library/paypal/paypal.js');

			let paypal_info = {
				'partner_id': partner_id,
				'client_id': client_id,
				'secret': secret,
				'environment': environment,
				'partner_attribution_id': partner_attribution_id
			};

			let paypal = new PayPal(paypal_info);

			let token_info = {
				'grant_type': 'client_credentials'
			};

			await paypal.setAccessToken(token_info);

			let result = await paypal.setPaymentRefund(transaction_id);

			if (await paypal.hasErrors()) {
				let error_messages = [];

				let errors = await paypal.getErrors();

				for (let error of errors) {
					if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
						error['message'] = this.language.get('error_timeout');
					}

					if ((error['details'][0]['description'])) {
						error_messages.push(error['details'][0]['description']);
					} else if ((error['message'])) {
						error_messages.push(error['message']);
					}

					await this.model_extension_payment_paypal.log(error, error['message']);
				}

				this.error['warning'] = error_messages.join(' ');
			}

			if ((result['id']) && (result['status']) && !this.error.warning) {
				let transaction_status = 'refunded';

				let paypal_order_data = {
					'order_id': order_id,
					'transaction_status': transaction_status
				};

				await this.model_extension_payment_paypal.editPayPalOrder(paypal_order_data);

				data['success'] = this.language.get('success_refund_payment');
			}
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async recurringButtons() {
		const data = {};
		let content = '';

		if (Number(this.config.get('payment_paypal_status')) && (this.request.get['order_recurring_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('sale/recurring', this);

			data['order_recurring_id'] = this.request.get['order_recurring_id'];

			const order_recurring_info = await this.model_sale_recurring.getRecurring(data['order_recurring_id']);

			if (order_recurring_info.order_recurring_id) {
				data['recurring_status'] = order_recurring_info['status'];

				data['info_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/getRecurringInfo', 'user_token=' + this.session.data['user_token'] + '&order_recurring_id=' + data['order_recurring_id'], true));
				data['enable_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/enableRecurring', 'user_token=' + this.session.data['user_token'], true));
				data['disable_url'] = str_replace('&amp;', '&', await this.url.link('extension/payment/paypal/disableRecurring', 'user_token=' + this.session.data['user_token'], true));

				content = await this.load.view('extension/payment/paypal/recurring', data);
			}
		}

		return content;
	}

	async getRecurringInfo() {
		this.response.setOutput(await this.recurringButtons());
	}

	async enableRecurring() {
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.post['order_recurring_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let order_recurring_id = this.request.post['order_recurring_id'];

			await this.model_extension_payment_paypal.editOrderRecurringStatus(order_recurring_id, 1);

			data['success'] = this.language.get('success_enable_recurring');
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async disableRecurring() {
		const data = {};
		if (Number(this.config.get('payment_paypal_status')) && (this.request.post['order_recurring_id'])) {
			await this.load.language('extension/payment/paypal');

			this.load.model('extension/payment/paypal', this);

			let order_recurring_id = this.request.post['order_recurring_id'];

			await this.model_extension_payment_paypal.editOrderRecurringStatus(order_recurring_id, 2);

			data['success'] = this.language.get('success_disable_recurring');
		}

		data['error'] = this.error;

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(data);
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/paypal')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async token(length = 32) {
		// Create random token
		let string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		let max = string.length - 1;

		let token = '';

		for (let i = 0; i < length; i++) {
			token += string[mt_rand(0, max)];
		}

		return token;
	}
}