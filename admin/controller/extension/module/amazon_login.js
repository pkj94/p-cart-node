module.exports = class ControllerExtensionModuleAmazonLogin extends Controller {
	version = '3.2.1';
	error = {};

	async index() {

		await this.load.language('extension/module/amazon_login');

		this.load.model('setting/setting',this);
		this.load.model('design/layout',this);

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('module_amazon_login', this.request.post);

			this.load.model('setting/event',this);
			await this.model_setting_event.deleteEventByCode('amazon_login');
			await this.model_setting_event.addEvent('amazon_login', 'catalog/controller/account/logout/after', 'extension/module/amazon_login/logout');

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['heading_title'] = this.language.get('heading_title') + ' ' + this.version;

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/module/amazon_login', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/module/amazon_login', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true);

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.post['module_amazon_login_button_type'])) {
			data['module_amazon_login_button_type'] = this.request.post['module_amazon_login_button_type'];
		} else if (this.config.get('module_amazon_login_button_type')) {
			data['module_amazon_login_button_type'] = this.config.get('module_amazon_login_button_type');
		} else {
			data['module_amazon_login_button_type'] = 'LwA';
		}

		if ((this.request.post['module_amazon_login_button_colour'])) {
			data['module_amazon_login_button_colour'] = this.request.post['module_amazon_login_button_colour'];
		} else if (this.config.get('module_amazon_login_button_colour')) {
			data['module_amazon_login_button_colour'] = this.config.get('module_amazon_login_button_colour');
		} else {
			data['module_amazon_login_button_colour'] = 'gold';
		}

		if ((this.request.post['module_amazon_login_button_size'])) {
			data['module_amazon_login_button_size'] = this.request.post['module_amazon_login_button_size'];
		} else if (this.config.get('module_amazon_login_button_size')) {
			data['module_amazon_login_button_size'] = this.config.get('module_amazon_login_button_size');
		} else {
			data['module_amazon_login_button_size'] = 'medium';
		}

		if ((this.request.post['module_amazon_login_status'])) {
			data['module_amazon_login_status'] = this.request.post['module_amazon_login_status'];
		} else {
			data['module_amazon_login_status'] = this.config.get('module_amazon_login_status');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/module/amazon_login', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/module/amazon_login')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async install() {
		this.load.model('setting/event',this);
		await this.model_setting_event.deleteEventByCode('amazon_login');
        await this.model_setting_event.addEvent('amazon_login', 'catalog/controller/account/logout/after', 'extension/module/amazon_login/logout');
	}

	async uninstall() {
		this.load.model('setting/event',this);
		await this.model_setting_event.deleteEventByCode('amazon_login');
	}

}
