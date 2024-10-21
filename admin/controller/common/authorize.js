module.exports = class AuthorizeCommontController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('common/authorize');

		this.document.setTitle(this.language.get('heading_title'));
		let token = '';
		if ((this.request.cookie['authorize'])) {
			token = this.request.cookie['authorize'];
		}
		const data = {};
		// Check to see if user is using incorrect token
		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete this.session.data['error'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete (this.session.data['success']);
		} else {
			data['success'] = '';
		}

		this.load.model('user/user', this);

		const login_info = await this.model_user_user.getAuthorizeByToken(await this.user.getId(), token);

		if (!login_info) {
			// Create a token that can be stored of a cookie and will be used to identify device is safe.
			token = oc_token(32);

			const authorize_data = {
				'token': token,
				'ip': this.request.server.headers['x-forwarded-for'] || (
					this.request.server.connection ? (this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress) : ''),
				'user_agent': require("useragent").parse(req.headers['user-agent'], this.request.server.query.jsuseragent).source
			};

			this.load.model('user/user', this);

			await this.model_user_user.addAuthorize(await this.user.getId(), authorize_data);

			this.response.response.cookie('authorize', token);
		}

		data['action'] = await this.url.link('common/authorize.validate', 'user_token=' + this.session.data['user_token']);

		// Set the code to be emailed
		this.session.data['code'] = oc_token(4);

		if ((this.request.get['route']) && this.request.get['route'] != 'common/login' && this.request.get['route'] != 'common/authorize') {
			let args = this.request.get;

			let route = args['route'];

			delete (args['route']);
			delete (args['user_token']);

			let url = '';

			if (args) {
				url+= args;
			}

			data['redirect'] = await this.url.link(route, url);
		} else {
			data['redirect'] = await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/authorize', data));
	}

	/**
	 * @return void
	 */
	async send() {
		await this.load.language('common/authorize');

		const json = {};

		json['success'] = this.language.get('text_resend');

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async validate() {
		await this.load.language('common/authorize');

		const json = {};
		let token = '';
		if ((this.request.cookie['authorize'])) {
			token = this.request.cookie['authorize'];
		} 

		this.load.model('user/user', this);

		const authorize_info = await this.model_user_user.getAuthorizeByToken(await this.user.getId(), token);

		if (authorize_info) {
			if ((authorize_info['attempts'] <= 2) && (!(this.request.post['code']) || !(this.session.data['code']) || (this.request.post['code'] != this.session.data['code']))) {
				json['error'] = this.language.get('error_code');

				await this.model_user_user.editAuthorizeTotal(authorize_info['user_authorize_id'], authorize_info['total'] + 1);
			}

			if (authorize_info['attempts'] >= 2) {
				json['redirect'] = await this.url.link('common/authorize.unlock', 'user_token=' + this.session.data['user_token'], true);
			}
		} else {
			json['error'] = this.language.get('error_code');
		}

		if (!Object.keys(json).length) {
			await this.model_user_user.editAuthorizeStatus(authorize_info['user_authorize_id'], 1);
			await this.model_user_user.editAuthorizeTotal(authorize_info['user_authorize_id'], 0);

			// Register the cookie for security.
			if ((this.request.post['redirect']) && (strpos(this.request.post['redirect'], HTTP_SERVER) === 0)) {
				json['redirect'] = str_replace('&amp;', '&', this.request.post['redirect'] + '&user_token=' + this.session.data['user_token']);
			} else {
				json['redirect'] = await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async unlock() {
		await this.load.language('common/authorize');
		let token = '';
		if ((this.request.cookie['authorize'])) {
			token = this.request.cookie['authorize'];
		} 
		this.load.model('user/user', this);

		const authorize_info = await this.model_user_user.getAuthorizeByToken(await this.user.getId(), token);

		if (authorize_info && authorize_info['status']) {
			// Redirect if already have a valid token.
			this.response.setRedirect(await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true));
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('common/authorize_unlock', data));
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('common/authorize');

		const json = {};

		json['success'] = this.language.get('text_link');

		// Create reset code
		this.load.model('user/user', this);

		await this.model_user_user.editCode(await this.user.getEmail(), oc_token(32));

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async reset() {
		await this.load.language('common/authorize');
		let email = '';
		if ((this.request.get['email'])) {
			email = this.request.get['email'];
		}
		let code = '';
		if ((this.request.get['code'])) {
			code = this.request.get['code'];
		}

		this.load.model('user/user', this);

		const user_info = await this.model_user_user.getUserByEmail(email);

		if (user_info && user_info['code'] && code && user_info['code'] === code) {
			await this.model_user_user.resetAuthorizes(user_info['user_id']);

			await this.model_user_user.editCode(email, '');

			this.session.data['success'] = this.language.get('text_unlocked');

			this.response.setRedirect(await this.url.link('common/authorize', 'user_token=' + this.session.data['user_token'], true));
		} else {
			await this.user.logout();

			await this.model_user_user.editCode(email, '');

			this.session.data['error'] = this.language.get('error_reset');

			this.response.setRedirect(await this.url.link('common/login', '', true));
		}
	}
}
