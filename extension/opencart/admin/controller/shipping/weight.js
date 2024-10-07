module.exports = class WeightShippingController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/shipping/weight');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('extension/opencart/shipping/weight', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/shipping/weight.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping');

		this.load.model('localisation/geo_zone',this);

		geo_zones = await this.model_localisation_geo_zone.getGeoZones();

		for (let geo_zone of geo_zones) {
			data['shipping_weight_geo_zone_rate'][geo_zone['geo_zone_id']] = this.config.get('shipping_weight_' . geo_zone['geo_zone_id'] + '_rate');
			data['shipping_weight_geo_zone_status'][geo_zone['geo_zone_id']] = this.config.get('shipping_weight_' . geo_zone['geo_zone_id'] + '_status');
		}

		data['geo_zones'] = geo_zones;

		data['shipping_weight_tax_class_id'] = this.config.get('shipping_weight_tax_class_id');

		this.load.model('localisation/tax_class',this);

		data['tax_classes'] = await this.model_localisation_tax_class.getTaxClasses();

		data['shipping_weight_status'] = this.config.get('shipping_weight_status');
		data['shipping_weight_sort_order'] = this.config.get('shipping_weight_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/shipping/weight', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/shipping/weight');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/shipping/weight')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('shipping_weight', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}