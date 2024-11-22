module.exports = class ControllerExtensionPaymentPerpetualPayments extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/perpetual_payments');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_perpetual_payments', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['auth_id'])) {
			data['error_auth_id'] = this.error['auth_id'];
		} else {
			data['error_auth_id'] = '';
		}

		if ((this.error['auth_pass'])) {
			data['error_auth_pass'] = this.error['auth_pass'];
		} else {
			data['error_auth_pass'] = '';
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
			'href' : await this.url.link('extension/payment/perpetual_payments', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/perpetual_payments', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_perpetual_payments_auth_id'])) {
			data['payment_perpetual_payments_auth_id'] = this.request.post['payment_perpetual_payments_auth_id'];
		} else {
			data['payment_perpetual_payments_auth_id'] = this.config.get('payment_perpetual_payments_auth_id');
		}

		if ((this.request.post['payment_perpetual_payments_auth_pass'])) {
			data['payment_perpetual_payments_auth_pass'] = this.request.post['payment_perpetual_payments_auth_pass'];
		} else {
			data['payment_perpetual_payments_auth_pass'] = this.config.get('payment_perpetual_payments_auth_pass');
		}

		if ((this.request.post['payment_perpetual_payments_test'])) {
			data['payment_perpetual_payments_test'] = this.request.post['payment_perpetual_payments_test'];
		} else {
			data['payment_perpetual_payments_test'] = this.config.get('payment_perpetual_payments_test');
		}

		if ((this.request.post['payment_perpetual_payments_total'])) {
			data['payment_perpetual_payments_total'] = this.request.post['payment_perpetual_payments_total'];
		} else {
			data['payment_perpetual_payments_total'] = this.config.get('payment_perpetual_payments_total');
		}

		if ((this.request.post['payment_perpetual_payments_order_status_id'])) {
			data['payment_perpetual_payments_order_status_id'] = this.request.post['payment_perpetual_payments_order_status_id'];
		} else {
			data['payment_perpetual_payments_order_status_id'] = this.config.get('payment_perpetual_payments_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_perpetual_payments_geo_zone_id'])) {
			data['payment_perpetual_payments_geo_zone_id'] = this.request.post['payment_perpetual_payments_geo_zone_id'];
		} else {
			data['payment_perpetual_payments_geo_zone_id'] = this.config.get('payment_perpetual_payments_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_perpetual_payments_status'])) {
			data['payment_perpetual_payments_status'] = this.request.post['payment_perpetual_payments_status'];
		} else {
			data['payment_perpetual_payments_status'] = this.config.get('payment_perpetual_payments_status');
		}

		if ((this.request.post['payment_perpetual_payments_sort_order'])) {
			data['payment_perpetual_payments_sort_order'] = this.request.post['payment_perpetual_payments_sort_order'];
		} else {
			data['payment_perpetual_payments_sort_order'] = this.config.get('payment_perpetual_payments_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/perpetual_payments', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/perpetual_payments')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_perpetual_payments_auth_id']) {
			this.error['auth_id'] = this.language.get('error_auth_id');
		}

		if (!this.request.post['payment_perpetual_payments_auth_pass']) {
			this.error['auth_pass'] = this.language.get('error_auth_pass');
		}

		return Object.keys(this.error).length?false:true
	}
}