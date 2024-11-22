module.exports = class ControllerExtensionExtensionModule extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/extension/module');

		this.load.model('setting/extension',this);

		this.load.model('setting/module');

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/module');

		this.load.model('setting/extension',this);

		this.load.model('setting/module');

		if (this.validate()) {
			await this.model_setting_extension.install('module', this.request.get['extension']);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/module/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/module/' + this.request.get['extension']);

			// Call install method if it exsits
			await this.load.controller('extension/module/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
		} else {
			this.session.data['error'] = this.error['warning'];
		}
	
		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/module');

		this.load.model('setting/extension',this);

		this.load.model('setting/module');

		if (this.validate()) {
			await this.model_setting_extension.uninstall('module', this.request.get['extension']);

			await this.model_setting_module.deleteModulesByCode(this.request.get['extension']);

			// Call uninstall method if it exsits
			await this.load.controller('extension/module/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group');
			await this.model_user_user_group.removePermissions('extension/module/' + this.request.get['extension']);

			this.session.data['success'] = this.language.get('text_success');
		}

		await this.getList();
	}
	
	async add() {
		await this.load.language('extension/extension/module');

		this.load.model('setting/extension',this);

		this.load.model('setting/module');

		if (this.validate()) {
			await this.load.language('module' + '/' + this.request.get['extension']);
			
			await this.model_setting_module.addModule(this.request.get['extension'], this.language.get('heading_title'));

			this.session.data['success'] = this.language.get('text_success');
		}

		await this.getList();
	}

	async delete() {
		await this.load.language('extension/extension/module');

		this.load.model('setting/extension',this);

		this.load.model('setting/module');

		if ((this.request.get['module_id']) && await this.validate()) {
			await this.model_setting_module.deleteModule(this.request.get['module_id']);

			this.session.data['success'] = this.language.get('text_success');
		}
		
		await this.getList();
	}

	async getList() {
		data['text_layout'] = sprintf(this.language.get('text_layout'), await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'], true));

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		extensions = await this.model_setting_extension.getInstalled('module');

		for (extensions of key : value) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/module/' + value + '.php') && !is_file(DIR_APPLICATION + 'controller/module/' + value + '.php')) {
				await this.model_setting_extension.uninstall('module', value);

				delete extensions[key]);
				
				await this.model_setting_module.deleteModulesByCode(value);
			}
		}

		data['extensions'] = {};

		// Create a new language container so we don't pollute the current one
		language = new Language(this.config.get('config_language'));
		
		// Compatibility code for old extension folders
		files = glob(DIR_APPLICATION + 'controller/extension/module/*.php');

		if (files) {
			for (let file of files) {
				extension = basename(file, '.php');

				await this.load.language('extension/module/' + extension, 'extension');

				module_data = {};

				modules = await this.model_setting_module.getModulesByCode(extension);

				for (modules of module) {
					if (module['setting']) {
						setting_info = JSON.parse(module['setting'], true);
					} else {
						setting_info = {};
					}
					
					module_data.push({
						'module_id' : module['module_id'],
						'name'      : module['name'],
						'status'    : ((setting_info['status']) && setting_info['status']) ? this.language.get('text_enabled') : this.language.get('text_disabled'),
						'edit'      : await this.url.link('extension/module/' + extension, 'user_token=' + this.session.data['user_token'] + '&module_id=' + module['module_id'], true),
						'delete'    : await this.url.link('extension/extension/module/delete', 'user_token=' + this.session.data['user_token'] + '&module_id=' + module['module_id'], true)
					});
				}

				data['extensions'].push({
					'name'      : this.language.get('extension').get('heading_title'),
					'status'    : this.config.get('module_' + extension + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'module'    : module_data,
					'install'   : await this.url.link('extension/extension/module/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall' : await this.url.link('extension/extension/module/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed' : in_array(extension, extensions),
					'edit'      : await this.url.link('extension/module/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		sort_order = {};

		for (data['extensions'] of key : value) {
			sort_order[key] = value['name'];
		}

		array_multisort(sort_order, SORT_ASC, data['extensions']);

		data['promotion'] = await this.load.controller('extension/extension/promotion');

		this.response.setOutput(await this.load.view('extension/extension/module', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/module')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if(!(this.error['warning']) && (this.request.get['extension']) && ((oc_strlen(this.request.get['extension']) < 3) || (oc_strlen(this.request.get['extension']) > 32))) {
			this.error['warning'] = this.language.get('error_code_name');
		}

		return Object.keys(this.error).length?false:true
	}
}
