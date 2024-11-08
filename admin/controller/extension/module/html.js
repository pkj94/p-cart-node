module.exports = class ControllerExtensionModuleHTML extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/module/html');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/module');

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			if (!(this.request.get['module_id'])) {
				await this.model_setting_module.addModule('html', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.get['module_id'], this.request.post);
			}

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true)
		);

		if (!(this.request.get['module_id'])) {
			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('extension/module/html', 'user_token=' + this.session.data['user_token'], true)
			);
		} else {
			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('extension/module/html', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id'], true)
			);
		}

		if (!(this.request.get['module_id'])) {
			data['action'] = await this.url.link('extension/module/html', 'user_token=' + this.session.data['user_token'], true);
		} else {
			data['action'] = await this.url.link('extension/module/html', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id'], true);
		}

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true);

		if ((this.request.get['module_id']) && (this.request.server['method'] != 'POST')) {
			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((module_info)) {
			data['name'] = module_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['module_description'])) {
			data['module_description'] = this.request.post['module_description'];
		} else if ((module_info)) {
			data['module_description'] = module_info['module_description'];
		} else {
			data['module_description'] = {};
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((module_info)) {
			data['status'] = module_info['status'];
		} else {
			data['status'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/module/html', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/module/html')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		return Object.keys(this.error).length?false:true
	}
}