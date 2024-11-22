module.exports = class ControllerExtensionExtensionAdvertise extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/extension/advertise');

		this.load.model('setting/extension',this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/advertise');

		this.load.model('setting/extension',this);

		if (this.validate()) {
			await this.model_setting_extension.install('advertise', this.request.get['extension']);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/advertise/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/advertise/' + this.request.get['extension']);
			
			// Compatibility
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'advertise/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'advertise/' + this.request.get['extension']);

			// Call install method if it exsits
			await this.load.controller('extension/advertise/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/advertise');

		this.load.model('setting/extension',this);

		if (this.validate()) {
			await this.model_setting_extension.uninstall('advertise', this.request.get['extension']);

			// Call uninstall method if it exsits
			await this.load.controller('extension/advertise/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group');
			await this.model_user_user_group.removePermissions('extension/advertise/' + this.request.get['extension']);
			await this.model_user_user_group.removePermissions('advertise/' + this.request.get['extension']);

			this.session.data['success'] = this.language.get('text_success');
		}

		await this.getList();
	}

	async getList() {
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

		extensions = await this.model_setting_extension.getInstalled('advertise');

		for (extensions of key : value) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/advertise/' + value + '.php') && !is_file(DIR_APPLICATION + 'controller/advertise/' + value + '.php')) {
				await this.model_setting_extension.uninstall('advertise', value);

				delete extensions[key]);
			}
		}
		
		this.load.model('setting/store',this);
		this.load.model('setting/setting',this);

		stores = await this.model_setting_store.getStores();
		
		data['extensions'] = {};

		// Compatibility code for old extension folders
		files = glob(DIR_APPLICATION + 'controller/extension/advertise/*.php');

		if (files) {
			for (let file of files) {
				extension = basename(file, '.php');
				
				// Compatibility code for old extension folders
				await this.load.language('extension/advertise/' + extension, 'extension');
				
				store_data = {};

				store_data.push({
					'name'   : this.config.get('config_name'),
					'edit'   : await this.url.link('extension/advertise/' + extension, 'user_token=' + this.session.data['user_token'] + '&store_id=0', true),
					'status' : this.config.get('advertise_' + extension + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled')
				});
				
				for (let store of stores) {
					store_data.push({
						'name'   : store['name'],
						'edit'   : await this.url.link('extension/advertise/' + extension, 'user_token=' + this.session.data['user_token'] + '&store_id=' + store['store_id'], true),
						'status' : await this.model_setting_setting.getSettingValue('advertise_' + extension + '_status', store['store_id']) ? this.language.get('text_enabled') : this.language.get('text_disabled')
					});
				}

				data['extensions'].push({
					'name'      : this.language.get('extension').get('heading_title'),
					'install'   : await this.url.link('extension/extension/advertise/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall' : await this.url.link('extension/extension/advertise/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed' : in_array(extension, extensions),
					'store'     : store_data
				});
			}
		}

		this.response.setOutput(await this.load.view('extension/extension/advertise', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/advertise')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}
