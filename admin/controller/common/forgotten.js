module.exports = class ForgottenController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('common/forgotten');

		if (this.user.isLogged() || !this.config.get('config_mail_engine')) {
			this.response.setRedirect(this.url.link('common/login', '', true));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('common/forgotten')
		});

		data['confirm'] = this.url.link('common/forgotten.confirm');
		data['back'] = this.url.link('common/login');

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/forgotten', data));
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('common/forgotten');

		const json = {};

		// Stop any undefined index messages.
		if (this.user.isLogged() || !this.config.get('config_mail_engine')) {
			json['redirect'] = this.url.link('common/login', '', true);
		}

		keys = ['email'];

		for (keys of key) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		this.load.model('user/user',this);

		const user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

		if (!user_info) {
			json['error'] = this.language.get('error_email');
		}

		if (!Object.keys(json).length) {
			await this.model_user_user.editCode(this.request.post['email'], oc_token(40));

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = this.url.link('common/login', '', true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async reset() {
		await this.load.language('common/forgotten');

		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		} else {
			email = '';
		}

		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		} else {
			code = '';
		}

		if (this.user.isLogged() || !this.config.get('config_mail_engine')) {
			this.response.setRedirect(this.url.link('common/login', '', true));
		}

		this.load.model('user/user',this);

		const user_info = await this.model_user_user.getUserByEmail(email);

		if (!user_info || !user_info['code'] || user_info['code'] !== code) {
			await this.model_user_user.editCode(email, '');

			this.session.data['error'] = this.language.get('error_code');

			this.response.setRedirect(this.url.link('common/login', '', true));
		}

		this.document.setTitle(this.language.get('heading_reset'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard')
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('common/forgotten.reset')
		});

		this.session.data['reset_token'] = substr(bin2hex(openssl_random_pseudo_bytes(26)), 0, 26);

		data['reset'] = this.url.link('common/forgotten.password', 'email=' + encodeURIComponent(email) + '&code=' + code + '&reset_token=' + this.session.data['reset_token']);
		data['back'] = this.url.link('common/login');

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/forgotten_reset', data));
	}

	/**
	 * @return void
	 */
	async password() {
		await this.load.language('common/forgotten');

		const json = {};

		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		} else {
			email = '';
		}

		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		} else {
			code = '';
		}

		keys = [
			'password',
			'confirm'
		});

		for (keys of key) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if (!(this.request.get['reset_token']) || !(this.session.data['reset_token']) || (this.session.data['reset_token'] != this.request.get['reset_token'])) {
			this.session.data['error'] = this.language.get('error_session');

			json['redirect'] = this.url.link('account/forgotten', true);
		}

		this.load.model('user/user',this);

		const user_info = await this.model_user_user.getUserByEmail(email);

		if (!user_info || !user_info['code'] || user_info['code'] !== code) {
			await this.model_user_user.editCode(email, '');

			this.session.data['error'] = this.language.get('error_code');

			json['redirect'] = this.url.link('common/login', '', true);
		}

		if (!Object.keys(json).length) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['confirm'] != this.request.post['password']) {
				json['error']['confirm'] = this.language.get('error_confirm');
			}
		}

		if (!Object.keys(json).length) {
			await this.model_user_user.editPassword(user_info['user_id'], this.request.post['password']);

			this.session.data['success'] = this.language.get('text_reset');

			delete (this.session.data['reset_token']);

			json['redirect'] = this.url.link('common/login', '', true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}