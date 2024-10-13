<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class StockStatusController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/stock_status');

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
			'href' : this.url.link('localisation/stock_status', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/stock_status.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/stock_status.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/stock_status', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/stock_status');

		this.response.setOutput(await this.getList());
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

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
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

		data['action'] = this.url.link('localisation/stock_status.list', 'user_token=' + this.session.data['user_token'] + url);

		data['stock_statuses'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/stock_status',this);

		stock_status_total await this.model_localisation_stock_status.getTotalStockStatuses();

		const results = await this.model_localisation_stock_status.getStockStatuses(filter_data);

		for (let result of results) {
			data['stock_statuses'].push({
				'stock_status_id' : result['stock_status_id'],
				'name'            : result['name'],
				'edit'            : this.url.link('localisation/stock_status.form', 'user_token=' + this.session.data['user_token'] + '&stock_status_id=' + result['stock_status_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('localisation/stock_status.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : stock_status_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/stock_status.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (stock_status_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (stock_status_total - this.config.get('config_pagination_admin'))) ? stock_status_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), stock_status_total, Math.ceil(stock_status_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/stock_status_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/stock_status');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['stock_status_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('localisation/stock_status', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/stock_status.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/stock_status', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['stock_status_id'])) {
			data['stock_status_id'] = this.request.get['stock_status_id'];
		} else {
			data['stock_status_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['stock_status_id'])) {
			this.load.model('localisation/stock_status',this);

			data['stock_status'] = await this.model_localisation_stock_status.getDescriptions(this.request.get['stock_status_id']);
		} else {
			data['stock_status'] = [];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/stock_status_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/stock_status');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/stock_status')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['stock_status'] of language_id : value) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/stock_status',this);

			if (!this.request.post['stock_status_id']) {
				json['stock_status_id'] = await this.model_localisation_stock_status.addStockStatus(this.request.post);
			} else {
				await this.model_localisation_stock_status.editStockStatus(this.request.post['stock_status_id'], this.request.post);
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
		await this.load.language('localisation/stock_status');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/stock_status')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product',this);

		for (selected of stock_status_id) {
			const product_total = await this.model_catalog_product.getTotalProductsByStockStatusId(stock_status_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/stock_status',this);

			for (selected of stock_status_id) {
				await this.model_localisation_stock_status.deleteStockStatus(stock_status_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
