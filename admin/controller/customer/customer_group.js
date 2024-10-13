<?php
namespace Opencart\Admin\Controller\Customer;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Customer
 */
class CustomerGroupController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('customer/customer_group');

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
			'href' : this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('customer/customer_group.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('customer/customer_group.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_group', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('customer/customer_group');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'cgd.name';
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

		data['action'] = this.url.link('customer/customer_group.list', 'user_token=' + this.session.data['user_token'] + url);

		data['customer_groups'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('customer/customer_group',this);

		customer_group_total await this.model_customer_customer_group.getTotalCustomerGroups();

		const results = await this.model_customer_customer_group.getCustomerGroups(filter_data);

		for (let result of results) {
			data['customer_groups'].push({
				'customer_group_id' : result['customer_group_id'],
				'name'              : result['name'] + ((result['customer_group_id'] == this.config.get('config_customer_group_id')) ? this.language.get('text_default') : ''),
				'sort_order'        : result['sort_order'],
				'edit'              : this.url.link('customer/customer_group.form', 'user_token=' + this.session.data['user_token'] + '&customer_group_id=' + result['customer_group_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('customer/customer_group.list', 'user_token=' + this.session.data['user_token'] + '&sort=cgd.name' + url);
		data['sort_sort_order'] = this.url.link('customer/customer_group.list', 'user_token=' + this.session.data['user_token'] + '&sort=cg.sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : customer_group_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('customer/customer_group.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_group_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (customer_group_total - this.config.get('config_pagination_admin'))) ? customer_group_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), customer_group_total, Math.ceil(customer_group_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('customer/customer_group_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('customer/customer_group');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['customer_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('customer/customer_group.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['customer_group_id'])) {
			this.load.model('customer/customer_group',this);

			customer_group_info await this.model_customer_customer_group.getCustomerGroup(this.request.get['customer_group_id']);
		}

		if ((this.request.get['customer_group_id'])) {
			data['customer_group_id'] = this.request.get['customer_group_id'];
		} else {
			data['customer_group_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['customer_group_id'])) {
			data['customer_group_description'] = await this.model_customer_customer_group.getDescriptions(this.request.get['customer_group_id']);
		} else {
			data['customer_group_description'] = [];
		}

		if ((customer_group_info)) {
			data['approval'] = customer_group_info['approval'];
		} else {
			data['approval'] = '';
		}

		if ((customer_group_info)) {
			data['sort_order'] = customer_group_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_group_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('customer/customer_group');

		const json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer_group')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['customer_group_description'] of language_id : value) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer_group',this);

			if (!this.request.post['customer_group_id']) {
				json['customer_group_id'] = await this.model_customer_customer_group.addCustomerGroup(this.request.post);
			} else {
				await this.model_customer_customer_group.editCustomerGroup(this.request.post['customer_group_id'], this.request.post);
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
		await this.load.language('customer/customer_group');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'customer/customer_group')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);
		this.load.model('customer/customer',this);

		for (let customer_group_id of selected) {
			if (this.config.get('config_customer_group_id') == customer_group_id) {
				json['error'] = this.language.get('error_default');
			}

			store_total await this.model_setting_store.getTotalStoresByCustomerGroupId(customer_group_id);

			if (store_total) {
				json['error'] = sprintf(this.language.get('error_store'), store_total);
			}

			customer_total await this.model_customer_customer.getTotalCustomersByCustomerGroupId(customer_group_id);

			if (customer_total) {
				json['error'] = sprintf(this.language.get('error_customer'), customer_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer_group',this);

			for (let customer_group_id of selected) {
				await this.model_customer_customer_group.deleteCustomerGroup(customer_group_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
