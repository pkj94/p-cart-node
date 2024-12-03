const strpos = require("locutus/php/strings/strpos");

module.exports = class ControllerCommonLogin extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('common/login');

		this.document.setTitle(this.language.get('heading_title'));

		if (await this.user.isLogged() && (this.request.get['user_token']) && (this.request.get['user_token'] == this.session.data['user_token'])) {
			this.response.setRedirect(await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true));
		}

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			this.session.data['user_token'] = oc_token(32);
			await this.session.save(this.session.data);
			if ((this.request.post['redirect']) && (strpos(this.request.post['redirect'], HTTP_SERVER) === 0 || strpos(this.request.post['redirect'], HTTPS_SERVER) === 0)) {
				this.response.setRedirect(this.request.post['redirect'] + '&user_token=' + this.session.data['user_token']);
			} else {
				this.response.setRedirect(await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true));
			}
		}

		if (((this.session.data['user_token']) && !(this.request.get['user_token'])) || (((this.request.get['user_token']) && ((this.session.data['user_token']) && (this.request.get['user_token'] != this.session.data['user_token']))))) {
			this.error['warning'] = this.language.get('error_token');
		}

		if ((this.error['error_attempts'])) {
			data['error_warning'] = this.error['error_attempts'];
		} else if ((this.error['warning'])) {
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

		data['action'] = await this.url.link('common/login', '', true);

		if ((this.request.post['username'])) {
			data['username'] = this.request.post['username'];
		} else {
			data['username'] = '';
		}

		if ((this.request.post['password'])) {
			data['password'] = this.request.post['password'];
		} else {
			data['password'] = '';
		}

		if ((this.request.get['route'])) {
			let route = this.request.get['route'];

			delete this.request.get['route'];
			delete this.request.get['user_token'];

			let url = '';

			if (this.request.get) {
				url += http_build_query(this.request.get);
			}

			data['redirect'] = await this.url.link(route, url, true);
		} else {
			data['redirect'] = '';
		}

		if (this.config.get('config_password')) {
			data['forgotten'] = await this.url.link('common/forgotten', '', true);
		} else {
			data['forgotten'] = '';
		}
		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('common/login', data));
	}

	async validate() {
		if (!(this.request.post['username']) || !(this.request.post['password']) || !this.request.post['username'] || !this.request.post['password']) {
			this.error['warning'] = this.language.get('error_login');
		} else {
			this.load.model('user/user', this);

			// Check how many login attempts have been made.
			const login_info = await this.model_user_user.getLoginAttempts(this.request.post['username']);

			if (login_info && (login_info.total >= this.config.get('config_login_attempts')) && new Date() - new Date(login_info.date_modified) < 3600000) {
				this.error['error_attempts'] = this.language.get('error_attempts');
			}
		}

		if (!Object.keys(this.error).length) {
			if (!await this.user.login(this.request.post['username'], html_entity_decode(this.request.post['password']))) {
				this.error['warning'] = this.language.get('error_login');

				await this.model_user_user.addLoginAttempt(this.request.post['username']);

				delete this.session.data['user_token'];
			} else {
				await this.model_user_user.deleteLoginAttempts(this.request.post['username']);
			}
		}

		return Object.keys(this.error).length?false:true;
	}
}
