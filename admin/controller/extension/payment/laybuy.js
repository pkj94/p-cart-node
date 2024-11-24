module.exports = class ControllerExtensionPaymentLaybuy extends Controller {
	error = {};

	async index() {
		this.load.model('setting/setting',this);

		this.load.model('extension/payment/laybuy');

		await this.load.language('extension/payment/laybuy');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			delete this.request.post['laybuy_cron_url'], this.request.post['laybuy_cron_time']);

			await this.model_setting_setting.editSetting('payment_laybuy', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true);

		data['fetch'] = await this.url.link('extension/payment/laybuy/fetch', 'user_token=' + this.session.data['user_token'] + '#reportstab', true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true);

		if ((this.request.post['payment_laybuys_membership_id'])) {
			data['payment_laybuys_membership_id'] = this.request.post['payment_laybuys_membership_id'];
		} else {
			data['payment_laybuys_membership_id'] = this.config.get('payment_laybuys_membership_id');
		}

		if ((this.request.post['payment_laybuy_token'])) {
			data['payment_laybuy_token'] = this.request.post['payment_laybuy_token'];
		} else if (this.config.has('payment_laybuy_token')) {
			data['payment_laybuy_token'] = this.config.get('payment_laybuy_token');
		} else {
			data['payment_laybuy_token'] = md5(time());
		}

		if ((this.request.post['payment_laybuy_min_deposit'])) {
			data['payment_laybuy_min_deposit'] = this.request.post['payment_laybuy_min_deposit'];
		} else if (this.config.get('payment_laybuy_min_deposit')) {
			data['payment_laybuy_min_deposit'] = this.config.get('payment_laybuy_min_deposit');
		} else {
			data['payment_laybuy_min_deposit'] = '20';
		}

		if ((this.request.post['payment_laybuy_max_deposit'])) {
			data['payment_laybuy_max_deposit'] = this.request.post['payment_laybuy_max_deposit'];
		} else if (this.config.get('payment_laybuy_max_deposit')) {
			data['payment_laybuy_max_deposit'] = this.config.get('payment_laybuy_max_deposit');
		} else {
			data['payment_laybuy_max_deposit'] = '50';
		}

		if ((this.request.post['payment_laybuy_max_months'])) {
			data['payment_laybuy_max_months'] = this.request.post['payment_laybuy_max_months'];
		} else if (this.config.get('payment_laybuy_max_months')) {
			data['payment_laybuy_max_months'] = this.config.get('payment_laybuy_max_months');
		} else {
			data['payment_laybuy_max_months'] = '3';
		}

		if ((this.request.post['payment_laybuy_category'])) {
			data['payment_laybuy_category'] = this.request.post['payment_laybuy_category'];
		} else if (this.config.get('payment_laybuy_category')) {
			data['payment_laybuy_category'] = this.config.get('payment_laybuy_category');
		} else {
			data['payment_laybuy_category'] = {};
		}

		data['categories'] = {};

		this.load.model('catalog/category',this);

		for (data['payment_laybuy_category'] of category_id) {
			category_info = await this.model_catalog_category.getCategory(category_id);

			if (category_info) {
				data['categories'].push({
					'category_id' 	: category_info['category_id'],
					'name' 			: (category_info['path']) ? category_info['path'] + ' &gt; ' + category_info['name'] : category_info['name']
				});
			}
		}

		if ((this.request.post['payment_laybuy_xproducts'])) {
			data['payment_laybuy_xproducts'] = this.request.post['payment_laybuy_xproducts'];
		} else {
			data['payment_laybuy_xproducts'] = this.config.get('payment_laybuy_xproducts');
		}

		if ((this.request.post['payment_laybuy_customer_group'])) {
			data['payment_laybuy_customer_group'] = this.request.post['payment_laybuy_customer_group'];
		} else if (this.config.get('payment_laybuy_customer_group')) {
			data['payment_laybuy_customer_group'] = this.config.get('payment_laybuy_customer_group');
		} else {
			data['payment_laybuy_customer_group'] = {};
		}

		data['customer_groups'] = {};

		this.load.model('customer/customer_group',this);

		for (data['payment_laybuy_customer_group'] of customer_group_id) {
			customer_group_info = await this.model_customer_customer_group.getCustomerGroup(customer_group_id);

			if (customer_group_info) {
				data['customer_groups'].push({
					'customer_group_id' : customer_group_info['customer_group_id'],
					'name'				: customer_group_info['name']
				});
			}
		}

		if ((this.request.post['payment_laybuy_logging'])) {
			data['payment_laybuy_logging'] = this.request.post['payment_laybuy_logging'];
		} else {
			data['payment_laybuy_logging'] = this.config.get('payment_laybuy_logging');
		}

		if ((this.request.post['payment_laybuy_total'])) {
			data['payment_laybuy_total'] = this.request.post['payment_laybuy_total'];
		} else {
			data['payment_laybuy_total'] = this.config.get('payment_laybuy_total');
		}

		if ((this.request.post['payment_laybuy_order_status_id_pending'])) {
			data['payment_laybuy_order_status_id_pending'] = this.request.post['payment_laybuy_order_status_id_pending'];
		} else if (this.config.get('payment_laybuy_order_status_id_pending')) {
			data['payment_laybuy_order_status_id_pending'] = this.config.get('payment_laybuy_order_status_id_pending');
		} else {
			data['payment_laybuy_order_status_id_pending'] = '1';
		}

		if ((this.request.post['payment_laybuy_order_status_id_canceled'])) {
			data['payment_laybuy_order_status_id_canceled'] = this.request.post['payment_laybuy_order_status_id_canceled'];
		} else if (this.config.get('payment_laybuy_order_status_id_canceled')) {
			data['payment_laybuy_order_status_id_canceled'] = this.config.get('payment_laybuy_order_status_id_canceled');
		} else {
			data['payment_laybuy_order_status_id_canceled'] = '7';
		}

		if ((this.request.post['payment_laybuy_order_status_id_processing'])) {
			data['payment_laybuy_order_status_id_processing'] = this.request.post['payment_laybuy_order_status_id_processing'];
		} else if (this.config.get('payment_laybuy_order_status_id_processing')) {
			data['payment_laybuy_order_status_id_processing'] = this.config.get('payment_laybuy_order_status_id_processing');
		} else {
			data['payment_laybuy_order_status_id_processing'] = '2';
		}

		if ((this.request.post['payment_laybuy_gateway_url'])) {
			data['payment_laybuy_gateway_url'] = this.request.post['payment_laybuy_gateway_url'];
		} else if (this.config.get('payment_laybuy_gateway_url')) {
			data['payment_laybuy_gateway_url'] = this.config.get('payment_laybuy_gateway_url');
		} else {
			data['payment_laybuy_gateway_url'] = 'http://lay-buys.com/gateway/';
		}

		if ((this.request.post['payment_laybuy_api_url'])) {
			data['payment_laybuy_api_url'] = this.request.post['payment_laybuy_api_url'];
		} else if (this.config.get('payment_laybuy_api_url')) {
			data['payment_laybuy_api_url'] = this.config.get('payment_laybuy_api_url');
		} else {
			data['payment_laybuy_api_url'] = 'https://lay-buys.com/report/';
		}

		if ((this.request.post['payment_laybuy_geo_zone_id'])) {
			data['payment_laybuy_geo_zone_id'] = this.request.post['payment_laybuy_geo_zone_id'];
		} else {
			data['payment_laybuy_geo_zone_id'] = this.config.get('payment_laybuy_geo_zone_id');
		}

		if ((this.request.post['payment_laybuy_status'])) {
			data['payment_laybuy_status'] = this.request.post['payment_laybuy_status'];
		} else {
			data['payment_laybuy_status'] = this.config.get('payment_laybuy_status');
		}

		if ((this.request.post['payment_laybuy_sort_order'])) {
			data['payment_laybuy_sort_order'] = this.request.post['payment_laybuy_sort_order'];
		} else {
			data['payment_laybuy_sort_order'] = this.config.get('payment_laybuy_sort_order');
		}

		data['laybuy_cron_url'] = HTTPS_CATALOG + 'index.php?route=extension/payment/laybuy/cron&token=' + data['payment_laybuy_token'];

		if (this.config.get('laybuy_cron_time')) {
			data['laybuy_cron_time'] = date(this.language.get('datetime_format'), strtotime(this.config.get('laybuy_cron_time')));
		} else {
			data['laybuy_cron_time'] = this.language.get('text_no_cron_time');
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['laybuys_membership_id'])) {
			data['error_laybuys_membership_id'] = this.error['laybuys_membership_id'];
		} else {
			data['error_laybuys_membership_id'] = '';
		}

		if ((this.error['laybuy_token'])) {
			data['error_laybuy_token'] = this.error['laybuy_token'];
		} else {
			data['error_laybuy_token'] = '';
		}

		if ((this.error['laybuy_min_deposit'])) {
			data['error_laybuy_min_deposit'] = this.error['laybuy_min_deposit'];
		} else {
			data['error_laybuy_min_deposit'] = '';
		}

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		/* Reports tab */
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

		if ((this.request.get['filter_dp_percent'])) {
			filter_dp_percent = this.request.get['filter_dp_percent'];
		} else {
			filter_dp_percent = '';
		}

		if ((this.request.get['filter_months'])) {
			filter_months = this.request.get['filter_months'];
		} else {
			filter_months = '';
		}

		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		} else {
			filter_status = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'lt.order_id';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'DESC';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		data['reports'] = {};

		filter_data = array(
			'filter_order_id'	: filter_order_id,
			'filter_customer'	: filter_customer,
			'filter_dp_percent'	: filter_dp_percent,
			'filter_months'		: filter_months,
			'filter_status'		: filter_status,
			'filter_date_added'	: filter_date_added,
			'sort'				: sort,
			'order'				: order,
			'start'				: (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'				: Number(this.config.get('config_limit_admin'))
		});

		report_total = await this.model_extension_payment_laybuy.getTotalTransactions(filter_data);

		results = await this.model_extension_payment_laybuy.getTransactions(filter_data);

		for (let result of results) {
			customer_url = false;

			customer_id = await this.model_extension_payment_laybuy.getCustomerIdByOrderId(result['order_id']);

			if (customer_id) {
				customer_url = await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id, true);
			}

			data['reports'].push({
				'id'			: result['laybuy_transaction_id'],
				'order_id'		: result['order_id'],
				'order_url'		: await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'], true),
				'customer_name'	: result['firstname'] + ' ' + result['lastname'],
				'customer_url'	: customer_url,
				'amount'		: this.currency.format(result['amount'], result['currency']),
				'dp_percent'	: result['downpayment'],
				'months'		: result['months'],
				'dp_amount'		: this.currency.format(result['downpayment_amount'], result['currency']),
				'first_payment'	: date(this.language.get('date_format_short'), strtotime(result['first_payment_due'])),
				'last_payment'	: date(this.language.get('date_format_short'), strtotime(result['last_payment_due'])),
				'status'		: await this.model_extension_payment_laybuy.getStatusLabel(result['status']),
				'date_added'	: date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'view'			: await this.url.link('extension/payment/laybuy/transaction', 'user_token=' + this.session.data['user_token'] + '&id=' + result['laybuy_transaction_id'], true)
			});
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + encodeURIComponent(html_entity_decode(this.request.get['filter_order_id']));
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_dp_percent'])) {
			url += '&filter_dp_percent=' + encodeURIComponent(html_entity_decode(this.request.get['filter_dp_percent']));
		}

		if ((this.request.get['filter_months'])) {
			url += '&filter_months=' + this.request.get['filter_months'];
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

		data['sort_order_id'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.order_id' + url + '#reportstab', true);
		data['sort_customer'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url + '#reportstab', true);
		data['sort_amount'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.amount' + url + '#reportstab', true);
		data['sort_dp_percent'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.downpayment' + url + '#reportstab', true);
		data['sort_months'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.months' + url + '#reportstab', true);
		data['sort_dp_amount'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.downpayment_amount' + url + '#reportstab', true);
		data['sort_first_payment'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.first_payment_due' + url + '#reportstab', true);
		data['sort_last_payment'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.last_payment_due' + url + '#reportstab', true);
		data['sort_status'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.status' + url + '#reportstab', true);
		data['sort_date_added'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '&sort=lt.date_added' + url + '#reportstab', true);

		url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + this.request.get['filter_customer'];
		}

		if ((this.request.get['filter_dp_percent'])) {
			url += '&filter_dp_percent=' + this.request.get['filter_dp_percent'];
		}

		if ((this.request.get['filter_months'])) {
			url += '&filter_months=' + this.request.get['filter_months'];
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
		pagination.total = report_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + url + '&page={page}#reportstab', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (report_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (report_total - Number(this.config.get('config_limit_admin')))) ? report_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), report_total, Math.ceil(report_total / Number(this.config.get('config_limit_admin'))));

		data['filter_order_id']	= filter_order_id;
		data['filter_customer']	= filter_customer;
		data['filter_dp_percent']	= filter_dp_percent;
		data['filter_months']		= filter_months;
		data['filter_status']		= filter_status;
		data['filter_date_added']	= filter_date_added;

		data['sort'] = sort;
		data['order'] = order;

		data['transaction_statuses'] = await this.model_extension_payment_laybuy.getTransactionStatuses();
		/* End of Reports Tab */

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
		
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/payment/laybuy', data));
	}

	async fetch() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Fetching transactions');

		if (await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			await this.load.language('extension/payment/laybuy');

			json = {};

			fetched = 0;

			paypal_profile_id_array = await this.model_extension_payment_laybuy.getPayPalProfileIds();

			if (paypal_profile_id_array) {
				paypal_profile_ids = '';

				for (paypal_profile_id_array of profile_id) {
					paypal_profile_ids += profile_id['paypal_profile_id'] + ',';
				}

				paypal_profile_ids = rtrim(paypal_profile_ids, ',');

				data_string = 'mid=' + this.config.get('payment_laybuys_membership_id') + '&' + 'profileIds=' + paypal_profile_ids;

				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				await this.model_extension_payment_laybuy.log('API URL: ' + this.config.get('payment_laybuy_api_url'));

				ch = curl_init();
				curl_setopt(ch, CURLOPT_URL, this.config.get('payment_laybuy_api_url'));
				curl_setopt(ch, CURLOPT_POST, true);
				curl_setopt(ch, CURLOPT_POSTFIELDS, data_string);
				curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt(ch, CURLOPT_HEADER, false);
				curl_setopt(ch, CURLOPT_TIMEOUT, 30);
				curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
				result = curl_exec(ch);
				if (curl_errno(ch)) {
					await this.model_extension_payment_laybuy.log('cURL error: ' + curl_errno(ch));
				}
				curl_close(ch);

				results = JSON.parse(result, true);

				await this.model_extension_payment_laybuy.log('Response: ' + print_r(results, true));

				if (results) {
					for (results of laybuy_ref_id : reports) {
						status = reports['status'];

						report = reports['report'];

						transaction = {};

						transaction = await this.model_extension_payment_laybuy.getTransactionByLayBuyRefId(laybuy_ref_id);

						order_id = transaction['order_id'];

						paypal_profile_id = transaction['paypal_profile_id'];

						months = transaction['months'];

						report_content = {};

						pending_flag = false;

						next_payment_status = this.language.get('text_status_1');

						for (report of month : payment) {
							payment['paymentDate'] = date('Y-m-d h:i:s', strtotime(str_replace('/', '-', payment['paymentDate'])));
							date = date(this.language.get('date_format_short'), strtotime(payment['paymentDate']));
							next_payment_date = payment['paymentDate'];

							if (payment['type'] == 'd') {
								report_content.push({
									'instalment'	: 0,
									'amount'		: this.currency.format(payment['amount'], transaction['currency']),
									'date'			: date,
									'pp_trans_id'	: payment['txnID'],
									'status'		: payment['paymentStatus']
								});
							} else if (payment['type'] == 'p') {
								pending_flag = true;

								report_content.push({
									'instalment'	: month,
									'amount'		: this.currency.format(payment['amount'], transaction['currency']),
									'date'			: date,
									'pp_trans_id'	: payment['txnID'],
									'status'		: payment['paymentStatus']
								});

								next_payment_status = payment['paymentStatus'];
							}
						}

						if (pending_flag) {
							start_index = month + 1;
						} else {
							start_index = month + 2;
						}

						if (month < months) {
							for (month = 1; month <= months; month++) {
								next_payment_date = date("Y-m-d h:i:s", strtotime(next_payment_date + " +1 month"));
								date = date(this.language.get('date_format_short'), strtotime(next_payment_date));

								report_content.push({
									'instalment'	: month,
									'amount'		: this.currency.format(transaction['payment_amounts'], transaction['currency']),
									'date'			: date,
									'pp_trans_id'	: '',
									'status'		: next_payment_status
								});
							}
						}

						report_content = JSON.stringify(report_content);

						switch (status) {
							case -1: // Cancel
								await this.model_extension_payment_laybuy.log('Transaction #' + transaction['laybuy_transaction_id'] + ' canceled');
								await this.model_extension_payment_laybuy.updateOrderStatus(order_id, this.config.get('payment_laybuy_order_status_id_canceled'), this.language.get('text_comment'));
								await this.model_extension_payment_laybuy.updateTransaction(transaction['laybuy_transaction_id'], '7', report_content, start_index);
								fetched++;
								break;
							case 0: // Pending
								await this.model_extension_payment_laybuy.log('Transaction #' + transaction['laybuy_transaction_id'] + ' still pending');
								await this.model_extension_payment_laybuy.updateTransaction(transaction['laybuy_transaction_id'], transaction['status'], report_content, start_index);
								fetched++;
								break;
							case 1: // Paid
								await this.model_extension_payment_laybuy.log('Transaction #' + transaction['laybuy_transaction_id'] + ' paid');
								await this.model_extension_payment_laybuy.updateOrderStatus(order_id, this.config.get('payment_laybuy_order_status_id_processing'), this.language.get('text_comment'));
								await this.model_extension_payment_laybuy.updateTransaction(transaction['laybuy_transaction_id'], '5', report_content, start_index);
								fetched++;
								break;
						}
					}
				}

				if (fetched) {
					this.session.data['success'] = sprintf(this.language.get('text_fetched_some'), fetched);
				} else {
					this.session.data['success'] = this.language.get('text_fetched_none');
				}

				this.response.setRedirect(await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true));
			} else {
				await this.model_extension_payment_laybuy.log('No PayPal Profile IDs to update');

				this.session.data['success'] = this.language.get('text_fetched_none');

				this.response.setRedirect(await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true));
			}
		} else {
			await this.model_extension_payment_laybuy.log('User does not have permission');
		}
	}

	async install() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/laybuy');

			await this.model_extension_payment_laybuy.install();
		}
	}

	async uninstall() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/laybuy');

			await this.model_extension_payment_laybuy.uninstall();
		}
	}

	async transaction(order_page = false) {
		this.load.model('extension/payment/laybuy');

		await this.load.language('extension/payment/laybuy');

		if ((this.request.get['id'])) {
			id = this.request.get['id'];
		} else {
			id = 0;
		}

		data['id'] = id;

		if (!order_page) {
			this.document.setTitle(this.language.get('heading_transaction_title'));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '#reportstab', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_transaction_title'),
			'href' : await this.url.link('extension/payment/laybuy/transaction', 'user_token=' + this.session.data['user_token'] + '&id=' + id, true)
		});

		data['heading_title'] = this.language.get('heading_transaction_title');

		data['button_cancel'] = this.language.get('button_cancel');

		data['cancel'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '#reportstab', true);

		transaction_info = await this.model_extension_payment_laybuy.getTransaction(id);

		if (transaction_info) {
			data['initial_payments'] = await this.model_extension_payment_laybuy.getInitialPayments();

			data['months'] = await this.model_extension_payment_laybuy.getMonths();

			data['currency_symbol_left'] = this.currency.getSymbolLeft(transaction_info['currency']);

			data['currency_symbol_right'] = this.currency.getSymbolRight(transaction_info['currency']);

			data['store_url'] = HTTPS_CATALOG;

			data['api_key'] = this.getApiKey();

			this.load.model('sale/order',this);

			order = await this.model_sale_order.getOrder(transaction_info['order_id']);

			data['order_info'] = array(
				'currency_value' : order['currency_value']
			});

			data['total'] = await this.model_extension_payment_laybuy.getRemainingAmount(transaction_info['amount'], transaction_info['downpayment_amount'], transaction_info['payment_amounts'], transaction_info['transaction']);

			data['transaction'] = array(
				'paypal_profile_id'  : transaction_info['paypal_profile_id'],
				'laybuy_ref_no' 	 : transaction_info['laybuy_ref_no'],
				'order_id'        	 : transaction_info['order_id'],
				'firstname'          : transaction_info['firstname'],
				'lastname'           : transaction_info['lastname'],
				'email'	  			 : transaction_info['email'],
				'address'	  		 : transaction_info['address'],
				'suburb'			 : transaction_info['suburb'],
				'state'				 : transaction_info['state'],
				'country' 			 : transaction_info['country'],
				'postcode'  		 : transaction_info['postcode'],
				'status_id'			 : transaction_info['status'],
				'status'          	 : await this.model_extension_payment_laybuy.getStatusLabel(transaction_info['status']),
				'amount'          	 : this.currency.format(transaction_info['amount'], transaction_info['currency']),
				'remaining'        	 : this.currency.format(await this.model_extension_payment_laybuy.getRemainingAmount(transaction_info['amount'], transaction_info['downpayment_amount'], transaction_info['payment_amounts'], transaction_info['transaction']), transaction_info['currency']),
				'downpayment'	  	 : transaction_info['downpayment'],
				'months'	  		 : transaction_info['months'],
				'downpayment_amount' : this.currency.format(transaction_info['downpayment_amount'], transaction_info['currency']),
				'payment_amounts'	 : this.currency.format(transaction_info['payment_amounts'], transaction_info['currency']),
				'first_payment_due'  : date(this.language.get('date_format_short'), strtotime(transaction_info['first_payment_due'])),
				'last_payment_due'   : date(this.language.get('date_format_short'), strtotime(transaction_info['last_payment_due'])),
				'report'        	 : JSON.parse(transaction_info['report'], true)
			});
		} else {
			data['transaction'] = {};

			data['text_not_found'] = this.language.get('text_not_found');
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.session.data['error_warning'])) {
			data['error_warning'] = this.session.data['error_warning'];

			delete this.session.data['error_warning']);
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		if (order_page) {
			return data;
		}

		this.response.setOutput(await this.load.view('extension/payment/laybuy_transaction', data));
	}

	async cancel() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Canceling transaction');

		if (this.request.get['source'] == 'order') {
			await this.model_extension_payment_laybuy.log('Called from order page');
		} else {
			await this.model_extension_payment_laybuy.log('Called from extension page');
		}

		if (await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			await this.load.language('extension/payment/laybuy');

			json = {};

			id = this.request.get['id'];

			transaction_info = await this.model_extension_payment_laybuy.getTransaction(id);

			cancel = false;

			if (!transaction_info['paypal_profile_id']) {
				await this.model_extension_payment_laybuy.log('Transaction has no paypal_profile_id');

				cancel = true;
			}

			if (!cancel) {
				data_string = 'mid=' + this.config.get('payment_laybuys_membership_id') + '&' + 'paypal_profile_id=' + transaction_info['paypal_profile_id'];

				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				ch = curl_init();
				url = 'https://lay-buys.com/vtmob/deal5cancel.php';
				curl_setopt(ch, CURLOPT_URL, url);
				curl_setopt(ch, CURLOPT_POST, true);
				curl_setopt(ch, CURLOPT_POSTFIELDS, data_string);
				curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt(ch, CURLOPT_HEADER, false);
				curl_setopt(ch, CURLOPT_TIMEOUT, 30);
				curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
				result = curl_exec(ch);
				if (curl_errno(ch)) {
					await this.model_extension_payment_laybuy.log('cURL error: ' + curl_errno(ch));
				}
				curl_close(ch);

				await this.model_extension_payment_laybuy.log('Response: ' + result);

				if (result == 'success') {
					await this.model_extension_payment_laybuy.log('Success');

					cancel = true;
				} else {
					await this.model_extension_payment_laybuy.log('Failure');
				}
			}

			if (cancel) {
				await this.model_extension_payment_laybuy.log('Transaction canceled');

				report_content = JSON.parse(transaction_info['report'], true);

				for (report_content of &array) {
					array['status'] = str_replace('Pending', 'Canceled', array['status']);
				}

				report_content = JSON.stringify(report_content);

				await this.model_extension_payment_laybuy.updateTransaction(transaction_info['laybuy_transaction_id'], '7', report_content, transaction_info['transaction']);

				json['success'] = this.language.get('text_cancel_success');

				json['order_id'] = transaction_info['order_id'];

				json['order_status_id'] = this.config.get('payment_laybuy_order_status_id_canceled');

				json['comment'] = sprintf(this.language.get('text_comment_canceled'), transaction_info['paypal_profile_id']);
			} else {
				json['error'] = this.language.get('text_cancel_failure');
			}

			if (this.request.get['source'] == 'order') {
				json['reload'] = await this.url.link('sale/order/info', 'order_id=' + transaction_info['order_id'] + '&user_token=' + this.session.data['user_token'], true);
			} else {
				json['reload'] = await this.url.link('extension/payment/laybuy/transaction', 'user_token=' + this.session.data['user_token'] + '&id=' + id, true);
			}

			this.response.setOutput(json);
		} else {
			await this.model_extension_payment_laybuy.log('User does not have permission');
		}
	}

	async revise() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Revising transaction');

		if (this.request.get['source'] == 'order') {
			await this.model_extension_payment_laybuy.log('Called from order page');
		} else {
			await this.model_extension_payment_laybuy.log('Called from extension page');
		}

		if (await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			if (this.request.server['method'] == 'POST') {
				await this.load.language('extension/payment/laybuy');

				json = {};

				payment_type = this.request.post['payment_type'];

				amount = this.request.post['amount'];

				initial = this.request.post['INIT'];

				months = this.request.post['MONTHS'];

				id = this.request.get['id'];

				transaction_info = await this.model_extension_payment_laybuy.getTransaction(id);

				original = new = transaction_info;

				original['transaction_id'] = new['transaction_id'] = transaction_info['laybuy_transaction_id'];

				original['payment_type'] = new['payment_type'] = payment_type;

				original['type'] = 'Original';

				new['type'] = 'New';
				new['status'] = '50';
				new['amount'] = amount;
				new['downpayment'] = initial;
				new['months'] = months;

				collection = await this.model_extension_payment_laybuy.getRevisedTransactions(id);

				await this.model_extension_payment_laybuy.log('Collection: ' + print_r(collection, true));

				if (count(collection) == 2) {
					await this.model_extension_payment_laybuy.log('Collection == 2');

					for (collection of request) {
						await this.model_extension_payment_laybuy.log('request: ' + print_r(request, true));

						if (request['type'] == 'Original') {
							await this.model_extension_payment_laybuy.log('Original: ' + print_r(original, true));

							await this.model_extension_payment_laybuy.updateRevisedTransaction(id, original);
						} else if (request['type'] == 'New') {
							await this.model_extension_payment_laybuy.log('New: ' + print_r(new, true));

							await this.model_extension_payment_laybuy.updateRevisedTransaction(id, new);

							revised_transaction = await this.model_extension_payment_laybuy.getRevisedTransaction(id);
						}
					}
				} else {
					await this.model_extension_payment_laybuy.log('Collection != 2');

					await this.model_extension_payment_laybuy.addRevisedTransaction(original);

					laybuy_revise_request_id = await this.model_extension_payment_laybuy.addRevisedTransaction(new);

					await this.model_extension_payment_laybuy.log('laybuy_revise_request_id: ' + laybuy_revise_request_id);

					revised_transaction = await this.model_extension_payment_laybuy.getRevisedTransaction(laybuy_revise_request_id);
				}

				await this.model_extension_payment_laybuy.log('Revised transaction: ' + print_r(revised_transaction, true));

				if (revised_transaction['payment_type'] == '1') {
					pp = '1';
					pplan = '1';
				} else {
					pp = '0';
					pplan = '0';
				}

				data = {};

				data['mid']       = this.config.get('payment_laybuys_membership_id');
				data['eml']       = revised_transaction['email'];
				data['prc']       = revised_transaction['amount'];
				data['curr']      = revised_transaction['currency'];
				data['pp']        = pp;
				data['pplan']     = pplan;
				data['init']      = initial;
				data['mnth']      = months;
				data['convrate']  = '1';
				data['id']        = revised_transaction['laybuy_revise_request_id'] + '-' + revised_transaction['order_id'] + ':' + md5(this.config.get('payment_laybuy_token'));
				data['RETURNURL'] = HTTPS_CATALOG + 'index.php?route=extension/payment/laybuy/reviseCallback';
				data['CANCELURL'] = HTTPS_CATALOG + 'index.php?route=extension/payment/laybuy/reviseCancel';

				data_string = '';

				for (data of param : value) {
					data_string += param + '=' + value + '&';
				}

				data_string = rtrim(data_string, '&');

				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				ch = curl_init();
				url = 'https://lay-buys.com/vtmob/deal5.php';
				curl_setopt(ch, CURLOPT_URL, url);
				curl_setopt(ch, CURLOPT_POST, true);
				curl_setopt(ch, CURLOPT_POSTFIELDS, data_string);
				curl_setopt(ch, CURLOPT_RETURNTRANSFER, true);
				curl_setopt(ch, CURLOPT_HEADER, false);
				curl_setopt(ch, CURLOPT_TIMEOUT, 30);
				curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, false);
				result = curl_exec(ch);
				if (curl_errno(ch)) {
					await this.model_extension_payment_laybuy.log('cURL error: ' + curl_errno(ch));
				}
				curl_close(ch);

				if (result == 'success') {
					await this.model_extension_payment_laybuy.log('Success');

					await this.model_extension_payment_laybuy.updateTransactionStatus(id, '50');

					json['success'] = this.language.get('text_revise_success');
				} else {
					await this.model_extension_payment_laybuy.log('Failure');

					await this.model_extension_payment_laybuy.log('Response: ' + print_r(result, true));

					json['error'] = this.language.get('text_revise_failure');
				}

				if (this.request.get['source'] == 'order') {
					json['reload'] = await this.url.link('sale/order/info', 'order_id=' + transaction_info['order_id'] + '&user_token=' + this.session.data['user_token'], true);
				} else {
					json['reload'] = await this.url.link('extension/payment/laybuy/transaction', 'user_token=' + this.session.data['user_token'] + '&id=' + id, true);
				}

				this.response.setOutput(json);
			} else {
				await this.model_extension_payment_laybuy.log('No _POST data');
			}
		} else {
			await this.model_extension_payment_laybuy.log('User does not have permission');
		}
	}

	async autocomplete() {
		json = {};

		if ((this.request.get['filter_customer_group'])) {
			this.load.model('customer/customer_group',this);

			results = await this.model_customer_customer_group.getCustomerGroups();

			for (let result of results) {
				json.push({
					'customer_group_id' : result['customer_group_id'],
					'name'       		: strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async order() {
		if (this.config.get('payment_laybuy_status')) {
			this.load.model('extension/payment/laybuy');

			await this.load.language('extension/payment/laybuy');

			order_id = this.request.get['order_id'];

			transaction_info = await this.model_extension_payment_laybuy.getTransactionByOrderId(order_id);

			laybuy_transaction_id = transaction_info['laybuy_transaction_id'];

			this.request.get['id'] = laybuy_transaction_id;

			data = this.transaction(true);

			data['store_url'] = HTTPS_CATALOG;

			data['api_key'] = this.getApiKey();

			return await this.load.view('extension/payment/laybuy_order', data);
		}
	}

	private function getApiKey() {
		this.load.model('extension/payment/laybuy');

		await this.model_extension_payment_laybuy.log('Getting API key');

		this.load.model('user/api');

		api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

		if (api_info) {
			await this.model_extension_payment_laybuy.log('API key: ' + api_info['key']);

			return api_info['key'];
		} else {
			await this.model_extension_payment_laybuy.log('No API info');

			return;
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['payment_laybuys_membership_id']) {
			this.error['laybuys_membership_id'] = this.language.get('error_membership_id');
		}

		if (!this.request.post['payment_laybuy_token']) {
			this.error['laybuy_token'] = this.language.get('error_token');
		}

		if (this.request.post['payment_laybuy_min_deposit'] > this.request.post['payment_laybuy_max_deposit']) {
			this.error['laybuy_min_deposit'] = this.language.get('error_min_deposit');
		}

		return Object.keys(this.error).length?false:true
	}
}
