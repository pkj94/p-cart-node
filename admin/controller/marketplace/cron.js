<?php
namespace Opencart\Admin\Controller\Marketplace;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Marketplace
 */
class CronController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('marketplace/cron');

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
			'href' : this.url.link('marketplace/cron', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['delete'] = this.url.link('marketplace/cron.delete', 'user_token=' + this.session.data['user_token']);

		// Example cron URL
		data['cron'] = HTTP_CATALOG + 'cron/cron';

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/cron', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketplace/cron');

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

		data['action'] = this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + url);

		data['crons'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('setting/cron');

		cron_total await this.model_setting_cron.getTotalCrons();

		const results = await this.model_setting_cron.getCrons(filter_data);

		for (let result of results) {
			data['crons'].push({
				'cron_id'       : result['cron_id'],
				'code'          : result['code'],
				'description'   : result['description'],
				'cycle'         : this.language.get('text_' + result['cycle']),
				'action'        : result['action'],
				'status'        : result['status'],
				'date_added'    : date(this.language.get('datetime_format'), strtotime(result['date_added'])),
				'date_modified' : date(this.language.get('datetime_format'), strtotime(result['date_modified'])),
				'run'           : this.url.link('marketplace/cron.run', 'user_token=' + this.session.data['user_token'] + '&cron_id=' + result['cron_id']),
				'enable'        : this.url.link('marketplace/cron.enable', 'user_token=' + this.session.data['user_token'] + '&cron_id=' + result['cron_id']),
				'disable'       : this.url.link('marketplace/cron.disable', 'user_token=' + this.session.data['user_token'] + '&cron_id=' + result['cron_id'])
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_code'] = this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_cycle'] = this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + '&sort=cycle' + url);
		data['sort_action'] = this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + '&sort=action' + url);
		data['sort_date_added'] = this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_added' + url);
		data['sort_date_modified'] = this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_modified' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : cron_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('marketplace/cron.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (cron_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (cron_total - this.config.get('config_pagination_admin'))) ? cron_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), cron_total, Math.ceil(cron_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketplace/cron_list', data);
	}

	/**
	 * @return void
	 */
	async run() {
		await this.load.language('marketplace/cron');

		const json = {};

		if ((this.request.get['cron_id'])) {
			cron_id = this.request.get['cron_id'];
		} else {
			cron_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/cron')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/cron');

			cron_info await this.model_setting_cron.getCron(cron_id);

			if (cron_info) {
				// Create a store instance using loader class to call controllers, models, views, libraries
				this.load.model('setting/store');

				store await this.model_setting_store.createStoreInstance(0, this.config.get('config_language'));

				store.load.controller(cron_info['action'], cron_id, cron_info['code'], cron_info['cycle'], cron_info['date_added'], cron_info['date_modified']);

				store.session.destroy(store.session.getId());

				await this.model_setting_cron.editCron(cron_info['cron_id']);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async enable() {
		await this.load.language('marketplace/cron');

		const json = {};

		if ((this.request.get['cron_id'])) {
			cron_id = this.request.get['cron_id'];
		} else {
			cron_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/cron')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/cron');

			await this.model_setting_cron.editStatus(cron_id, 1);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async disable() {
		await this.load.language('marketplace/cron');

		const json = {};

		if ((this.request.get['cron_id'])) {
			cron_id = this.request.get['cron_id'];
		} else {
			cron_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'marketplace/cron')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/cron');

			await this.model_setting_cron.editStatus(cron_id, 0);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('marketplace/cron');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = (array)this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/event')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/cron');

			for (selected of cron_id) {
				await this.model_setting_cron.deleteCron(cron_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
