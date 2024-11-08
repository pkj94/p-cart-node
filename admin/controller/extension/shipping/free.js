module.exports = class ControllerExtensionShippingFree extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/shipping/free');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_free', this.request.post);

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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/shipping/free', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/shipping/free', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		if ((this.request.post['shipping_free_total'])) {
			data['shipping_free_total'] = this.request.post['shipping_free_total'];
		} else {
			data['shipping_free_total'] = this.config.get('shipping_free_total');
		}

		if ((this.request.post['shipping_free_geo_zone_id'])) {
			data['shipping_free_geo_zone_id'] = this.request.post['shipping_free_geo_zone_id'];
		} else {
			data['shipping_free_geo_zone_id'] = this.config.get('shipping_free_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['shipping_free_status'])) {
			data['shipping_free_status'] = this.request.post['shipping_free_status'];
		} else {
			data['shipping_free_status'] = this.config.get('shipping_free_status');
		}

		if ((this.request.post['shipping_free_sort_order'])) {
			data['shipping_free_sort_order'] = this.request.post['shipping_free_sort_order'];
		} else {
			data['shipping_free_sort_order'] = this.config.get('shipping_free_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/free', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/free')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}