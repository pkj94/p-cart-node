<?php
namespace Opencart\Admin\Controller\Sale;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Sale
 */
class SubscriptionController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('sale/subscription');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_subscription_id'])) {
			filter_subscription_id = this.request.get['filter_subscription_id'];
		} else {
			filter_subscription_id = '';
		}

		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_subscription_status_id'])) {
			filter_subscription_status_id = this.request.get['filter_subscription_status_id'];
		} else {
			filter_subscription_status_id = '';
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

		if ((this.request.get['filter_subscription_id'])) {
			url += '&filter_subscription_id=' + this.request.get['filter_subscription_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_subscription_status_id'])) {
			url += '&filter_subscription_status_id=' + this.request.get['filter_subscription_status_id'];
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
			'href' : this.url.link('sale/subscription', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('sale/subscription.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('sale/subscription.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		this.load.model('localisation/subscription_status');

		data['subscription_statuses'] = await this.model_localisation_subscription_status.getSubscriptionStatuses();

		data['filter_subscription_id'] = filter_subscription_id;
		data['filter_order_id'] = filter_order_id;
		data['filter_customer'] = filter_customer;
		data['filter_subscription_status_id'] = filter_subscription_status_id;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/subscription', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('sale/subscription');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_subscription_id'])) {
			filter_subscription_id = this.request.get['filter_subscription_id'];
		} else {
			filter_subscription_id = '';
		}

		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_subscription_status_id'])) {
			filter_subscription_status_id = this.request.get['filter_subscription_status_id'];
		} else {
			filter_subscription_status_id = '';
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
			sort = 's.subscription_id';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'DESC';
		}

		let page = 1;
		if ((this.request.get['page '])) {
			page = this.request.get['page '];
		}

		let url = '';

		if ((this.request.get['filter_subscription_id'])) {
			url += '&filter_subscription_id=' + this.request.get['filter_subscription_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_subscription_status_id'])) {
			url += '&filter_subscription_status_id=' + this.request.get['filter_subscription_status_id'];
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

		data['subscriptions'] = [];

		let filter_data = {
			'filter_subscription_id'        : filter_subscription_id,
			'filter_order_id'               : filter_order_id,
			'filter_customer'               : filter_customer,
			'filter_subscription_status_id' : filter_subscription_status_id,
			'filter_date_from'              : filter_date_from,
			'filter_date_to'                : filter_date_to,
			'order'                         : order,
			'sort'                          : sort,
			'start'                         : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'                         : this.config.get('config_pagination_admin')
		});

		this.load.model('sale/subscription');

		subscription_total await this.model_sale_subscription.getTotalSubscriptions(filter_data);

		const results = await this.model_sale_subscription.getSubscriptions(filter_data);

		for (let result of results) {
			data['subscriptions'].push({
				'subscription_id' : result['subscription_id'],
				'order_id'        : result['order_id'],
				'customer'        : result['customer'],
				'status'          : result['subscription_status'],
				'date_added'      : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'view'            : this.url.link('sale/subscription.info', 'user_token=' + this.session.data['user_token'] + '&subscription_id=' + result['subscription_id'] + url),
				'order'           : this.url.link('sale/order.info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'])
			];
		}

		let url = '';

		if ((this.request.get['filter_subscription_id'])) {
			url += '&filter_subscription_id=' + this.request.get['filter_subscription_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_subscription_status_id'])) {
			url += '&filter_subscription_status_id=' + this.request.get['filter_subscription_status_id'];
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

		data['sort_subscription'] = this.url.link('sale/subscription.list', 'user_token=' + this.session.data['user_token'] + '&sort=s.subscription_id' + url);
		data['sort_order'] = this.url.link('sale/subscription.list', 'user_token=' + this.session.data['user_token'] + '&sort=s.order_id' + url);
		data['sort_customer'] = this.url.link('sale/subscription.list', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url);
		data['sort_status'] = this.url.link('sale/subscription.list', 'user_token=' + this.session.data['user_token'] + '&sort=subscription_status' + url);
		data['sort_date_added'] = this.url.link('sale/subscription.list', 'user_token=' + this.session.data['user_token'] + '&sort=s.date_added' + url);

		let url = '';

		if ((this.request.get['filter_subscription_id'])) {
			url += '&filter_subscription_id=' + this.request.get['filter_subscription_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
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
			'total' : subscription_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('sale/subscription.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (subscription_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (subscription_total - this.config.get('config_pagination_admin'))) ? subscription_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), subscription_total, Math.ceil(subscription_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('sale/subscription_list', data);
	}

	/**
	 * @return void
	 */
	async info() {
		await this.load.language('sale/subscription');

		if ((this.request.get['subscription_id'])) {
			subscription_id = this.request.get['subscription_id'];
		} else {
			subscription_id = 0;
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !subscription_id ? this.language.get('text_add') : sprintf(this.language.get('text_edit'), subscription_id);

		let url = '';

		if ((this.request.get['filter_subscription_id'])) {
			url += '&filter_subscription_id=' + this.request.get['filter_subscription_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_subscription_status_id'])) {
			url += '&filter_subscription_status_id=' + this.request.get['filter_subscription_status_id'];
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
			'href' : this.url.link('sale/subscription', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['back'] = this.url.link('sale/subscription', 'user_token=' + this.session.data['user_token'] + url);

		data['subscription_id'] = subscription_id;

		this.load.model('sale/subscription');

		subscription_info await this.model_sale_subscription.getSubscription(data['subscription_id']);

		if ((subscription_info)) {
			data['subscription_id'] = subscription_info['subscription_id'];
		} else {
			data['subscription_id'] = '';
		}

		// Order
		if ((subscription_info)) {
			this.load.model('sale/order');

			order_info await this.model_sale_order.getOrder(subscription_info['order_id']);
		}

		if ((subscription_info)) {
			data['order'] = this.url.link('sale/order.info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + subscription_info['order_id']);
		} else {
			data['order'] = '';
		}

		if ((subscription_info)) {
			data['order_id'] = subscription_info['order_id'];
		} else {
			data['order_id'] = 0;
		}

		// Customer
		if ((subscription_info)) {
			this.load.model('customer/customer',this);

			customer_info await this.model_customer_customer.getCustomer(subscription_info['customer_id']);
		}

		if ((customer_info)) {
			data['firstname'] = customer_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((customer_info)) {
			data['lastname'] = customer_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((customer_info)) {
			data['lastname'] = customer_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		// Subscription
		data['subscription_plans'] = [];

		this.load.model('catalog/subscription_plan',this);

		const results = await this.model_catalog_subscription_plan.getSubscriptionPlans();

		for (let result of results) {
			description = '';

			if (result['trial_status']) {
				trial_price = this.currency.format(subscription_info['trial_price'], this.config.get('config_currency'));
				trial_cycle = result['trial_cycle'];
				trial_frequency = this.language.get('text_' + result['trial_frequency']);
				trial_duration = result['trial_duration'];

				description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
			}

			price = this.currency.format(subscription_info['price'], this.config.get('config_currency'));
			cycle = result['cycle'];
			frequency = this.language.get('text_' + result['frequency']);
			duration = result['duration'];

			if (result['duration']) {
				description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
			} else {
				description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
			}

			data['subscription_plans'].push({
				'subscription_plan_id' : result['subscription_plan_id'],
				'name'                 : result['name'],
				'description'          : description
			];
		}

		if ((subscription_info)) {
			data['subscription_plan_id'] = subscription_info['subscription_plan_id'];
		} else {
			data['subscription_plan_id'] = 0;
		}

		subscription_plan_info = await this.model_catalog_subscription_plan.getSubscriptionPlan(data['subscription_plan_id']);

		if ((subscription_plan_info)) {
			data['subscription_plan'] = '';

			if (subscription_plan_info['trial_status']) {
				trial_price = this.currency.format(subscription_info['trial_price'], this.config.get('config_currency'));
				trial_cycle = result['trial_cycle'];
				trial_frequency = this.language.get('text_' + subscription_plan_info['trial_frequency']);
				trial_duration = subscription_plan_info['trial_duration'];

				data['subscription_plan'] += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
			}

			price = this.currency.format(subscription_info['price'], this.config.get('config_currency'));
			cycle = result['cycle'];
			frequency = this.language.get('text_' + subscription_plan_info['frequency']);
			duration = subscription_plan_info['duration'];

			if (subscription_plan_info['duration']) {
				data['subscription_plan'] += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
			} else {
				data['subscription_plan'] += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
			}
		} else {
			data['subscription_plan'] = '';
		}

		if ((subscription_info)) {
			data['trial_price'] = subscription_info['trial_price'];
		} else {
			data['trial_price'] = 0;
		}

		data['frequencies'] = [];

		data['frequencies'].push({
			'text'  : this.language.get('text_day'),
			'value' : 'day'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_week'),
			'value' : 'week'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_semi_month'),
			'value' : 'semi_month'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_month'),
			'value' : 'month'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_year'),
			'value' : 'year'
		});

		if ((subscription_info)) {
			data['trial_frequency'] = subscription_info['trial_frequency'];
		} else {
			data['trial_frequency'] = '';
		}

		if ((subscription_info)) {
			data['trial_cycle'] = subscription_info['trial_cycle'];
		} else {
			data['trial_cycle'] = 0;
		}

		if ((subscription_info)) {
			data['trial_duration'] = subscription_info['trial_duration'];
		} else {
			data['trial_duration'] = 0;
		}

		if ((subscription_info)) {
			data['trial_remaining'] = subscription_info['trial_remaining'];
		} else {
			data['trial_remaining'] = 0;
		}

		if ((subscription_info)) {
			data['trial_status'] = subscription_info['trial_status'];
		} else {
			data['trial_status'] = 0;
		}

		if ((subscription_info)) {
			data['price'] = subscription_info['price'];
		} else {
			data['price'] = 0;
		}

		if ((subscription_info)) {
			data['frequency'] = subscription_info['frequency'];
		} else {
			data['frequency'] = '';
		}

		if ((subscription_info)) {
			data['cycle'] = subscription_info['cycle'];
		} else {
			data['cycle'] = 0;
		}

		if ((subscription_info)) {
			data['duration'] = subscription_info['duration'];
		} else {
			data['duration'] = 0;
		}

		if ((subscription_info)) {
			data['remaining'] = subscription_info['remaining'];
		} else {
			data['remaining'] = 0;
		}

		// Date next
		if ((subscription_info)) {
			data['date_next'] = date(this.language.get('date_format_short'), strtotime(subscription_info['date_next']));
		} else {
			data['date_next'] = '';
		}



		// Payment method
		if ((subscription_info)) {
			data['payment_method'] = subscription_info['payment_method']['name'];
		} else {
			data['payment_method'] = '';
		}





		if ((order_info)) {
			data['date_added'] = date(this.language.get('date_format_short'), strtotime(order_info['date_added']));
		} else {
			data['date_added'] = '';
		}

		// Product data
		if ((subscription_info)) {
			this.load.model('sale/order');

			const product_info = await this.model_sale_order.getProductByOrderProductId(subscription_info['order_id'], subscription_info['order_product_id']);
		}

		if ((product_info['name'])) {
			data['product_name'] = product_info['name'];
		} else {
			data['product_name'] = '';
		}

		if (product_info && product_info.product_id) {
			data['product'] = this.url.link('catalog/product.form', 'user_token=' + this.session.data['user_token'] + '&product_id=' + product_info['product_id']);
		} else {
			data['product'] = '';
		}

		data['options'] = [];

		options await this.model_sale_order.getOptions(subscription_info['order_id'], subscription_info['order_product_id']);
		this.load.model('tool/upload');
		for (options of option) {
			if (option['type'] != 'file') {
				data['options'].push({
					'name'  : option['name'],
					'value' : option['value'],
					'type'  : option['type']
				];
			} else {
				upload_info await this.model_tool_upload.getUploadByCode(option['value']);

				if (upload_info) {
					data['options'].push({
						'name'  : option['name'],
						'value' : upload_info['name'],
						'type'  : option['type'],
						'href'  : this.url.link('tool/upload.download', 'user_token=' + this.session.data['user_token'] + '&code=' + upload_info['code'])
					];
				}
			}
		}



		if (product_info && product_info.product_id) {
			data['quantity'] = product_info['quantity'];
		} else {
			data['quantity'] = '';
		}



		this.load.model('localisation/subscription_status');

		data['subscription_statuses'] = await this.model_localisation_subscription_status.getSubscriptionStatuses();

		if ((subscription_info)) {
			data['subscription_status_id'] = subscription_info['subscription_status_id'];
		} else {
			data['subscription_status_id'] = '';
		}

		data['history'] = this.getHistory();
		data['orders'] = this.getOrder();

		// Additional tabs that are payment gateway specific
		data['tabs'] = [];

		// Extension Order Tabs can are called here.
		/*
		this.load.model('setting/extension');

		if ((order_info)) {
			extension_info await this.model_setting_extension.getExtensionByCode('payment', order_info['payment_method']['code']);

			if (extension_info && await this.user.hasPermission('access', 'extension/' + extension_info['extension'] + '/payment/' + extension_info['code'])) {
				output = await this.load.controller('extension/payment/' + order_info['payment_code'] + '.subscription');

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
		*/
		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/subscription_info', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('sale/subscription');

		const json = {};

		if ((this.request.get['subscription_id'])) {
			subscription_id = this.request.get['subscription_id'];
		} else {
			subscription_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/subscription')) {
			json['error'] = this.language.get('error_permission');
		} else if (this.request.post['subscription_plan_id'] == '') {
            json['error'] = this.language.get('error_subscription_plan');
        }

		this.load.model('catalog/subscription_plan',this);

		subscription_plan_info = await this.model_catalog_subscription_plan.getSubscriptionPlan(this.request.post['subscription_plan_id']);

		if (!subscription_plan_info) {
			json['error'] = this.language.get('error_subscription_plan');
		}

		this.load.model('sale/subscription');

		subscription_info await this.model_sale_subscription.getSubscription(subscription_id);

		if (!subscription_info) {
			this.load.model('customer/customer',this);

			payment_method_info await this.model_customer_customer.getPaymentMethod(subscription_info['customer_id'], this.request.post['customer_payment_id']);

			if (!payment_method_info) {
				json['error'] = this.language.get('error_payment_method');
			}
		} else {
			json['error'] = this.language.get('error_subscription');
		}

		if (!Object.keys(json).length) {
			await this.model_sale_subscription.editSubscriptionPlan(subscription_id, this.request.post['subscription_plan_id']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('sale/subscription');

		this.response.setOutput(this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		if ((this.request.get['subscription_id'])) {
			subscription_id = this.request.get['subscription_id'];
		} else {
			subscription_id = 0;
		}

		if ((this.request.get['page']) && this.request.get['route'] == 'sale/subscription.history') {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('sale/subscription');

		const results = await this.model_sale_subscription.getHistories(subscription_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'status'     : result['status'],
				'comment'    : nl2br(result['comment']),
				'notify'     : result['notify'] ? this.language.get('text_yes') : this.language.get('text_no'),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			];
		}

		subscription_total await this.model_sale_subscription.getTotalHistories(subscription_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : subscription_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('sale/subscription.history', 'user_token=' + this.session.data['user_token'] + '&subscription_id=' + subscription_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (subscription_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (subscription_total - limit)) ? subscription_total : (((page - 1) * limit) + limit), subscription_total, Math.ceil(subscription_total / limit));

		return await this.load.view('sale/subscription_history', data);
	}

	/**
	 * @return void
	 */
	async addHistory() {
		await this.load.language('sale/subscription');

		const json = {};

		if ((this.request.get['subscription_id'])) {
			subscription_id = this.request.get['subscription_id'];
		} else {
			subscription_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/subscription')) {
            json['error'] = this.language.get('error_permission');
        }

		// Subscription
		this.load.model('sale/subscription');

		subscription_info await this.model_sale_subscription.getSubscription(subscription_id);

		if (!subscription_info) {
			json['error'] = this.language.get('error_subscription');
		}

		// Subscription Plan
		this.load.model('localisation/subscription_status');

		subscription_status_info await this.model_localisation_subscription_status.getSubscriptionStatus(this.request.post['subscription_status_id']);

		if (!subscription_status_info) {
            json['error'] = this.language.get('error_subscription_status');
        }

		if (!Object.keys(json).length) {
			await this.model_sale_subscription.addHistory(subscription_id, this.request.post['subscription_status_id'], this.request.post['comment'], this.request.post['notify']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async order() {
		await this.load.language('sale/subscription');

		this.response.setOutput(this.getOrder());
	}

	/**
	 * @return string
	 */
	async getOrder() {
		if ((this.request.get['subscription_id'])) {
			subscription_id = this.request.get['subscription_id'];
		} else {
			subscription_id = 0;
		}

		if ((this.request.get['page']) && this.request.get['route'] == 'sale/subscription.order') {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		let limit = 10;

		data['orders'] = [];

		this.load.model('sale/order');

		const results = await this.model_sale_order.getOrdersBySubscriptionId(subscription_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['orders'].push({
				'order_id'   : result['order_id'],
				'status'     : result['status'],
				'total'      : this.currency.format(result['total'], result['currency_code'], result['currency_value']),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'view'       : this.url.link('sale/subscription.order', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'] + '&page={page}')
			];
		}

		order_total await this.model_sale_order.getTotalOrdersBySubscriptionId(subscription_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : order_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('sale/subscription.order', 'user_token=' + this.session.data['user_token'] + '&subscription_id=' + subscription_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (order_total - limit)) ? order_total : (((page - 1) * limit) + limit), order_total, Math.ceil(order_total / limit));

		return await this.load.view('sale/subscription_order', data);
	}
}
