module.exports = class ControllerExtensionExtensionPayment extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/extension/payment');

		this.load.model('setting/extension', this);

		await this.getList();
	}

	async install() {
		await this.load.language('extension/extension/payment');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.install('payment', this.request.get['extension']);

			this.load.model('user/user_group', this);

			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'access', 'extension/payment/' + this.request.get['extension']);
			await this.model_user_user_group.addPermission(await this.user.getGroupId(), 'modify', 'extension/payment/' + this.request.get['extension']);

			// Call install method if it exsits
			await this.load.controller('extension/payment/' + this.request.get['extension'] + '/install');

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
		}

		await this.getList();
	}

	async uninstall() {
		await this.load.language('extension/extension/payment');

		this.load.model('setting/extension', this);

		if (await this.validate()) {
			await this.model_setting_extension.uninstall('payment', this.request.get['extension']);

			// Call uninstall method if it exsits
			await this.load.controller('extension/payment/' + this.request.get['extension'] + '/uninstall');

			this.load.model('user/user_group', this);
			await this.model_user_user_group.removePermissions('extension/payment/' + this.request.get['extension']);

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

		const extensions = await this.model_setting_extension.getInstalled('payment');

		for (let [key, value] of Object.entries(extensions)) {
			if (!is_file(DIR_APPLICATION + 'controller/extension/payment/' + value + '.js') && !is_file(DIR_APPLICATION + 'controller/payment/' + value + '.js')) {
				await this.model_setting_extension.uninstall('payment', value);

				delete extensions[key];
			}
		}

		data['extensions'] = [];

		// Compatibility code for old extension folders
		const files = require('glob').sync(DIR_APPLICATION + 'controller/extension/payment/*.js');

		if (files.length) {
			for (let file of files.sort()) {
				const extension = expressPath.basename(file, '.js');

				await this.load.language('extension/payment/' + extension, 'extension');

				let text_link = this.language.get('extension').get('text_' + extension);
				let link = '';
				if (text_link != 'text_' + extension) {
					link = text_link;
				}

				data['extensions'].push({
					'name': this.language.get('extension').get('heading_title'),
					'link': link,
					'status': Number(this.config.get('payment_' + extension + '_status')) ? this.language.get('text_enabled') : this.language.get('text_disabled'),
					'sort_order': this.config.get('payment_' + extension + '_sort_order'),
					'install': await this.url.link('extension/extension/payment/install', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'uninstall': await this.url.link('extension/extension/payment/uninstall', 'user_token=' + this.session.data['user_token'] + '&extension=' + extension, true),
					'installed': extensions.includes(extension),
					'edit': await this.url.link('extension/payment/' + extension, 'user_token=' + this.session.data['user_token'], true)
				});
			}
		}

		data['promotion'] = await this.load.controller('extension/extension/promotion');
		await this.session.save(this.session.data);

		this.response.setOutput(await this.load.view('extension/extension/payment', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/extension/payment')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}