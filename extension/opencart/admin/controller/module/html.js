global['\Opencart\Admin\Controller\Extension\Opencart\Module\Html'] = class HTML extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/module/html');

		this.document.setTitle(this.language.get('heading_title'));

		const data = { breadcrumbs: [] };

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module')
		});

		if (!(this.request.get['module_id'])) {
			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('extension/opencart/module/html', 'user_token=' + this.session.data['user_token'])
			});
		} else {
			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('extension/opencart/module/html', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id'])
			});
		}

		if (!(this.request.get['module_id'])) {
			data['save'] = await this.url.link('extension/opencart/module/html.save', 'user_token=' + this.session.data['user_token']);
		} else {
			data['save'] = await this.url.link('extension/opencart/module/html.save', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id']);
		}

		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module');
		let module_info = {};
		if ((this.request.get['module_id']) && (this.request.server['mrthod'] != 'POST')) {
			this.load.model('setting/module', this);

			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		if ((module_info['name'])) {
			data['name'] = module_info['name'];
		} else {
			data['name'] = '';
		}

		if ((module_info['module_description'])) {
			data['module_description'] = {};
			for (let [language_id, value] of Object.entries(module_info['module_description'])) {
				language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
				data['module_description'][language_id] = value;
			}
		} else {
			data['module_description'] = {};
		}

		this.load.model('localisation/language', this);

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

		const json = { error: {} };
		if (!await this.user.hasPermission('modify', 'extension/opencart/module/html')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('setting/module', this);
			this.request.post.module_id = Number(this.request.post.module_id);
			if (!this.request.post['module_id']) {
				json['module_id'] = await this.model_setting_module.addModule('opencart.html', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.post['module_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
