global['\Opencart\Admin\Controller\Extension\Opencart\Payment\Cheque'] = class Cheque extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/payment/cheque');

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
			href: await this.url.link('extension/opencart/payment/cheque', 'user_token=' + this.session.data.user_token)
		});

		data.save = await this.url.link('extension/opencart/payment/cheque.save', 'user_token=' + this.session.data.user_token);
		data.back = await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment');

		data.payment_cheque_payable = this.config.get('payment_cheque_payable');
		data.payment_cheque_order_status_id = this.config.get('payment_cheque_order_status_id');

		this.load.model('localisation/order_status',this);

		data.order_statuses = await this.model_localisation_order_status.getOrderStatuses();

		data.payment_cheque_geo_zone_id = this.config.get('payment_cheque_geo_zone_id');

		this.load.model('localisation/geo_zone', this);

		data.geo_zones = await this.model_localisation_geo_zone.getGeoZones();

		data.payment_cheque_status = this.config.get('payment_cheque_status');
		data.payment_cheque_sort_order = this.config.get('payment_cheque_sort_order');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/payment/cheque', data));
	}

	async save() {
		await this.load.language('extension/opencart/payment/cheque');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/payment/cheque')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		if (!this.request.post.payment_cheque_payable) {
			json.error = { ...json.error, payable: this.language.get('error_payable') };
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('payment_cheque', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

