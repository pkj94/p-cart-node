module.exports = class ControllerExtensionExtensionReport extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/extension/report');

		this.load.model('setting/extension',this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/report');

		this.load.model('setting/extension',this);

		if (this.validate()) {
			await this.model_setting_extension.install('report', this.request.get['extension']);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/report/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/report/' + this.request.get['extension']);

			await this.load.controller('extension/report/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/report');

		this.load.model('setting/extension',this);

		if (this.validate()) {
			await this.model_setting_extension.uninstall('report', this.request.get['extension']);

			await this.load.controller('extension/report/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group');
			await this.model_user_user_group.removePermissions('extension/report/' + this.request.get['extension']);

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

		this.load.model('setting/extension',this);

		extensions = await this.model_setting_extension.getInstalled('report');

		for (extensions of key : value) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/report/' + value + '.php') && !is_file(DIR_APPLICATION + 'controller/report/' + value + '.php')) {
				await this.model_setting_extension.uninstall('report', value);

				delete extensions[key]);
			}
		}

		data['extensions'] = {};
		
		// Compatibility code for old extension folders
		files = glob(DIR_APPLICATION + 'controller/extension/report/*.php');

		if (files) {
			for (let file of files) {
				extension = basename(file, '.php');

				await this.load.language('extension/report/' + extension, 'extension');

				data['extensions'].push({
					'name'       : this.language.get('extension').get('heading_title'),
					'status'     : this.config.get('report_' + extension + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'sort_order' : this.config.get('report_' + extension + '_sort_order'),
					'install'    : await this.url.link('extension/extension/report/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall'  : await this.url.link('extension/extension/report/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed'  : in_array(extension, extensions),
					'edit'       : await this.url.link('extension/report/' + extension, 'user_token=' + this.session.data['user_token'], true)
				);
			}
		}

		data['promotion'] = await this.load.controller('extension/extension/promotion');

		this.response.setOutput(await this.load.view('extension/extension/report', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/report')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}