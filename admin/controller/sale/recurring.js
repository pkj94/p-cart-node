module.exports = class ControllerSaleRecurring extends Controller {
	error = {};

	async index() {
		await this.load.language('sale/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/recurring');

		await this.getList();
	}

	async getList() {
		if ((this.request.get['filter_order_recurring_id'])) {
			filter_order_recurring_id = this.request.get['filter_order_recurring_id'];
		} else {
			filter_order_recurring_id = '';
		}

		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_reference'])) {
			filter_reference = this.request.get['filter_reference'];
		} else {
			filter_reference = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		} else {
			filter_status = 0;
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'order_recurring_id';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'DESC';
		}

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		url = '';

		if ((this.request.get['filter_order_recurring_id'])) {
			url += '&filter_order_recurring_id=' + this.request.get['filter_order_recurring_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_reference'])) {
			url += '&filter_reference=' + this.request.get['filter_reference'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['recurrings'] = {};

		filter_data = array(
			'filter_order_recurring_id' : filter_order_recurring_id,
			'filter_order_id'           : filter_order_id,
			'filter_reference'          : filter_reference,
			'filter_customer'           : filter_customer,
			'filter_status'             : filter_status,
			'filter_date_added'         : filter_date_added,
			'order'                     : order,
			'sort'                      : sort,
			'start'                     : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'                     : Number(this.config.get('config_limit_admin'))
		});

		recurrings_total = await this.model_sale_recurring.getTotalRecurrings(filter_data);

		results = await this.model_sale_recurring.getRecurrings(filter_data);

		for (let result of results) {
			if (result['status']) {
				status	= this.language.get('text_status_' + result['status']);
			} else {
				status = '';
			}
			
			data['recurrings'].push({
				'order_recurring_id' : result['order_recurring_id'],
				'order_id'           : result['order_id'],
				'reference'          : result['reference'],
				'customer'           : result['customer'],
				'status'             : status,
				'date_added'         : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'view'               : await this.url.link('sale/recurring/info', 'user_token=' + this.session.data['user_token'] + '&order_recurring_id=' + result['order_recurring_id'] + url, true),
				'order'              : await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'], true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}
		
		url = '';

		if ((this.request.get['filter_order_recurring_id'])) {
			url += '&filter_order_recurring_id=' + this.request.get['filter_order_recurring_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_reference'])) {
			url += '&filter_reference=' + encodeURIComponent(html_entity_decode(this.request.get['filter_reference']));
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_order_recurring'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=or.order_recurring_id' + url, true);
		data['sort_order'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=or.order_id' + url, true);
		data['sort_reference'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=or.reference' + url, true);
		data['sort_customer'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url, true);
		data['sort_status'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=or.status' + url, true);
		data['sort_date_added'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=or.date_added' + url, true);

		url = '';

		if ((this.request.get['filter_order_recurring_id'])) {
			url += '&filter_order_recurring_id=' + this.request.get['filter_order_recurring_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_reference'])) {
			url += '&filter_reference=' + encodeURIComponent(html_entity_decode(this.request.get['filter_reference']));
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = recurrings_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + '&page={page}' + url, true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (recurrings_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (recurrings_total - Number(this.config.get('config_limit_admin')))) ? recurrings_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), recurrings_total, Math.ceil(recurrings_total / Number(this.config.get('config_limit_admin'))));

		data['filter_order_recurring_id'] = filter_order_recurring_id;
		data['filter_order_id'] = filter_order_id;
		data['filter_reference'] = filter_reference;
		data['filter_customer'] = filter_customer;
		data['filter_status'] = filter_status;
		data['filter_date_added'] = filter_date_added;
		
		data['sort'] = sort;
		data['order'] = order;
		
		data['recurring_statuses'] = {};
		
		data['recurring_statuses'][0] = array(
			'text'  : '',
			'value' : 0
		});
			
		for (i = 1; i <= 6; i++) {
			data['recurring_statuses'][i] = array(
				'text'  : this.language.get('text_status_' + i),
				'value' : i,
			});		
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/recurring_list', data));
	}

	async info() {
		this.load.model('sale/recurring');
		
		if ((this.request.get['order_recurring_id'])) {
			order_recurring_id = this.request.get['order_recurring_id'];
		} else {
			order_recurring_id = 0;
		}
		
		order_recurring_info = await this.model_sale_recurring.getRecurring(order_recurring_id);

		if (order_recurring_info) {
			await this.load.language('sale/recurring');
		
			this.document.setTitle(this.language.get('heading_title'));

			data['user_token'] = this.session.data['user_token'];
			
			url = '';

			if ((this.request.get['filter_order_recurring_id'])) {
				url += '&filter_order_recurring_id=' + this.request.get['filter_order_recurring_id'];
			}

			if ((this.request.get['filter_order_id'])) {
				url += '&filter_order_id=' + this.request.get['filter_order_id'];
			}

			if ((this.request.get['filter_reference'])) {
				url += '&filter_reference=' + this.request.get['filter_reference'];
			}

			if ((this.request.get['filter_customer'])) {
				url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
				'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
			});

			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + url, true)
			});

			data['cancel'] = await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'] + url, true);
			
			// Recurring
			data['order_recurring_id'] = order_recurring_info['order_recurring_id'];
			data['reference'] = order_recurring_info['reference'];
			data['recurring_name'] = order_recurring_info['recurring_name'];
			
			if (order_recurring_info['recurring_id']) {
				data['recurring'] = await this.url.link('catalog/recurring/edit', 'user_token=' + this.session.data['user_token'] + '&recurring_id=' + order_recurring_info['recurring_id'], true);
			} else {
				data['recurring'] = '';
			}			
			
			data['recurring_description'] = order_recurring_info['recurring_description'];
			
			if (order_recurring_info['status']) {
				data['recurring_status']= this.language.get('text_status_' + order_recurring_info['status']);
			} else {
				data['recurring_status'] = '';
			}
			
			this.load.model('sale/order',this);

			order_info = await this.model_sale_order.getOrder(order_recurring_info['order_id']);
			
			data['payment_method'] = order_info['payment_method'];
			
			// Order
			data['order_id'] = order_info['order_id'];
			data['order'] = await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + order_info['order_id'], true);
			data['firstname'] = order_info['firstname'];
			data['lastname'] = order_info['lastname'];
			
			if (order_info['customer_id']) {
				data['customer'] = await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + order_info['customer_id'], true);
			} else {
				data['customer'] = '';
			}
		
			data['email'] = order_info['email'];
			data['order_status'] = order_info['order_status'];
			data['date_added'] = date(this.language.get('date_format_short'), strtotime(order_info['date_added']));
			
			// Product
			data['product'] = order_recurring_info['product_name'];
			data['quantity'] = order_recurring_info['product_quantity'];

			// Transactions
			data['transactions'] = {};
			
			transactions = await this.model_sale_recurring.getRecurringTransactions(order_recurring_info['order_recurring_id']);

			for (transactions of transaction) {
				data['transactions'].push({
					'date_added' : transaction['date_added'],
					'type'       : transaction['type'],
					'amount'     : this.currency.format(transaction['amount'], order_info['currency_code'], order_info['currency_value'])
				});
			}

			data['buttons'] = await this.load.controller('extension/payment/' + order_info['payment_code'] + '/recurringButtons');

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('sale/recurring_info', data));
		} else {
			return new Action('error/not_found');
		}
	}
}
