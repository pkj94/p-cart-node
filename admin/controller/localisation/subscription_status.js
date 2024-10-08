<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class SubscriptionStatusController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/subscription_status');

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
			'href' : this.url.link('localisation/subscription_status', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/subscription_status.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/subscription_status.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/subscription_status', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/subscription_status');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
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

		data['action'] = this.url.link('localisation/subscription_status.list', 'user_token=' + this.session.data['user_token'] + url);

		data['subscription_statuses'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/subscription_status');

		subscription_status_total await this.model_localisation_subscription_status.getTotalSubscriptionStatuses();

		const results = await this.model_localisation_subscription_status.getSubscriptionStatuses(filter_data);

		for (let result of results) {
			data['subscription_statuses'].push({
				'subscription_status_id' : result['subscription_status_id'],
				'name'                   : result['name'] + ((result['subscription_status_id'] == this.config.get('config_subscription_status_id')) ? this.language.get('text_default') : ''),
				'edit'                   : this.url.link('localisation/subscription_status.form', 'user_token=' + this.session.data['user_token'] + '&subscription_status_id=' + result['subscription_status_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('localisation/subscription_status.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : subscription_status_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/subscription_status.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (subscription_status_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (subscription_status_total - this.config.get('config_pagination_admin'))) ? subscription_status_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), subscription_status_total, Math.ceil(subscription_status_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/subscription_status_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/subscription_status');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['subscription_status_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('localisation/subscription_status', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/subscription_status.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/subscription_status', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['subscription_status_id'])) {
			data['subscription_status_id'] = this.request.get['subscription_status_id'];
		} else {
			data['subscription_status_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['subscription_status_id'])) {
			this.load.model('localisation/subscription_status');

			data['subscription_status'] = await this.model_localisation_subscription_status.getDescriptions(this.request.get['subscription_status_id']);
		} else {
			data['subscription_status'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/subscription_status_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/subscription_status');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/subscription_status')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['subscription_status'] of language_id : value) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/subscription_status');

			if (!this.request.post['subscription_status_id']) {
				json['subscription_status_id'] = await this.model_localisation_subscription_status.addSubscriptionStatus(this.request.post);
			} else {
				await this.model_localisation_subscription_status.editSubscriptionStatus(this.request.post['subscription_status_id'], this.request.post);
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
		await this.load.language('localisation/subscription_status');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'localisation/subscription_status')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store');
		this.load.model('sale/subscription');

		for (selected of subscription_status_id) {
			if (this.config.get('config_subscription_status_id') == subscription_status_id) {
				json['error'] = this.language.get('error_default');
			}

			subscription_total await this.model_sale_subscription.getTotalSubscriptionsBySubscriptionStatusId(subscription_status_id);

			if (subscription_total) {
				json['error'] = sprintf(this.language.get('error_subscription'), subscription_total);
			}

			subscription_total await this.model_sale_subscription.getTotalHistoriesBySubscriptionStatusId(subscription_status_id);

			if (subscription_total) {
				json['error'] = sprintf(this.language.get('error_subscription'), subscription_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/subscription_status');

			for (selected of subscription_status_id) {
				await this.model_localisation_subscription_status.deleteSubscriptionStatus(subscription_status_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}