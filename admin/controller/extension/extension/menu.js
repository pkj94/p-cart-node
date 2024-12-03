module.exports = class ControllerExtensionExtensionMenu extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/extension/menu');

		this.load.model('setting/extension', this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/menu');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.install('menu', this.request.get['extension']);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/menu/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/menu/' + this.request.get['extension']);

			// Call install method if it exsits
			await this.load.controller('extension/menu/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/menu');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.uninstall('menu', this.request.get['extension']);

			// Call uninstall method if it exsits
			await this.load.controller('extension/menu/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group', this);
			await this.model_user_user_group.removePermissions('extension/menu/' + this.request.get['extension']);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		data['text_layout'] = sprintf(this.language.get('text_layout'), await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'], true));

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		const extensions = await this.model_setting_extension.getInstalled('menu');

		for (let [key, value] of Object.entries(extensions)) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/menu/' + value + '.js') && !is_file(DIR_APPLICATION + 'controller/menu/' + value + '.js')) {
				await this.model_setting_extension.uninstall('menu', value);

				delete extensions[key];
			}
		}

		data['extensions'] = [];

		// Compatibility code for old extension folders
		const files = require('glob').sync(DIR_APPLICATION + 'controller/extension/menu/*.js');

		if (files.length) {
			for (let file of files.sort()) {
				const extension = expressPath.basename(file, '.js');

				await this.load.language('extension/menu/' + extension, 'extension');

				data['extensions'].push({
					'name': this.language.get('extension').get('heading_title'),
					'status': Number(this.config.get('menu_' + extension + '_status')) ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'install': await this.url.link('extension/extension/menu/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall': await this.url.link('extension/extension/menu/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed': extensions.includes(extension),
					'edit': await this.url.link('extension/menu/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		data['extensions'] = data['extensions'].sort((a, b) => a.name - b.name);
		data['promotion'] = await this.load.controller('extension/extension/promotion');
		await this.session.save(this.session.data);

		this.response.setOutput(await this.load.view('extension/extension/menu', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/menu')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}
