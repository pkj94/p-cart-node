module.exports = class FilterModuleController extends Controller {
	constructor(registry) {
		super(registry)
	}

	async index() {
		await this.load.language('extension/opencart/module/filter');

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
			href: this.url.link('extension/opencart/module/filter', 'user_token=' + this.session.data.user_token)
		});

		data.save = this.url.link('extension/opencart/module/filter.save', 'user_token=' + this.session.data.user_token);
		data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module');

		data.module_filter_status = this.config.get('module_filter_status');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/filter', data));
	}

	async save() {
		await this.load.language('extension/opencart/module/filter');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/module/filter')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('module_filter', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

