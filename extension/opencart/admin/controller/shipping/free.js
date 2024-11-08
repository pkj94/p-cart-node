global['\Opencart\Admin\Controller\Extension\Opencart\Shipping\Free'] = class Free extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/shipping/free');

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
			'href' : await this.url.link('extension/opencart/shipping/free', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/shipping/free.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=shipping');

		data['shipping_free_total'] = this.config.get('shipping_free_total');
		data['shipping_free_geo_zone_id'] = Number(this.config.get('shipping_free_geo_zone_id'));

		this.load.model('localisation/geo_zone',this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		data['shipping_free_status'] = this.config.get('shipping_free_status');
		data['shipping_free_sort_order'] = this.config.get('shipping_free_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/shipping/free', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/shipping/free');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/shipping/free')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('shipping_free', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}