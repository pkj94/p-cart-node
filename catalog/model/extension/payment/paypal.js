module.exports = class ModelExtensionPaymentPayPal extends Model {
	
	async getMethod(address, total) {
		method_data = array();
		
		agree_status = this.getAgreeStatus();
		
		if (this.config.get('payment_paypal_status') && this.config.get('payment_paypal_client_id') && this.config.get('payment_paypal_secret') && agree_status) {
			await this.load.language('extension/payment/paypal');

			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_paypal_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

			if ((this.config.get('payment_paypal_total') > 0) && (this.config.get('payment_paypal_total') > total)) {
				status = false;
			} else if (!this.config.get('payment_paypal_geo_zone_id')) {
				status = true;
			} else if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}

			if (status) {			
				method_data = array(
					'code'        'paypal',
					'title'       this.language.get('text_paypal_title'),
					'terms'       '',
					'sort_order'  this.config.get('payment_paypal_sort_order')
				});
			}
		}

		return method_data;
	}
	
	async hasProductInCart(product_id, option = array(), recurring_id = 0) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "cart WHERE api_id = '" + ((this.session.data['api_id']) ? this.session.data['api_id'] : 0) + "' AND customer_id = '" + await this.customer.getId() + "' AND session_id = '" + this.db.escape(this.session.getId()) + "' AND product_id = '" + product_id + "' AND recurring_id = '" + recurring_id + "' AND `option` = '" + this.db.escape(JSON.stringify(option)) + "'");
				
		return query.row['total'];
	}
	
	async getCountryByCode(code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE iso_code_2 = '" + this.db.escape(code) + "' AND status = '1'");
				
		return query.row;
	}
	
	async getZoneByCode(country_id, code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '" + country_id + "' AND (code = '" + this.db.escape(code) + "' OR name = '" + this.db.escape(code) + "') AND status = '1'");
		
		return query.row;
	}
	
	async addPayPalCustomerToken(data) {
		let sql = "INSERT INTO `" + DB_PREFIX + "paypal_checkout_integration_customer_token` SET";

		const implode = [];
			
		if ((data['customer_id'])) {
			implode.push("`customer_id` = '" + data['customer_id'] + "'";
		}
		
		if ((data['payment_method'])) {
			implode.push("`payment_method` = '" + this.db.escape(data['payment_method']) + "'";
		}	

		if ((data['vault_id'])) {
			implode.push("`vault_id` = '" + this.db.escape(data['vault_id']) + "'";
		}
		
		if ((data['vault_customer_id'])) {
			implode.push("`vault_customer_id` = '" + this.db.escape(data['vault_customer_id']) + "'";
		}
		
		if ((data['card_type'])) {
			implode.push("`card_type` = '" + this.db.escape(data['card_type']) + "'";
		}
		
		if ((data['card_nice_type'])) {
			implode.push("`card_nice_type` = '" + this.db.escape(data['card_nice_type']) + "'";
		}
		
		if ((data['card_last_digits'])) {
			implode.push("`card_last_digits` = '" + this.db.escape(data['card_last_digits']) + "'";
		}
		
		if ((data['card_expiry'])) {
			implode.push("`card_expiry` = '" + this.db.escape(data['card_expiry']) + "'";
		}
					
		if (implode.length) {
			sql += implode(", ", implode);
		}
		
		await this.db.query(sql);
	}
	
	async deletePayPalCustomerToken(customer_id, payment_method, vault_id) {
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "paypal_checkout_integration_customer_token` WHERE `customer_id` = '" + customer_id + "' AND `payment_method` = '" + this.db.escape(payment_method) + "' AND `vault_id` = '" + this.db.escape(vault_id) + "'");
	}
	
	async setPayPalCustomerMainToken(customer_id, payment_method, vault_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "paypal_checkout_integration_customer_token` SET `main_token_status` = '0' WHERE `customer_id` = '" + customer_id + "' AND `payment_method` = '" + this.db.escape(payment_method) + "'");
		await this.db.query("UPDATE `" + DB_PREFIX + "paypal_checkout_integration_customer_token` SET `main_token_status` = '1' WHERE `customer_id` = '" + customer_id + "' AND `payment_method` = '" + this.db.escape(payment_method) + "' AND `vault_id` = '" + this.db.escape(vault_id) + "'");
	}
	
	async getPayPalCustomerMainToken(customer_id, payment_method) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_customer_token` WHERE `customer_id` = '" + customer_id + "' AND `payment_method` = '" + this.db.escape(payment_method) + "' AND `main_token_status` = '1'");
		
		if (query.num_rows) {
			return query.row;
		} else {
			return array();
		}
	}
	
	async getPayPalCustomerToken(customer_id, payment_method, vault_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_customer_token` WHERE `customer_id` = '" + customer_id + "' AND `payment_method` = '" + this.db.escape(payment_method) + "' AND `vault_id` = '" + this.db.escape(vault_id) + "'");

		if (query.num_rows) {
			return query.row;
		} else {
			return array();
		}
	}
	
	async getPayPalCustomerTokens(customer_id, payment_method = '') {
		if (payment_method) {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_customer_token` WHERE `customer_id` = '" + customer_id + "' AND `payment_method` = '" + this.db.escape(payment_method) + "'");
		} else {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_customer_token` WHERE `customer_id` = '" + customer_id + "'");
		}

		if (query.num_rows) {
			return query.rows;
		} else {
			return array();
		}
	}
		
	async addPayPalOrder(data) {
		let sql = "INSERT INTO `" + DB_PREFIX + "paypal_checkout_integration_order` SET";

		const implode = [];
			
		if ((data['order_id'])) {
			implode.push("`order_id` = '" + data['order_id'] + "'";
		}
		
		if ((data['paypal_order_id'])) {
			implode.push("`paypal_order_id` = '" + this.db.escape(data['paypal_order_id']) + "'";
		}
		
		if ((data['transaction_id'])) {
			implode.push("`transaction_id` = '" + this.db.escape(data['transaction_id']) + "'";
		}
		
		if ((data['transaction_status'])) {
			implode.push("`transaction_status` = '" + this.db.escape(data['transaction_status']) + "'";
		}
		
		if ((data['payment_method'])) {
			implode.push("`payment_method` = '" + this.db.escape(data['payment_method']) + "'";
		}
		
		if ((data['vault_id'])) {
			implode.push("`vault_id` = '" + this.db.escape(data['vault_id']) + "'";
		}
		
		if ((data['vault_customer_id'])) {
			implode.push("`vault_customer_id` = '" + this.db.escape(data['vault_customer_id']) + "'";
		}
		
		if ((data['card_type'])) {
			implode.push("`card_type` = '" + this.db.escape(data['card_type']) + "'";
		}
		
		if ((data['card_nice_type'])) {
			implode.push("`card_nice_type` = '" + this.db.escape(data['card_nice_type']) + "'";
		}
		
		if ((data['card_last_digits'])) {
			implode.push("`card_last_digits` = '" + this.db.escape(data['card_last_digits']) + "'";
		}
		
		if ((data['card_expiry'])) {
			implode.push("`card_expiry` = '" + this.db.escape(data['card_expiry']) + "'";
		}
				
		if ((data['environment'])) {
			implode.push("`environment` = '" + this.db.escape(data['environment']) + "'";
		}
		
		if (implode.length) {
			sql += implode(", ", implode);
		}
		
		await this.db.query(sql);
	}
	
	async editPayPalOrder(data) {
		let sql = "UPDATE `" + DB_PREFIX + "paypal_checkout_integration_order` SET";

		const implode = [];
		
		if ((data['paypal_order_id'])) {
			implode.push("`paypal_order_id` = '" + this.db.escape(data['paypal_order_id']) + "'";
		}
		
		if ((data['transaction_id'])) {
			implode.push("`transaction_id` = '" + this.db.escape(data['transaction_id']) + "'";
		}
					
		if ((data['transaction_status'])) {
			implode.push("`transaction_status` = '" + this.db.escape(data['transaction_status']) + "'";
		}
		
		if ((data['payment_method'])) {
			implode.push("`payment_method` = '" + this.db.escape(data['payment_method']) + "'";
		}
		
		if ((data['vault_id'])) {
			implode.push("`vault_id` = '" + this.db.escape(data['vault_id']) + "'";
		}
		
		if ((data['vault_customer_id'])) {
			implode.push("`vault_customer_id` = '" + this.db.escape(data['vault_customer_id']) + "'";
		}
		
		if ((data['card_type'])) {
			implode.push("`card_type` = '" + this.db.escape(data['card_type']) + "'";
		}
		
		if ((data['card_nice_type'])) {
			implode.push("`card_nice_type` = '" + this.db.escape(data['card_nice_type']) + "'";
		}
		
		if ((data['card_last_digits'])) {
			implode.push("`card_last_digits` = '" + this.db.escape(data['card_last_digits']) + "'";
		}
		
		if ((data['card_expiry'])) {
			implode.push("`card_expiry` = '" + this.db.escape(data['card_expiry']) + "'";
		}
		
		if ((data['environment'])) {
			implode.push("`environment` = '" + this.db.escape(data['environment']) + "'";
		}
				
		if (implode.length) {
			sql += implode(", ", implode);
		}

		sql += " WHERE `order_id` = '" + data['order_id'] + "'";
		
		await this.db.query(sql);
	}
		
	async deletePayPalOrder(order_id) {
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "paypal_checkout_integration_order` WHERE `order_id` = '" + order_id + "'");
	}
	
	async getPayPalOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_order` WHERE `order_id` = '" + order_id + "'");
		
		if (query.num_rows) {
			return query.row;
		} else {
			return array();
		}
	}
	
	async getPayPalOrderByPayPalOrderId(paypal_order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_order` WHERE `paypal_order_id` = '" + this.db.escape(paypal_order_id) + "'");
		
		if (query.num_rows) {
			return query.row;
		} else {
			return array();
		}
	}
	
	async addPayPalOrderRecurring(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` SET `order_recurring_id` = '" + data['order_recurring_id'] + "', `order_id` = '" + data['order_id'] + "', `date_added` = NOW(), `date_modified` = NOW(), `next_payment` = NOW(), `trial_end` = '" + data['trial_end'] + "', `subscription_end` = '" + data['subscription_end'] + "', `currency_code` = '" + this.db.escape(data['currency_code']) + "', `total` = '" + this.currency.format(data['amount'], data['currency_code'], false, false) + "'");
	}

	async editPayPalOrderRecurringNextPayment(order_recurring_id, next_payment) {
		await this.db.query("UPDATE `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` SET `next_payment` = '" + next_payment + "', `date_modified` = NOW() WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}
	
	async deletePayPalOrderRecurring(order_id) {
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` WHERE `order_id` = '" + order_id + "'");
	}

	async getPayPalOrderRecurring(order_recurring_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` WHERE `order_recurring_id` = '" + order_recurring_id + "'");
		
		return query.row;
	}
	
	async addOrderRecurring(order_id, description, data, reference) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring` SET `order_id` = '" + order_id + "', `date_added` = NOW(), `status` = '1', `product_id` = '" + data['product_id'] + "', `product_name` = '" + this.db.escape(data['name']) + "', `product_quantity` = '" + this.db.escape(data['quantity']) + "', `recurring_id` = '" + data['recurring']['recurring_id'] + "', `recurring_name` = '" + this.db.escape(data['name']) + "', `recurring_description` = '" + this.db.escape(description) + "', `recurring_frequency` = '" + this.db.escape(data['recurring']['frequency']) + "', `recurring_cycle` = '" + data['recurring']['cycle'] + "', `recurring_duration` = '" + data['recurring']['duration'] + "', `recurring_price` = '" + data['recurring']['price'] + "', `trial` = '" + data['recurring']['trial'] + "', `trial_frequency` = '" + this.db.escape(data['recurring']['trial_frequency']) + "', `trial_cycle` = '" + data['recurring']['trial_cycle'] + "', `trial_duration` = '" + data['recurring']['trial_duration'] + "', `trial_price` = '" + data['recurring']['trial_price'] + "', `reference` = '" + this.db.escape(reference) + "'");

		return this.db.getLastId();
	}
	
	async editOrderRecurringStatus(order_recurring_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `status` = '" + status + "' WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}
	
	async deleteOrderRecurring(order_id) {
		const query = await this.db.query("SELECT order_recurring_id FROM `" + DB_PREFIX + "order_recurring` WHERE order_id = '" + order_id + "'");

		for (query.rows as order_recurring) {
			this.deleteOrderRecurringTransaction(order_recurring['order_recurring_id']);
		}
		
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "order_recurring` WHERE `order_id` = '" + order_id + "'");
	}
	
	async getOrderRecurrings() {
		const query = await this.db.query("SELECT `or`.`order_recurring_id` FROM `" + DB_PREFIX + "order_recurring` `or` JOIN `" + DB_PREFIX + "order` `o` USING(`order_id`) WHERE `o`.`payment_code` = 'paypal' AND `or`.`status` = '1'");

		order_recurring_data = array();

		for (query.rows as order_recurring) {
			order_recurring_data.push(this.getOrderRecurring(order_recurring['order_recurring_id']);
		}
			
		return order_recurring_data;
	}

	async getOrderRecurring(order_recurring_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_recurring` WHERE `order_recurring_id` = '" + order_recurring_id + "'");
		
		return query.row;
	}

	async addOrderRecurringTransaction(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring_transaction` SET `order_recurring_id` = '" + data['order_recurring_id'] + "', `reference` = '" + this.db.escape(data['reference']) + "', `type` = '" + data['type'] + "', `amount` = '" + data['amount'] + "', `date_added` = NOW()");
	}
	
	async deleteOrderRecurringTransaction(order_recurring_id) {
		const query = await this.db.query("DELETE FROM `" + DB_PREFIX + "order_recurring_transaction` WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}
		
	async recurringPayment(product_data, order_data, paypal_order_data) {
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
		
		setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
		
		transaction_method = setting['general']['transaction_method'];
		
		recurring_name = product_data['recurring']['name'];
				
		if (product_data['recurring']['trial'] == 1) {
			price = product_data['recurring']['trial_price'];
			trial_amt = this.currency.format(this.tax.calculate(product_data['recurring']['trial_price'], product_data['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * product_data['quantity'] + ' ' + this.session.data['currency'];
			trial_text = sprintf(this.language.get('text_trial'), trial_amt, product_data['recurring']['trial_cycle'], product_data['recurring']['trial_frequency'], product_data['recurring']['trial_duration']);
		} else {
			price = product_data['recurring']['price'];
			trial_text = '';
		}
			
		recurring_amt = this.currency.format(this.tax.calculate(product_data['recurring']['price'], product_data['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * product_data['quantity'] + ' ' + this.session.data['currency'];
		recurring_description = trial_text + sprintf(this.language.get('text_recurring'), recurring_amt, product_data['recurring']['cycle'], product_data['recurring']['frequency']);

		if (product_data['recurring']['duration'] > 0) {
			recurring_description += sprintf(this.language.get('text_length'), product_data['recurring']['duration']);
		}
			
		order_recurring_id = this.addOrderRecurring(order_data['order_id'], recurring_description, product_data, paypal_order_data['transaction_id']);
			
		this.editOrderRecurringStatus(order_recurring_id, 1);
		
		if ((paypal_order_data['vault_id'])) {
			next_payment = new DateTime('now');
			trial_end = new DateTime('now');
			subscription_end = new DateTime('now');

			if ((product_data['recurring']['trial'] == 1) && (product_data['recurring']['trial_duration'] != 0)) {
				next_payment = this.calculateSchedule(product_data['recurring']['trial_frequency'], next_payment, product_data['recurring']['trial_cycle']);
				trial_end = this.calculateSchedule(product_data['recurring']['trial_frequency'], trial_end, product_data['recurring']['trial_cycle'] * product_data['recurring']['trial_duration']);
			} else if (product_data['recurring']['trial'] == 1) {
				next_payment = this.calculateSchedule(product_data['recurring']['trial_frequency'], next_payment, product_data['recurring']['trial_cycle']);
				trial_end = new DateTime('0000-00-00');
			}
			
			if (date_format(trial_end, 'Y-m-d H:i:s') > date_format(subscription_end, 'Y-m-d H:i:s') && product_data['recurring']['duration'] != 0) {
				subscription_end = new DateTime(date_format(trial_end, 'Y-m-d H:i:s'));
				subscription_end = this.calculateSchedule(product_data['recurring']['frequency'], subscription_end, product_data['recurring']['cycle'] * product_data['recurring']['duration']);
			} else if (date_format(trial_end, 'Y-m-d H:i:s') == date_format(subscription_end, 'Y-m-d H:i:s') && product_data['recurring']['duration'] != 0) {
				next_payment = this.calculateSchedule(product_data['recurring']['frequency'], next_payment, product_data['recurring']['cycle']);
				subscription_end = this.calculateSchedule(product_data['recurring']['frequency'], subscription_end, product_data['recurring']['cycle'] * product_data['recurring']['duration']);
			} else if (date_format(trial_end, 'Y-m-d H:i:s') > date_format(subscription_end, 'Y-m-d H:i:s') && product_data['recurring']['duration'] == 0) {
				subscription_end = new DateTime('0000-00-00');
			} else if (date_format(trial_end, 'Y-m-d H:i:s') == date_format(subscription_end, 'Y-m-d H:i:s') && product_data['recurring']['duration'] == 0) {
				next_payment = this.calculateSchedule(product_data['recurring']['frequency'], next_payment, product_data['recurring']['cycle']);
				subscription_end = new DateTime('0000-00-00');
			}
										
			result = this.createPayment(order_data, paypal_order_data, price, order_recurring_id, recurring_name);

			transaction_status = '';
			transaction_id = '';
			currency_code = '';
			amount = '';
			
			if (transaction_method == 'authorize') {
				if ((result['purchase_units'][0]['payments']['authorizations'][0]['status']) && (result['purchase_units'][0]['payments']['authorizations'][0]['seller_protection']['status'])) {
					transaction_id = result['purchase_units'][0]['payments']['authorizations'][0]['id'];
					transaction_status = result['purchase_units'][0]['payments']['authorizations'][0]['status'];
					currency_code = result['purchase_units'][0]['payments']['authorizations'][0]['amount']['currency_code'];
					amount = result['purchase_units'][0]['payments']['authorizations'][0]['amount']['value'];
				}
			} else {
				if ((result['purchase_units'][0]['payments']['captures'][0]['status']) && (result['purchase_units'][0]['payments']['captures'][0]['seller_protection']['status'])) {
					transaction_id = result['purchase_units'][0]['payments']['captures'][0]['id'];
					transaction_status = result['purchase_units'][0]['payments']['captures'][0]['status'];
					currency_code = result['purchase_units'][0]['payments']['captures'][0]['amount']['currency_code'];
					amount = result['purchase_units'][0]['payments']['captures'][0]['amount']['value'];
				}
			}
			
			if (transaction_id && transaction_status && currency_code && amount) {			
				paypal_order_recurring_data = array(
					'order_recurring_id'  order_recurring_id,
					'order_id'  order_data['order_id'],
					'trial_end'  date_format(trial_end, 'Y-m-d H:i:s'),
					'subscription_end'  date_format(subscription_end, 'Y-m-d H:i:s'),
					'currency_code'  currency_code,
					'amount'  amount
				});
		
				this.addPayPalOrderRecurring(paypal_order_recurring_data);
			
				if ((transaction_status == 'CREATED') || (transaction_status == 'COMPLETED') || (transaction_status == 'PENDING')) {
					order_recurring_transaction_data = array(
						'order_recurring_id'  order_recurring_id,
						'reference'  transaction_id,
						'type'  '1',
						'amount'  amount
					});
			
					this.addOrderRecurringTransaction(order_recurring_transaction_data);
								
					this.editPayPalOrderRecurringNextPayment(order_recurring_id, date_format(next_payment, 'Y-m-d H:i:s'));
				} else {
					order_recurring_transaction_data = array(
						'order_recurring_id'  order_recurring_id,
						'reference'  transaction_id,
						'type'  '4',
						'amount'  amount
					});
				
					this.addOrderRecurringTransaction(order_recurring_transaction_data);
				}
			}
		}
	}
	
	async cronPayment() {
		this.load.model('checkout/order',this);
		
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
		
		setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
		
		transaction_method = setting['general']['transaction_method'];
		
		order_recurrings = this.getOrderRecurrings();
						
		for (order_recurrings as order_recurring) {
			if (order_recurring['status'] == 1) {
				paypal_order_recurring = this.getPayPalOrderRecurring(order_recurring['order_recurring_id']);

				if (paypal_order_recurring) {
					today = new DateTime('now');
					unlimited = new DateTime('0000-00-00');
					next_payment = new DateTime(paypal_order_recurring['next_payment']);
					trial_end = new DateTime(paypal_order_recurring['trial_end']);
					subscription_end = new DateTime(paypal_order_recurring['subscription_end']);

					order_info = await this.model_checkout_order.getOrder(order_recurring['order_id']);
			
					paypal_order_info = this.getPayPalOrder(order_recurring['order_id']);
					
					if ((paypal_order_info['vault_id'])) {
						if ((date_format(today, 'Y-m-d H:i:s') > date_format(next_payment, 'Y-m-d H:i:s')) && (date_format(trial_end, 'Y-m-d H:i:s') > date_format(today, 'Y-m-d H:i:s') || date_format(trial_end, 'Y-m-d H:i:s') == date_format(unlimited, 'Y-m-d H:i:s'))) {
							price = this.currency.format(order_recurring['trial_price'], order_info['currency_code'], false, false);
							frequency = order_recurring['trial_frequency'];
							cycle = order_recurring['trial_cycle'];
							next_payment = this.calculateSchedule(frequency, next_payment, cycle);
						} else if ((date_format(today, 'Y-m-d H:i:s') > date_format(next_payment, 'Y-m-d H:i:s')) && (date_format(subscription_end, 'Y-m-d H:i:s') > date_format(today, 'Y-m-d H:i:s') || date_format(subscription_end, 'Y-m-d H:i:s') == date_format(unlimited, 'Y-m-d H:i:s'))) {
							price = this.currency.format(order_recurring['recurring_price'], order_info['currency_code'], false, false);
							frequency = order_recurring['recurring_frequency'];
							cycle = order_recurring['recurring_cycle'];
							next_payment = this.calculateSchedule(frequency, next_payment, cycle);
						} else {
							continue;
						}

						result = this.createPayment(order_info, paypal_order_info, price, order_recurring['order_recurring_id'], order_recurring['recurring_name']);
			
						transaction_status = '';
						transaction_id = '';
						currency_code = '';
						amount = '';
			
						if (transaction_method == 'authorize') {
							if ((result['purchase_units'][0]['payments']['authorizations'][0]['status']) && (result['purchase_units'][0]['payments']['authorizations'][0]['seller_protection']['status'])) {
								transaction_id = result['purchase_units'][0]['payments']['authorizations'][0]['id'];
								transaction_status = result['purchase_units'][0]['payments']['authorizations'][0]['status'];
								currency_code = result['purchase_units'][0]['payments']['authorizations'][0]['amount']['currency_code'];
								amount = result['purchase_units'][0]['payments']['authorizations'][0]['amount']['value'];
							}
						} else {
							if ((result['purchase_units'][0]['payments']['captures'][0]['status']) && (result['purchase_units'][0]['payments']['captures'][0]['seller_protection']['status'])) {
								transaction_id = result['purchase_units'][0]['payments']['captures'][0]['id'];
								transaction_status = result['purchase_units'][0]['payments']['captures'][0]['status'];
								currency_code = result['purchase_units'][0]['payments']['captures'][0]['amount']['currency_code'];
								amount = result['purchase_units'][0]['payments']['captures'][0]['amount']['value'];
							}
						}
			
						if (transaction_id && transaction_status && currency_code && amount) {						
							if ((transaction_status == 'CREATED') || (transaction_status == 'COMPLETED') || (transaction_status == 'PENDING')) {
								order_recurring_transaction_data = array(
									'order_recurring_id'  order_recurring['order_recurring_id'],
									'reference'  transaction_id,
									'type'  '1',
									'amount'  amount
								});
				
								this.addOrderRecurringTransaction(order_recurring_transaction_data);
								
								this.editPayPalOrderRecurringNextPayment(order_recurring['order_recurring_id'], date_format(next_payment, 'Y-m-d H:i:s'));
							} else {
								order_recurring_transaction_data = array(
									'order_recurring_id'  order_recurring['order_recurring_id'],
									'reference'  transaction_id,
									'type'  '4',
									'amount'  amount
								});
				
								this.addOrderRecurringTransaction(order_recurring_transaction_data);
							}
						}
					}
				}
			}
		}
	}
	
	async createPayment(order_data, paypal_order_data, price, order_recurring_id, recurring_name) {
		await this.load.language('extension/payment/paypal');
						
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
		
		setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
		
		client_id = this.config.get('payment_paypal_client_id');
		secret = this.config.get('payment_paypal_secret');
		merchant_id = this.config.get('payment_paypal_merchant_id');
		environment = this.config.get('payment_paypal_environment');
		partner_id = setting['partner'][environment]['partner_id'];
		partner_attribution_id = setting['partner'][environment]['partner_attribution_id'];
		transaction_method = setting['general']['transaction_method'];		
										
		currency_code = order_data['currency_code'];
		currency_value = this.currency.getValue(currency_code);				
		decimal_place = setting['currency'][currency_code]['decimal_place'];
				
		require_once DIR_SYSTEM + 'library/paypal/paypal.php';
		
		paypal_info = array(
			'partner_id'  partner_id,
			'client_id'  client_id,
			'secret'  secret,
			'environment'  environment,
			'partner_attribution_id'  partner_attribution_id
		});
		
		paypal = new PayPal(paypal_info);
			
		token_info = array(
			'grant_type'  'client_credentials'
		});	
				
		paypal.setAccessToken(token_info);
										
		item_info = array();
			
		item_total = 0;
						
		product_price = number_format(price * currency_value, decimal_place, '.', '');
				
		item_info.push(array(
			'name'  recurring_name,
			'quantity'  1,
			'unit_amount'  array(
				'currency_code'  currency_code,
				'value'  product_price
			)
		});
				
		item_total += product_price;
				
		item_total = number_format(item_total, decimal_place, '.', '');
		order_total = number_format(item_total, decimal_place, '.', '');
				
		amount_info = array();
				
		amount_info['currency_code'] = currency_code;
		amount_info['value'] = order_total;
								
		amount_info['breakdown']['item_total'] = array(
			'currency_code'  currency_code,
			'value'  item_total
		});
				
		paypal_order_info = array();
				
		paypal_order_info['intent'] = strtoupper(transaction_method);
		paypal_order_info['purchase_units'][0]['reference_id'] = 'default';
		paypal_order_info['purchase_units'][0]['items'] = item_info;
		paypal_order_info['purchase_units'][0]['amount'] = amount_info;
				
		paypal_order_info['purchase_units'][0]['description'] = 'Subscription to order ' + order_data['order_id'];
				
		shipping_preference = 'NO_SHIPPING';
		
		paypal_order_info['application_context']['shipping_preference'] = shipping_preference;
				
		paypal_order_info['payment_source'][paypal_order_data['payment_method']]['vault_id'] = paypal_order_data['vault_id'];
		
		if (paypal_order_data['payment_method'] == 'card') {
			paypal_order_info['payment_source'][paypal_order_data['payment_method']]['stored_credential']['payment_initiator'] = 'MERCHANT';
			paypal_order_info['payment_source'][paypal_order_data['payment_method']]['stored_credential']['payment_type'] = 'UNSCHEDULED';
			paypal_order_info['payment_source'][paypal_order_data['payment_method']]['stored_credential']['usage'] = 'SUBSEQUENT';
			paypal_order_info['payment_source'][paypal_order_data['payment_method']]['stored_credential']['previous_transaction_reference'] = paypal_order_data['transaction_id'];
		}
		
		result = paypal.createOrder(paypal_order_info);
								
		errors = array();
		
		if (paypal.hasErrors()) {
			errors = paypal.getErrors();
								
			for (errors as error) {
				if ((error['name']) && (error['name'] == 'CURLE_OPERATION_TIMEOUTED')) {
					error['message'] = this.language.get('error_timeout');
				}
								
				this.log(error, error['message']);
			}
		}
				
		if ((result['id']) && (result['status']) && !errors) {
			this.log(result, 'Create Recurring Payment');
			
			return result;
		}
		
		return false;
	}
	
	async calculateSchedule(frequency, next_payment, cycle) {
		if (frequency == 'semi_month') {
			day = date_format(next_payment, 'd');
			value = 15 - day;
			is_even = false;

			if (cycle % 2 == 0) {
				is_even = true;
			}

			odd = (cycle + 1) / 2;
			plus_even = (cycle / 2) + 1;
			minus_even = cycle / 2;

			if (day == 1) {
				odd = odd - 1;
				plus_even = plus_even - 1;
				day = 16;
			}

			if (day <= 15 && is_even) {
				next_payment.modify('+' + value + ' day');
				next_payment.modify('+' + minus_even + ' month');
			} else if (day <= 15) {
				next_payment.modify('first day of this month');
				next_payment.modify('+' + odd + ' month');
			} else if (day > 15 && is_even) {
				next_payment.modify('first day of this month');
				next_payment.modify('+' + plus_even + ' month');
			} else if (day > 15) {
				next_payment.modify('+' + value + ' day');
				next_payment.modify('+' + odd + ' month');
			}
		} else {
			next_payment.modify('+' + cycle + ' ' + frequency);
		}
		
		return next_payment;
	}
	
	async getAgreeStatus() {
		agree_status = true;
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE status = '1' AND (iso_code_2 = 'CU' OR iso_code_2 = 'IR' OR iso_code_2 = 'SY' OR iso_code_2 = 'KP')");
		
		if (query.rows) {
			agree_status = false;
		}
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone WHERE country_id = '220' AND status = '1' AND (`code` = '43' OR `code` = '14' OR `code` = '09')");
		
		if (query.rows) {
			agree_status = false;
		}
		
		return agree_status;
	}
	
	async log(data, title = '') {
		// Setting
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
		
		setting = array_replace_recursive(config_setting, this.config.get('payment_paypal_setting'));
			
		if (setting['general']['debug']) {
			log = new Log('paypal.log');
			log.write('PayPal debug (' + title + '): ' + JSON.stringify(data));
		}
	}
		
	async update() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_customer_token`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order`");
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order_recurring`");
		
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_customer_token` (`customer_id` INT(11) NOT NULL, `payment_method` VARCHAR(20) NOT NULL, `vault_id` VARCHAR(50) NOT NULL, `vault_customer_id` VARCHAR(50) NOT NULL, `card_type` VARCHAR(40) NOT NULL, `card_nice_type` VARCHAR(40) NOT NULL, `card_last_digits` VARCHAR(4) NOT NULL, `card_expiry` VARCHAR(20) NOT NULL, `main_token_status` TINYINT(1) NOT NULL, PRIMARY KEY (`customer_id`, `payment_method`, `vault_id`), KEY `vault_customer_id` (`vault_customer_id`), KEY `main_token_status` (`main_token_status`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order` (`order_id` INT(11) NOT NULL, `paypal_order_id` VARCHAR(20) NOT NULL, `transaction_id` VARCHAR(20) NOT NULL, `transaction_status` VARCHAR(20) NOT NULL, `payment_method` VARCHAR(20) NOT NULL, `vault_id` VARCHAR(50) NOT NULL, `vault_customer_id` VARCHAR(50) NOT NULL, `card_type` VARCHAR(40) NOT NULL, `card_nice_type` VARCHAR(40) NOT NULL, `card_last_digits` VARCHAR(4) NOT NULL, `card_expiry` VARCHAR(20) NOT NULL, `environment` VARCHAR(20) NOT NULL, PRIMARY KEY (`order_id`), KEY `paypal_order_id` (`paypal_order_id`), KEY `transaction_id` (`transaction_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "paypal_checkout_integration_order_recurring` (`paypal_order_recurring_id` INT(11) NOT NULL AUTO_INCREMENT, `order_id` INT(11) NOT NULL, `order_recurring_id` INT(11) NOT NULL, `date_added` DATETIME NOT NULL, `date_modified` DATETIME NOT NULL, `next_payment` DATETIME NOT NULL, `trial_end` DATETIME DEFAULT NULL, `subscription_end` DATETIME DEFAULT NULL, `currency_code` CHAR(3) NOT NULL, `total` DECIMAL(10, 2) NOT NULL, PRIMARY KEY (`paypal_order_recurring_id`), KEY (`order_id`), KEY (`order_recurring_id`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
		
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `code` = 'paypal_order_info'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `code` = 'paypal_header'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `code` = 'paypal_extension_get_extensions'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `code` = 'paypal_order_delete_order'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `code` = 'paypal_customer_delete_customer'");
		
		await this.db.query("INSERT INTO `" + DB_PREFIX + "event` SET `code` = 'paypal_order_info', `trigger` = 'admin/view/sale/order_info/before', `action` = 'extension/payment/paypal/order_info_before', `sort_order` = '0', `status` = '1'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "event` SET `code` = 'paypal_header', `trigger` = 'catalog/controller/common/header/before', `action` = 'extension/payment/paypal/header_before', `sort_order` = '0', `status` = '1'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "event` SET `code` = 'paypal_extension_get_extensions', `trigger` = 'catalog/model/setting/extension/getExtensions/after', `action` = 'extension/payment/paypal/extension_get_extensions_after', `sort_order` = '0', `status` = '1'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "event` SET `code` = 'paypal_order_delete_order', `trigger` = 'catalog/model/checkout/order/deleteOrder/before', `action` = 'extension/payment/paypal/order_delete_order_before', `sort_order` = '0', `status` = '1'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "event` SET `code` = 'paypal_customer_delete_customer', `trigger` = 'admin/model/customer/customer/deleteCustomer/before', `action` = 'extension/payment/paypal/customer_delete_customer_before', `sort_order` = '0', `status` = '1'");
				
		// Setting
		_config = new Config();
		_config.load('paypal');
			
		config_setting = _config.get('paypal_setting');
						
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE store_id = '0' AND `code` = 'paypal_version'");

		await this.db.query("INSERT INTO " + DB_PREFIX + "setting SET store_id = '0', `code` = 'paypal_version', `key` = 'paypal_version', `value` = '" + this.db.escape(config_setting['version']) + "'");
	}
	
	async recurringPayments() {
		/*
		 * Used by the checkout to state the module
		 * supports recurring recurrings.
		 */
		return true;
	}
}