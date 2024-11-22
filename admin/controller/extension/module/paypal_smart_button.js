module.exports = class ControllerExtensionModulePayPalSmartButton extends Controller {
	error = {};
	
	async index() {
		await this.load.language('extension/module/paypal_smart_button');

		this.load.model('extension/module/paypal_smart_button');
		this.load.model('setting/setting',this);

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('module_paypal_smart_button', this.request.post);

			this.session.data['success'] = this.language.get('success_save');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extensions'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/module/paypal_smart_button', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/module/paypal_smart_button', 'user_token=' + this.session.data['user_token'], true);
		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true);
						
		if ((this.request.post['module_paypal_smart_button_status'])) {
			data['status'] = this.request.post['module_paypal_smart_button_status'];
		} else {
			data['status'] = this.config.get('module_paypal_smart_button_status');
		}
		
		// Setting 		
		_config = new Config();
		_config.load('paypal_smart_button');
		
		data['setting'] = _config.get('paypal_smart_button_setting');
		
		if ((this.request.post['module_paypal_smart_button_setting'])) {
			data['setting'] = array_replace_recursive(data['setting'], this.request.post['module_paypal_smart_button_setting']);
		} else {
			data['setting'] = array_replace_recursive(data['setting'], this.config.get('module_paypal_smart_button_setting'));
		}
				
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/module/paypal_smart_button', data));
	}

	async install() {
		this.load.model('extension/module/paypal_smart_button');
		this.load.model('setting/setting',this);

		await this.model_extension_module_paypal_smart_button.install();
		
		setting['module_paypal_smart_button_status'] = 0;
		
		await this.model_setting_setting.editSetting('module_paypal_smart_button', setting);
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/module/paypal_smart_button')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}
