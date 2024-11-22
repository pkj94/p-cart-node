module.exports = class ControllerExtensionShippingAusPost extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/shipping/auspost');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('shipping_auspost', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['api'])) {
			data['error_api'] = this.error['api'];
		} else {
			data['error_api'] = '';
		}

		if ((this.error['postcode'])) {
			data['error_postcode'] = this.error['postcode'];
		} else {
			data['error_postcode'] = '';
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
			'href' : await this.url.link('extension/shipping/auspost', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/shipping/auspost', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping', true);

		if ((this.request.post['shipping_auspost_postcode'])) {
			data['shipping_auspost_postcode'] = this.request.post['shipping_auspost_postcode'];
		} else {
			data['shipping_auspost_postcode'] = this.config.get('shipping_auspost_postcode');
		}

		if ((this.request.post['shipping_auspost_api'])) {
			data['shipping_auspost_api'] = this.request.post['shipping_auspost_api'];
		} else {
			data['shipping_auspost_api'] = this.config.get('shipping_auspost_api');
		}

		if ((this.request.post['shipping_auspost_weight_class_id'])) {
			data['shipping_auspost_weight_class_id'] = this.request.post['shipping_auspost_weight_class_id'];
		} else {
			data['shipping_auspost_weight_class_id'] = this.config.get('shipping_auspost_weight_class_id');
		}

		this.load.model('localisation/weight_class',this);

		data['weight_classes'] = await this.model_localisation_weight_class.getWeightClasses();

		if ((this.request.post['shipping_auspost_tax_class_id'])) {
			data['shipping_auspost_tax_class_id'] = this.request.post['shipping_auspost_tax_class_id'];
		} else {
			data['shipping_auspost_tax_class_id'] = this.config.get('shipping_auspost_tax_class_id');
		}

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		if ((this.request.post['shipping_auspost_geo_zone_id'])) {
			data['shipping_auspost_geo_zone_id'] = this.request.post['shipping_auspost_geo_zone_id'];
		} else {
			data['shipping_auspost_geo_zone_id'] = this.config.get('shipping_auspost_geo_zone_id');
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((this.request.post['shipping_auspost_status'])) {
			data['shipping_auspost_status'] = this.request.post['shipping_auspost_status'];
		} else {
			data['shipping_auspost_status'] = this.config.get('shipping_auspost_status');
		}

		if ((this.request.post['shipping_auspost_sort_order'])) {
			data['shipping_auspost_sort_order'] = this.request.post['shipping_auspost_sort_order'];
		} else {
			data['shipping_auspost_sort_order'] = this.config.get('shipping_auspost_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/shipping/auspost', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/shipping/auspost')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (empty(this.request.post['shipping_auspost_api'])) {
			this.error['api'] = this.language.get('error_api');
		}

		if (!preg_match('/^[0-9]{4}/', this.request.post['shipping_auspost_postcode'])) {
			this.error['postcode'] = this.language.get('error_postcode');
		}

		return Object.keys(this.error).length?false:true
	}
}