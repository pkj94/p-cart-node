module.exports = class ControllerExtensionExtensionCurrency extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/extension/currency');

		this.load.model('setting/extension',this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/currency');

		this.load.model('setting/extension',this);

		if (this.validate()) {
			await this.model_setting_extension.install('currency', this.request.get['extension']);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/currency/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/currency/' + this.request.get['extension']);

			// Call install method if it exsits
			await this.load.controller('extension/currency/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/currency');

		this.load.model('setting/extension',this);

		if (this.validate()) {
			await this.model_setting_extension.uninstall('currency', this.request.get['extension']);

			// Call uninstall method if it exsits
			await this.load.controller('extension/currency/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group');
			await this.model_user_user_group.removePermissions('extension/currency/' + this.request.get['extension']);

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

		extensions = await this.model_setting_extension.getInstalled('currency');

		for (extensions of key : value) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/currency/' + value + '.php') && !is_file(DIR_APPLICATION + 'controller/currency/' + value + '.php')) {
				await this.model_setting_extension.uninstall('currency', value);

				delete extensions[key]);
			}
		}

		data['extensions'] = {};
		
		// Compatibility code for old extension folders
		files = glob(DIR_APPLICATION + 'controller/extension/currency/*.php');

		if (files) {
			for (let file of files) {
				extension = basename(file, '.php');

				await this.load.language('extension/currency/' + extension, 'extension');

				data['extensions'].push({
					'name'      : this.language.get('extension').get('heading_title'),
					'status'    : this.config.get('currency_' + extension + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'install'   : await this.url.link('extension/extension/currency/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall' : await this.url.link('extension/extension/currency/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed' : in_array(extension, extensions),
					'edit'      : await this.url.link('extension/currency/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		data['promotion'] = await this.load.controller('extension/extension/promotion');

		this.response.setOutput(await this.load.view('extension/extension/currency', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/currency')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}