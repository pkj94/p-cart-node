module.exports =
	class ModelExtensionPaymentWorldpay extends Model {

		async getMethod(address, total) {
			await this.load.language('extension/payment/worldpay');

			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_worldpay_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
			let status = false;
			if (Number(this.config.get('payment_worldpay_total')) > 0 && Number(this.config.get('payment_worldpay_total')) > total) {
				status = false;
			} else if (!this.config.get('payment_worldpay_geo_zone_id')) {
				status = true;
			} else if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}

			let method_data = null;

			if (status) {
				method_data = {
					'code': 'worldpay',
					'title': this.language.get('text_title'),
					'terms': '',
					'sort_order': this.config.get('payment_worldpay_sort_order')
				};
			}

			return method_data;
		}

		async getCards(customer_id) {

			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "worldpay_card WHERE customer_id = '" + customer_id + "'");

			const card_data = [];

			this.load.model('account/address', this);

			for (let row of query.rows) {

				card_data.push({
					'card_id': row['card_id'],
					'customer_id': row['customer_id'],
					'token': row['token'],
					'digits': row['digits'],
					'expiry': row['expiry'],
					'type': row['type'],
				});
			}
			return card_data;
		}

		async addCard(order_id, card_data) {
			await this.db.query("INSERT into " + DB_PREFIX + "worldpay_card SET customer_id = '" + this.db.escape(card_data['customer_id']) + "', order_id = '" + this.db.escape(order_id) + "', digits = '" + this.db.escape(card_data['Last4Digits']) + "', expiry = '" + this.db.escape(card_data['ExpiryDate']) + "', type = '" + this.db.escape(card_data['CardType']) + "', token = '" + this.db.escape(card_data['Token']) + "'");
		}

		async deleteCard(token) {
			await this.db.query("DELETE FROM " + DB_PREFIX + "worldpay_card WHERE customer_id = '" + await this.customer.isLogged() + "' AND `token` = '" + this.db.escape(token) + "'");

			if (this.db.countAffected() > 0) {
				return true;
			} else {
				return false;
			}
		}

		async addOrder(order_info, order_code) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "worldpay_order` SET `order_id` = '" + order_info['order_id'] + "', `order_code` = '" + this.db.escape(order_code) + "', `date_added` = now(), `date_modified` = now(), `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");

			return this.db.getLastId();
		}

		async getOrder(order_id) {
			const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "worldpay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

			if (qry.num_rows) {
				const order = qry.row;
				order['transactions'] = this.getTransactions(order['worldpay_order_id']);

				return order;
			} else {
				return false;
			}
		}

		async addTransaction(worldpay_order_id, type, order_info) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "worldpay_order_transaction` SET `worldpay_order_id` = '" + worldpay_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
		}

		async getTransactions(worldpay_order_id) {
			const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "worldpay_order_transaction` WHERE `worldpay_order_id` = '" + worldpay_order_id + "'");

			if (qry.num_rows) {
				return qry.rows;
			} else {
				return false;
			}
		}

		async recurringPayment(item, order_id_rand, token) {

			this.load.model('checkout/recurring', this);
			this.load.model('extension/payment/worldpay', this);
			//trial information
			let price = '', trial_text = '';
			if (item['recurring']['trial'] == 1) {
				price = item['recurring']['trial_price'];
				let trial_amt = this.currency.format(this.tax.calculate(item['recurring']['trial_price'], item['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * item['quantity'] + ' ' + this.session.data['currency'];
				trial_text = sprintf(this.language.get('text_trial'), trial_amt, item['recurring']['trial_cycle'], item['recurring']['trial_frequency'], item['recurring']['trial_duration']);
			} else {
				price = item['recurring']['price'];
				trial_text = '';
			}

			const recurring_amt = this.currency.format(this.tax.calculate(item['recurring']['price'], item['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * item['quantity'] + ' ' + this.session.data['currency'];
			let recurring_description = trial_text + sprintf(this.language.get('text_recurring'), recurring_amt, item['recurring']['cycle'], item['recurring']['frequency']);

			if (item['recurring']['duration'] > 0) {
				recurring_description += sprintf(this.language.get('text_length'), item['recurring']['duration']);
			}

			const order_recurring_id = await this.model_checkout_recurring.addRecurring(this.session.data['order_id'], recurring_description, item['recurring']);

			await this.model_checkout_recurring.editReference(order_recurring_id, order_id_rand);

			const order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

			const order = {
				"token": token,
				"orderType": 'RECURRING',
				"amount": (price * 100),
				"currencyCode": order_info['currency_code'],
				"name": order_info['firstname'] + ' ' + order_info['lastname'],
				"orderDescription": order_info['store_name'] + ' - ' + date('Y-m-d H:i:s'),
				"customerOrderCode": 'orderRecurring-' + order_recurring_id
			};

			await this.model_extension_payment_worldpay.logger(order);

			const response_data = await this.model_extension_payment_worldpay.sendCurl('orders', order);

			await this.model_extension_payment_worldpay.logger(response_data);

			let next_payment = new Date();
			let trial_end = new Date();
			let subscription_end = new Date();

			if (item['recurring']['trial'] == 1 && item['recurring']['trial_duration'] != 0) {
				next_payment = await this.calculateSchedule(item['recurring']['trial_frequency'], next_payment, item['recurring']['trial_cycle']);
				trial_end = await this.calculateSchedule(item['recurring']['trial_frequency'], trial_end, item['recurring']['trial_cycle'] * item['recurring']['trial_duration']);
			} else if (item['recurring']['trial'] == 1) {
				next_payment = await this.calculateSchedule(item['recurring']['trial_frequency'], next_payment, item['recurring']['trial_cycle']);
				trial_end = new Date('0000-00-00');
			}

			if (trial_end > subscription_end && item['recurring']['duration'] != 0) {
				subscription_end = new Date(trial_end);
				subscription_end = await this.calculateSchedule(item['recurring']['frequency'], subscription_end, item['recurring']['cycle'] * item['recurring']['duration']);
			} else if (trial_end == subscription_end && item['recurring']['duration'] != 0) {
				next_payment = await this.calculateSchedule(item['recurring']['frequency'], next_payment, item['recurring']['cycle']);
				subscription_end = await this.calculateSchedule(item['recurring']['frequency'], subscription_end, item['recurring']['cycle'] * item['recurring']['duration']);
			} else if (trial_end > subscription_end && item['recurring']['duration'] == 0) {
				subscription_end = new Date('0000-00-00');
			} else if (trial_end == subscription_end && item['recurring']['duration'] == 0) {
				next_payment = await this.calculateSchedule(item['recurring']['frequency'], next_payment, item['recurring']['cycle']);
				subscription_end = new Date('0000-00-00');
			}

			if ((response_data.paymentStatus) && response_data.paymentStatus == 'SUCCESS') {
				await this.addRecurringOrder(order_info, response_data.orderCode, token, price, order_recurring_id, date('Y-m-d H:i:s', trial_end), date('Y-m-d H:i:s', subscription_end));

				await this.updateRecurringOrder(order_recurring_id, date('Y-m-d H:i:s', next_payment));

				await this.addProfileTransaction(order_recurring_id, response_data.orderCode, price, 1);
			} else {
				await this.addProfileTransaction(order_recurring_id, '', price, 4);
			}
		}

		async cronPayment() {

			this.load.model('account/order', this);
			this.load.model('checkout/order', this);
			const profiles = await this.getProfiles();
			const cron_data = [];
			let i = 1;
			for (let profile of profiles) {
				const recurring_order = await this.getRecurringOrder(profile['order_recurring_id']);

				let today = new Date();
				let unlimited = new Date('0000-00-00');
				let next_payment = new Date(recurring_order['next_payment']);
				let trial_end = new Date(recurring_order['trial_end']);
				let subscription_end = new Date(recurring_order['subscription_end']);

				const order_info = await this.model_checkout_order.getOrder(profile['order_id']);
				let price = '', frequency = '', cycle = '';
				if ((today > next_payment) && (trial_end > today || trial_end == unlimited)) {
					price = this.currency.format(profile['trial_price'], order_info['currency_code'], false, false);
					frequency = profile['trial_frequency'];
					cycle = profile['trial_cycle'];
				} else if ((today > next_payment) && (subscription_end > today || subscription_end == unlimited)) {
					price = this.currency.format(profile['recurring_price'], order_info['currency_code'], false, false);
					frequency = profile['recurring_frequency'];
					cycle = profile['recurring_cycle'];
				} else {
					continue;
				}

				const order = {
					"token": recurring_order['token'],
					"orderType": 'RECURRING',
					"amount": (price * 100),
					"currencyCode": order_info['currency_code'],
					"name": order_info['firstname'] + ' ' + order_info['lastname'],
					"orderDescription": order_info['store_name'] + ' - ' + date('Y-m-d H:i:s'),
					"customerOrderCode": 'orderRecurring-' + profile['order_recurring_id'] + '-repeat-' + i++
				};

				await this.model_extension_payment_worldpay.logger(order);

				const response_data = await this.model_extension_payment_worldpay.sendCurl('orders', order);

				await this.model_extension_payment_worldpay.logger(response_data);

				cron_data.push(response_data);

				if ((response_data.paymentStatus) && response_data.paymentStatus == 'SUCCESS') {
					await this.addProfileTransaction(profile['order_recurring_id'], response_data.orderCode, price, 1);
					next_payment = this.calculateSchedule(frequency, next_payment, cycle);
					next_payment = date_format(next_payment, 'Y-m-d H:i:s');
					await this.updateRecurringOrder(profile['order_recurring_id'], next_payment);
				} else {
					await this.addProfileTransaction(profile['order_recurring_id'], '', price, 4);
				}
			}
			const log = new Log('worldpay_recurring_orders.log');
			log.write(JSON.stringify(cron_data, true));
			return cron_data;
		}

		async calculateSchedule(frequency, nextPayment, cycle) {
			nextPayment = new Date(nextPayment);
			if (frequency === 'semi_month') {
				let day = nextPayment.getDate();
				let value = 15 - day;
				let isEven = (cycle % 2 === 0);
				let odd = Math.floor((cycle + 1) / 2);
				let plusEven = Math.floor(cycle / 2) + 1;
				let minusEven = Math.floor(cycle / 2);
				if (day === 1) {
					odd -= 1;
					plusEven -= 1;
					day = 16;
				}
				if (day <= 15 && isEven) {
					nextPayment.setDate(nextPayment.getDate() + value);
					nextPayment.setMonth(nextPayment.getMonth() + minusEven);
				} else if (day <= 15) {
					nextPayment.setDate(1);
					nextPayment.setMonth(nextPayment.getMonth() + odd);
				} else if (day > 15 && isEven) {
					nextPayment.setDate(1);
					nextPayment.setMonth(nextPayment.getMonth() + plusEven);
				} else if (day > 15) {
					nextPayment.setDate(nextPayment.getDate() + value);
					nextPayment.setMonth(nextPayment.getMonth() + odd);
				}
			} else {
				if (frequency === 'daily') {
					nextPayment.setDate(nextPayment.getDate() + cycle);
				} else if (frequency === 'weekly') {
					nextPayment.setDate(nextPayment.getDate() + cycle * 7);
				} else if (frequency === 'monthly') {
					nextPayment.setMonth(nextPayment.getMonth() + cycle);
				} else if (frequency === 'yearly') {
					nextPayment.setFullYear(nextPayment.getFullYear() + cycle);
				}
			}
			return nextPayment;
		}

		async addRecurringOrder(order_info, order_code, token, price, order_recurring_id, trial_end, subscription_end) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "worldpay_order_recurring` SET `order_id` = '" + order_info['order_id'] + "', `order_recurring_id` = '" + order_recurring_id + "', `order_code` = '" + this.db.escape(order_code) + "', `token` = '" + this.db.escape(token) + "', `date_added` = now(), `date_modified` = now(), `next_payment` = now(), `trial_end` = '" + trial_end + "', `subscription_end` = '" + subscription_end + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(price, order_info['currency_code'], false, false) + "'");
		}

		async updateRecurringOrder(order_recurring_id, next_payment) {
			await this.db.query("UPDATE `" + DB_PREFIX + "worldpay_order_recurring` SET `next_payment` = '" + next_payment + "', `date_modified` = now() WHERE `order_recurring_id` = '" + order_recurring_id + "'");
		}

		async getRecurringOrder(order_recurring_id) {
			const qry = await this.db.query("SELECT * FROM " + DB_PREFIX + "worldpay_order_recurring WHERE order_recurring_id = '" + order_recurring_id + "'");
			return qry.row;
		}

		async addProfileTransaction(order_recurring_id, order_code, price, type) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring_transaction` SET `order_recurring_id` = '" + order_recurring_id + "', `date_added` = NOW(), `amount` = '" + price + "', `type` = '" + type + "', `reference` = '" + this.db.escape(order_code) + "'");
		}

		async getProfiles() {
			let sql = "SELECT`or`.order_recurring_id FROM`" + DB_PREFIX + "order_recurring` `or`	JOIN`" + DB_PREFIX + "order` `o` USING(`order_id`)	WHERE o.payment_code = 'worldpay'";

			const qry = await this.db.query(sql);

			const order_recurring = [];

			for (let profile of qry.rows) {
				order_recurring.push(this.getProfile(profile['order_recurring_id']));
			}
			return order_recurring;
		}

		async getProfile(order_recurring_id) {
			const qry = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_recurring WHERE order_recurring_id = " + order_recurring_id);
			return qry.row;
		}

		async getWorldpayOrder(worldpay_order_id) {
			const qry = await this.db.query("SELECT * FROM " + DB_PREFIX + "worldpay_order WHERE order_code = " + worldpay_order_id);
			return qry.row;
		}

		async updateCronJobRunTime() {
			await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `code` = 'payment_worldpay' AND `key` = 'payment_worldpay_last_cron_job_run'");
			await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` (`store_id`, `code`, `key`, `value`, `serialized`) VALUES (0, 'payment_worldpay', 'payment_worldpay_last_cron_job_run', NOW(), 0)");
		}



		async sendCurl(url, order = null) {
			const apiUrl = `https://api.worldpay.com/v1/${url}`;
			const headers = {
				'Authorization': `Basic ${this.config.get('payment_worldpay_service_key')}`,
				'Content-Type': 'application/json'
			};

			let data = null;
			if (order) {
				data = JSON.stringify(order);
				headers['Content-Length'] = Buffer.byteLength(data);
			}

			try {
				const response = await require('axios')({
					method: order ? 'POST' : 'GET',
					url: apiUrl,
					headers: headers,
					data: data,
					timeout: 10000,
					httpsAgent: new (require('https').Agent)({
						rejectUnauthorized: false // Equivalent to CURLOPT_SSL_VERIFYPEER = 0
					})
				});

				return response.data;
			} catch (error) {
				console.error(`Worldpay HTTP Error: ${error.message}`);
				if (error.response) {
					console.error('HTTP Response:', error.response.data);
				}
				return null;
			}
		}


		async logger(data) {
			if (Number(this.config.get('payment_worldpay_debug'))) {
				constlog = new Log('worldpay_debug.log');
				const stack = new Error().stack.split('\n');
				const origin = stack[6] ? stack[6].trim().replace(/^at\s/, '') : 'Unknown';
				const logMessage = `${origin} - ${title}: ${JSON.stringify(data, null, 2)}`;
				log.write(logMessage);
			}
		}

		async recurringPayments() {
			/*
			 * Used by the checkout to state the module
			 * supports recurring profiles.
			 */
			return true;
		}

	}
