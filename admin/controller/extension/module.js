const expressPath = require('path');
const fs= require('fs');
const sprintf = require('locutus/php/strings/sprintf');
module.exports = class ModuleController extends Controller {
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
		await this.load.language('extension/module');

		this.load.model('setting/module', this);

		await this.load.language('extension/module');

		data['text_layout'] = sprintf(this.language.get('text_layout'), this.url.link('design/layout', 'user_token=' + this.session.data['user_token']));

		let available = [];

		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getPaths('%/admin/controller/module/%.js');

		for (let result of results) {
			available.push(expressPath.basename(result['path'], '.js'));
		}

		let installed = [];

		const extensions = await this.model_setting_extension.getExtensionsByType('module');

		for (let extension of extensions) {
			if (available.includes(extension['code'])) {
				installed.push(extension['code']);
			} else {
				await this.model_setting_extension.uninstall('module', extension['code']);
			}
		}

		this.load.model('setting/module', this);

		data['extensions'] = [];

		if (results) {
			for (let result of results) {
				const extension = result['path'].substring(0, result['path'].indexOf('/'));

				const code = expressPath.basename(result['path'], '.js');

				await this.load.language('extension/' + extension + '/module/' + code, code);

				let module_data = [];

				const modules = await this.model_setting_module.getModulesByCode(extension + '.' + code);

				for (let module of modules) {
					let setting_info = {};
					if (module['setting']) {
						setting_info = JSON.parse(module['setting']);
					}

					module_data.push({
						'name': module['name'],
						'status': Number(setting_info['status']) ? this.language.get('text_enabled') : this.language.get('text_disabled'),
						'edit': this.url.link('extension/' + extension + '/module/' + code, 'user_token=' + this.session.data['user_token'] + '&module_id=' + module['module_id']),
						'delete': this.url.link('extension/module.delete', 'user_token=' + this.session.data['user_token'] + '&module_id=' + module['module_id'])
					});
				}
				let status = '';
				if (module_data.length) {
					status = '';
				} else {
					status = Number(this.config.get('module_' + code + '_status')) ? this.language.get('text_enabled') : this.language.get('text_disabled');
				}
				data['extensions'].push({
					'name': this.language.get(code + '_heading_title'),
					'status': status,
					'module': module_data,
					'install': this.url.link('extension/module.install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'uninstall': this.url.link('extension/module.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'installed': installed.includes(code),
					'edit': this.url.link('extension/' + extension + '/module/' + code, 'user_token=' + this.session.data['user_token'])
				});
			}
		}

		let sort_order = [];

		for (let [key, value] of Object.entries(data['extensions'])) {
			sort_order[key] = value['name'];
		}

		// data['extensions'] = multiSort(data['extensions'], sort_order, 'ASC');
		data['extensions'] = data['extensions'].sort((a, b) => a.name - b.name);

		data['promotion'] = await this.load.controller('marketplace/promotion');

		return await this.load.view('extension/module', data);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('extension/module');

		const json = {};

		let extension = '';
		if ((this.request.get['extension'])) {
			extension = expressPath.basename(this.request.get['extension']);
		}

		let code = '';
		if ((this.request.get['code'])) {
			code = expressPath.basename(this.request.get['code']);
		}

		if (!await this.user.hasPermission('modify', 'extension/module')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!fs.existsSync(DIR_EXTENSION + extension + '/admin/controller/module/' + code + '.js')) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension', this);

			await this.model_setting_extension.install('module', extension, code);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'access', 'extension/' + extension + '/module/' + code);
			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'modify', 'extension/' + extension + '/module/' + code);


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
			await this.load.controller('extension/' + extension + '/module/' + code + '.install');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.load.language('extension/module');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/module')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension', this);

			await this.model_setting_extension.uninstall('module', this.request.get['code']);

			this.load.model('setting/module', this);

			await this.model_setting_module.deleteModulesByCode(this.request.get['extension'] + '.' + this.request.get['code']);

			// Call uninstall method if it exists
			await this.load.controller('extension/' + this.request.get['extension'] + '/module/' + this.request.get['code'] + '.uninstall');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async add() {
		await this.load.language('extension/module');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/module')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			await this.load.language('extension/' + this.request.get['extension'] + '/module/' + this.request.get['code'], 'extension');

			this.load.model('setting/module', this);

			await this.model_setting_module.addModule(this.request.get['extension'] + '.' + this.request.get['code'], this.language.get('extension_heading_title'));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('extension/module');

		const json = {};

		if ((this.request.get['module_id'])) {
			module_id = this.request.get['module_id'];
		} else {
			module_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'extension/module')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/module', this);

			await this.model_setting_module.deleteModule(module_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
