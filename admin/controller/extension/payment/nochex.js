module.exports = class ControllerExtensionPaymentNOCHEX extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/payment/nochex');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('payment_nochex', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['email'])) {
			data['error_email'] = this.error['email'];
		} else {
			data['error_email'] = '';
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
			'href' : await this.url.link('extension/payment/nochex', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/nochex', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_nochex_email'])) {
			data['payment_nochex_email'] = this.request.post['payment_nochex_email'];
		} else {
			data['payment_nochex_email'] = this.config.get('payment_nochex_email');
		}

		if ((this.request.post['payment_nochex_account'])) {
			data['payment_nochex_account'] = this.request.post['payment_nochex_account'];
		} else {
			data['payment_nochex_account'] = this.config.get('payment_nochex_account');
		}

		if ((this.request.post['payment_nochex_merchant'])) {
			data['payment_nochex_merchant'] = this.request.post['payment_nochex_merchant'];
		} else {
			data['payment_nochex_merchant'] = this.config.get('payment_nochex_merchant');
		}

		if ((this.request.post['payment_nochex_template'])) {
			data['payment_nochex_template'] = this.request.post['payment_nochex_template'];
		} else {
			data['payment_nochex_template'] = this.config.get('payment_nochex_template');
		}

		if ((this.request.post['payment_nochex_test'])) {
			data['payment_nochex_test'] = this.request.post['payment_nochex_test'];
		} else {
			data['payment_nochex_test'] = this.config.get('payment_nochex_test');
		}

		if ((this.request.post['payment_nochex_total'])) {
			data['payment_nochex_total'] = this.request.post['payment_nochex_total'];
		} else {
			data['payment_nochex_total'] = this.config.get('payment_nochex_total');
		}

		if ((this.request.post['payment_nochex_order_status_id'])) {
			data['payment_nochex_order_status_id'] = this.request.post['payment_nochex_order_status_id'];
		} else {
			data['payment_nochex_order_status_id'] = this.config.get('payment_nochex_order_status_id');
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['payment_nochex_geo_zone_id'])) {
			data['payment_nochex_geo_zone_id'] = this.request.post['payment_nochex_geo_zone_id'];
		} else {
			data['payment_nochex_geo_zone_id'] = this.config.get('payment_nochex_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['payment_nochex_status'])) {
			data['payment_nochex_status'] = this.request.post['payment_nochex_status'];
		} else {
			data['payment_nochex_status'] = this.config.get('payment_nochex_status');
		}

		if ((this.request.post['payment_nochex_sort_order'])) {
			data['payment_nochex_sort_order'] = this.request.post['payment_nochex_sort_order'];
		} else {
			data['payment_nochex_sort_order'] = this.config.get('payment_nochex_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/nochex', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/nochex')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_nochex_email']) {
			this.error['email'] = this.language.get('error_email');
		}

		if (!this.request.post['payment_nochex_merchant']) {
			this.error['merchant'] = this.language.get('error_merchant');
		}

		return Object.keys(this.error).length?false:true
	}
}