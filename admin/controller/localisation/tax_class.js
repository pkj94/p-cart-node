<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class Tax
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/tax_class');

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
			'href' : this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/tax_class.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/tax_class.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_class', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/tax_class');
		
		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'title';
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

		data['action'] = this.url.link('localisation/tax_class.list', 'user_token=' + this.session.data['user_token'] + url);

		data['tax_classes'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/tax_class',this);

		tax_class_total await this.model_localisation_tax_class.getTotalTaxClasses();

		const results = await this.model_localisation_tax_class.getTaxClasses(filter_data);

		for (let result of results) {
			data['tax_classes'].push({
				'tax_class_id' : result['tax_class_id'],
				'title'        : result['title'],
				'edit'         : this.url.link('localisation/tax_class.form', 'user_token=' + this.session.data['user_token'] + '&tax_class_id=' + result['tax_class_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_title'] = this.url.link('localisation/tax_class.list', 'user_token=' + this.session.data['user_token'] + '&sort=title' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : tax_class_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/tax_class.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (tax_class_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (tax_class_total - this.config.get('config_pagination_admin'))) ? tax_class_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), tax_class_total, Math.ceil(tax_class_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/tax_class_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/tax_class');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['tax_class_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/tax_class.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['tax_class_id'])) {
			this.load.model('localisation/tax_class',this);

			tax_class_info await this.model_localisation_tax_class.getTaxClass(this.request.get['tax_class_id']);
		}

		if ((this.request.get['tax_class_id'])) {
			data['tax_class_id'] = this.request.get['tax_class_id'];
		} else {
			data['tax_class_id'] = 0;
		}

		if ((tax_class_info)) {
			data['title'] = tax_class_info['title'];
		} else {
			data['title'] = '';
		}

		if ((tax_class_info)) {
			data['description'] = tax_class_info['description'];
		} else {
			data['description'] = '';
		}

		this.load.model('localisation/tax_rate');

		data['tax_rates'] = await this.model_localisation_tax_rate.getTaxRates();

		if ((this.request.get['tax_class_id'])) {
			data['tax_rules'] = await this.model_localisation_tax_class.getTaxRules(this.request.get['tax_class_id']);
		} else {
			data['tax_rules'] = [];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_class_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/tax_class');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/tax_class')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['title']) < 3) || (oc_strlen(this.request.post['title']) > 32)) {
			json['error']['title'] = this.language.get('error_title');
		}

		if ((oc_strlen(this.request.post['description']) < 3) || (oc_strlen(this.request.post['description']) > 255)) {
			json['error']['description'] = this.language.get('error_description');
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/tax_class',this);

			if (!this.request.post['tax_class_id']) {
				json['tax_class_id'] = await this.model_localisation_tax_class.addTaxClass(this.request.post);
			} else {
				await this.model_localisation_tax_class.editTaxClass(this.request.post['tax_class_id'], this.request.post);
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
		await this.load.language('localisation/tax_class');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/tax_class')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product',this);

		for (selected of tax_class_id) {
			const product_total = await this.model_catalog_product.getTotalProductsByTaxClassId(tax_class_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/tax_class',this);

			for (selected of tax_class_id) {
				await this.model_localisation_tax_class.deleteTaxClass(tax_class_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
