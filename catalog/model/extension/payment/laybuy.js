module.exports = class ModelExtensionPaymentLaybuy extends Model {
	async addTransaction(data, status) {
		this.log('Report: ' + print_r(data, true), '1');

		this.log('Status: ' + status, '1');

		await this.db.query("INSERT INTO `" + DB_PREFIX + "laybuy_transaction` SET `order_id` = '" + data['order_id'] + "', `firstname` = '" + this.db.escape(data['firstname']) + "', `lastname` = '" + this.db.escape(data['lastname']) + "', `address` = '" + this.db.escape(data['address']) + "', `suburb` = '" + this.db.escape(data['suburb']) + "', `state` = '" + this.db.escape(data['state']) + "', `country` = '" + this.db.escape(data['country']) + "', `postcode` = '" + this.db.escape(data['postcode']) + "', `email` = '" + this.db.escape(data['email']) + "', `amount` = '" + data['amount'] + "', `currency` = '" + this.db.escape(data['currency']) + "', `downpayment` = '" + this.db.escape(data['downpayment']) + "', `months` = '" + data['months'] + "', `downpayment_amount` = '" + data['downpayment_amount'] + "', `payment_amounts` = '" + data['payment_amounts'] + "', `first_payment_due` = '" + this.db.escape(data['first_payment_due']) + "', `last_payment_due` = '" + this.db.escape(data['last_payment_due']) + "', `store_id` = '" + data['store_id'] + "', `status` = '" + status + "', `report` = '" + this.db.escape(data['report']) + "', `paypal_profile_id` = '" + this.db.escape(data['paypal_profile_id']) + "', `laybuy_ref_no` = '" + data['laybuy_ref_no'] + "', `date_added` = NOW()");
	}

	async deleteRevisedTransaction(id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "laybuy_revise_request` WHERE `laybuy_revise_request_id` = '" + id + "'");
	}

	async deleteTransactionByOrderId(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `order_id` = '" + order_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "laybuy_revise_request` WHERE `order_id` = '" + order_id + "'");
	}

	async getInitialPayments() {
		minimum = this.config.get('payment_laybuy_min_deposit') ? this.config.get('payment_laybuy_min_deposit') : 20;

		maximum = this.config.get('payment_laybuy_max_deposit') ? this.config.get('payment_laybuy_max_deposit') : 50;

		initial_payments = array();

		for (i = minimum; i <= maximum; i += 10) {
			initial_payments.push(i;
		}

		return initial_payments;
	}

	async getMethod(address, total) {
		await this.load.language('extension/payment/laybuy');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + this.config.get('payment_laybuy_geo_zone_id') + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");

		if (this.config.get('payment_laybuy_total') > 0 && this.config.get('payment_laybuy_total') > total) {
			status = false;
		} else if (!this.config.get('payment_laybuy_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		/* Condition for customer group */
		if (status && this.config.get('payment_laybuy_customer_group')) {
			if ((this.session.data['guest']) && in_array(0, this.config.get('payment_laybuy_customer_group'))) {
				status = true;
			} else if (await this.customer.isLogged() && this.session.data['customer_id']) {
				this.load.model('account/customer',this);

				customer = await this.model_account_customer.getCustomer(this.session.data['customer_id']);

				if (in_array(customer['customer_group_id'], this.config.get('payment_laybuy_customer_group'))) {
					this.session.data['customer_group_id'] = customer['customer_group_id'];

					status = true;
				} else {
					status = false;
				}
			} else {
				status = false;
			}
		}

		/* Condition for categories and products */
		if (status && this.config.get('payment_laybuy_category')) {
			allowed_categories = this.config.get('payment_laybuy_category');

			xproducts = explode(',', this.config.get('payment_laybuy_xproducts'));

			cart_products = await this.cart.getProducts();

			for (cart_products as cart_product) {
				product = array();

				if (xproducts && in_array(cart_product['product_id'], xproducts)) {
					status = false;
					break;
				} else {
					product = await this.db.query("SELECT GROUP_CONCAT(`category_id`) as `categories` FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + cart_product['product_id'] + "'");

					product = product.row;

					product = explode(',', product['categories']);

					if (product && count(array_diff(product, allowed_categories)) > 0) {
						status = false;
						break;
					}
				}
			}
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'			 'laybuy',
				'title'			 this.language.get('text_title'),
				'terms'			 '',
				'sort_order'	 this.config.get('payment_laybuy_sort_order')
			});
		}

		return method_data;
	}

	async getMonths() {
		await this.load.language('extension/payment/laybuy');

		max_months = this.config.get('payment_laybuy_max_months');

		if (!max_months) {
			max_months = 3;
		}

		if (max_months < 1) {
			max_months = 1;
		}

		months = array();

		for (i = 1; i <= max_months; i++) {
			months.push(array(
				'value'  i,
				'label'  i + ' ' + ((i > 1) ? this.language.get('text_months') : this.language.get('text_month'))
			});
		}

		return months;
	}

	async getPayPalProfileIds() {
		const query = await this.db.query("SELECT `paypal_profile_id` FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `status` = '1'");

		return query.rows;
	}

	async getRevisedTransaction(id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_revise_request` WHERE `laybuy_revise_request_id` = '" + id + "'");

		return query.row;
	}

	async getTransaction(id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `laybuy_transaction_id` = '" + id + "'");

		return query.row;
	}

	async getTransactionByLayBuyRefId(laybuy_ref_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "laybuy_transaction` WHERE `laybuy_ref_no` = '" + laybuy_ref_id + "'");

		return query.row;
	}

	async log(data, step = 6) {
		if (this.config.get('payment_laybuy_logging')) {
			backtrace = debug_backtrace();

			log = new Log('laybuy.log');

			log.write('(' + backtrace[step]['class'] + '::' + backtrace[step]['function'] + ') - ' + data);
		}
	}

	async prepareTransactionReport(post_data) {
		this.load.model('checkout/order',this);

		await this.load.language('extension/payment/laybuy');

		data = array_change_key_case(post_data, CASE_LOWER);

		data['order_id'] = data['custom'];

		order_info = await this.model_checkout_order.getOrder(data['order_id']);

		date_added = date(this.language.get('date_format_short'), strtotime(order_info['date_added']));

		data['store_id'] = order_info['store_id'];

		data['date_added'] = order_info['date_added'];

		data['first_payment_due'] = date('Y-m-d h:i:s', strtotime(str_replace('/', '-', data['first_payment_due'])));

		data['last_payment_due'] = date('Y-m-d h:i:s', strtotime(str_replace('/', '-', data['last_payment_due'])));

		months = data['months'];

		report_content = array();

		report_content.push(array(
			'instalment'	 0,
			'amount'		 this.currency.format(data['downpayment_amount'], data['currency']),
			'date'			 date_added,
			'pp_trans_id'	 data['dp_paypal_txn_id'],
			'status'		 'Completed'
		});

		for (month = 1; month <= months; month++) {
			date = date("Y-m-d h:i:s", strtotime(data['first_payment_due'] + " +" + (month -1) + " month"));
			date = date(this.language.get('date_format_short'), strtotime(date));

			report_content.push(array(
			'instalment'	 month,
			'amount'		 this.currency.format(data['payment_amounts'], data['currency']),
			'date'			 date,
			'pp_trans_id'	 '',
			'status'		 'Pending'
			});
		}

		data['report'] = JSON.stringify(report_content);

		return data;
	}

	async updateCronRunTime() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `key` = 'laybuy_cron_time'");

		await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `store_id` = '0', `code` = 'laybuy', `key` = 'laybuy_cron_time', `value` = NOW(), `serialized` = '0'");
	}

	async updateTransaction(id, status, report, transaction) {
		await this.db.query("UPDATE `" + DB_PREFIX + "laybuy_transaction` SET `status` = '" + status + "', `report` = '" + this.db.escape(report) + "', `transaction` = '" + transaction + "' WHERE `laybuy_transaction_id` = '" + id + "'");
	}
}
