const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
module.exports = class UserController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('user/user');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('user/user.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('user/user.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('user/user');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'username';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}

		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('user/user.list', 'user_token=' + this.session.data['user_token'] + url);

		data['users'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('user/user', this);

		const user_total = await this.model_user_user.getTotalUsers();

		const results = await this.model_user_user.getUsers(filter_data);

		for (let result of results) {
			data['users'].push({
				'user_id': result['user_id'],
				'username': result['username'],
				'status': (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'edit': this.url.link('user/user.form', 'user_token=' + this.session.data['user_token'] + '&user_id=' + result['user_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_username'] = this.url.link('user/user.list', 'user_token=' + this.session.data['user_token'] + '&sort=username' + url);
		data['sort_status'] = this.url.link('user/user.list', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url);
		data['sort_date_added'] = this.url.link('user/user.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': user_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('user/user.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (user_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (user_total - this.config.get('config_pagination_admin'))) ? user_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), user_total, Math.ceil(user_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('user/user_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('user/user');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['user_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['save'] = this.url.link('user/user.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url);
		let user_info
		if ((this.request.get['user_id'])) {
			this.load.model('user/user', this);

			user_info = await this.model_user_user.getUser(this.request.get['user_id']);
		}

		if ((this.request.get['user_id'])) {
			data['user_id'] = this.request.get['user_id'];
		} else {
			data['user_id'] = 0;
		}

		if ((user_info)) {
			data['username'] = user_info['username'];
		} else {
			data['username'] = '';
		}

		this.load.model('user/user_group', this);

		data['user_groups'] = await this.model_user_user_group.getUserGroups();

		if ((user_info)) {
			data['user_group_id'] = user_info['user_group_id'];
		} else {
			data['user_group_id'] = 0;
		}

		if ((user_info)) {
			data['firstname'] = user_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((user_info)) {
			data['lastname'] = user_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((user_info)) {
			data['email'] = user_info['email'];
		} else {
			data['email'] = '';
		}

		if ((user_info)) {
			data['image'] = user_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image', this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (data['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(data['image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(data['image']), 100, 100);
		} else {
			data['thumb'] = data['placeholder'];
		}

		if ((user_info)) {
			data['status'] = user_info['status'];
		} else {
			data['status'] = 0;
		}

		data['authorize'] = await this.getAuthorize();
		data['login'] = await this.getLogin();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('user/user');
		this.request.post['user_id'] = Number(this.request.post['user_id']);
		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'user/user')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['username']) < 3) || (oc_strlen(this.request.post['username']) > 20)) {
			json['error']['username'] = this.language.get('error_username');
		}

		this.load.model('user/user', this);

		let user_info = await this.model_user_user.getUserByUsername(this.request.post['username']);

		if (!this.request.post['user_id']) {
			if (user_info.user_id) {
				json['error']['warning'] = this.language.get('error_username_exists');
			}
		} else {
			if (user_info.user_id && (this.request.post['user_id'] != user_info['user_id'])) {
				json['error']['warning'] = this.language.get('error_username_exists');
			}
		}

		if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
			json['error']['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
			json['error']['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
			json['error']['email'] = this.language.get('error_email');
		}

		user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

		if (!this.request.post['user_id']) {
			if (user_info.user_id) {
				json['error']['warning'] = this.language.get('error_email_exists');
			}
		} else {
			if (user_info.user_id && (this.request.post['user_id'] != user_info['user_id'])) {
				json['error']['warning'] = this.language.get('error_email_exists');
			}
		}

		if (this.request.post['password'] || (!(this.request.post['user_id']))) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['password'] != this.request.post['confirm']) {
				json['error']['confirm'] = this.language.get('error_confirm');
			}
		}

		if (!Object.keys(json.error).length) {
			if (!this.request.post['user_id']) {
				json['user_id'] = await this.model_user_user.addUser(this.request.post);
			} else {
				await this.model_user_user.editUser(this.request.post['user_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('user/user');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'user/user')) {
			json['error'] = this.language.get('error_permission');
		}

		for (let user_id of selected) {
			if (this.user.getId() == user_id) {
				json['error'] = json['error'] || {};
				json['error']['warning'] = this.language.get('error_account');
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('user/user', this);

			for (let user_id of selected) {
				await this.model_user_user.deleteUser(user_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async authorize() {
		await this.load.language('user/user');

		this.response.setOutput(await this.getAuthorize());
	}

	/**
	 * @return string
	 */
	async getAuthorize() {
		const data = {};
		let user_id = 0;
		if ((this.request.get['user_id'])) {
			user_id = this.request.get['user_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'user/user.login') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['authorizes'] = [];

		this.load.model('user/user', this);

		const results = await this.model_user_user.getAuthorizes(user_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['authorizes'].push({
				'token': result['token'],
				'ip': result['ip'],
				'user_agent': result['user_agent'],
				'status': result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled'),
				'total': result['total'],
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added'])),
				'delete': this.url.link('user/user.deleteAuthorize', 'user_token=' + this.session.data['user_token'] + '&user_authorize_id=' + result['user_authorize_id'])
			});
		}

		const authorize_total = await this.model_user_user.getTotalAuthorizes(user_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': authorize_total,
			'page': page,
			'limit': limit,
			'url': this.url.link('user/user.authorize', 'user_token=' + this.session.data['user_token'] + '&user_id=' + user_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (authorize_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (authorize_total - limit)) ? authorize_total : (((page - 1) * limit) + limit), authorize_total, Math.ceil(authorize_total / limit));

		return await this.load.view('user/user_authorize', data);
	}

	/**
	 * @return void
	 */
	async deleteAuthorize() {
		await this.load.language('user/user');

		const json = {};
		let user_authorize_id = 0;
		if ((this.request.get['user_authorize_id'])) {
			user_authorize_id = this.request.get['user_authorize_id'];
		}
		let token = '';
		if ((this.request.cookie['authorize'])) {
			token = this.request.cookie['authorize'];
		}

		if (!await this.user.hasPermission('modify', 'user/user')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('user/user', this);

		const login_info = await this.model_user_user.getAuthorize(user_authorize_id);

		if (!login_info.login_id) {
			json['error'] = this.language.get('error_authorize');
		}

		if (!Object.keys(json).length) {
			await this.model_user_user.deleteAuthorize(user_authorize_id);

			// If the token is still present, then we enforce the user to log out automatically.
			if (login_info['token'] == token) {
				this.session.data['success'] = this.language.get('text_success');

				json['redirect'] = this.url.link('common/login', '', true);
			} else {
				json['success'] = this.language.get('text_success');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async login() {
		await this.load.language('user/user');

		this.response.setOutput(await this.getLogin());
	}

	/**
	 * @return string
	 */
	async getLogin() {
		const data = {};
		let user_id = 0;
		if ((this.request.get['user_id'])) {
			user_id = this.request.get['user_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'user/user.login') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['logins'] = [];

		this.load.model('user/user', this);

		const results = await this.model_user_user.getLogins(user_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['logins'].push({
				'ip': result['ip'],
				'user_agent': result['user_agent'],
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added']))
			});
		}

		const login_total = await this.model_user_user.getTotalLogins(user_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': login_total,
			'page': page,
			'limit': limit,
			'url': this.url.link('user/user.login', 'user_token=' + this.session.data['user_token'] + '&user_id=' + user_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (login_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (login_total - limit)) ? login_total : (((page - 1) * limit) + limit), login_total, Math.ceil(login_total / limit));

		return await this.load.view('user/user_login', data);
	}
}
