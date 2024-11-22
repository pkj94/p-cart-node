module.exports = class ControllerExtensionPaymentWebPaymentSoftware extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/web_payment_software');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_web_payment_software', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['login'])) {
			data['error_login'] = this.error['login'];
		} else {
			data['error_login'] = '';
		}

		if ((this.error['key'])) {
			data['error_key'] = this.error['key'];
		} else {
			data['error_key'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/web_payment_software', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/web_payment_software', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_web_payment_software_merchant_name'])) {
			data['payment_web_payment_software_merchant_name'] = this.request.post['payment_web_payment_software_merchant_name'];
		} else {
			data['payment_web_payment_software_merchant_name'] = this.config.get('payment_web_payment_software_merchant_name');
		}

		if ((this.request.post['payment_web_payment_software_merchant_key'])) {
			data['payment_web_payment_software_merchant_key'] = this.request.post['payment_web_payment_software_merchant_key'];
		} else {
			data['payment_web_payment_software_merchant_key'] = this.config.get('payment_web_payment_software_merchant_key');
		}

		if ((this.request.post['payment_web_payment_software_mode'])) {
			data['payment_web_payment_software_mode'] = this.request.post['payment_web_payment_software_mode'];
		} else {
			data['payment_web_payment_software_mode'] = this.config.get('payment_web_payment_software_mode');
		}

		if ((this.request.post['payment_web_payment_software_method'])) {
			data['payment_web_payment_software_method'] = this.request.post['payment_web_payment_software_method'];
		} else {
			data['payment_web_payment_software_method'] = this.config.get('payment_web_payment_software_method');
		}

		if ((this.request.post['payment_web_payment_software_order_status_id'])) {
			data['payment_web_payment_software_order_status_id'] = this.request.post['payment_web_payment_software_order_status_id'];
		} else {
			data['payment_web_payment_software_order_status_id'] = this.config.get('payment_web_payment_software_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_web_payment_software_geo_zone_id'])) {
			data['payment_web_payment_software_geo_zone_id'] = this.request.post['payment_web_payment_software_geo_zone_id'];
		} else {
			data['payment_web_payment_software_geo_zone_id'] = this.config.get('payment_web_payment_software_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_web_payment_software_status'])) {
			data['payment_web_payment_software_status'] = this.request.post['payment_web_payment_software_status'];
		} else {
			data['payment_web_payment_software_status'] = this.config.get('payment_web_payment_software_status');
		}

		if ((this.request.post['payment_web_payment_software_total'])) {
			data['payment_web_payment_software_total'] = this.request.post['payment_web_payment_software_total'];
		} else {
			data['payment_web_payment_software_total'] = this.config.get('payment_web_payment_software_total');
		}

		if ((this.request.post['payment_web_payment_software_sort_order'])) {
			data['payment_web_payment_software_sort_order'] = this.request.post['payment_web_payment_software_sort_order'];
		} else {
			data['payment_web_payment_software_sort_order'] = this.config.get('payment_web_payment_software_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/web_payment_software', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/web_payment_software')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_web_payment_software_merchant_name']) {
			this.error['login'] = this.language.get('error_login');
		}

		if (!this.request.post['payment_web_payment_software_merchant_key']) {
			this.error['key'] = this.language.get('error_key');
		}

		return Object.keys(this.error).length?false:true
	}
}