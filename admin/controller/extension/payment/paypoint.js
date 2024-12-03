module.exports = class ControllerExtensionPaymentPayPoint extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/payment/paypoint');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_paypoint', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['merchant'])) {
			data['error_merchant'] = this.error['merchant'];
		} else {
			data['error_merchant'] = '';
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
			'href' : await this.url.link('extension/payment/paypoint', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/paypoint', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_paypoint_merchant'])) {
			data['payment_paypoint_merchant'] = this.request.post['payment_paypoint_merchant'];
		} else {
			data['payment_paypoint_merchant'] = this.config.get('payment_paypoint_merchant');
		}

		if ((this.request.post['payment_paypoint_password'])) {
			data['payment_paypoint_password'] = this.request.post['payment_paypoint_password'];
		} else {
			data['payment_paypoint_password'] = this.config.get('payment_paypoint_password');
		}

		if ((this.request.post['payment_paypoint_test'])) {
			data['payment_paypoint_test'] = this.request.post['payment_paypoint_test'];
		} else {
			data['payment_paypoint_test'] = this.config.get('payment_paypoint_test');
		}

		if ((this.request.post['payment_paypoint_total'])) {
			data['payment_paypoint_total'] = this.request.post['payment_paypoint_total'];
		} else {
			data['payment_paypoint_total'] = this.config.get('payment_paypoint_total');
		}

		if ((this.request.post['payment_paypoint_order_status_id'])) {
			data['payment_paypoint_order_status_id'] = this.request.post['payment_paypoint_order_status_id'];
		} else {
			data['payment_paypoint_order_status_id'] = this.config.get('payment_paypoint_order_status_id');
		}

		this.load.model('localisation/order_status',this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_paypoint_geo_zone_id'])) {
			data['payment_paypoint_geo_zone_id'] = this.request.post['payment_paypoint_geo_zone_id'];
		} else {
			data['payment_paypoint_geo_zone_id'] = this.config.get('payment_paypoint_geo_zone_id');
		}

		this.load.model('localisation/geo_zone',this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_paypoint_status'])) {
			data['payment_paypoint_status'] = this.request.post['payment_paypoint_status'];
		} else {
			data['payment_paypoint_status'] = this.config.get('payment_paypoint_status');
		}

		if ((this.request.post['payment_paypoint_sort_order'])) {
			data['payment_paypoint_sort_order'] = this.request.post['payment_paypoint_sort_order'];
		} else {
			data['payment_paypoint_sort_order'] = this.config.get('payment_paypoint_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/paypoint', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/paypoint')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_paypoint_merchant']) {
			this.error['merchant'] = this.language.get('error_merchant');
		}

		return Object.keys(this.error).length?false:true
	}
}