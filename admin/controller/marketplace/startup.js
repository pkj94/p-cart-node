<?php
namespace Opencart\Admin\Controller\Marketplace;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Marketplace
 */
class StartupController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('marketplace/startup');

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
			'href' : this.url.link('marketplace/startup', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['delete'] = this.url.link('marketplace/startup.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/startup', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketplace/startup');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'code';
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

		data['action'] = this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + url);

		data['startups'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('setting/startup');

		startup_total await this.model_setting_startup.getTotalStartups();

		const results = await this.model_setting_startup.getStartups(filter_data);

		for (let result of results) {
			data['startups'].push({
				'startup_id' : result['startup_id'],
				'code'       : result['code'],
				'action'     : result['action'],
				'status'     : result['status'],
				'sort_order' : result['sort_order'],
				'enable'     : this.url.link('marketplace/startup.enable', 'user_token=' + this.session.data['user_token'] + '&startup_id=' + result['startup_id']),
				'disable'    : this.url.link('marketplace/startup.disable', 'user_token=' + this.session.data['user_token'] + '&startup_id=' + result['startup_id'])
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_code'] = this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_action'] = this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + '&sort=action' + url);
		data['sort_sort_order'] = this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : startup_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (startup_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (startup_total - this.config.get('config_pagination_admin'))) ? startup_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), startup_total, Math.ceil(startup_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketplace/startup_list', data);
	}

	/**
	 * @return void
	 */
	async enable() {
		await this.load.language('marketplace/startup');

		const json = {};

		if ((this.request.get['startup_id'])) {
			startup_id = this.request.get['startup_id'];
		} else {
			startup_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/startup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/startup');

			await this.model_setting_startup.editStatus(startup_id, 1);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async disable() {
		await this.load.language('marketplace/startup');

		const json = {};

		if ((this.request.get['startup_id'])) {
			startup_id = this.request.get['startup_id'];
		} else {
			startup_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/startup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/startup');

			await this.model_setting_startup.editStatus(startup_id, 0);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('marketplace/startup');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = (array)this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/startup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/startup');

			for (selected of startup_id) {
				await this.model_setting_startup.deleteStartup(startup_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
