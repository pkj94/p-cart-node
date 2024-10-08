<?php
namespace Opencart\Admin\Controller\Customer;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Customer
 */
class CustomerApprovalController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('customer/customer_approval');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('customer/customer_approval', 'user_token=' + this.session.data['user_token'])
		});

		data['approve'] = this.url.link('customer/customer_approval.approve', 'user_token=' + this.session.data['user_token'], true);
		data['deny'] = this.url.link('customer/customer_approval.deny', 'user_token=' + this.session.data['user_token'], true);

		this.load.model('customer/customer_group');

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_approval', data));	
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('customer/customer_approval');

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

		if ((this.request.get['filter_email'])) {
			filter_email = this.request.get['filter_email'];
		} else {
			filter_email = '';
		}
		
		if ((this.request.get['filter_customer_group_id'])) {
			filter_customer_group_id = this.request.get['filter_customer_group_id'];
		} else {
			filter_customer_group_id = '';
		}

		if ((this.request.get['filter_type'])) {
			filter_type = this.request.get['filter_type'];
		} else {
			filter_type = '';
		}

		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		} else {
			filter_date_from = '';
		}

		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		} else {
			filter_date_to = '';
		}
						
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_customer_group_id'])) {
			url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
		}

		if ((this.request.get['filter_type'])) {
			url += '&filter_type=' + this.request.get['filter_type'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('customer/customer_approval.list', 'user_token=' + this.session.data['user_token'] + url, true);

		data['customer_approvals'] = [];

		let filter_data = {
			'filter_customer'          : filter_customer,
			'filter_email'             : filter_email,
			'filter_customer_group_id' : filter_customer_group_id,
			'filter_type'              : filter_type,
			'filter_date_from'         : filter_date_from,
			'filter_date_to'           : filter_date_to,
			'start'                    : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'                    : this.config.get('config_pagination_admin')
		});

		this.load.model('customer/customer_approval');	

		customer_approval_total await this.model_customer_customer_approval.getTotalCustomerApprovals(filter_data);

		const results = await this.model_customer_customer_approval.getCustomerApprovals(filter_data);

		for (let result of results) {
			data['customer_approvals'].push({
				'customer_approval_id' : result['customer_approval_id'],
				'customer_id'          : result['customer_id'],
				'customer'             : result['customer'],
				'email'                : result['email'],
				'customer_group'       : result['customer_group'],
				'type'                 : this.language.get('text_' + result['type']),
				'date_added'           : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'approve'              : this.url.link('customer/customer_approval.approve', 'user_token=' + this.session.data['user_token'] + '&customer_approval_id=' + result['customer_approval_id'], true),
				'deny'                 : this.url.link('customer/customer_approval.deny', 'user_token=' + this.session.data['user_token'] + '&customer_approval_id=' + result['customer_approval_id'], true),
				'edit'                 : this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'], true)
			];
		}

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
		}
			
		if ((this.request.get['filter_customer_group_id'])) {
			url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
		}
		
		if ((this.request.get['filter_type'])) {
			url += '&filter_type=' + this.request.get['filter_type'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : customer_approval_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('customer/customer_approval.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_approval_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (customer_approval_total - this.config.get('config_pagination_admin'))) ? customer_approval_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), customer_approval_total, Math.ceil(customer_approval_total / this.config.get('config_pagination_admin')));

		return await this.load.view('customer/customer_approval_list', data);
	}

	/**
	 * @return void
	 */
	async approve() {
		await this.load.language('customer/customer_approval');

		const json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer_approval')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer_approval');

			approvals = [];

			if ((this.request.post['selected'])) {
				approvals = this.request.post['selected'];
			}

			if ((this.request.get['customer_approval_id'])) {
				approvals[] = this.request.get['customer_approval_id'];
			}

			for (approvals of customer_approval_id) {
				customer_approval_info await this.model_customer_customer_approval.getCustomerApproval(customer_approval_id);

				if (customer_approval_info) {
					if (customer_approval_info['type'] == 'customer') {
						await this.model_customer_customer_approval.approveCustomer(customer_approval_info['customer_id']);
					}

					if (customer_approval_info['type'] == 'affiliate') {
						await this.model_customer_customer_approval.approveAffiliate(customer_approval_info['customer_id']);
					}
				}
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async deny() {
		await this.load.language('customer/customer_approval');

		const json = {};
				
		if (!await this.user.hasPermission('modify', 'customer/customer_approval')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer_approval');

			denials = [];

			if ((this.request.post['selected'])) {
				denials = this.request.post['selected'];
			}

			if ((this.request.get['customer_approval_id'])) {
				denials[] = this.request.get['customer_approval_id'];
			}

			for (denials of customer_approval_id) {
				customer_approval_info await this.model_customer_customer_approval.getCustomerApproval(customer_approval_id);

				if (customer_approval_info) {
					if (customer_approval_info['type'] == 'customer') {
						await this.model_customer_customer_approval.denyCustomer(customer_approval_info['customer_id']);
					}

					if (customer_approval_info['type'] == 'affiliate') {
						await this.model_customer_customer_approval.denyAffiliate(customer_approval_info['customer_id']);
					}
				}
			}

			json['success'] = this.language.get('text_success');
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
