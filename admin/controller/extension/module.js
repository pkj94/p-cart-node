<?php
namespace Opencart\Admin\Controller\Extension;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Extension
 */
class ModuleController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		await this.load.language('extension/module');

		this.load.model('setting/module');

		await this.load.language('extension/module');

		data['text_layout'] = sprintf(this.language.get('text_layout'), this.url.link('design/layout', 'user_token=' + this.session.data['user_token']));

		available = [];

		this.load.model('setting/extension');

		const results = await this.model_setting_extension.getPaths('%/admin/controller/module/%.php');

		for (let result of results) {
			available[] = basename(result['path'], '.php');
		}

		installed = [];

		extensions await this.model_setting_extension.getExtensionsByType('module');

		for (extensions of extension) {
			if (in_array(extension['code'], available)) {
				installed[] = extension['code'];
			} else {
				await this.model_setting_extension.uninstall('module', extension['code']);
			}
		}

		this.load.model('setting/module');

		data['extensions'] = [];

		if (results) {
			for (let result of results) {
				extension = substr(result['path'], 0, strpos(result['path'], '/'));

				code = basename(result['path'], '.php');

				await this.load.language('extension/' + extension + '/module/' + code, code);

				module_data = [];

				modules await this.model_setting_module.getModulesByCode(extension + '.' + code);

				for (modules of module) {
					if (module['setting']) {
						setting_info = json_decode(module['setting'], true);
					} else {
						setting_info = [];
					}

					module_data.push({
						'name'   : module['name'],
						'status' : (bool)setting_info['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled'),
						'edit'   : this.url.link('extension/' + extension + '/module/' + code, 'user_token=' + this.session.data['user_token'] + '&module_id=' + module['module_id']),
						'delete' : this.url.link('extension/module.delete', 'user_token=' + this.session.data['user_token'] + '&module_id=' + module['module_id'])
					];
				}

				if (module_data) {
					status = '';
				} else {
					status = this.config.get('module_' + code + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled');
				}

				data['extensions'].push({
					'name'      : this.language.get(code + '_heading_title'),
					'status'    : status,
					'module'    : module_data,
					'install'   : this.url.link('extension/module.install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'uninstall' : this.url.link('extension/module.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'installed' : in_array(code, installed),
					'edit'      : this.url.link('extension/' + extension + '/module/' + code, 'user_token=' + this.session.data['user_token'])
				];
			}
		}

		sort_order = [];

		for (data['extensions'] of key : value) {
			sort_order[key] = value['name'];
		}

		data['extensions']= multiSort(data['extensions'],sort_order,'ASC');

		data['promotion'] = await this.load.controller('marketplace/promotion');

		return await this.load.view('extension/module', data);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('extension/module');

		const json = {};

		if ((this.request.get['extension'])) {
			extension = basename(this.request.get['extension']);
		} else {
			extension = '';
		}

		if ((this.request.get['code'])) {
			code = basename(this.request.get['code']);
		} else {
			code = '';
		}

		if (!await this.user.hasPermission('modify', 'extension/module')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!is_file(DIR_EXTENSION + extension + '/admin/controller/module/' + code + '.php')) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension');

			await this.model_setting_extension.install('module', extension, code);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'access', 'extension/' + extension + '/module/' + code);
			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'modify', 'extension/' + extension + '/module/' + code);

			namespace = str_replace(['_', '/'], ['', '\\'], ucwords(extension, '_/'));

			// Register controllers, models and system extension folders
			this.autoloader.register('Opencart\Admin\Controller\Extension\\' + namespace, DIR_EXTENSION + extension + '/admin/controller/');
			this.autoloader.register('Opencart\Admin\Model\Extension\\' + namespace, DIR_EXTENSION + extension + '/admin/model/');
			this.autoloader.register('Opencart\System\Extension\\' + namespace, DIR_EXTENSION + extension + '/system/');

			// Template directory
			this.template.addPath('extension/' + extension, DIR_EXTENSION + extension + '/admin/view/template/');

			// Language directory
			this.language.addPath('extension/' + extension, DIR_EXTENSION + extension + '/admin/language/');

			// Config directory
			this.config.addPath('extension/' + extension, DIR_EXTENSION + extension + '/system/config/');

			// Call install method if it exists
			this.load.controller('extension/' + extension + '/module/' + code + '.install');

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
			this.load.model('setting/extension');

			await this.model_setting_extension.uninstall('module', this.request.get['code']);

			this.load.model('setting/module');

			await this.model_setting_module.deleteModulesByCode(this.request.get['extension'] + '.' + this.request.get['code']);

			// Call uninstall method if it exists
			this.load.controller('extension/' + this.request.get['extension'] + '/module/' + this.request.get['code'] + '.uninstall');

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

			this.load.model('setting/module');

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
			this.load.model('setting/module');

			await this.model_setting_module.deleteModule(module_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
