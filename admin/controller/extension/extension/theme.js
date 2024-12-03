module.exports = class ControllerExtensionExtensionTheme extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/extension/theme');

		this.load.model('setting/extension', this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/theme');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.install('theme', this.request.get['extension']);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/theme/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/theme/' + this.request.get['extension']);

			// Call install method if it exsits
			await this.load.controller('extension/theme/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/theme');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.uninstall('theme', this.request.get['extension']);

			// Call uninstall method if it exsits
			await this.load.controller('extension/theme/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group', this);
			await this.model_user_user_group.removePermissions('extension/theme/' + this.request.get['extension']);

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

		const extensions = await this.model_setting_extension.getInstalled('theme');

		for (let [key, value] of Object.entries(extensions)) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/theme/' + value + '.js') && !is_file(DIR_APPLICATION + 'controller/theme/' + value + '.js')) {
				await this.model_setting_extension.uninstall('theme', value);

				delete extensions[key];
			}
		}

		this.load.model('setting/store', this);
		this.load.model('setting/setting', this);

		const stores = await this.model_setting_store.getStores();

		data['extensions'] = [];

		// Compatibility code for old extension folders
		const files = require('glob').sync(DIR_APPLICATION + 'controller/extension/theme/*.js');

		if (files.length) {
			for (let file of files.sort()) {
				const extension = expressPath.basename(file, '.js');

				await this.load.language('extension/theme/' + extension, 'extension');

				let store_data = [];

				store_data.push({
					'name': this.config.get('config_name'),
					'edit': await this.url.link('extension/theme/' + extension, 'user_token=' + this.session.data['user_token'] + '&store_id=0', true),
					'status': Number(this.config.get('theme_' + extension + '_status')) ? this.language.get('text_enabled') : this.language.get('text_disabled')
				});

				for (let store of stores) {
					store_data.push({
						'name': store['name'],
						'edit': await this.url.link('extension/theme/' + extension, 'user_token=' + this.session.data['user_token'] + '&store_id=' + store['store_id'], true),
						'status': await this.model_setting_setting.getSettingValue('theme_' + extension + '_status', store['store_id']) ? this.language.get('text_enabled') : this.language.get('text_disabled')
					});
				}

				data['extensions'].push({
					'name': this.language.get('extension').get('heading_title'),
					'install': await this.url.link('extension/extension/theme/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall': await this.url.link('extension/extension/theme/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed': extensions.includes(extension),
					'store': store_data
				});
			}
		}

		data['promotion'] = await this.load.controller('extension/extension/promotion');
		await this.session.save(this.session.data);

		this.response.setOutput(await this.load.view('extension/extension/theme', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/theme')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}