global['\Opencart\Admin\Controller\Extension\Opencart\Module\Category'] = class Category extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/module/category');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: await this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: await this.url.link('extension/opencart/module/category', 'user_token=' + this.session.data.user_token)
		});

		data.save = await this.url.link('extension/opencart/module/category.save', 'user_token=' + this.session.data.user_token);
		data.back = await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module');

		data.module_category_status = this.config.get('module_category_status');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/category', data));
	}

	async save() {
		await this.load.language('extension/opencart/module/category');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/module/category')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('module_category', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

