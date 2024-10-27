global['\Opencart\Admin\Controller\Extension\Opencart\Payment\Cod'] = class Cod extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/payment/cod');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {};

		data.breadcrumbs = [];

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: await this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: await this.url.link('extension/opencart/payment/cod', 'user_token=' + this.session.data.user_token)
		});

		data.save = await this.url.link('extension/opencart/payment/cod.save', 'user_token=' + this.session.data.user_token);
		data.back = await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment');

		data.payment_cod_order_status_id = this.config.get('payment_cod_order_status_id');

		this.load.model('localisation/order_status', this);

		data.order_statuses = await this.model_localisation_order_status.getOrderStatuses();

		data.payment_cod_geo_zone_id = Number(this.config.get('payment_cod_geo_zone_id'));

		this.load.model('localisation/geo_zone', this);

		data.geo_zones = await this.model_localisation_geo_zone.getGeoZones();

		data.payment_cod_status = this.config.get('payment_cod_status');
		data.payment_cod_sort_order = this.config.get('payment_cod_sort_order');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/payment/cod', data));
	}

	async save() {
		await this.load.language('extension/opencart/payment/cod');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/payment/cod')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('payment_cod', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

