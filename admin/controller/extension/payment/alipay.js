module.exports = class ControllerExtensionPaymentAlipay extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/alipay');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_alipay', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['app_id'])) {
			data['error_app_id'] = this.error['app_id'];
		} else {
			data['error_app_id'] = '';
		}

		if ((this.error['merchant_private_key'])) {
			data['error_merchant_private_key'] = this.error['merchant_private_key'];
		} else {
			data['error_merchant_private_key'] = '';
		}

		if ((this.error['alipay_public_key'])) {
			data['error_alipay_public_key'] = this.error['alipay_public_key'];
		} else {
			data['error_alipay_public_key'] = '';
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
			'href' : await this.url.link('extension/payment/alipay', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/payment/alipay', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_alipay_app_id'])) {
			data['payment_alipay_app_id'] = this.request.post['payment_alipay_app_id'];
		} else {
			data['payment_alipay_app_id'] = this.config.get('payment_alipay_app_id');
		}

		if ((this.request.post['payment_alipay_merchant_private_key'])) {
			data['payment_alipay_merchant_private_key'] = this.request.post['payment_alipay_merchant_private_key'];
		} else {
			data['payment_alipay_merchant_private_key'] = this.config.get('payment_alipay_merchant_private_key');
		}

		if ((this.request.post['payment_alipay_alipay_public_key'])) {
			data['payment_alipay_alipay_public_key'] = this.request.post['payment_alipay_alipay_public_key'];
		} else {
			data['payment_alipay_alipay_public_key'] = this.config.get('payment_alipay_alipay_public_key');
		}

		if ((this.request.post['payment_alipay_total'])) {
			data['payment_alipay_total'] = this.request.post['payment_alipay_total'];
		} else {
			data['payment_alipay_total'] = this.config.get('payment_alipay_total');
		}

		if ((this.request.post['payment_alipay_order_status_id'])) {
			data['payment_alipay_order_status_id'] = this.request.post['payment_alipay_order_status_id'];
		} else {
			data['payment_alipay_order_status_id'] = this.config.get('payment_alipay_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_alipay_geo_zone_id'])) {
			data['payment_alipay_geo_zone_id'] = this.request.post['payment_alipay_geo_zone_id'];
		} else {
			data['payment_alipay_geo_zone_id'] = this.config.get('payment_alipay_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_alipay_test'])) {
			data['payment_alipay_test'] = this.request.post['payment_alipay_test'];
		} else {
			data['payment_alipay_test'] = this.config.get('payment_alipay_test');
		}

		if ((this.request.post['payment_alipay_status'])) {
			data['payment_alipay_status'] = this.request.post['payment_alipay_status'];
		} else {
			data['payment_alipay_status'] = this.config.get('payment_alipay_status');
		}

		if ((this.request.post['payment_alipay_sort_order'])) {
			data['payment_alipay_sort_order'] = this.request.post['payment_alipay_sort_order'];
		} else {
			data['payment_alipay_sort_order'] = this.config.get('payment_alipay_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/alipay', data));
	}

	private function validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/alipay')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_alipay_app_id']) {
			this.error['app_id'] = this.language.get('error_app_id');
		}

		if (!this.request.post['payment_alipay_merchant_private_key']) {
			this.error['merchant_private_key'] = this.language.get('error_merchant_private_key');
		}

		if (!this.request.post['payment_alipay_alipay_public_key']) {
			this.error['alipay_public_key'] = this.language.get('error_alipay_public_key');
		}

		return Object.keys(this.error).length?false:true
	}
}