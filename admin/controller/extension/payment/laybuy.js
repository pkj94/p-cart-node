const rtrim = require("locutus/php/strings/rtrim");

module.exports = class ControllerExtensionPaymentLaybuy extends Controller {
	error = {};

	async index() {
		const data = {};
		this.load.model('setting/setting', this);

		this.load.model('extension/payment/laybuy', this);

		await this.load.language('extension/payment/laybuy');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			delete this.request.post['laybuy_cron_url'];
			delete this.request.post['laybuy_cron_time'];

			await this.model_setting_setting.editSetting('payment_laybuy', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=payment', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true)
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
			data['payment_laybuy_token'] = md5(new Date().getTime());
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
			data['payment_laybuy_category'] = [];
		}

		data['categories'] = [];

		this.load.model('catalog/category', this);

		for (let category_id of data['payment_laybuy_category']) {
			const category_info = await this.model_catalog_category.getCategory(category_id);

			if (category_info.category_id) {
				data['categories'].push({
					'category_id': category_info['category_id'],
					'name': (category_info['path']) ? category_info['path'] + ' &gt; ' + category_info['name'] : category_info['name']
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
			data['payment_laybuy_customer_group'] = [];
		}

		data['customer_groups'] = [];

		this.load.model('customer/customer_group', this);

		for (let customer_group_id of data['payment_laybuy_customer_group']) {
			const customer_group_info = await this.model_customer_customer_group.getCustomerGroup(customer_group_id);

			if (customer_group_info.customer_group_id) {
				data['customer_groups'].push({
					'customer_group_id': customer_group_info['customer_group_id'],
					'name': customer_group_info['name']
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

		data['laybuy_cron_url'] = HTTPS_CATALOG + '?route=extension/payment/laybuy/cron&token=' + data['payment_laybuy_token'];

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

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		this.load.model('localisation/geo_zone', this);

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		/* Reports tab */
		let filter_order_id = '';
		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		}
		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_dp_percent = '';
		if ((this.request.get['filter_dp_percent'])) {
			filter_dp_percent = this.request.get['filter_dp_percent'];
		}
		let filter_months = '';
		if ((this.request.get['filter_months'])) {
			filter_months = this.request.get['filter_months'];
		}
		let filter_status = '';
		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		}
		let filter_date_added = '';
		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		}
		let sort = 'lt.order_id';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'DESC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['reports'] = {};

		const filter_data = {
			'filter_order_id': filter_order_id,
			'filter_customer': filter_customer,
			'filter_dp_percent': filter_dp_percent,
			'filter_months': filter_months,
			'filter_status': filter_status,
			'filter_date_added': filter_date_added,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const report_total = await this.model_extension_payment_laybuy.getTotalTransactions(filter_data);

		const results = await this.model_extension_payment_laybuy.getTransactions(filter_data);

		for (let result of results) {
			let customer_url = false;

			const customer_id = await this.model_extension_payment_laybuy.getCustomerIdByOrderId(result['order_id']);

			if (customer_id) {
				customer_url = await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id, true);
			}

			data['reports'].push({
				'id': result['laybuy_transaction_id'],
				'order_id': result['order_id'],
				'order_url': await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'], true),
				'customer_name': result['firstname'] + ' ' + result['lastname'],
				'customer_url': customer_url,
				'amount': this.currency.format(result['amount'], result['currency']),
				'dp_percent': result['downpayment'],
				'months': result['months'],
				'dp_amount': this.currency.format(result['downpayment_amount'], result['currency']),
				'first_payment': date(this.language.get('date_format_short'), strtotime(result['first_payment_due'])),
				'last_payment': date(this.language.get('date_format_short'), strtotime(result['last_payment_due'])),
				'status': await this.model_extension_payment_laybuy.getStatusLabel(result['status']),
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'view': await this.url.link('extension/payment/laybuy/transaction', 'user_token=' + this.session.data['user_token'] + '&id=' + result['laybuy_transaction_id'], true)
			});
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		let url = '';

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

		const pagination = new Pagination();
		pagination.total = report_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + url + '&page={page}#reportstab', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (report_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (report_total - Number(this.config.get('config_limit_admin')))) ? report_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), report_total, Math.ceil(report_total / Number(this.config.get('config_limit_admin'))));

		data['filter_order_id'] = filter_order_id;
		data['filter_customer'] = filter_customer;
		data['filter_dp_percent'] = filter_dp_percent;
		data['filter_months'] = filter_months;
		data['filter_status'] = filter_status;
		data['filter_date_added'] = filter_date_added;

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

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('extension/payment/laybuy', data));
	}

	async fetch() {
		this.load.model('extension/payment/laybuy', this);

		await this.model_extension_payment_laybuy.log('Fetching transactions');

		if (await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			await this.load.language('extension/payment/laybuy');

			let fetched = 0;

			const paypal_profile_id_array = await this.model_extension_payment_laybuy.getPayPalProfileIds();

			if (paypal_profile_id_array) {
				let paypal_profile_ids = '';

				for (let profile_id of paypal_profile_id_array) {
					paypal_profile_ids += profile_id['paypal_profile_id'] + ',';
				}

				paypal_profile_ids = rtrim(paypal_profile_ids, ',');

				let data_string = 'mid=' + this.config.get('payment_laybuys_membership_id') + '&' + 'profileIds=' + paypal_profile_ids;
				let data = {
					mid: this.config.get('payment_laybuys_membership_id'),
					profileIds: paypal_profile_ids
				}
				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				await this.model_extension_payment_laybuy.log('API URL: ' + this.config.get('payment_laybuy_api_url'));
				// console.log('Hiii', data, this.config.get('payment_laybuy_api_url'))
				try {
					const response = await require('axios').post(this.config.get('payment_laybuy_api_url'), data, {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						timeout: 30000
					});
					let results = response.data;
					await this.model_extension_payment_laybuy.log('Response: ' + JSON.stringify(results, true));

					if (results) {
						for (let [laybuy_ref_id, reports] of Object.entries(results)) {
							let status = reports['status'];

							let report = reports['report']||{};

							let transaction = {};

							transaction = await this.model_extension_payment_laybuy.getTransactionByLayBuyRefId(laybuy_ref_id);

							let order_id = transaction['order_id'];

							let paypal_profile_id = transaction['paypal_profile_id'];

							let months = transaction['months'];

							let report_content = [];

							let pending_flag = false;

							let next_payment_status = this.language.get('text_status_1');
							let next_payment_date = '', month1 = 0;
							for (let [month, payment] of Object.entries(report)) {
								payment['paymentDate'] = date('Y-m-d h:i:s', strtotime(str_replace('/', '-', payment['paymentDate'])));
								date = date(this.language.get('date_format_short'), strtotime(payment['paymentDate']));
								next_payment_date = payment['paymentDate'];

								if (payment['type'] == 'd') {
									report_content.push({
										'instalment': 0,
										'amount': this.currency.format(payment['amount'], transaction['currency']),
										'date': date,
										'pp_trans_id': payment['txnID'],
										'status': payment['paymentStatus']
									});
								} else if (payment['type'] == 'p') {
									pending_flag = true;

									report_content.push({
										'instalment': month,
										'amount': this.currency.format(payment['amount'], transaction['currency']),
										'date': date,
										'pp_trans_id': payment['txnID'],
										'status': payment['paymentStatus']
									});

									next_payment_status = payment['paymentStatus'];
								}
								month1 = month;
							}
							let start_index = month1 + 2;
							if (pending_flag) {
								start_index = month1 + 1;
							} else {
								start_index = month1 + 2;
							}

							if (month1 < months) {
								for (month1 = 1; month1 <= months; month1++) {
									next_payment_date = date("Y-m-d h:i:s", strtotime(next_payment_date + " +1 month"));
									let date = date(this.language.get('date_format_short'), new Date(next_payment_date));

									report_content.push({
										'instalment': month,
										'amount': this.currency.format(transaction['payment_amounts'], transaction['currency']),
										'date': date,
										'pp_trans_id': '',
										'status': next_payment_status
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
					await this.session.save(this.session.data);
					this.response.setRedirect(await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true));
				} catch (error) {
					console.log(error)
					await this.model_extension_payment_laybuy.log('Error: ' + JSON.stringify(error, true));
				}


			} else {
				await this.model_extension_payment_laybuy.log('No PayPal Profile IDs to update');

				this.session.data['success'] = this.language.get('text_fetched_none');
				await this.session.save(this.session.data);
				this.response.setRedirect(await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'], true));
			}
		} else {
			await this.model_extension_payment_laybuy.log('User does not have permission');
		}
	}

	async install() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/laybuy', this);

			await this.model_extension_payment_laybuy.install();
		}
	}

	async uninstall() {
		if (await this.user.hasPermission('modify', 'marketplace/extension')) {
			this.load.model('extension/payment/laybuy', this);

			await this.model_extension_payment_laybuy.uninstall();
		}
	}

	async transaction(order_page = false) {
		this.load.model('extension/payment/laybuy', this);

		await this.load.language('extension/payment/laybuy');
		let id = 0;
		if ((this.request.get['id'])) {
			id = this.request.get['id'];
		}

		data['id'] = id;

		if (!order_page) {
			this.document.setTitle(this.language.get('heading_transaction_title'));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '#reportstab', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_transaction_title'),
			'href': await this.url.link('extension/payment/laybuy/transaction', 'user_token=' + this.session.data['user_token'] + '&id=' + id, true)
		});

		data['heading_title'] = this.language.get('heading_transaction_title');

		data['button_cancel'] = this.language.get('button_cancel');

		data['cancel'] = await this.url.link('extension/payment/laybuy', 'user_token=' + this.session.data['user_token'] + '#reportstab', true);

		const transaction_info = await this.model_extension_payment_laybuy.getTransaction(id);

		if (transaction_info) {
			data['initial_payments'] = await this.model_extension_payment_laybuy.getInitialPayments();

			data['months'] = await this.model_extension_payment_laybuy.getMonths();

			data['currency_symbol_left'] = this.currency.getSymbolLeft(transaction_info['currency']);

			data['currency_symbol_right'] = this.currency.getSymbolRight(transaction_info['currency']);

			data['store_url'] = HTTPS_CATALOG;

			data['api_key'] = await this.getApiKey();

			this.load.model('sale/order', this);

			const order = await this.model_sale_order.getOrder(transaction_info['order_id']);

			data['order_info'] = {
				'currency_value': order['currency_value']
			};

			data['total'] = await this.model_extension_payment_laybuy.getRemainingAmount(transaction_info['amount'], transaction_info['downpayment_amount'], transaction_info['payment_amounts'], transaction_info['transaction']);

			data['transaction'] = {
				'paypal_profile_id': transaction_info['paypal_profile_id'],
				'laybuy_ref_no': transaction_info['laybuy_ref_no'],
				'order_id': transaction_info['order_id'],
				'firstname': transaction_info['firstname'],
				'lastname': transaction_info['lastname'],
				'email': transaction_info['email'],
				'address': transaction_info['address'],
				'suburb': transaction_info['suburb'],
				'state': transaction_info['state'],
				'country': transaction_info['country'],
				'postcode': transaction_info['postcode'],
				'status_id': transaction_info['status'],
				'status': await this.model_extension_payment_laybuy.getStatusLabel(transaction_info['status']),
				'amount': this.currency.format(transaction_info['amount'], transaction_info['currency']),
				'remaining': this.currency.format(await this.model_extension_payment_laybuy.getRemainingAmount(transaction_info['amount'], transaction_info['downpayment_amount'], transaction_info['payment_amounts'], transaction_info['transaction']), transaction_info['currency']),
				'downpayment': transaction_info['downpayment'],
				'months': transaction_info['months'],
				'downpayment_amount': this.currency.format(transaction_info['downpayment_amount'], transaction_info['currency']),
				'payment_amounts': this.currency.format(transaction_info['payment_amounts'], transaction_info['currency']),
				'first_payment_due': date(this.language.get('date_format_short'), strtotime(transaction_info['first_payment_due'])),
				'last_payment_due': date(this.language.get('date_format_short'), strtotime(transaction_info['last_payment_due'])),
				'report': JSON.parse(transaction_info['report'], true)
			};
		} else {
			data['transaction'] = {};

			data['text_not_found'] = this.language.get('text_not_found');
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.session.data['error_warning'])) {
			data['error_warning'] = this.session.data['error_warning'];

			delete this.session.data['error_warning'];
		} else {
			data['error_warning'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		if (order_page) {
			return data;
		}

		this.response.setOutput(await this.load.view('extension/payment/laybuy_transaction', data));
	}

	async cancel() {
		this.load.model('extension/payment/laybuy', this);

		await this.model_extension_payment_laybuy.log('Canceling transaction');

		if (this.request.get['source'] == 'order') {
			await this.model_extension_payment_laybuy.log('Called from order page');
		} else {
			await this.model_extension_payment_laybuy.log('Called from extension page');
		}

		if (await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			await this.load.language('extension/payment/laybuy');

			const json = {};

			let id = this.request.get['id'];

			const transaction_info = await this.model_extension_payment_laybuy.getTransaction(id);

			let cancel = false;

			if (!transaction_info['paypal_profile_id']) {
				await this.model_extension_payment_laybuy.log('Transaction has no paypal_profile_id');

				cancel = true;
			}

			if (!cancel) {
				let data = {
					mid: this.config.get('payment_laybuys_membership_id'),
					paypal_profile_id: transaction_info['paypal_profile_id']
				};

				await this.model_extension_payment_laybuy.log('Data String: ' + JSON.stringify(data, true));

				try {
					const response = await require('axios').post('https://lay-buys.com/vtmob/deal5cancel.php', data, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000
					});
					const results = response.data;
					await this.model_extension_payment_laybuy.log('Response: ' + result);

					if (result == 'success') {
						await this.model_extension_payment_laybuy.log('Success');

						cancel = true;
					} else {
						await this.model_extension_payment_laybuy.log('Failure');
					}
				} catch (error) {
					console.error('cURL error:', error);
					await this.model_extension_payment_laybuy.log('cURL error: ' + JSON.stringify(error, true));
				}
			}

			if (cancel) {
				await this.model_extension_payment_laybuy.log('Transaction canceled');

				const report_content = typeof transaction_info['report'] == 'string' ? JSON.parse(transaction_info['report']) : transaction_info['report'];

				for (let array of report_content) {
					array['status'] = array['status'].replace('Pending', 'Canceled');
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
		this.load.model('extension/payment/laybuy', this);

		await this.model_extension_payment_laybuy.log('Revising transaction');

		if (this.request.get['source'] == 'order') {
			await this.model_extension_payment_laybuy.log('Called from order page');
		} else {
			await this.model_extension_payment_laybuy.log('Called from extension page');
		}

		if (await this.user.hasPermission('modify', 'extension/payment/laybuy')) {
			if (this.request.server['method'] == 'POST') {
				await this.load.language('extension/payment/laybuy');

				const json = {};

				let payment_type = this.request.post['payment_type'];

				let amount = this.request.post['amount'];

				let initial = this.request.post['INIT'];

				let months = this.request.post['MONTHS'];

				let id = this.request.get['id'];

				const transaction_info = await this.model_extension_payment_laybuy.getTransaction(id);

				let original = new1 = transaction_info;

				original['transaction_id'] = new1['transaction_id'] = transaction_info['laybuy_transaction_id'];

				original['payment_type'] = new1['payment_type'] = payment_type;

				original['type'] = 'Original';

				new1['type'] = 'New';
				new1['status'] = '50';
				new1['amount'] = amount;
				new1['downpayment'] = initial;
				new1['months'] = months;

				const collection = await this.model_extension_payment_laybuy.getRevisedTransactions(id);

				await this.model_extension_payment_laybuy.log('Collection: ' + JSON.stringify(collection, true));
				let revised_transaction;
				if (collection.length == 2) {
					await this.model_extension_payment_laybuy.log('Collection == 2');

					for (let request of collection) {
						await this.model_extension_payment_laybuy.log('request: ' + JSON.stringify(request, true));

						if (request['type'] == 'Original') {
							await this.model_extension_payment_laybuy.log('Original: ' + JSON.stringify(original, true));

							await this.model_extension_payment_laybuy.updateRevisedTransaction(id, original);
						} else if (request['type'] == 'New') {
							await this.model_extension_payment_laybuy.log('New: ' + JSON.stringify(new1, true));

							await this.model_extension_payment_laybuy.updateRevisedTransaction(id, new1);

							revised_transaction = await this.model_extension_payment_laybuy.getRevisedTransaction(id);
						}
					}
				} else {
					await this.model_extension_payment_laybuy.log('Collection != 2');

					await this.model_extension_payment_laybuy.addRevisedTransaction(original);

					const laybuy_revise_request_id = await this.model_extension_payment_laybuy.addRevisedTransaction(new1);

					await this.model_extension_payment_laybuy.log('laybuy_revise_request_id: ' + laybuy_revise_request_id);

					revised_transaction = await this.model_extension_payment_laybuy.getRevisedTransaction(laybuy_revise_request_id);
				}

				await this.model_extension_payment_laybuy.log('Revised transaction: ' + JSON.stringify(revised_transaction, true));
				let pp = '0';
				let pplan = '0';
				if (revised_transaction['payment_type'] == '1') {
					pp = '1';
					pplan = '1';
				}

				const data = {};

				data['mid'] = this.config.get('payment_laybuys_membership_id');
				data['eml'] = revised_transaction['email'];
				data['prc'] = revised_transaction['amount'];
				data['curr'] = revised_transaction['currency'];
				data['pp'] = pp;
				data['pplan'] = pplan;
				data['init'] = initial;
				data['mnth'] = months;
				data['convrate'] = '1';
				data['id'] = revised_transaction['laybuy_revise_request_id'] + '-' + revised_transaction['order_id'] + ':' + md5(this.config.get('payment_laybuy_token'));
				data['RETURNURL'] = HTTPS_CATALOG + '?route=extension/payment/laybuy/reviseCallback';
				data['CANCELURL'] = HTTPS_CATALOG + '?route=extension/payment/laybuy/reviseCancel';

				let data_string = '';

				for (let [param, value] of Object.entries(data)) {
					data_string += param + '=' + value + '&';
				}

				data_string = rtrim(data_string, '&');

				await this.model_extension_payment_laybuy.log('Data String: ' + data_string);

				try {
					const response = await require('axios').post('https://lay-buys.com/vtmob/deal5.php', data, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 30000
					});
					const results = response.data;
					if (result == 'success') {
						await this.model_extension_payment_laybuy.log('Success');

						await this.model_extension_payment_laybuy.updateTransactionStatus(id, '50');

						json['success'] = this.language.get('text_revise_success');
					} else {
						await this.model_extension_payment_laybuy.log('Failure');

						await this.model_extension_payment_laybuy.log('Response: ' + JSON.stringify(result, true));

						json['error'] = this.language.get('text_revise_failure');
					}
				} catch (error) {
					await this.model_extension_payment_laybuy.log('cURL error: ' + JSON.stringify(error, true));
					await this.model_extension_payment_laybuy.log('Failure');

					await this.model_extension_payment_laybuy.log('Response: ' + JSON.stringify(error, true));

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
		let json = [];

		if ((this.request.get['filter_customer_group'])) {
			this.load.model('customer/customer_group', this);

			const results = await this.model_customer_customer_group.getCustomerGroups();

			for (let result of results) {
				json.push({
					'customer_group_id': result['customer_group_id'],
					'name': strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async order() {
		if (this.config.get('payment_laybuy_status')) {
			this.load.model('extension/payment/laybuy', this);

			await this.load.language('extension/payment/laybuy');

			let order_id = this.request.get['order_id'];

			const transaction_info = await this.model_extension_payment_laybuy.getTransactionByOrderId(order_id);

			let laybuy_transaction_id = transaction_info['laybuy_transaction_id'];

			this.request.get['id'] = laybuy_transaction_id;

			constdata = await this.transaction(true);

			data['store_url'] = HTTPS_CATALOG;

			data['api_key'] = this.getApiKey();

			return await this.load.view('extension/payment/laybuy_order', data);
		}
	}

	async getApiKey() {
		this.load.model('extension/payment/laybuy', this);

		await this.model_extension_payment_laybuy.log('Getting API key');

		this.load.model('user/api', this);

		const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

		if (api_info.api_id) {
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

		return Object.keys(this.error).length ? false : true
	}
}
