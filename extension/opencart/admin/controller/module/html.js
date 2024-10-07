module.exports = class HTMLModuleController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/module/html');

		this.document.setTitle(this.language.get('heading_title'));

		this.document.addScript('view/javascript/ckeditor/ckeditor+js');
		this.document.addScript('view/javascript/ckeditor/adapters/jquery+js');

		const data = { breadcrumbs: [] };

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module')
		});

		if (!(this.request.get['module_id'])) {
			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': this.url.link('extension/opencart/module/html', 'user_token=' + this.session.data['user_token'])
			});
		} else {
			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': this.url.link('extension/opencart/module/html', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id'])
			});
		}

		if (!(this.request.get['module_id'])) {
			data['save'] = this.url.link('extension/opencart/module/html+save', 'user_token=' + this.session.data['user_token']);
		} else {
			data['save'] = this.url.link('extension/opencart/module/html+save', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id']);
		}

		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module');
		let module_info = {};
		if ((this.request.get['module_id']) && (this.request.server['REQUEST_METHOD'] != 'POST')) {
			this.load.model('setting/module', this);

			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		if ((module_info['name'])) {
			data['name'] = module_info['name'];
		} else {
			data['name'] = '';
		}

		if ((module_info['module_description'])) {
			data['module_description'] = module_info['module_description'];
		} else {
			data['module_description'] = [];
		}

		this.load.model('localisation/language');

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((module_info['status'])) {
			data['status'] = module_info['status'];
		} else {
			data['status'] = '';
		}

		if ((this.request.get['module_id'])) {
			data['module_id'] = this.request.get['module_id'];
		} else {
			data['module_id'] = 0;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/html', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/module/html');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/module/html')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!json) {
			this.load.model('setting/module', this);

			if (!this.request.post['module_id']) {
				json['module_id'] = await this.model_setting_module.addModule('opencart+html', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.post['module_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
