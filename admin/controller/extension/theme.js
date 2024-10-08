<?php
namespace Opencart\Admin\Controller\Extension;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Extension
 */
class ThemeController extends Controller {
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
		await this.load.language('extension/theme');

		available = [];

		this.load.model('setting/extension');

		const results = await this.model_setting_extension.getPaths('%/admin/controller/theme/%.php');

		for (let result of results) {
			available[] = basename(result['path'], '.php');
		}

		installed = [];

		extensions await this.model_setting_extension.getExtensionsByType('theme');

		for (extensions of extension) {
			if (in_array(extension['code'], available)) {
				installed[] = extension['code'];
			} else {
				await this.model_setting_extension.uninstall('theme', extension['code']);
			}
		}

		this.load.model('setting/store');
		this.load.model('setting/setting',this);

		let stores = await this.model_setting_store.getStores();

		data['extensions'] = [];

		if (results) {
			for (let result of results) {
				extension = substr(result['path'], 0, strpos(result['path'], '/'));

				code = basename(result['path'], '.php');

				await this.load.language('extension/' + extension + '/theme/' + code, code);

				store_data = [];

				store_data.push({
					'name'   : this.config.get('config_name'),
					'edit'   : this.url.link('extension/' + extension + '/theme/' + code, 'user_token=' + this.session.data['user_token'] + '&store_id=0'),
					'status' : this.config.get('theme_' + code + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled')
				];

				for (let store of stores) {
					store_data.push({
						'name'   : store['name'],
						'edit'   : this.url.link('extension/' + extension + '/theme/' + code, 'user_token=' + this.session.data['user_token'] + '&store_id=' + store['store_id']),
						'status' : this.model_setting_setting.getValue('theme_' + code + '_status', store['store_id']) ? this.language.get('text_enabled') : this.language.get('text_disabled')
					];
				}

				data['extensions'].push({
					'name'      : this.language.get(code + '_heading_title'),
					'install'   : this.url.link('extension/theme.install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'uninstall' : this.url.link('extension/theme.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'installed' : in_array(code, installed),
					'store'     : store_data
				];
			}
		}

		data['promotion'] = await this.load.controller('marketplace/promotion');

		return await this.load.view('extension/theme', data);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('extension/theme');

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

		if (!await this.user.hasPermission('modify', 'extension/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!is_file(DIR_EXTENSION + extension + '/admin/controller/theme/' + code + '.php')) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension');

			await this.model_setting_extension.install('theme', extension, code);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'access', 'extension/' + extension + '/theme/' + code);
			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'modify', 'extension/' + extension + '/theme/' + code);

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
			this.load.controller('extension/' + extension + '/theme/' + code + '.install');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.load.language('extension/theme');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/theme')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension');

			await this.model_setting_extension.uninstall('theme', this.request.get['code']);

			// Call uninstall method if it exists
			this.load.controller('extension/' + this.request.get['extension'] + '/theme/' + this.request.get['code'] + '.uninstall');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}