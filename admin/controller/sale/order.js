<?php
namespace Opencart\Admin\Controller\Sale;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Sale
 */
class OrderController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('sale/order');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_customer_id'])) {
			filter_customer_id = this.request.get['filter_customer_id'];
		} else {
			filter_customer_id = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_store_id'])) {
			filter_store_id = this.request.get['filter_store_id'];
		} else {
			filter_store_id = '';
		}

		if ((this.request.get['filter_order_status'])) {
			filter_order_status = this.request.get['filter_order_status'];
		} else {
			filter_order_status = '';
		}

		if ((this.request.get['filter_order_status_id'])) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		} else {
			filter_order_status_id = '';
		}

		if ((this.request.get['filter_total'])) {
			filter_total = this.request.get['filter_total'];
		} else {
			filter_total = '';
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

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer_id'])) {
			url += '&filter_customer_id=' + this.request.get['filter_customer_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

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
			'href' : this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('sale/order.info', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('sale/order.delete', 'user_token=' + this.session.data['user_token']);
		data['invoice'] = this.url.link('sale/order.invoice', 'user_token=' + this.session.data['user_token']);
		data['shipping'] = this.url.link('sale/order.shipping', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['stores'] = [];

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.language.get('text_default')
		});

		this.load.model('setting/store',this);

		let stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id' : store['store_id'],
				'name'     : store['name']
			];
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		data['filter_order_id'] = filter_order_id;
		data['filter_customer_id'] = filter_customer_id;
		data['filter_customer'] = filter_customer;
		data['filter_store_id'] = filter_store_id;
		data['filter_order_status'] = filter_order_status;
		data['filter_order_status_id'] = filter_order_status_id;
		data['filter_total'] = filter_total;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/order', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('sale/order');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_customer_id'])) {
			filter_customer_id = this.request.get['filter_customer_id'];
		} else {
			filter_customer_id = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_store_id'])) {
			filter_store_id = this.request.get['filter_store_id'];
		} else {
			filter_store_id = '';
		}

		if ((this.request.get['filter_order_status'])) {
			filter_order_status = this.request.get['filter_order_status'];
		} else {
			filter_order_status = '';
		}

		if ((this.request.get['filter_order_status_id'])) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		} else {
			filter_order_status_id = '';
		}

		if ((this.request.get['filter_total'])) {
			filter_total = this.request.get['filter_total'];
		} else {
			filter_total = '';
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

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'o.order_id';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'DESC';
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer_id'])) {
			url += '&filter_customer_id=' + this.request.get['filter_customer_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + url);

		data['orders'] = [];

		let filter_data = {
			'filter_order_id'        : filter_order_id,
			'filter_customer_id'     : filter_customer_id,
			'filter_customer'        : filter_customer,
			'filter_store_id'        : filter_store_id,
			'filter_order_status'    : filter_order_status,
			'filter_order_status_id' : filter_order_status_id,
			'filter_total'           : filter_total,
			'filter_date_from'       : filter_date_from,
			'filter_date_to'         : filter_date_to,
			'sort'                   : sort,
			'order'                  : order,
			'start'                  : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'                  : this.config.get('config_pagination_admin')
		});

		this.load.model('sale/order');

		order_total await this.model_sale_order.getTotalOrders(filter_data);

		const results = await this.model_sale_order.getOrders(filter_data);

		for (let result of results) {
			data['orders'].push({
				'order_id'        : result['order_id'],
				'store_name'      : result['store_name'],
				'customer'        : result['customer'],
				'order_status'    : result['order_status'] ? result['order_status'] : this.language.get('text_missing'),
				'total'           : this.currency.format(result['total'], result['currency_code'], result['currency_value']),
				'date_added'      : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified'   : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'shipping_method' : result['shipping_method'],
				'view'            : this.url.link('sale/order.info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer_id'])) {
			url += '&filter_customer_id=' + this.request.get['filter_customer_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_order'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=o.order_id' + url);
		data['sort_store_name'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=o.store_name' + url);
		data['sort_customer'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url);
		data['sort_status'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=order_status' + url);
		data['sort_total'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=o.total' + url);
		data['sort_date_added'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=o.date_added' + url);
		data['sort_date_modified'] = this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + '&sort=o.date_modified' + url);

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer_id'])) {
			url += '&filter_customer_id=' + this.request.get['filter_customer_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : order_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('sale/order.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (order_total - this.config.get('config_pagination_admin'))) ? order_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), order_total, Math.ceil(order_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('sale/order_list', data);
	}

	/**
	 * @return void
	 * @throws \Exception
	 */
	async info() {
		await this.load.language('sale/order');

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !order_id ? this.language.get('text_add') : sprintf(this.language.get('text_edit'), order_id);

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), this.config.get('config_file_max_size'));

		data['config_file_max_size'] = (this.config.get('config_file_max_size') * 1024 * 1024);
		data['config_telephone_required'] = this.config.get('config_telephone_required');

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer_id'])) {
			url += '&filter_customer_id=' + this.request.get['filter_customer_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

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
			'href' : this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['shipping'] = this.url.link('sale/order.shipping', 'user_token=' + this.session.data['user_token'] + '&order_id=' + order_id);
		data['invoice'] = this.url.link('sale/order.invoice', 'user_token=' + this.session.data['user_token'] + '&order_id=' + order_id);
		data['back'] = this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url);
		data['upload'] = this.url.link('tool/upload.upload', 'user_token=' + this.session.data['user_token']);
		data['customer_add'] = this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token']);

		if (order_id) {
			this.load.model('sale/order');

			order_info await this.model_sale_order.getOrder(order_id);
		}

		if ((order_info)) {
			data['order_id'] = order_info['order_id'];
		} else {
			data['order_id'] = '';
		}

		// Invoice
		if ((order_info)) {
			data['invoice_no'] = order_info['invoice_no'];
		} else {
			data['invoice_no'] = '';
		}

		if ((order_info)) {
			data['invoice_prefix'] = order_info['invoice_prefix'];
		} else {
			data['invoice_prefix'] = '';
		}

		// Customer
		if ((order_info)) {
			data['customer_id'] = order_info['customer_id'];
		} else {
			data['customer_id'] = 0;
		}

		this.load.model('customer/customer_group',this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((order_info)) {
			data['customer_group_id'] = order_info['customer_group_id'];
		} else {
			data['customer_group_id'] = this.config.get('config_customer_group_id');
		}

		customer_group_info await this.model_customer_customer_group.getCustomerGroup(data['customer_group_id']);

		if (customer_group_info) {
			data['customer_group'] = customer_group_info['name'];
		} else {
			data['customer_group'] = '';
		}

		if ((order_info)) {
			data['firstname'] = order_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((order_info)) {
			data['lastname'] = order_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((order_info)) {
			data['email'] = order_info['email'];
		} else {
			data['email'] = '';
		}

		if ((order_info)) {
			data['telephone'] = order_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((order_info)) {
			data['account_custom_field'] = order_info['custom_field'];
		} else {
			data['account_custom_field'] = [];
		}

		// Custom Fields
		data['custom_fields'] = [];

		let filter_data = {
			'filter_status' : 1,
			'sort'          : 'cf.sort_order',
			'order'         : 'ASC'
		});

		this.load.model('customer/custom_field');

		custom_fields await this.model_customer_custom_field.getCustomFields(filter_data);

		for (custom_fields of custom_field) {
			data['custom_fields'].push({
				'custom_field_id'    : custom_field['custom_field_id'],
				'custom_field_value' : this.model_customer_custom_field.getValues(custom_field['custom_field_id']),
				'name'               : custom_field['name'],
				'value'              : custom_field['value'],
				'type'               : custom_field['type'],
				'location'           : custom_field['location'],
				'sort_order'         : custom_field['sort_order']
			];
		}

		// Products
		data['order_products'] = [];

		this.load.model('sale/order');
		this.load.model('sale/subscription');
		this.load.model('tool/upload');

		products await this.model_sale_order.getProducts(order_id);

		for (products of product) {
			let option_data = [];

			options await this.model_sale_order.getOptions(order_id, product['order_product_id']);

			for (options of option) {
				if (option['type'] != 'file') {
					option_data.push({
						'name'  : option['name'],
						'value' : option['value'],
						'type'  : option['type']
					];
				} else {
					upload_info await this.model_tool_upload.getUploadByCode(option['value']);

					if (upload_info) {
						option_data.push({
							'name'  : option['name'],
							'value' : upload_info['name'],
							'type'  : option['type'],
							'href'  : this.url.link('tool/upload.download', 'user_token=' + this.session.data['user_token'] + '&code=' + upload_info['code'])
						];
					}
				}
			}

			description = '';

			subscription_info await this.model_sale_order.getSubscription(order_id, product['order_product_id']);

			if (subscription_info) {
				if (subscription_info['trial_status']) {
					trial_price = this.currency.format(subscription_info['trial_price'], this.config.get('config_currency'));
					trial_cycle = subscription_info['trial_cycle'];
					trial_frequency = this.language.get('text_' + subscription_info['trial_frequency']);
					trial_duration = subscription_info['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
				}

				price = this.currency.format(subscription_info['price'], this.config.get('config_currency'));
				cycle = subscription_info['cycle'];
				frequency = this.language.get('text_' + subscription_info['frequency']);
				duration = subscription_info['duration'];

				if (subscription_info['duration']) {
					description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
				}
			}

			subscription_info await this.model_sale_subscription.getSubscriptionByOrderProductId(order_id, product['order_product_id']);

			if (subscription_info) {
				subscription = this.url.link('sale/subscription.info', 'user_token=' + this.session.data['user_token'] + '&subscription_id=' + subscription_info['subscription_id']);
			} else {
				subscription = '';
			}

			data['order_products'].push({
				'order_product_id'         : product['order_product_id'],
				'product_id'               : product['product_id'],
				'name'                     : product['name'],
				'model'                    : product['model'],
				'option'                   : option_data,
				'subscription'             : subscription,
				'subscription_description' : description,
				'quantity'                 : product['quantity'],
				'price'                    : this.currency.format(product['price'] + (this.config.get('config_tax') ? product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
				'total'                    : this.currency.format(product['total'] + (this.config.get('config_tax') ? (product['tax'] * product['quantity']) : 0), order_info['currency_code'], order_info['currency_value']),
				'reward'                   : product['reward']
			];
		}

		// Vouchers
		data['order_vouchers'] = [];

		vouchers await this.model_sale_order.getVouchers(order_id);

		for (vouchers of voucher) {
			data['order_vouchers'].push({
				'description' : voucher['description'],
				'amount'      : this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value']),
				'href'        : this.url.link('sale/voucher.form', 'user_token=' + this.session.data['user_token'] + '&voucher_id=' + voucher['voucher_id'])
			];
		}

		// Totals
		data['order_totals'] = [];

		totals await this.model_sale_order.getTotals(order_id);

		for (totals of total) {
			data['order_totals'].push({
				'title' : total['title'],
				'text'  : this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value'])
			];
		}

		// Delete any old session
		if ((this.session.data['api_session'])) {
			session = new \Opencart\System\Library\Session(this.config.get('session_engine'), this.registry);
			session.start(this.session.data['api_session']);
			session.destroy();
		}

		if ((order_info)) {
			store_id = order_info['store_id'];
		} else {
			store_id = 0;
		}

		if ((order_info)) {
			language = order_info['language_code'];
		} else {
			language = this.config.get('config_language');
		}

		// Create a store instance using loader class to call controllers, models, views, libraries
		this.load.model('setting/store',this);

		store await this.model_setting_store.createStoreInstance(store_id, language);

		// 2. Store the new session ID so we're not creating new session on every page load
		this.session.data['api_session'] = store.session.getId();

		// 3. To use the order API it requires an API ID.
		store.session.data['api_id'] = this.config.get('config_api_id');

		if ((order_info)) {
			// 4. Add the request vars and remove the unneeded ones
			store.request.get = this.request.get;
			store.request.post = this.request.post;

			// 5. Load the order data
			store.request.get['route'] = 'api/sale/order.load';
			store.request.get['language'] = language;

			delete (store.request.get['user_token']);
			delete (store.request.get['action']);

			store.load.controller(store.request.get['route']);
		}

		// Store
		data['stores'] = [];

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.config.get('config_name')
		});

		this.load.model('setting/store',this);

		const results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id' : result['store_id'],
				'name'     : result['name']
			];
		}

		if ((order_info)) {
			data['store_id'] = order_info['store_id'];
		} else {
			data['store_id'] = this.config.get('config_store_id');
		}

		// Language
		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((order_info)) {
			data['language_code'] = order_info['language_code'];
		} else {
			data['language_code'] = this.config.get('config_language');
		}

		// Voucher themes
		this.load.model('sale/voucher_theme');

		data['voucher_themes'] = await this.model_sale_voucher_theme.getVoucherThemes();

		// Currency
		this.load.model('localisation/currency');

		data['currencies'] = await this.model_localisation_currency.getCurrencies();

		if ((order_info)) {
			data['currency_code'] = order_info['currency_code'];
		} else {
			data['currency_code'] = this.config.get('config_currency');
		}

		// Coupon, Voucher, Reward
		data['total_coupon'] = '';
		data['total_voucher'] = '';
		data['total_reward'] = 0;

		if (order_id) {
			order_totals await this.model_sale_order.getTotals(order_id);

			for (order_totals of order_total) {
				// If coupon, voucher or reward points
				start = strpos(order_total['title'], '(') + 1;
				end = strrpos(order_total['title'], ')');

				if (start && end) {
					data['total_' + order_total['code']] = substr(order_total['title'], start, end - start);
				}
			}
		}

		// Reward Points
		if ((order_info)) {
			data['points'] = await this.model_sale_order.getRewardTotal(order_id);
		} else {
			data['points'] = 0;
		}

		// Reward Points
		if ((order_info)) {
			data['reward_total'] = await this.model_customer_customer.getTotalRewardsByOrderId(order_id);
		} else {
			data['reward_total'] = 0;
		}

		// Affiliate
		if ((order_info)) {
			data['affiliate_id'] = order_info['affiliate_id'];
		} else {
			data['affiliate_id'] = 0;
		}

		if ((order_info)) {
			data['affiliate'] = order_info['affiliate'];
		} else {
			data['affiliate'] = '';
		}

		// Commission
		if ((order_info) && (float)order_info['commission']) {
			data['commission'] = this.currency.format(order_info['commission'], this.config.get('config_currency'));
		} else {
			data['commission'] = '';
		}

		if ((order_info)) {
			data['commission_total'] = await this.model_customer_customer.getTotalTransactionsByOrderId(order_id);
		} else {
			data['commission_total'] = '';
		}

		// Addresses
		if ((order_info)) {
			this.load.model('customer/customer',this);

			data['addresses'] = await this.model_customer_customer.getAddresses(order_info['customer_id']);
		} else {
			data['addresses'] = [];
		}

		// Payment Address
		if ((order_info)) {
			data['payment_address_id'] = order_info['payment_address_id'];
		} else {
			data['payment_address_id'] = 0;
		}

		if ((order_info)) {
			data['payment_firstname'] = order_info['payment_firstname'];
		} else {
			data['payment_firstname'] = '';
		}

		if ((order_info)) {
			data['payment_lastname'] = order_info['payment_lastname'];
		} else {
			data['payment_lastname'] = '';
		}

		if ((order_info)) {
			data['payment_company'] = order_info['payment_company'];
		} else {
			data['payment_company'] = '';
		}

		if ((order_info)) {
			data['payment_address_1'] = order_info['payment_address_1'];
		} else {
			data['payment_address_1'] = '';
		}

		if ((order_info)) {
			data['payment_address_2'] = order_info['payment_address_2'];
		} else {
			data['payment_address_2'] = '';
		}

		if ((order_info)) {
			data['payment_city'] = order_info['payment_city'];
		} else {
			data['payment_city'] = '';
		}

		if ((order_info)) {
			data['payment_postcode'] = order_info['payment_postcode'];
		} else {
			data['payment_postcode'] = '';
		}

		// Countries
		this.load.model('localisation/country');

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((order_info)) {
			data['payment_country_id'] = order_info['payment_country_id'];
		} else {
			data['payment_country_id'] = 0;
		}

		if ((order_info)) {
			data['payment_country'] = order_info['payment_country'];
		} else {
			data['payment_country'] = '';
		}

		if ((order_info)) {
			data['payment_zone_id'] = order_info['payment_zone_id'];
		} else {
			data['payment_zone_id'] = 0;
		}

		if ((order_info)) {
			data['payment_zone'] = order_info['payment_zone'];
		} else {
			data['payment_zone'] = '';
		}

		if ((order_info)) {
			data['payment_custom_field'] = order_info['payment_custom_field'];
		} else {
			data['payment_custom_field'] = [];
		}

		// Payment Method
		if ((order_info['payment_method']['name'])) {
			data['payment_method'] = order_info['payment_method']['name'];
		} else {
			data['payment_method'] = '';
		}

		if ((order_info['payment_method']['code'])) {
			data['payment_code'] = order_info['payment_method']['code'];
		} else {
			data['payment_code'] = '';
		}

		// Shipping Address
		if ((order_info)) {
			data['shipping_address_id'] = order_info['shipping_address_id'];
		} else {
			data['shipping_address_id'] = 0;
		}

		if ((order_info)) {
			data['shipping_firstname'] = order_info['shipping_firstname'];
		} else {
			data['shipping_firstname'] = '';
		}

		if ((order_info)) {
			data['shipping_lastname'] = order_info['shipping_lastname'];
		} else {
			data['shipping_lastname'] = '';
		}

		if ((order_info)) {
			data['shipping_company'] = order_info['shipping_company'];
		} else {
			data['shipping_company'] = '';
		}

		if ((order_info)) {
			data['shipping_address_1'] = order_info['shipping_address_1'];
		} else {
			data['shipping_address_1'] = '';
		}

		if ((order_info)) {
			data['shipping_address_2'] = order_info['shipping_address_2'];
		} else {
			data['shipping_address_2'] = '';
		}

		if ((order_info)) {
			data['shipping_city'] = order_info['shipping_city'];
		} else {
			data['shipping_city'] = '';
		}

		if ((order_info)) {
			data['shipping_postcode'] = order_info['shipping_postcode'];
		} else {
			data['shipping_postcode'] = '';
		}

		if ((order_info)) {
			data['shipping_country_id'] = order_info['shipping_country_id'];
		} else {
			data['shipping_country_id'] = 0;
		}

		if ((order_info)) {
			data['shipping_country'] = order_info['shipping_country'];
		} else {
			data['shipping_country'] = '';
		}

		if ((order_info)) {
			data['shipping_zone_id'] = order_info['shipping_zone_id'];
		} else {
			data['shipping_zone_id'] = 0;
		}

		if ((order_info)) {
			data['shipping_zone'] = order_info['shipping_zone'];
		} else {
			data['shipping_zone'] = '';
		}

		if ((order_info)) {
			data['shipping_custom_field'] = order_info['shipping_custom_field'];
		} else {
			data['shipping_custom_field'] = [];
		}

		// Shipping method
		if ((order_info['shipping_method']['name'])) {
			data['shipping_method'] = order_info['shipping_method']['name'];
		} else {
			data['shipping_method'] = '';
		}

		if ((order_info['shipping_method']['code'])) {
			data['shipping_code'] = order_info['shipping_method']['code'];
		} else {
			data['shipping_code'] = '';
		}

		// Comment
		if ((order_info)) {
			data['comment'] = nl2br(order_info['comment']);
		} else {
			data['comment'] = '';
		}

		// Totals
		data['order_totals'] = [];

		if ((order_info)) {
			totals await this.model_sale_order.getTotals(order_id);

			for (totals of total) {
				data['order_totals'].push({
					'title' : total['title'],
					'text'  : this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value'])
				];
			}
		}

		// Order Status
		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((order_info)) {
			data['order_status_id'] = order_info['order_status_id'];
		} else {
			data['order_status_id'] = this.config.get('config_order_status_id');
		}

		// Additional tabs that are payment gateway specific
		data['tabs'] = [];

		// Extension Order Tabs can are called here.
		this.load.model('setting/extension');

		if ((order_info['payment_method']['code'])) {
			if ((order_info['payment_method']['code'])) {
				code = oc_substr(order_info['payment_method']['code'], 0, strpos(order_info['payment_method']['code'], '.'));
			} else {
				code = '';
			}

			extension_info await this.model_setting_extension.getExtensionByCode('payment', code);

			if (extension_info && await this.user.hasPermission('access', 'extension/' + extension_info['extension'] + '/payment/' + extension_info['code'])) {
				output = await this.load.controller('extension/' + extension_info['extension'] + '/payment/' + extension_info['code'] + '.order');

				if (!output instanceof \Exception) {
					await this.load.language('extension/' + extension_info['extension'] + '/payment/' + extension_info['code'], 'extension');

					data['tabs'].push({
						'code'    : extension_info['code'],
						'title'   : this.language.get('extension_heading_title'),
						'content' : output
					];
				}
			}
		}

		// Extension Order Tabs can are called here.
		this.load.model('setting/extension');

		extensions await this.model_setting_extension.getExtensionsByType('fraud');

		for (extensions of extension) {
			if (this.config.get('fraud_' + extension['code'] + '_status')) {
				await this.load.language('extension/' + extension['extension'] + '/fraud/' + extension['code'], 'extension');

				output = await this.load.controller('extension/' + extension['extension'] + '/fraud/' + extension['code'] + '.order');

				if (!output instanceof \Exception) {
					data['tabs'].push({
						'code'    : extension['extension'],
						'title'   : this.language.get('extension_heading_title'),
						'content' : output
					];
				}
			}
		}

		// Additional information
		if ((order_info)) {
			data['ip'] = order_info['ip'];
			data['forwarded_ip'] = order_info['forwarded_ip'];
			data['user_agent'] = order_info['user_agent'];
			data['accept_language'] = order_info['accept_language'];
			data['date_added'] = date(this.language.get('date_format_short'), strtotime(order_info['date_added']));
			data['date_modified'] = date(this.language.get('date_format_short'), strtotime(order_info['date_modified']));
		} else {
			data['ip'] = '';
			data['forwarded_ip'] = '';
			data['user_agent'] = '';
			data['accept_language'] = '';
			data['date_added'] = date(this.language.get('date_format_short'), time());
			data['date_modified'] = date(this.language.get('date_format_short'), time());
		}

		// Histories
		data['history'] = this.getHistory();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/order_info', data));
	}

	// Method to call the store front API and return a response.

	/**
	 * @return void
	 */
	async call() {
		await this.load.language('sale/order');

		const json = {};

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		if ((this.request.get['language'])) {
			language = this.request.get['language'];
		} else {
			language = this.config.get('config_language');
		}

		if ((this.request.get['action'])) {
			action = this.request.get['action'];
		} else {
			action = '';
		}

		if ((this.session.data['api_session'])) {
			session_id = this.session.data['api_session'];
		} else {
			session_id = '';
		}

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			// 1. Create a store instance using loader class to call controllers, models, views, libraries
			this.load.model('setting/store',this);

			store await this.model_setting_store.createStoreInstance(store_id, language, session_id);

			// 2. Add the request vars and remove the unneeded ones
			store.request.get = this.request.get;
			store.request.post = this.request.post;

			store.request.get['route'] = 'api/' + action;

			// 3. Remove the unneeded keys
			delete (store.request.get['action']);
			delete (store.request.get['user_token']);

			// Call the required API controller
			store.load.controller(store.request.get['route']);

			output = store.response.getOutput();
		} else {
			output = json;
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(output);
	}

	/**
	 * @return void
	 */
	async invoice() {
		await this.load.language('sale/order');

		data['title'] = this.language.get('text_invoice');

		data['base'] = HTTP_SERVER;
		data['direction'] = this.language.get('direction');
		data['lang'] = this.language.get('code');

		// Hard coding css so they can be replaced via the events system.
		data['bootstrap_css'] = 'view/stylesheet/bootstrap.css';
		data['icons'] = 'view/stylesheet/fonts/fontawesome/css/all.min.css';
		data['stylesheet'] = 'view/stylesheet/stylesheet.css';

		// Hard coding scripts so they can be replaced via the events system.
		data['jquery'] = 'view/javascript/jquery/jquery-3.7.1.min.js';
		data['bootstrap_js'] = 'view/javascript/bootstrap/js/bootstrap.bundle.min.js';

		this.load.model('sale/order');
		this.load.model('setting/setting',this);
		this.load.model('tool/upload');
		this.load.model('sale/subscription');

		data['orders'] = [];

		orders = [];

		if ((this.request.post['selected'])) {
			orders = this.request.post['selected'];
		}

		if ((this.request.get['order_id'])) {
			orders[] = this.request.get['order_id'];
		}

		for (orders of order_id) {
			order_info await this.model_sale_order.getOrder(order_id);

			if (order_info) {
				const store_info = await this.model_setting_setting.getSetting('config', order_info['store_id']);

				if (store_info && store_info.store_id) {
					store_address = store_info['config_address'];
					store_email = store_info['config_email'];
					store_telephone = store_info['config_telephone'];
				} else {
					store_address = this.config.get('config_address');
					store_email = this.config.get('config_email');
					store_telephone = this.config.get('config_telephone');
				}

				if (order_info['invoice_no']) {
					invoice_no = order_info['invoice_prefix'] + order_info['invoice_no'];
				} else {
					invoice_no = '';
				}

				// Payment Address
				if (order_info['payment_address_format']) {
					format = order_info['payment_address_format'];
				} else {
					format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
				}

				find = [
					'{firstname}',
					'{lastname}',
					'{company}',
					'{address_1}',
					'{address_2}',
					'{city}',
					'{postcode}',
					'{zone}',
					'{zone_code}',
					'{country}'
				];

				replace = [
					'firstname' : order_info['payment_firstname'],
					'lastname'  : order_info['payment_lastname'],
					'company'   : order_info['payment_company'],
					'address_1' : order_info['payment_address_1'],
					'address_2' : order_info['payment_address_2'],
					'city'      : order_info['payment_city'],
					'postcode'  : order_info['payment_postcode'],
					'zone'      : order_info['payment_zone'],
					'zone_code' : order_info['payment_zone_code'],
					'country'   : order_info['payment_country']
				];

				payment_address = str_replace(["\r\n", "\r", "\n"], '<br/>', preg_replace(["/\s\s+/", "/\r\r+/", "/\n\n+/"], '<br/>', trim(str_replace(find, replace, format))));

				// Shipping Address
				if (order_info['shipping_address_format']) {
					format = order_info['shipping_address_format'];
				} else {
					format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
				}

				find = [
					'{firstname}',
					'{lastname}',
					'{company}',
					'{address_1}',
					'{address_2}',
					'{city}',
					'{postcode}',
					'{zone}',
					'{zone_code}',
					'{country}'
				];

				replace = [
					'firstname' : order_info['shipping_firstname'],
					'lastname'  : order_info['shipping_lastname'],
					'company'   : order_info['shipping_company'],
					'address_1' : order_info['shipping_address_1'],
					'address_2' : order_info['shipping_address_2'],
					'city'      : order_info['shipping_city'],
					'postcode'  : order_info['shipping_postcode'],
					'zone'      : order_info['shipping_zone'],
					'zone_code' : order_info['shipping_zone_code'],
					'country'   : order_info['shipping_country']
				];

				shipping_address = str_replace(["\r\n", "\r", "\n"], '<br/>', preg_replace(["/\s\s+/", "/\r\r+/", "/\n\n+/"], '<br/>', trim(str_replace(find, replace, format))));

				product_data = [];

				products await this.model_sale_order.getProducts(order_id);

				for (products of product) {
					let option_data = [];

					options await this.model_sale_order.getOptions(order_id, product['order_product_id']);

					for (options of option) {
						if (option['type'] != 'file') {
							value = option['value'];
						} else {
							upload_info await this.model_tool_upload.getUploadByCode(option['value']);

							if (upload_info) {
								value = upload_info['name'];
							} else {
								value = '';
							}
						}

						option_data.push({
							'name'  : option['name'],
							'value' : value
						];
					}

					// Subscription
					description = '';

					subscription_info await this.model_sale_order.getSubscription(order_id, product['order_product_id']);

					if (subscription_info) {
						if (subscription_info['trial_status']) {
							trial_price = this.currency.format(subscription_info['trial_price'], this.config.get('config_currency'));
							trial_cycle = subscription_info['trial_cycle'];
							trial_frequency = this.language.get('text_' + subscription_info['trial_frequency']);
							trial_duration = subscription_info['trial_duration'];

							description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
						}

						price = this.currency.format(subscription_info['price'], this.config.get('config_currency'));
						cycle = subscription_info['cycle'];
						frequency = this.language.get('text_' + subscription_info['frequency']);
						duration = subscription_info['duration'];

						if (subscription_info['duration']) {
							description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
						} else {
							description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
						}
					}

					product_data.push({
						'name'     		: product['name'],
						'model'    		: product['model'],
						'option'   		: option_data,
						'subscription'	: description,
						'quantity' 		: product['quantity'],
						'price'    		: this.currency.format(product['price'] + (this.config.get('config_tax') ? product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
						'total'    		: this.currency.format(product['total'] + (this.config.get('config_tax') ? (product['tax'] * product['quantity']) : 0), order_info['currency_code'], order_info['currency_value'])
					];
				}

				voucher_data = [];

				vouchers await this.model_sale_order.getVouchers(order_id);

				for (vouchers of voucher) {
					voucher_data.push({
						'description' : voucher['description'],
						'amount'      : this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value'])
					];
				}

				total_data = [];

				totals await this.model_sale_order.getTotals(order_id);

				for (totals of total) {
					total_data.push({
						'title' : total['title'],
						'text'  : this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value'])
					];
				}

				data['orders'].push({
					'order_id'         : order_id,
					'invoice_no'       : invoice_no,
					'date_added'       : date(this.language.get('date_format_short'), strtotime(order_info['date_added'])),
					'store_name'       : order_info['store_name'],
					'store_url'        : rtrim(order_info['store_url'], '/'),
					'store_address'    : nl2br(store_address),
					'store_email'      : store_email,
					'store_telephone'  : store_telephone,
					'email'            : order_info['email'],
					'telephone'        : order_info['telephone'],
					'shipping_address' : shipping_address,
					'shipping_method'  : (order_info['shipping_method'] ? order_info['shipping_method']['name'] : ''),
					'payment_address'  : payment_address,
					'payment_method'   : order_info['payment_method']['name'],
					'product'          : product_data,
					'voucher'          : voucher_data,
					'total'            : total_data,
					'comment'          : nl2br(order_info['comment'])
				];
			}
		}

		this.response.setOutput(await this.load.view('sale/order_invoice', data));
	}

	/**
	 * @return void
	 */
	async shipping() {
		await this.load.language('sale/order');

		data['title'] = this.language.get('text_shipping');

		data['base'] = HTTP_SERVER;
		data['direction'] = this.language.get('direction');
		data['lang'] = this.language.get('code');

		// Hard coding CSS so they can be replaced via the events system.
		data['bootstrap_css'] = 'view/stylesheet/bootstrap.css';
		data['icons'] = 'view/stylesheet/fonts/fontawesome/css/all.min.css';
		data['stylesheet'] = 'view/stylesheet/stylesheet.css';

		// Hard coding scripts so they can be replaced via the events system.
		data['jquery'] = 'view/javascript/jquery/jquery-3.7.1.min.js';
		data['bootstrap_js'] = 'view/javascript/bootstrap/js/bootstrap.bundle.min.js';

		this.load.model('sale/order');
		this.load.model('catalog/product',this);
		this.load.model('setting/setting',this);
		this.load.model('tool/upload');
		this.load.model('sale/subscription');

		data['orders'] = [];

		orders = [];

		if ((this.request.post['selected'])) {
			orders = this.request.post['selected'];
		}

		if ((this.request.get['order_id'])) {
			orders[] = this.request.get['order_id'];
		}

		for (orders of order_id) {
			order_info await this.model_sale_order.getOrder(order_id);

			// Make sure there is a shipping method
			if (order_info && order_info['shipping_method']) {
				const store_info = await this.model_setting_setting.getSetting('config', order_info['store_id']);

				if (store_info && store_info.store_id) {
					store_address = store_info['config_address'];
					store_email = store_info['config_email'];
					store_telephone = store_info['config_telephone'];
				} else {
					store_address = this.config.get('config_address');
					store_email = this.config.get('config_email');
					store_telephone = this.config.get('config_telephone');
				}

				if (order_info['invoice_no']) {
					invoice_no = order_info['invoice_prefix'] + order_info['invoice_no'];
				} else {
					invoice_no = '';
				}

				// Shipping Address
				if (order_info['shipping_address_format']) {
					format = order_info['shipping_address_format'];
				} else {
					format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
				}

				find = [
					'{firstname}',
					'{lastname}',
					'{company}',
					'{address_1}',
					'{address_2}',
					'{city}',
					'{postcode}',
					'{zone}',
					'{zone_code}',
					'{country}'
				];

				replace = [
					'firstname' : order_info['shipping_firstname'],
					'lastname'  : order_info['shipping_lastname'],
					'company'   : order_info['shipping_company'],
					'address_1' : order_info['shipping_address_1'],
					'address_2' : order_info['shipping_address_2'],
					'city'      : order_info['shipping_city'],
					'postcode'  : order_info['shipping_postcode'],
					'zone'      : order_info['shipping_zone'],
					'zone_code' : order_info['shipping_zone_code'],
					'country'   : order_info['shipping_country']
				];

				shipping_address = str_replace(["\r\n", "\r", "\n"], '<br/>', preg_replace(["/\s\s+/", "/\r\r+/", "/\n\n+/"], '<br/>', trim(str_replace(find, replace, format))));

				product_data = [];

				products await this.model_sale_order.getProducts(order_id);

				for (products of product) {
					option_weight = 0;

					const product_info = await this.model_catalog_product.getProduct(product['product_id']);

					if (product_info) {
						let option_data = [];

						options await this.model_sale_order.getOptions(order_id, product['order_product_id']);

						for (options of option) {
							if (option['type'] != 'file') {
								value = option['value'];
							} else {
								upload_info await this.model_tool_upload.getUploadByCode(option['value']);

								if (upload_info) {
									value = upload_info['name'];
								} else {
									value = '';
								}
							}

							option_data.push({
								'name'  : option['name'],
								'value' : value
							];

							product_option_value_info await this.model_catalog_product.getOptionValue(product['product_id'], option['product_option_value_id']);

							if ((product_option_value_info['weight'])) {
								if (product_option_value_info['weight_prefix'] == '+') {
									option_weight += product_option_value_info['weight'];
								} else if (product_option_value_info['weight_prefix'] == '-') {
									option_weight -= product_option_value_info['weight'];
								}
							}
						}

						product_data.push({
							'name'     	   : product_info['name'],
							'model'    	   : product_info['model'],
							'option'   	   : option_data,
							'quantity'     : product['quantity'],
							'location'     : product_info['location'],
							'sku'          : product_info['sku'],
							'upc'          : product_info['upc'],
							'ean'          : product_info['ean'],
							'jan'          : product_info['jan'],
							'isbn'         : product_info['isbn'],
							'mpn'          : product_info['mpn'],
							'weight'       : this.weight.format((product_info['weight'] + (float)option_weight) * product['quantity'], product_info['weight_class_id'], this.language.get('decimal_point'), this.language.get('thousand_point'))
						];
					}
				}

				data['orders'].push({
					'order_id'         : order_id,
					'invoice_no'       : invoice_no,
					'date_added'       : date(this.language.get('date_format_short'), strtotime(order_info['date_added'])),
					'store_name'       : order_info['store_name'],
					'store_url'        : rtrim(order_info['store_url'], '/'),
					'store_address'    : nl2br(store_address),
					'store_email'      : store_email,
					'store_telephone'  : store_telephone,
					'email'            : order_info['email'],
					'telephone'        : order_info['telephone'],
					'shipping_address' : shipping_address,
					'shipping_method'  : order_info['shipping_method']['name'],
					'product'          : product_data,
					'comment'          : nl2br(order_info['comment'])
				];
			}
		}

		this.response.setOutput(await this.load.view('sale/order_shipping', data));
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('sale/order');

		this.response.setOutput(this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		if ((this.request.get['page']) && this.request.get['route'] == 'sale/order.history') {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('sale/order');

		const results = await this.model_sale_order.getHistories(order_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'status'     : result['status'],
				'comment'    : nl2br(result['comment']),
				'notify'     : result['notify'] ? this.language.get('text_yes') : this.language.get('text_no'),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			];
		}

		history_total await this.model_sale_order.getTotalHistories(order_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : history_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('sale/order.history', 'user_token=' + this.session.data['user_token'] + '&order_id=' + order_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		return await this.load.view('sale/order_history', data);
	}

	/**
	 * @return void
	 */
	async createInvoiceNo() {
		await this.load.language('sale/order');

		const json = {};

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order');

		order_info await this.model_sale_order.getOrder(order_id);

		if (order_info) {
			if (order_info['invoice_no']) {
				json['error'] = this.language.get('error_invoice_no');
			}
		} else {
			json['error'] = this.language.get('error_order');
		}

		if (!Object.keys(json).length) {
			json['success'] = this.language.get('text_success');

			this.load.model('sale/order');

			json['invoice_no'] = await this.model_sale_order.createInvoiceNo(order_id);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async addReward() {
		await this.load.language('sale/order');

		const json = {};

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order');

		order_info await this.model_sale_order.getOrder(order_id);

		if (order_info) {
			if (!order_info['customer_id']) {
				json['error'] = this.language.get('error_customer');
			}
		} else {
			json['error'] = this.language.get('error_order');
		}

		this.load.model('customer/customer',this);

		reward_total await this.model_customer_customer.getTotalRewardsByOrderId(order_id);

		if (reward_total) {
			json['error'] = this.language.get('error_reward_add');
		}

		if (!Object.keys(json).length) {
			await this.model_customer_customer.addReward(order_info['customer_id'], this.language.get('text_order_id') + ' #' + order_id, order_info['reward'], order_id);

			json['success'] = this.language.get('text_reward_add');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async removeReward() {
		await this.load.language('sale/order');

		const json = {};

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order');

		order_info await this.model_sale_order.getOrder(order_id);

		if (!order_info) {
			json['error'] = this.language.get('error_order');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer',this);

			await this.model_customer_customer.deleteReward(order_id);

			json['success'] = this.language.get('text_reward_remove');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async addCommission() {
		await this.load.language('sale/order');

		const json = {};

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order');

		order_info await this.model_sale_order.getOrder(order_id);

		if (order_info) {
			this.load.model('customer/customer',this);

			customer_info await this.model_customer_customer.getCustomer(order_info['affiliate_id']);

			if (!customer_info) {
				json['error'] = this.language.get('error_affiliate');
			}

			affiliate_total await this.model_customer_customer.getTotalTransactionsByOrderId(order_id);

			if (affiliate_total) {
				json['error'] = this.language.get('error_commission_add');
			}
		} else {
			json['error'] = this.language.get('error_order');
		}

		if (!Object.keys(json).length) {
			await this.model_customer_customer.addTransaction(order_info['affiliate_id'], this.language.get('text_order_id') + ' #' + order_id, order_info['commission'], order_id);

			json['success'] = this.language.get('text_commission_add');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async removeCommission() {
		await this.load.language('sale/order');

		const json = {};

		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/order');

		order_info await this.model_sale_order.getOrder(order_id);

		if (!order_info) {
			json['error'] = this.language.get('error_order');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer',this);

			await this.model_customer_customer.deleteTransactionByOrderId(order_id);

			json['success'] = this.language.get('text_commission_remove');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
