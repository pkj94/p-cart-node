<?php
namespace Opencart\Admin\Controller\Extension;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Extension
 */
class PaymentController extends Controller {
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
		await this.load.language('extension/payment');

		available = [];

		this.load.model('setting/extension');

		const results = await this.model_setting_extension.getPaths('%/admin/controller/payment/%.php');

		for (let result of results) {
			available[] = basename(result['path'], '.php');
		}

		installed = [];

		extensions await this.model_setting_extension.getExtensionsByType('payment');

		for (extensions of extension) {
			if (in_array(extension['code'], available)) {
				installed[] = extension['code'];
			} else {
				await this.model_setting_extension.uninstall('payment', extension['code']);
			}
		}

		data['extensions'] = [];

		if (results) {
			for (let result of results) {
				extension = substr(result['path'], 0, strpos(result['path'], '/'));

				code = basename(result['path'], '.php');

				await this.load.language('extension/' + extension + '/payment/' + code, code);

				text_link = this.language.get(code + '_text_' + code);

				if (text_link != code + '_text_' + code) {
					link = text_link;
				} else {
					link = '';
				}

				data['extensions'].push({
					'name'       : this.language.get(code + '_heading_title'),
					'link'       : link,
					'status'     : this.config.get('payment_' + code + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'sort_order' : this.config.get('payment_' + code + '_sort_order'),
					'install'    : this.url.link('extension/payment.install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'uninstall'  : this.url.link('extension/payment.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'installed'  : in_array(code, installed),
					'edit'       : this.url.link('extension/' + extension + '/payment/' + code, 'user_token=' + this.session.data['user_token'])
				];
			}
		}

		data['promotion'] = await this.load.controller('marketplace/promotion');

		return await this.load.view('extension/payment', data);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('extension/payment');

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

		if (!await this.user.hasPermission('modify', 'extension/payment')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!is_file(DIR_EXTENSION + extension + '/admin/controller/payment/' + code + '.php')) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension');

			await this.model_setting_extension.install('payment', extension, code);

			this.load.model('user/user_group');

			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'access', 'extension/' + extension + '/payment/' + code);
			await this.model_user_user_group.addPermission(this.user.getGroupId(), 'modify', 'extension/' + extension + '/payment/' + code);

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
			this.load.controller('extension/' + extension + '/payment/' + code + '.install');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.load.language('extension/payment');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/payment')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension');

			await this.model_setting_extension.uninstall('payment', this.request.get['code']);

			// Call uninstall method if it exists
			this.load.controller('extension/' + this.request.get['extension'] + '/payment/' + this.request.get['code'] + '.uninstall');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}