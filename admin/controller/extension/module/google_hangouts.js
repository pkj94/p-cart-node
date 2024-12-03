module.exports = class ControllerExtensionModuleGoogleHangouts extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/module/google_hangouts');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('module_google_hangouts', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['code'])) {
			data['error_code'] = this.error['code'];
		} else {
			data['error_code'] = '';
		}

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
			'href' : await this.url.link('extension/module/google_hangouts', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/module/google_hangouts', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true);

		if ((this.request.post['module_google_hangouts_code'])) {
			data['module_google_hangouts_code'] = this.request.post['module_google_hangouts_code'];
		} else {
			data['module_google_hangouts_code'] = this.config.get('module_google_hangouts_code');
		}

		if ((this.request.post['module_google_hangouts_status'])) {
			data['module_google_hangouts_status'] = this.request.post['module_google_hangouts_status'];
		} else {
			data['module_google_hangouts_status'] = this.config.get('module_google_hangouts_status');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/module/google_hangouts', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/module/google_hangouts')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['module_google_hangouts_code']) {
			this.error['code'] = this.language.get('error_code');
		}

		return Object.keys(this.error).length?false:true
	}
}