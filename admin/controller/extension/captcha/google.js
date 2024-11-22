module.exports = class ControllerExtensionCaptchaGoogle extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/captcha/google');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('captcha_google', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=captcha', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['key'])) {
			data['error_key'] = this.error['key'];
		} else {
			data['error_key'] = '';
		}

		if ((this.error['secret'])) {
			data['error_secret'] = this.error['secret'];
		} else {
			data['error_secret'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=captcha', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/captcha/google', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/captcha/google', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=captcha', true);

		if ((this.request.post['captcha_google_key'])) {
			data['captcha_google_key'] = this.request.post['captcha_google_key'];
		} else {
			data['captcha_google_key'] = this.config.get('captcha_google_key');
		}

		if ((this.request.post['captcha_google_secret'])) {
			data['captcha_google_secret'] = this.request.post['captcha_google_secret'];
		} else {
			data['captcha_google_secret'] = this.config.get('captcha_google_secret');
		}

		if ((this.request.post['captcha_google_status'])) {
			data['captcha_google_status'] = this.request.post['captcha_google_status'];
		} else {
			data['captcha_google_status'] = this.config.get('captcha_google_status');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/captcha/google', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/captcha/google')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['captcha_google_key']) {
			this.error['key'] = this.language.get('error_key');
		}

		if (!this.request.post['captcha_google_secret']) {
			this.error['secret'] = this.language.get('error_secret');
		}

		return Object.keys(this.error).length?false:true
	}
}
