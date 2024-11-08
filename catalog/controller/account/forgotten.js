module.exports = class Forgotten extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/forgotten');

		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_forgotten'),
			'href': await this.url.link('account/forgotten', 'language=' + this.config.get('config_language'))
		});

		data['confirm'] = await this.url.link('account/forgotten+confirm', 'language=' + this.config.get('config_language'));

		data['back'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/forgotten', data));
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('account/forgotten');

		const json = {};

		if (await this.customer.isLogged()) {
			json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}

		if (!Object.keys(json).length) {
			let keys = ['email'];

			for (let key of keys) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			this.load.model('account/customer', this);

			const customer_info = await this.model_account_customer.getCustomerByEmail(this.request.post['email']);

			if (!customer_info.customer_id) {
				json['error'] = this.language.get('error_not_found');
			}
		}

		if (!Object.keys(json).length) {
			await this.model_account_customer.editCode(this.request.post['email'], oc_token(40));

			this.session.data['success'] = this.language.get('text_success');

			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async reset() {
		await this.load.language('account/forgotten');
		let email = '';
		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		}
		let code = '';
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}

		if (await this.customer.isLogged()) {
			this.response.setRedirect(await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']));
		}

		this.load.model('account/customer', this);

		const customer_info = await this.model_account_customer.getCustomerByEmail(email);

		if (!customer_info.customer_id || !customer_info['code'] || customer_info['code'] !== code) {
			await this.model_account_customer.editCode(email, '');

			this.session.data['error'] = this.language.get('error_code');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_reset'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/forgotten+reset', 'language=' + this.config.get('config_language'))
		});

		this.session.data['reset_token'] = bin2hex(26);

		data['save'] = await this.url.link('account/forgotten+password', 'language=' + this.config.get('config_language') + '&email=' + encodeURIComponent(email) + '&code=' + code + '&reset_token=' + this.session.data['reset_token']);
		data['back'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('account/forgotten_reset', data));
	}

	/**
	 * @return void
	 */
	async password() {
		await this.load.language('account/forgotten');

		const json = { error: {} };
		let email = '';
		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		}
		let code = '';
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}

		if (await this.customer.isLogged()) {
			json['redirect'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'], true);
		}

		if (!(this.request.get['reset_token']) || !(this.session.data['reset_token']) || (this.request.get['reset_token'] != this.session.data['reset_token'])) {
			this.session.data['error'] = this.language.get('error_session');
			await this.session.save(this.session.data);
			json['redirect'] = await this.url.link('account/forgotten', 'language=' + this.config.get('config_language'), true);
		}

		this.load.model('account/customer', this);

		const customer_info = await this.model_account_customer.getCustomerByEmail(email);

		if (!customer_info.customer_id || !customer_info['code'] || customer_info['code'] !== code) {
			// Reset token
			await this.model_account_customer.editCode(email, '');

			this.session.data['error'] = this.language.get('error_code');
			await this.session.save(this.session.data);
			json['redirect'] = await this.url.link('account/forgotten', 'language=' + this.config.get('config_language'), true);
		}

		if (!json.redirect) {
			let keys = [
				'password',
				'confirm'
			];

			for (let key of keys) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['confirm'] != this.request.post['password']) {
				json['error']['confirm'] = this.language.get('error_confirm');
			}
		}

		if (!Object.keys(json.error).length) {
			await this.model_account_customer.editPassword(customer_info['email'], this.request.post['password']);

			this.session.data['success'] = this.language.get('text_success');

			delete this.session.data['reset_token'];
			await this.session.save(this.session.data);
			json['redirect'] = await this.url.link('account/login', 'language=' + this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}