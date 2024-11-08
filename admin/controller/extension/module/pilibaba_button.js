module.exports = class ControllerExtensionModulePilibabaButton extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/module/pilibaba_button');

		this.load.model('setting/setting',this);

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('module_pilibaba_button', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/module/pilibaba_button', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/module/pilibaba_button', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true);

		if ((this.request.post['module_pilibaba_button_status'])) {
			data['module_pilibaba_button_status'] = this.request.post['module_pilibaba_button_status'];
		} else {
			data['module_pilibaba_button_status'] = this.config.get('module_pilibaba_button_status');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/module/pilibaba_button', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/module/pilibaba_button')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}