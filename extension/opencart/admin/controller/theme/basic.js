module.exports = class BasicThemeController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/theme/basic');

		this.document.setTitle(this.language.get('heading_title'));
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}

		const data = {
			breadcrumbs: []
		};

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=theme')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/opencart/theme/basic', 'user_token=' + this.session.data['user_token'] + '&store_id='.store_id)
		});

		data['save'] = await this.url.link('extension/opencart/theme/basic.save', 'user_token=' + this.session.data['user_token'] + '&store_id='.store_id);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=theme');
		let setting_info = {};
		if (this.request.get['store_id']) {
			this.load.model('setting/setting', this);

			setting_info = await this.model_setting_setting.getSetting('theme_basic', this.request.get['store_id']);
		}

		if ((setting_info['theme_basic_status'])) {
			data['theme_basic_status'] = setting_info['theme_basic_status'];
		} else {
			data['theme_basic_status'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/theme/basic', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/theme/basic');
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}
		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/theme/basic')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('theme_basic', this.request.post, store_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
