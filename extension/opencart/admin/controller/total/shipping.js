global['\Opencart\Admin\Controller\Extension\Opencart\Total\Shipping'] = class Shipping extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/total/shipping');

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
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/opencart/total/shipping', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/total/shipping.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=total');

		data['total_shipping_estimator'] = Number(this.config.get('total_shipping_estimator'));
		data['total_shipping_status'] = Number(this.config.get('total_shipping_status'));
		data['total_shipping_sort_order'] = this.config.get('total_shipping_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/total/shipping', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/total/shipping');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/total/shipping')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('total_shipping', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}