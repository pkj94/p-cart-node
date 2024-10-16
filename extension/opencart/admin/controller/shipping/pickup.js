module.exports = class PickupShippingController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/shipping/pickup');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/opencart/shipping/pickup', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/shipping/pickup.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping');

		data['shipping_pickup_geo_zone_id'] = this.config.get('shipping_pickup_geo_zone_id');

		this.load.model('localisation/geo_zone',this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		data['shipping_pickup_status'] = this.config.get('shipping_pickup_status');
		data['shipping_pickup_sort_order'] = this.config.get('shipping_pickup_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/shipping/pickup', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/shipping/pickup');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/shipping/pickup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('shipping_pickup', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}