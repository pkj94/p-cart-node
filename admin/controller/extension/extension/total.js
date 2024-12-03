module.exports = class ControllerExtensionExtensionTotal extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/extension/total');

		this.load.model('setting/extension', this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/total');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.install('total', this.request.get['extension']);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/total/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/total/' + this.request.get['extension']);

			await this.load.controller('extension/total/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/total');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.uninstall('total', this.request.get['extension']);

			await this.load.controller('extension/total/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group', this);
			await this.model_user_user_group.removePermissions('extension/total/' + this.request.get['extension']);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		await this.getList();
	}

	async getList() {
		const data = {};
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

		this.load.model('setting/extension', this);

		const extensions = await this.model_setting_extension.getInstalled('total');

		for (let [key, value] of Object.entries(extensions)) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/total/' + value + '.js') && !is_file(DIR_APPLICATION + 'controller/total/' + value + '.js')) {
				await this.model_setting_extension.uninstall('total', value);

				delete extensions[key];
			}
		}

		data['extensions'] = [];

		// Compatibility code for old extension folders
		let files = require('glob').sync(DIR_APPLICATION + 'controller/extension/total/*.js');

		if (files.length) {
			for (let file of files.sort()) {
				let extension = expressPath.basename(file, '.js');

				await this.load.language('extension/total/' + extension, 'extension');

				data['extensions'].push({
					'name': this.language.get('extension').get('heading_title'),
					'status': Number(this.config.get('total_' + extension + '_status')) ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'sort_order': this.config.get('total_' + extension + '_sort_order'),
					'install': await this.url.link('extension/extension/total/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall': await this.url.link('extension/extension/total/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed': extensions.includes(extension),
					'edit': await this.url.link('extension/total/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		data['promotion'] = await this.load.controller('extension/extension/promotion');
		await this.session.save(this.session.data);

		this.response.setOutput(await this.load.view('extension/extension/total', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/total')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}