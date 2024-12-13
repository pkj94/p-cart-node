module.exports = class ControllerExtensionCaptchaGoogle extends Controller {
    async index(error = array()) {
        await this.load.language('extension/captcha/google');

        if ((error['captcha'])) {
			data['error_captcha'] = error['captcha'];
		} else {
			data['error_captcha'] = '';
		}

		data['site_key'] = this.config.get('captcha_google_key');

        data['route'] = this.request.get['route']; 

		return await this.load.view('extension/captcha/google', data);
    }

    async validate() {
		if (empty(this.session.data['gcapcha'])) {
			await this.load.language('extension/captcha/google');

			if (!(this.request.post['g-recaptcha-response'])) {
				return this.language.get('error_captcha');
			}

			recaptcha = file_get_contents('https://www.google+com/recaptcha/api/siteverify?secret=' + encodeURIComponent(this.config.get('captcha_google_secret')) + '&response=' + this.request.post['g-recaptcha-response'] + '&remoteip=' + this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : ''));

			recaptcha = JSON.parse(recaptcha, true);

			if (recaptcha['success']) {
				this.session.data['gcapcha']	= true;
			} else {
				return this.language.get('error_captcha');
			}
		}
    }
}
