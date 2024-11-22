module.exports = class ControllerExtensionShippingPickup extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/shipping/pickup');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_pickup', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/shipping/pickup', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/shipping/pickup', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		if ((this.request.post['shipping_pickup_geo_zone_id'])) {
			data['shipping_pickup_geo_zone_id'] = this.request.post['shipping_pickup_geo_zone_id'];
		} else {
			data['shipping_pickup_geo_zone_id'] = this.config.get('shipping_pickup_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['shipping_pickup_status'])) {
			data['shipping_pickup_status'] = this.request.post['shipping_pickup_status'];
		} else {
			data['shipping_pickup_status'] = this.config.get('shipping_pickup_status');
		}

		if ((this.request.post['shipping_pickup_sort_order'])) {
			data['shipping_pickup_sort_order'] = this.request.post['shipping_pickup_sort_order'];
		} else {
			data['shipping_pickup_sort_order'] = this.config.get('shipping_pickup_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/pickup', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/pickup')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}