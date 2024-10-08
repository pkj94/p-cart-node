<?php
namespace Opencart\Admin\Controller\User;
/**
 * 
 *
 * @package Opencart\Admin\Controller\User
 */
class ApiController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('user/api');

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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('user/api.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('user/api.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/api', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('user/api');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
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

		data['action'] = this.url.link('user/api.list', 'user_token=' + this.session.data['user_token'] + url);

		data['apis'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('user/api');

		user_total await this.model_user_api.getTotalApis();

		const results = await this.model_user_api.getApis(filter_data);

		for (let result of results) {
			data['apis'].push({
				'api_id'        : result['api_id'],
				'username'      : result['username'],
				'status'        : (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'date_added'    : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified' : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit'          : this.url.link('user/api.form', 'user_token=' + this.session.data['user_token'] + '&api_id=' + result['api_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_username'] = this.url.link('user/api.list', 'user_token=' + this.session.data['user_token'] + '&sort=username' + url);
		data['sort_status'] = this.url.link('user/api.list', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url);
		data['sort_date_added'] = this.url.link('user/api.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url);
		data['sort_date_modified'] = this.url.link('user/api.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_modified' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : user_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('user/api.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (user_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (user_total - this.config.get('config_pagination_admin'))) ? user_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), user_total, Math.ceil(user_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('user/api_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('user/api');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['api_id']) ? this.language.get('text_add') : this.language.get('text_edit');
		data['text_ip'] = sprintf(this.language.get('text_ip'), this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress) : ''));

		if ((this.request.get['api_id'])) {
			data['api_id'] = this.request.get['api_id'];
		} else {
			data['api_id'] = 0;
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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('user/api.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('user/api', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['api_id'])) {
			this.load.model('user/api');

			api_info await this.model_user_api.getApi(this.request.get['api_id']);
		}

		if ((this.request.get['api_id'])) {
			data['api_id'] = this.request.get['api_id'];
		} else {
			data['api_id'] = 0;
		}

		if ((api_info)) {
			data['username'] = api_info['username'];
		} else {
			data['username'] = '';
		}

		if ((api_info)) {
			data['key'] = api_info['key'];
		} else {
			data['key'] = '';
		}

		if ((api_info)) {
			data['status'] = api_info['status'];
		} else {
			data['status'] = 0;
		}

		// IP
		if ((api_info)) {
			data['api_ips'] = await this.model_user_api.getIps(this.request.get['api_id']);
		} else {
			data['api_ips'] = [];
		}

		// Session
		data['api_sessions'] = [];

		if ((api_info)) {
			const results = await this.model_user_api.getSessions(this.request.get['api_id']);

			for (let result of results) {
				data['api_sessions'].push({
					'api_session_id' : result['api_session_id'],
					'session_id'     : result['session_id'],
					'ip'             : result['ip'],
					'date_added'     : date(this.language.get('datetime_format'), strtotime(result['date_added'])),
					'date_modified'  : date(this.language.get('datetime_format'), strtotime(result['date_modified']))
				];
			}
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/api_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('user/api');

		const json = {};

		if (!await this.user.hasPermission('modify', 'user/api')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['username']) < 3) || (oc_strlen(this.request.post['username']) > 64)) {
			json['error']['username'] = this.language.get('error_username');
		}

		if ((oc_strlen(this.request.post['key']) < 64) || (oc_strlen(this.request.post['key']) > 256)) {
			json['error']['key'] = this.language.get('error_key');
		}

		if (!(json['error']['warning']) && !(this.request.post['api_ip'])) {
			json['error']['warning'] = this.language.get('error_ip');
		}

		if (!Object.keys(json).length) {
			this.load.model('user/api');

			if (!this.request.post['api_id']) {
				json['api_id'] = await this.model_user_api.addApi(this.request.post);
			} else {
				await this.model_user_api.editApi(this.request.post['api_id'], this.request.post);
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
		await this.load.language('user/api');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'user/api')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('user/api');

			for (selected of api_id) {
				await this.model_user_api.deleteApi(api_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async deleteSession() {
		await this.load.language('user/api');

		const json = {};

		if (!await this.user.hasPermission('modify', 'user/api')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('user/api');

			await this.model_user_api.deleteSession(this.request.get['api_session_id']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}