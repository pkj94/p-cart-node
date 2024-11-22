module.exports = class ControllerExtensionPaymentPayMate extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/paymate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_paymate', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['username'])) {
			data['error_username'] = this.error['username'];
		} else {
			data['error_username'] = '';
		}

		if ((this.error['password'])) {
			data['error_password'] = this.error['password'];
		} else {
			data['error_password'] = '';
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
			'href' : await this.url.link('extension/payment/paymate', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/paymate', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_paymate_username'])) {
			data['payment_paymate_username'] = this.request.post['payment_paymate_username'];
		} else {
			data['payment_paymate_username'] = this.config.get('payment_paymate_username');
		}

		if ((this.request.post['payment_paymate_password'])) {
			data['payment_paymate_username'] = this.request.post['payment_paymate_password'];
		} else if (this.config.get('payment_paymate_password')) {
			data['payment_paymate_password'] = this.config.get('payment_paymate_password');
		} else {
			data['payment_paymate_password'] = token(32);
		}

		if ((this.request.post['payment_paymate_test'])) {
			data['payment_paymate_test'] = this.request.post['payment_paymate_test'];
		} else {
			data['payment_paymate_test'] = this.config.get('payment_paymate_test');
		}

		if ((this.request.post['payment_paymate_total'])) {
			data['payment_paymate_total'] = this.request.post['payment_paymate_total'];
		} else {
			data['payment_paymate_total'] = this.config.get('payment_paymate_total');
		}

		if ((this.request.post['payment_paymate_order_status_id'])) {
			data['payment_paymate_order_status_id'] = this.request.post['payment_paymate_order_status_id'];
		} else {
			data['payment_paymate_order_status_id'] = this.config.get('payment_paymate_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_paymate_geo_zone_id'])) {
			data['payment_paymate_geo_zone_id'] = this.request.post['payment_paymate_geo_zone_id'];
		} else {
			data['payment_paymate_geo_zone_id'] = this.config.get('payment_paymate_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_paymate_status'])) {
			data['payment_paymate_status'] = this.request.post['payment_paymate_status'];
		} else {
			data['payment_paymate_status'] = this.config.get('payment_paymate_status');
		}

		if ((this.request.post['payment_paymate_sort_order'])) {
			data['payment_paymate_sort_order'] = this.request.post['payment_paymate_sort_order'];
		} else {
			data['payment_paymate_sort_order'] = this.config.get('payment_paymate_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paymate', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/paymate')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_paymate_username']) {
			this.error['username'] = this.language.get('error_username');
		}

		if (!this.request.post['payment_paymate_password']) {
			this.error['password'] = this.language.get('error_password');
		}

		return Object.keys(this.error).length?false:true
	}
}
