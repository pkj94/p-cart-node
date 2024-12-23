const expressPath = require('path');
const fs= require('fs');
module.exports = class FraudController extends global['\Opencart\System\Engine\Controller'] {
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
		await this.load.language('extension/fraud');

		let available = [];

		const results = await this.model_setting_extension.getPaths('%/admin/controller/fraud/%.js');

		for (let result of results) {
			available.push(expressPath.basename(result['path'], '.js'));
		}

		let installed = [];

		this.load.model('setting/extension', this);

		const extensions = await this.model_setting_extension.getExtensionsByType('fraud');

		for (let extension of extensions) {
			if (available.includes(extension['code'])) {
				installed.push(extension['code']);
			} else {
				await this.model_setting_extension.uninstall('fraud', extension['code']);
			}
		}

		data['extensions'] = [];

		if (results) {
			for (let result of results) {
				const extension = result['path'].substring(0, result['path'].indexOf('/'));

				const code = expressPath.basename(result['path'], '.js');

				await this.load.language('extension/' + extension + '/fraud/' + code, code);

				data['extensions'].push({
					'name': this.language.get(code + '_heading_title'),
					'status': this.config.get('fraud_' + code + '_status') ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'install': await this.url.link('extension/fraud.install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'uninstall': await this.url.link('extension/fraud.uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension + '&code=' + code),
					'installed': installed.includes(code),
					'edit': await this.url.link('extension/' + extension + '/fraud/' + code, 'user_token=' + this.session.data['user_token'])
				});
			}
		}

		data['promotion'] = await this.load.controller('marketplace/promotion');

		return await this.load.view('extension/fraud', data);
	}

	/**
	 * @return void
	 */
	async install() {
		await this.load.language('extension/fraud');

		const json = {};

		let extension = '';
		if ((this.request.get['extension'])) {
			extension = expressPath.basename(this.request.get['extension']);
		}

		let code = '';
		if ((this.request.get['code'])) {
			code = expressPath.basename(this.request.get['code']);
		}

		if (!await this.user.hasPermission('modify', 'extension/fraud')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!fs.existsSync(DIR_EXTENSION + extension + '/admin/controller/fraud/' + code + '.js')) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension', this);

			await this.model_setting_extension.install('fraud', extension, code);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/' + extension + '/fraud/' + code);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/' + extension + '/fraud/' + code);


			// Register controllers, models and system extension folders
			let namespace = str_replace(['_', '/'], ['', '\\'], ucfirst(extension, '_/'));

this.autoloader.register('Opencart\Admin\Controller\Extension\\' +namespace, DIR_EXTENSION + extension + '/admin/controller/');
			this.autoloader.register('Opencart\Admin\Model\Extension\\' + namespace, DIR_EXTENSION + extension + '/admin/model/');
			this.autoloader.register('Opencart\System\Extension\\' + namespace, DIR_EXTENSION + extension + '/system/');

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
			await this.load.controller('extension/' + extension + '/fraud/' + code + '.install');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.load.language('extension/fraud');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/fraud')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/extension', this);

			await this.model_setting_extension.uninstall('fraud', this.request.get['code']);

			// Call uninstall method if it exists
			await this.load.controller('extension/' + this.request.get['extension'] + '/fraud/' + this.request.get['code'] + '.uninstall');

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}