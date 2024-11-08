module.exports = class ControllerUserUser extends Controller {
	error = {};

	async index() {
		await this.load.language('user/user');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user',this);

		await this.getList();
	}

	async add() {
		await this.load.language('user/user');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user',this);

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_user_user.addUser(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('user/user');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user',this);

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_user_user.editUser(this.request.get['user_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('user/user');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user',this);

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of user_id) {
				await this.model_user_user.deleteUser(user_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'username';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		url = '';

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
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('user/user/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('user/user/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['users'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		user_total = await this.model_user_user.getTotalUsers();

		results = await this.model_user_user.getUsers(filter_data);

		for (let result of results) {
			data['users'].push({
				'user_id'    : result['user_id'],
				'username'   : result['username'],
				'status'     : (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit'       : await this.url.link('user/user/edit', 'user_token=' + this.session.data['user_token'] + '&user_id=' + result['user_id'] + url, true)
			);
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = {};
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_username'] = await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + '&sort=username' + url, true);
		data['sort_status'] = await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);
		data['sort_date_added'] = await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = user_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (user_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (user_total - this.config.get('config_limit_admin'))) ? user_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), user_total, ceil(user_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['user_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['username'])) {
			data['error_username'] = this.error['username'];
		} else {
			data['error_username'] = '';
		}

		if ((this.error['password'])) {
			data['error_password'] = this.error['password'];
		} else {
			data['error_password'] = '';
		}

		if ((this.error['confirm'])) {
			data['error_confirm'] = this.error['confirm'];
		} else {
			data['error_confirm'] = '';
		}

		if ((this.error['firstname'])) {
			data['error_firstname'] = this.error['firstname'];
		} else {
			data['error_firstname'] = '';
		}

		if ((this.error['lastname'])) {
			data['error_lastname'] = this.error['lastname'];
		} else {
			data['error_lastname'] = '';
		}

		if ((this.error['email'])) {
			data['error_email'] = this.error['email'];
		} else {
			data['error_email'] = '';
		}

		url = '';

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
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['user_id'])) {
			data['action'] = await this.url.link('user/user/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('user/user/edit', 'user_token=' + this.session.data['user_token'] + '&user_id=' + this.request.get['user_id'] + url, true);
		}

		data['cancel'] = await this.url.link('user/user', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['user_id']) && (this.request.server['method'] != 'POST')) {
			user_info = await this.model_user_user.getUser(this.request.get['user_id']);
		}

		if ((this.request.post['username'])) {
			data['username'] = this.request.post['username'];
		} else if ((user_info)) {
			data['username'] = user_info['username'];
		} else {
			data['username'] = '';
		}

		if ((this.request.post['user_group_id'])) {
			data['user_group_id'] = this.request.post['user_group_id'];
		} else if ((user_info)) {
			data['user_group_id'] = user_info['user_group_id'];
		} else {
			data['user_group_id'] = '';
		}

		this.load.model('user/user_group');

		data['user_groups'] = await this.model_user_user_group.getUserGroups();

		if ((this.request.post['password'])) {
			data['password'] = this.request.post['password'];
		} else {
			data['password'] = '';
		}

		if ((this.request.post['confirm'])) {
			data['confirm'] = this.request.post['confirm'];
		} else {
			data['confirm'] = '';
		}

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((user_info)) {
			data['firstname'] = user_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((user_info)) {
			data['lastname'] = user_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else if ((user_info)) {
			data['email'] = user_info['email'];
		} else {
			data['email'] = '';
		}

		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((user_info)) {
			data['image'] = user_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

		if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
		} else if ((user_info) && user_info['image'] && is_file(DIR_IMAGE + user_info['image'])) {
			data['thumb'] = await this.model_tool_image.resize(user_info['image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}
		
		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((user_info)) {
			data['status'] = user_info['status'];
		} else {
			data['status'] = 0;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'user/user')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['username']) < 3) || (oc_strlen(this.request.post['username']) > 20)) {
			this.error['username'] = this.language.get('error_username');
		}

		user_info = await this.model_user_user.getUserByUsername(this.request.post['username']);

		if (!(this.request.get['user_id'])) {
			if (user_info) {
				this.error['warning'] = this.language.get('error_exists_username');
			}
		} else {
			if (user_info && (this.request.get['user_id'] != user_info['user_id'])) {
				this.error['warning'] = this.language.get('error_exists_username');
			}
		}

		if ((oc_strlen(trim(this.request.post['firstname'])) < 1) || (oc_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(trim(this.request.post['lastname'])) < 1) || (oc_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			this.error['email'] = this.language.get('error_email');
		}

		user_info = await this.model_user_user.getUserByEmail(this.request.post['email']);

		if (!(this.request.get['user_id'])) {
			if (user_info) {
				this.error['warning'] = this.language.get('error_exists_email');
			}
		} else {
			if (user_info && (this.request.get['user_id'] != user_info['user_id'])) {
				this.error['warning'] = this.language.get('error_exists_email');
			}
		}

		if (this.request.post['password'] || (!(this.request.get['user_id']))) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				this.error['password'] = this.language.get('error_password');
			}

			if (this.request.post['password'] != this.request.post['confirm']) {
				this.error['confirm'] = this.language.get('error_confirm');
			}
		}

		total_users = await this.model_user_user.getTotalUsers();

		if (total_users <= 1 && (this.request.post['status']) && this.request.post['status'] == 0) {
			this.error['warning'] = this.language.get('error_single_user');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'user/user')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['selected'] of user_id) {
			if (await this.user.getId() == user_id) {
				this.error['warning'] = this.language.get('error_account');
			}
		}

		return Object.keys(this.error).length?false:true
	}
}