module.exports = class ControllerUserUserPermission extends Controller {
	error = {};

	async index() {
		await this.load.language('user/user_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user_group');

		await this.getList();
	}

	async add() {
		await this.load.language('user/user_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user_group');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_user_user_group.addUserGroup(this.request.post);

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

			this.response.setRedirect(await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('user/user_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user_group');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_user_user_group.editUserGroup(this.request.get['user_group_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('user/user_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/user_group');

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of user_group_id) {
				await this.model_user_user_group.deleteUserGroup(user_group_id);
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

			this.response.setRedirect(await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('user/user_permission/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('user/user_permission/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['user_groups'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		user_group_total = await this.model_user_user_group.getTotalUserGroups();

		results = await this.model_user_user_group.getUserGroups(filter_data);

		for (let result of results) {
			data['user_groups'].push({
				'user_group_id' : result['user_group_id'],
				'name'          : result['name'],
				'edit'          : await this.url.link('user/user_permission/edit', 'user_token=' + this.session.data['user_token'] + '&user_group_id=' + result['user_group_id'] + url, true)
			});
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

		data['sort_name'] = await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = user_group_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (user_group_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (user_group_total - Number(this.config.get('config_limit_admin')))) ? user_group_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), user_group_total, Math.ceil(user_group_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_group_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['user_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['user_group_id'])) {
			data['action'] = await this.url.link('user/user_permission/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('user/user_permission/edit', 'user_token=' + this.session.data['user_token'] + '&user_group_id=' + this.request.get['user_group_id'] + url, true);
		}

		data['cancel'] = await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['user_group_id']) && this.request.server['method'] != 'POST') {
			user_group_info = await this.model_user_user_group.getUserGroup(this.request.get['user_group_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((user_group_info)) {
			data['name'] = user_group_info['name'];
		} else {
			data['name'] = '';
		}

		ignore = array(
			'common/dashboard',
			'common/startup',
			'common/login',
			'common/logout',
			'common/forgotten',
			'common/reset',			
			'common/footer',
			'common/header',
			'error/not_found',
			'error/permission'
		});

		data['permissions'] = {};

		files = {};

		// Make path into an array
		path = array(DIR_APPLICATION + 'controller/*');

		// While the path array is still populated keep looping through
		while (count(path) != 0) {
			next = array_shift(path);

			for (glob(next) of file) {
				// If directory add to path array
				if (is_dir(file)) {
					path.push(file + '/*';
				}

				// Add the file to the files to be deleted array
				if (is_file(file)) {
					files.push(file;
				}
			}
		}

		// Sort the file array
		sort(files);
					
		for (let file of files) {
			controller = substr(file, strlen(DIR_APPLICATION + 'controller/'));

			permission = substr(controller, 0, strrpos(controller, '.'));

			if (!in_array(permission, ignore)) {
				data['permissions'].push(permission;
			}
		}

		if ((this.request.post['permission']['access'])) {
			data['access'] = this.request.post['permission']['access'];
		} else if ((user_group_info['permission']['access'])) {
			data['access'] = user_group_info['permission']['access'];
		} else {
			data['access'] = {};
		}

		if ((this.request.post['permission']['modify'])) {
			data['modify'] = this.request.post['permission']['modify'];
		} else if ((user_group_info['permission']['modify'])) {
			data['modify'] = user_group_info['permission']['modify'];
		} else {
			data['modify'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_group_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'user/user_permission')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'user/user_permission')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('user/user',this);

		for (this.request.post['selected'] of user_group_id) {
			user_total = await this.model_user_user.getTotalUsersByGroupId(user_group_id);

			if (user_total) {
				this.error['warning'] = sprintf(this.language.get('error_user'), user_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}