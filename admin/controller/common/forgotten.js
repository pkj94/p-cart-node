module.exports = class ForgottenController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('common/forgotten');

		if (await this.user.isLogged() || !this.config.get('config_mail_engine')) {
			this.response.setRedirect(await this.url.link('common/login', '', true));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('common/forgotten')
		});

		data['confirm'] = await this.url.link('common/forgotten.confirm');
		data['back'] = await this.url.link('common/login');

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
		if (await this.user.isLogged() || !this.config.get('config_mail_engine')) {
			json['redirect'] = await this.url.link('common/login', '', true);
		}

		keys = ['email'];

		for (keys of key) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		this.load.model('user/user', this);

		const user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

		if (!user_info.user_id) {
			json['error'] = this.language.get('error_email');
		}

		if (!Object.keys(json).length) {
			await this.model_user_user.editCode(this.request.post['email'], oc_token(40));

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('common/login', '', true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async reset() {
		const data = {};
		await this.load.language('common/forgotten');
		let email = '';
		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		}
		let code = '';
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}

		if (await this.user.isLogged() || !this.config.get('config_mail_engine')) {
			this.response.setRedirect(await this.url.link('common/login', '', true));
		}

		this.load.model('user/user', this);

		const user_info = await this.model_user_user.getUserByEmail(email);

		if (!user_info.user_id || !user_info['code'] || user_info['code'] !== code) {
			await this.model_user_user.editCode(email, '');

			this.session.data['error'] = this.language.get('error_code');

			this.response.setRedirect(await this.url.link('common/login', '', true));
		}

		this.document.setTitle(this.language.get('heading_reset'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('common/forgotten.reset')
		});

		this.session.data['reset_token'] = substr(bin2hex(openssl_random_pseudo_bytes(26)), 0, 26);

		data['reset'] = await this.url.link('common/forgotten.password', 'email=' + encodeURIComponent(email) + '&code=' + code + '&reset_token=' + this.session.data['reset_token']);
		data['back'] = await this.url.link('common/login');

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('common/forgotten_reset', data));
	}

	/**
	 * @return void
	 */
	async password() {
		await this.load.language('common/forgotten');

		const json = {};
		let email = '';
		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		}
		let code = '';
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}
		let keys = [
			'password',
			'confirm'
		];

		for (keys of key) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		if (!(this.request.get['reset_token']) || !(this.session.data['reset_token']) || (this.session.data['reset_token'] != this.request.get['reset_token'])) {
			this.session.data['error'] = this.language.get('error_session');

			json['redirect'] = await this.url.link('account/forgotten', true);
		}

		this.load.model('user/user', this);

		const user_info = await this.model_user_user.getUserByEmail(email);

		if (!user_info.user_id || !user_info['code'] || user_info['code'] !== code) {
			await this.model_user_user.editCode(email, '');

			this.session.data['error'] = this.language.get('error_code');

			json['redirect'] = await this.url.link('common/login', '', true);
		}

		if (!Object.keys(json).length) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error'] = json['error'] || {};
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['confirm'] != this.request.post['password']) {
				json['error'] = json['error'] || {};
				json['error']['confirm'] = this.language.get('error_confirm');
			}
		}

		if (!Object.keys(json).length) {
			await this.model_user_user.editPassword(user_info['user_id'], this.request.post['password']);

			this.session.data['success'] = this.language.get('text_reset');

			delete this.session.data['reset_token'];

			json['redirect'] = await this.url.link('common/login', '', true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
