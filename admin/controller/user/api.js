module.exports = class ControllerUserApi extends Controller {
	error = {};

	async index() {
		await this.load.language('user/api');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/api');

		await this.getList();
	}

	async add() {
		await this.load.language('user/api');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/api');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_user_api.addApi(this.request.post);

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

			this.response.setRedirect(await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('user/api');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/api');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_user_api.editApi(this.request.get['api_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('user/api');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('user/api');

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of api_id) {
				await this.model_user_api.deleteApi(api_id);
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

			this.response.setRedirect(await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url, true));
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
			page = Number(this.request.get['page']);
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
			'href' : await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('user/api/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('user/api/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['apis'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		user_total = await this.model_user_api.getTotalApis();

		results = await this.model_user_api.getApis(filter_data);

		for (let result of results) {
			data['apis'].push({
				'api_id'        : result['api_id'],
				'username'      : result['username'],
				'status'        : (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'date_added'    : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified' : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit'          : await this.url.link('user/api/edit', 'user_token=' + this.session.data['user_token'] + '&api_id=' + result['api_id'] + url, true)
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
			data['selected'] = [];
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

		data['sort_username'] = await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + '&sort=username' + url, true);
		data['sort_status'] = await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);
		data['sort_date_added'] = await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url, true);
		data['sort_date_modified'] = await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + '&sort=date_modified' + url, true);

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
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (user_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (user_total - Number(this.config.get('config_limit_admin')))) ? user_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), user_total, Math.ceil(user_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/api_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['api_id']) ? this.language.get('text_add') : this.language.get('text_edit');
		data['text_ip'] = sprintf(this.language.get('text_ip'), this.request.server['REMOTE_ADDR']);
		
		data['user_token'] = this.session.data['user_token'];

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

		if ((this.error['key'])) {
			data['error_key'] = this.error['key'];
		} else {
			data['error_key'] = '';
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
			'href' : await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['api_id'])) {
			data['action'] = await this.url.link('user/api/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('user/api/edit', 'user_token=' + this.session.data['user_token'] + '&api_id=' + this.request.get['api_id'] + url, true);
		}

		data['cancel'] = await this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['api_id']) && (this.request.server['method'] != 'POST')) {
			api_info = await this.model_user_api.getApi(this.request.get['api_id']);
		}

		if ((this.request.post['username'])) {
			data['username'] = this.request.post['username'];
		} else if ((api_info)) {
			data['username'] = api_info['username'];
		} else {
			data['username'] = '';
		}

		if ((this.request.post['key'])) {
			data['key'] = this.request.post['key'];
		} else if ((api_info)) {
			data['key'] = api_info['key'];
		} else {
			data['key'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((api_info)) {
			data['status'] = api_info['status'];
		} else {
			data['status'] = 0;
		}

		// IP
		if ((this.request.post['api_ip'])) {
			data['api_ips'] = this.request.post['api_ip'];
		} else if ((this.request.get['api_id'])) {
			data['api_ips'] = await this.model_user_api.getApiIps(this.request.get['api_id']);
		} else {
			data['api_ips'] = {};
		}
		
		// Session
		data['api_sessions'] = {};
		
		if ((this.request.get['api_id'])) {
			results = await this.model_user_api.getApiSessions(this.request.get['api_id']);
			
			for (let result of results) {
				data['api_sessions'].push({
					'api_session_id' : result['api_session_id'],
					'session_id'     : result['session_id'],
					'ip'             : result['ip'],
					'date_added'     : date(this.language.get('datetime_format'), strtotime(result['date_added'])),
					'date_modified'  : date(this.language.get('datetime_format'), strtotime(result['date_modified']))
				});
			}
		}
		
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/api_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'user/user')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(trim(this.request.post['username'])) < 3) || (oc_strlen(trim(this.request.post['username'])) > 64)) {
			this.error['username'] = this.language.get('error_username');
		}

		if ((oc_strlen(this.request.post['key']) < 64) || (oc_strlen(this.request.post['key']) > 256)) {
			this.error['key'] = this.language.get('error_key');
		}
		
		if (!(this.error['warning']) && !(this.request.post['api_ip'])) {
			this.error['warning'] = this.language.get('error_ip');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'user/api')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async deleteSession() {
		await this.load.language('user/api');

		json = {};

		if (!await this.user.hasPermission('modify', 'user/api')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('user/api');

			await this.model_user_api.deleteApiSession(this.request.get['api_session_id']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}	
}
