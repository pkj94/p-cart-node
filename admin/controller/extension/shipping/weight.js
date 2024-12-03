module.exports = class ControllerExtensionShippingWeight extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/shipping/weight');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_weight', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/shipping/weight', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/shipping/weight', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		this.load.model('localisation/geo_zone', this);

		const geo_zones = await this.model_localisation_geo_zone.getGeoZones();

		for (let geo_zone of geo_zones) {
			if ((this.request.post['shipping_weight_' + geo_zone['geo_zone_id'] + '_rate'])) {
				data['shipping_weight_geo_zone_rate'] = data['shipping_weight_geo_zone_rate']||{}
				data['shipping_weight_geo_zone_rate'][geo_zone['geo_zone_id']] = this.request.post['shipping_weight_' + geo_zone['geo_zone_id'] + '_rate'];
			} else {
				data['shipping_weight_geo_zone_rate'] = data['shipping_weight_geo_zone_rate']||{}
				data['shipping_weight_geo_zone_rate'][geo_zone['geo_zone_id']] = this.config.get('shipping_weight_' + geo_zone['geo_zone_id'] + '_rate');
			}

			if ((this.request.post['shipping_weight_' + geo_zone['geo_zone_id'] + '_status'])) {
				data['shipping_weight_geo_zone_status'] = data['shipping_weight_geo_zone_status']||{};
				data['shipping_weight_geo_zone_status'][geo_zone['geo_zone_id']] = this.request.post['shipping_weight_' + geo_zone['geo_zone_id'] + '_status'];
			} else {
				data['shipping_weight_geo_zone_status'] = data['shipping_weight_geo_zone_status']||{};
				data['shipping_weight_geo_zone_status'][geo_zone['geo_zone_id']] = this.config.get('shipping_weight_' + geo_zone['geo_zone_id'] + '_status');
			}
		}

		data['geo_zones'] = geo_zones;

		if ((this.request.post['shipping_weight_tax_class_id'])) {
			data['shipping_weight_tax_class_id'] = this.request.post['shipping_weight_tax_class_id'];
		} else {
			data['shipping_weight_tax_class_id'] = this.config.get('shipping_weight_tax_class_id');
		}

		this.load.model('localisation/tax_class', this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['shipping_weight_status'])) {
			data['shipping_weight_status'] = this.request.post['shipping_weight_status'];
		} else {
			data['shipping_weight_status'] = this.config.get('shipping_weight_status');
		}

		if ((this.request.post['shipping_weight_sort_order'])) {
			data['shipping_weight_sort_order'] = this.request.post['shipping_weight_sort_order'];
		} else {
			data['shipping_weight_sort_order'] = this.config.get('shipping_weight_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/weight', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/weight')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}