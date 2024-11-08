module.exports = class ControllerExtensionPaymentPilibaba extends Controller {
	error = {};

	async index() {
		this.load.model('setting/setting',this);

		this.load.model('extension/payment/pilibaba');

		await this.load.language('extension/payment/pilibaba');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_pilibaba', this.request.post);

			if (this.request.post['payment_pilibaba_status']) {
				await this.model_extension_payment_pilibaba.enablePiliExpress();
			} else {
				await this.model_extension_payment_pilibaba.disablePiliExpress();
			}

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/pilibaba', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/pilibaba', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_pilibaba_merchant_number'])) {
			data['payment_pilibaba_merchant_number'] = this.request.post['payment_pilibaba_merchant_number'];
		} else {
			data['payment_pilibaba_merchant_number'] = this.config.get('payment_pilibaba_merchant_number');
		}

		if ((this.request.post['payment_pilibaba_secret_key'])) {
			data['payment_pilibaba_secret_key'] = this.request.post['payment_pilibaba_secret_key'];
		} else {
			data['payment_pilibaba_secret_key'] = this.config.get('payment_pilibaba_secret_key');
		}

		if ((this.request.post['payment_pilibaba_environment'])) {
			data['payment_pilibaba_environment'] = this.request.post['payment_pilibaba_environment'];
		} else {
			data['payment_pilibaba_environment'] = this.config.get('payment_pilibaba_environment');
		}

		if ((this.request.post['payment_pilibaba_shipping_fee'])) {
			data['payment_pilibaba_shipping_fee'] = this.request.post['payment_pilibaba_shipping_fee'];
		} else {
			data['payment_pilibaba_shipping_fee'] = this.config.get('payment_pilibaba_shipping_fee');
		}

		if ((this.request.post['payment_pilibaba_order_status_id'])) {
			data['payment_pilibaba_order_status_id'] = this.request.post['payment_pilibaba_order_status_id'];
		} else if (this.config.has('payment_pilibaba_order_status_id')) {
			data['payment_pilibaba_order_status_id'] = this.config.get('payment_pilibaba_order_status_id');
		} else {
			data['payment_pilibaba_order_status_id'] = '2';
		}

		if ((this.request.post['payment_pilibaba_status'])) {
			data['payment_pilibaba_status'] = this.request.post['payment_pilibaba_status'];
		} else {
			data['payment_pilibaba_status'] = this.config.get('payment_pilibaba_status');
		}

		if ((this.request.post['payment_pilibaba_logging'])) {
			data['payment_pilibaba_logging'] = this.request.post['payment_pilibaba_logging'];
		} else {
			data['payment_pilibaba_logging'] = this.config.get('payment_pilibaba_logging');
		}

		if ((this.request.post['payment_pilibaba_sort_order'])) {
			data['payment_pilibaba_sort_order'] = this.request.post['payment_pilibaba_sort_order'];
		} else {
			data['payment_pilibaba_sort_order'] = this.config.get('payment_pilibaba_sort_order');
		}

		if ((this.request.post['payment_pilibaba_email_address'])) {
			data['payment_pilibaba_email_address'] = this.request.post['payment_pilibaba_email_address'];
		} else if (this.config.has('payment_pilibaba_email_address')) {
			data['payment_pilibaba_email_address'] = this.config.get('payment_pilibaba_email_address');
		} else {
			data['payment_pilibaba_email_address'] = '';
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.error['pilibaba_merchant_number'])) {
			data['error_pilibaba_merchant_number'] = this.error['pilibaba_merchant_number'];
		} else {
			data['error_pilibaba_merchant_number'] = '';
		}

		if ((this.error['pilibaba_secret_key'])) {
			data['error_pilibaba_secret_key'] = this.error['pilibaba_secret_key'];
		} else {
			data['error_pilibaba_secret_key'] = '';
		}

		if ((this.error['pilibaba_shipping_fee'])) {
			data['error_pilibaba_shipping_fee'] = this.error['pilibaba_shipping_fee'];
		} else {
			data['error_pilibaba_shipping_fee'] = '';
		}

		if ((data['pilibaba_merchant_number']) && data['pilibaba_merchant_number'] && (data['payment_pilibaba_secret_key']) && data['payment_pilibaba_secret_key']) {
			data['show_register'] = false;

			data['currencies'] = data['warehouses'] = data['countries'] = {};
		} else {
			data['show_register'] = true;

			data['currencies'] = await this.model_extension_payment_pilibaba.getCurrencies();

			data['warehouses'] = await this.model_extension_payment_pilibaba.getWarehouses();

			this.load.model('localisation/country');

			data['countries'] = await this.model_localisation_country.getCountries();
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if (this.config.get('config_weight_class_id') != '2') {
			data['error_weight'] = sprintf(this.language.get('error_weight'), await this.url.link('setting/setting', 'user_token=' + this.session.data['user_token'], true));
		} else {
			data['error_weight'] = '';
		}

		if (this.config.has('payment_pilibaba_email_address') && this.config.get('payment_pilibaba_email_address')) {
			data['notice_email'] = sprintf(this.language.get('text_email'), this.config.get('payment_pilibaba_email_address'));
		} else {
			data['notice_email'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/pilibaba', data));
	}

	async install() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/pilibaba');

			await this.model_extension_payment_pilibaba.install();
		}
	}

	async uninstall() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/pilibaba');

			await this.model_extension_payment_pilibaba.uninstall();
		}
	}

	async register() {
		await this.load.language('extension/payment/pilibaba');

		json = {};

		if ((this.request.post['email_address']) && (this.request.post['password']) && (this.request.post['currency']) && (this.request.post['warehouse']) && (this.request.post['country']) && (this.request.post['environment'])) {
			if (oc_strlen(this.request.post['email_address']) < 1) {
				json['error'] = this.language.get('error_email_address');
			} else if (!filter_var(this.request.post['email_address'], FILTER_VALIDATE_EMAIL)) {
				json['error'] = this.language.get('error_email_invalid');
			} else if (oc_strlen(this.request.post['password']) < 8) {
				json['error'] = this.language.get('error_password');
			} else if (oc_strlen(this.request.post['currency']) < 1) {
				json['error'] = this.language.get('error_currency');
			} else if (oc_strlen(this.request.post['warehouse']) < 1) {
				json['error'] = this.language.get('error_warehouse');
			} else if (this.request.post['warehouse'] == 'other' && oc_strlen(this.request.post['country']) < 1) {
				json['error'] = this.language.get('error_country');
			} else {
				this.load.model('extension/payment/pilibaba');

				response = await this.model_extension_payment_pilibaba.register(this.request.post['email_address'], this.request.post['password'], this.request.post['currency'], this.request.post['warehouse'], this.request.post['country'], this.request.post['environment']);

				if ((response['code']) && (response['message'])) {
					if (response['code'] == '0') {
						this.load.model('setting/setting',this);

						await this.model_setting_setting.editSetting('payment_pilibaba', array('pilibaba_merchant_number' : response['data']['merchantNo'], 'pilibaba_secret_key' : response['data']['privateKey'], 'pilibaba_email_address' : this.request.post['email_address'], 'payment_pilibaba_environment' : this.request.post['environment']), 0);

						this.session.data['success'] = this.language.get('text_register_success');

						json['redirect'] = await this.url.link('extension/payment/pilibaba', 'user_token=' + this.session.data['user_token'], true);
					} else {
						json['error'] = response['message'];
					}
				} else {
					json['error'] = this.language.get('error_bad_response');
				}
			}
		} else {
			json['error'] = this.language.get('error_data_missing');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async order() {
		if (this.config.get('payment_pilibaba_status')) {
			this.load.model('extension/payment/pilibaba');

			order_id = this.request.get['order_id'];

			pilibaba_order = await this.model_extension_payment_pilibaba.getOrder(this.request.get['order_id']);

			if (pilibaba_order) {
				await this.load.language('extension/payment/pilibaba');

				order_info['order_id'] = pilibaba_order['order_id'];

				order_info['amount'] = '&yen;' + pilibaba_order['amount'];

				order_info['fee'] = '&yen;' + pilibaba_order['fee'];

				order_info['status'] = 'Success';

				order_info['date_added'] = date(this.language.get('datetime_format'), strtotime(pilibaba_order['date_added']));

				order_info['tracking'] = pilibaba_order['tracking'];

				data['pilibaba_order'] = order_info;

				data['barcode'] = await this.url.link('extension/payment/pilibaba/barcode', 'user_token=' + this.session.data['user_token'] + '&order_id=' + this.request.get['order_id'], true);

				data['order_id'] = this.request.get['order_id'];

				data['user_token'] = this.session.data['user_token'];

				return await this.load.view('extension/payment/pilibaba_order', data);
			}
		}
	}

	async tracking() {
		await this.load.language('extension/payment/pilibaba');

		json = {};

		if (this.config.get('payment_pilibaba_status')) {
			if ((this.request.post['order_id']) && (this.request.post['tracking'])) {
				if (oc_strlen(this.request.post['tracking']) > 0 && oc_strlen(this.request.post['tracking']) <= 50) {
					this.load.model('extension/payment/pilibaba');

					await this.model_extension_payment_pilibaba.updateTrackingNumber(this.request.post['order_id'], this.request.post['tracking'], this.config.get('payment_pilibaba_merchant_number'));

					json['success'] = this.language.get('text_tracking_success');
				} else {
					json['error'] = this.language.get('error_tracking_length');
				}
			} else {
				json['error'] = this.language.get('error_data_missing');
			}
		} else {
			json['error'] = this.language.get('error_not_enabled');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async barcode() {
		if (this.config.get('payment_pilibaba_status')) {
			if ((this.request.get['order_id'])) {
				if (this.config.get('payment_pilibaba_environment') == 'live') {
					url = 'https://www.pilibaba.com/pilipay/barCode';
				} else {
					url = 'http://pre.pilibaba.com/pilipay/barCode';
				}

				echo '<img src="' + url + '?orderNo=' + this.request.get['order_id'] + '&merchantNo=' + this.config.get('payment_pilibaba_merchant_number') + '">';
			}
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/pilibaba')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_pilibaba_merchant_number']) {
			this.error['pilibaba_merchant_number'] = this.language.get('error_merchant_number');
		}

		if (!this.request.post['payment_pilibaba_secret_key']) {
			this.error['pilibaba_secret_key'] = this.language.get('error_secret_key');
		}

		if (this.request.post['payment_pilibaba_shipping_fee'] != '' && strpos(this.request.post['payment_pilibaba_shipping_fee'], '.') === false) {
			this.error['pilibaba_shipping_fee'] = this.language.get('error_shipping_fee');
		}

		if (this.error && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}
}