<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class TaxRateController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/tax_rate');

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
			'href' : this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/tax_rate.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/tax_rate.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_rate', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/tax_rate');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'tr.name';
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

		data['action'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + url);

		data['tax_rates'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/tax_rate');

		tax_rate_total await this.model_localisation_tax_rate.getTotalTaxRates();

		const results = await this.model_localisation_tax_rate.getTaxRates(filter_data);

		for (let result of results) {
			data['tax_rates'].push({
				'tax_rate_id'   : result['tax_rate_id'],
				'name'          : result['name'],
				'rate'          : result['rate'],
				'type'          : (result['type'] == 'F' ? this.language.get('text_amount') : this.language.get('text_percent')),
				'geo_zone'      : result['geo_zone'],
				'date_added'    : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified' : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit'          : this.url.link('localisation/tax_rate.form', 'user_token=' + this.session.data['user_token'] + '&tax_rate_id=' + result['tax_rate_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + '&sort=tr.name' + url);
		data['sort_rate'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + '&sort=tr.rate' + url);
		data['sort_type'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + '&sort=tr.type' + url);
		data['sort_geo_zone'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + '&sort=gz.name' + url);
		data['sort_date_added'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + '&sort=tr.date_added' + url);
		data['sort_date_modified'] = this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + '&sort=tr.date_modified' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : tax_rate_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/tax_rate.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (tax_rate_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (tax_rate_total - this.config.get('config_pagination_admin'))) ? tax_rate_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), tax_rate_total, Math.ceil(tax_rate_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/tax_rate_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/tax_rate');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['tax_rate_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/tax_rate.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['tax_rate_id'])) {
			this.load.model('localisation/tax_rate');

			tax_rate_info await this.model_localisation_tax_rate.getTaxRate(this.request.get['tax_rate_id']);
		}

		if ((this.request.get['tax_rate_id'])) {
			data['tax_rate_id'] = this.request.get['tax_rate_id'];
		} else {
			data['tax_rate_id'] = 0;
		}

	    if ((tax_rate_info)) {
			data['name'] = tax_rate_info['name'];
		} else {
			data['name'] = '';
		}

		if ((tax_rate_info)) {
			data['rate'] = tax_rate_info['rate'];
		} else {
			data['rate'] = '';
		}

		if ((tax_rate_info)) {
			data['type'] = tax_rate_info['type'];
		} else {
			data['type'] = '';
		}

		this.load.model('customer/customer_group',this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((this.request.get['tax_rate_id'])) {
			data['tax_rate_customer_group'] = await this.model_localisation_tax_rate.getCustomerGroups(this.request.get['tax_rate_id']);
		} else {
			data['tax_rate_customer_group'] = [this.config.get('config_customer_group_id')];
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		if ((tax_rate_info)) {
			data['geo_zone_id'] = tax_rate_info['geo_zone_id'];
		} else {
			data['geo_zone_id'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_rate_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/tax_rate');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/tax_rate')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!this.request.post['rate']) {
			json['error']['rate'] = this.language.get('error_rate');
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/tax_rate');

			if (!this.request.post['tax_rate_id']) {
				json['tax_rate_id'] = await this.model_localisation_tax_rate.addTaxRate(this.request.post);
			} else {
				await this.model_localisation_tax_rate.editTaxRate(this.request.post['tax_rate_id'], this.request.post);
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
		await this.load.language('localisation/tax_rate');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/tax_rate')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('localisation/tax_class',this);

		for (this.request.post['selected'] of tax_rate_id) {
			tax_rule_total await this.model_localisation_tax_class.getTotalTaxRulesByTaxRateId(tax_rate_id);

			if (tax_rule_total) {
				json['error'] = sprintf(this.language.get('error_tax_rule'), tax_rule_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/tax_rate');

			for (selected of tax_rate_id) {
				await this.model_localisation_tax_rate.deleteTaxRate(tax_rate_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
