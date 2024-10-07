module.exports = class StoreModuleController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/module/store');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: this.url.link('extension/opencart/module/store', 'user_token=' + this.session.data.user_token)
		});

		data.save = this.url.link('extension/opencart/module/store.save', 'user_token=' + this.session.data.user_token);
		data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module');

		data.module_store_admin = this.config.get('module_store_admin');
		data.module_store_status = this.config.get('module_store_status');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/store', data));
	}

	async save() {
		await this.load.language('extension/opencart/module/store');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/module/store')) {
			json.error = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/setting',this);

			await this.model_setting_setting.editSetting('module_store', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

