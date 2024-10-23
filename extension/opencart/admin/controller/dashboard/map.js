
global['\Opencart\Admin\Controller\Extension\Opencart\Dashboard\Map'] = class Map extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/map');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/opencart/dashboard/map', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/dashboard/map+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard');

		data['dashboard_map_width'] = this.config.get('dashboard_map_width');

		data['columns'] = [];

		for (let i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		data['dashboard_map_status'] = this.config.get('dashboard_map_status');
		data['dashboard_map_sort_order'] = this.config.get('dashboard_map_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/map_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/dashboard/map');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/map')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('dashboard_map', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return string
	 */
	async dashboard() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/map');

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/dashboard/map_info', data);
	}

	/**
	 * @return void
	 */
	async map() {
		const json = {};

		this.load.model('extension/opencart/dashboard/map', this);

		let results = await this.model_extension_opencart_dashboard_map.getTotalOrdersByCountry();

		for (let result of results) {
			json[strtolower(result['iso_code_2'])] = {
				'total': result['total'],
				'amount': this.currency.format(result['amount'], this.config.get('config_currency'))
			};
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
