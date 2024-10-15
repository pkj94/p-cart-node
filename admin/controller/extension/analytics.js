const expressPath = require('path');
const fs= require('fs');
module.exports = class AnalyticsController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		await this.load.language('extension/analytics');

		// Promotion
		data['promotion'] = await this.load.controller('marketplace/promotion');

		let available = [];

		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getPaths('%/admin/controller/analytics/%.js');

		for (let result of results) {
			available.push(expressPath.basename(result['path'], '.js'));
		}

		let installed = [];

		const extensions = await this.model_setting_extension.getExtensionsByType('analytics');

		for (let extension of extensions) {
			if (available.includes(extension['code'])) {
				installed.push(extension['code']);
			} else {
				// Uninstall any missing extensions
				await this.model_setting_extension.uninstall('analytics', extension['code']);
			}
		}

		this.load.model('setting/store', this);
		this.load.model('setting/setting', this);

		let stores = await this.model_setting_store.getStores();

		data['extensions'] = [];

		this.load.model('setting/extension', this);

		if (results) {
			for (let result of results) {
				const extension = result['path'].substring(0, result['path'].indexOf('/'));

				const code = expressPath.basename(result['path'], '.js');

				await this.load.language('extension/' + extension + '/analytics/' + code, code);

				let store_data = [];

				store_data.push({
					'name': this.config.get('config_name'),
					'edit': this.url.link('extension/' + extension + '/analytics/' + code, 'user_token=' + this.session.data['user_token'] + '&store_id=0'),
					'status': this.config.get('analytics_' + code + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled')
				});

				for (let store of stores) {
					store_data.push({
						'name': store['name'],
						'edit': this.url.link('extension/' + extension + '/analytics/' + code, 'user_token=' + this.session.data['user_token'] + '&store_id=' + store['store_id']),
						'status': this.model_setting_setting.getValue('analytics_' + code + '_status', store['store_id']) ? this.language.get('text_enabled') : this.language.get('text_disabled')
					});
				}

				data['extensions'].push({
					'name': this.language.get(code + '_heading_title'),
					'install': this.url.link('extension/analytics.install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'uninstall': this.url.link('extension/analytics.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'installed': installed.includes(code),
					'store': store_data
				});
			}
		}

		return await this.load.view('extension/analytics', data);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('extension/analytics');

		const json = {};

		let extension = '';
		if ((this.request.get['extension'])) {
			extension = expressPath.basename(this.request.get['extension']);
		}

		let code = '';
		if ((this.request.get['code'])) {
			code = expressPath.basename(this.request.get['code']);
		}

		if (!await this.user.hasPermission('modify', 'extension/analytics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!fs.existsSync(DIR_EXTENSION + extension + '/admin/controller/analytics/' + code + '.js')) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension', this);

			await this.model_setting_extension.install('analytics', extension, code);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/' + extension + '/analytics/' + code);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/' + extension + '/analytics/' + code);


			// Register controllers, models and system extension folders
			if (fs.existsSync(`${DIR_EXTENSION}${extension}/admin/controller/`))
				fs.readdirSync(`${DIR_EXTENSION}${extension}/admin/controller/`).forEach((folder) => {
					fs.readdirSync(`${DIR_EXTENSION}${extension}/admin/controller/${folder}`).forEach((controller) => {
						if (controller.indexOf('.html') == -1) {
							let name = ucfirst(controller).replace('.js', '') + ucfirst(folder) + 'Controller';
							global[name] = require(DIR_EXTENSION + extension + '/admin/controller/' + folder + '/' + controller);
						}
					})
				});

			if (fs.existsSync(`${DIR_EXTENSION}${extension}/admin/model/`))
				fs.readdirSync(`${DIR_EXTENSION}${extension}/admin/model/`).forEach((folder) => {
					fs.readdirSync(`${DIR_EXTENSION}${extension}/admin/model/${folder}`).forEach((model) => {
						let name = ucfirst(model).replace('.js', '') + ucfirst(folder) + 'Model';
						global[name] = require(DIR_EXTENSION + extension + '/admin/model/' + folder + '/' + model)
					})
				});
			if (fs.existsSync(`${DIR_EXTENSION}${extension}/system/library/`))
				fs.readdirSync(`${DIR_EXTENSION}${extension}/system/library/`).forEach((library) => {
					let name = ucfirst(library).replace('.js', '') + 'Library';
					global[name] = require(DIR_EXTENSION + extension + '/system/library/' + '/' + library);
				});

			// Template directory
			if (fs.existsSync(`${DIR_EXTENSION}${extension}/admin/view/template/`))
				this.template.addPath(`extension/${extension}`, `${DIR_EXTENSION}${extension}/admin/view/template/`);


			// Language directory
			if (fs.existsSync(`${DIR_EXTENSION}${extension}/admin/language/`))
				this.language.addPath(`extension/${extension}`, `${DIR_EXTENSION}${extension}/admin/language/`);


			// Config directory
			if (fs.existsSync(`${DIR_EXTENSION}${extension}/system/config/`))
				this.language.addPath(`extension/${extension}`, `${DIR_EXTENSION}${extension}/system/config/`);


			// Call install method if it exists
			await this.load.controller('extension/' + extension + '/analytics/' + code + '.install');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.load.language('extension/analytics');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/analytics')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension', this);

			await this.model_setting_extension.uninstall('analytics', this.request.get['code']);

			// Call uninstall method if it exists
			await this.load.controller('extension/' + this.request.get['extension'] + '/analytics/' + this.request.get['code'] + '.uninstall');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}