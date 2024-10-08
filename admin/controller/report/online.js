<?php
namespace Opencart\Admin\Controller\Report;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Report
 */
class OnlineController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('report/online');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
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
			'href' : this.url.link('report/online', 'user_token=' + this.session.data['user_token'])
		});

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		
		this.response.setOutput(await this.load.view('report/online', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('report/online');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
		} else {
			filter_ip = '';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		data['customers'] = [];

		let filter_data = {
			'filter_customer' : filter_customer,
			'filter_ip'       : filter_ip,
			'start'           : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'           : this.config.get('config_pagination_admin')
		});

		this.load.model('report/online');
		this.load.model('customer/customer');

		customer_total await this.model_report_online.getTotalOnline(filter_data);

		const results = await this.model_report_online.getOnline(filter_data);

		for (let result of results) {
			customer_info await this.model_customer_customer.getCustomer(result['customer_id']);

			if (customer_info) {
				customer = customer_info['firstname'] + ' ' + customer_info['lastname'];
			} else {
				customer = this.language.get('text_guest');
			}

			data['customers'].push({
				'customer_id' : result['customer_id'],
				'ip'          : result['ip'],
				'customer'    : customer,
				'url'         : result['url'],
				'referer'     : result['referer'],
				'date_added'  : date(this.language.get('datetime_format'), strtotime(result['date_added'])),
				'edit'        : this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'])
			];
		}

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(this.request.get['filter_customer']);
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : customer_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('report/online.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (customer_total - this.config.get('config_pagination_admin'))) ? customer_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), customer_total, Math.ceil(customer_total / this.config.get('config_pagination_admin')));

		return await this.load.view('report/online_list', data);
	}
}