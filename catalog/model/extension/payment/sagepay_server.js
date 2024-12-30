const trim = require("locutus/php/strings/trim");

module.exports = class ModelExtensionPaymentSagePayServer extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/sagepay_server');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE geo_zone_id = '" + this.config.get('payment_sagepay_server_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (Number(this.config.get('payment_sagepay_server_total')) > 0 && Number(this.config.get('payment_sagepay_server_total')) > total) {
			status = false;
		} else if (!this.config.get('payment_sagepay_server_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = null;

		if (status) {
			method_data = {
				'code': 'sagepay_server',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_sagepay_server_sort_order')
			};
		}

		return method_data;
	}

	async getCards(customer_id) {

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "sagepay_server_card` WHERE customer_id = '" + customer_id + "'");

		const card_data = [];

		this.load.model('account/address', this);

		for (let row of query.rows) {

			card_data.push({
				'card_id': row['card_id'],
				'customer_id': row['customer_id'],
				'token': row['token'],
				'digits': '**** ' + row['digits'],
				'expiry': row['expiry'],
				'type': row['type'],
			});
		}
		return card_data;
	}

	async getCard(card_id, token) {
		const qry = await this.db.query("SELECT * FROM " + DB_PREFIX + "sagepay_server_card WHERE (card_id = '" + this.db.escape(card_id) + "' OR token = '" + this.db.escape(token) + "') AND customer_id = '" + await this.customer.getId() + "'");

		if (qry.num_rows) {
			return qry.row;
		} else {
			return false;
		}
	}

	async addCard(data) {
		await this.db.query("INSERT into `" + DB_PREFIX + "sagepay_server_card` SET customer_id = '" + this.db.escape(data['customer_id']) + "', token = '" + this.db.escape(data['Token']) + "', digits = '" + this.db.escape(data['Last4Digits']) + "', expiry = '" + this.db.escape(data['ExpiryDate']) + "', type = '" + this.db.escape(data['CardType']) + "'");
	}

	async deleteCard(card_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "sagepay_server_card WHERE card_id = '" + card_id + "'");
	}

	async addOrder(order_info) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "sagepay_server_order` WHERE `order_id` = '" + order_info['order_id'] + "'");

		await this.db.query("INSERT INTO `" + DB_PREFIX + "sagepay_server_order` SET `order_id` = '" + order_info['order_id'] + "', `customer_id` = '" + await this.customer.getId() + "', `VPSTxId` = '" + this.db.escape(order_info['VPSTxId']) + "',  `VendorTxCode` = '" + this.db.escape(order_info['VendorTxCode']) + "', `SecurityKey` = '" + this.db.escape(order_info['SecurityKey']) + "', `date_added` = now(), `date_modified` = now(), `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async getOrder(order_id, vpstx_id = null) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "sagepay_server_order` WHERE `order_id` = '" + order_id + "' OR `VPSTxId` = '" + this.db.escape(vpstx_id) + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['sagepay_server_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async updateOrder(order_info, vps_txn_id, tx_auth_no) {
		await this.db.query("UPDATE `" + DB_PREFIX + "sagepay_server_order` SET `VPSTxId` = '" + this.db.escape(vps_txn_id) + "', `TxAuthNo` = '" + this.db.escape(tx_auth_no) + "' WHERE `order_id` = '" + order_info['order_id'] + "'");
	}

	async deleteOrder(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "sagepay_server_order` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_recurring` WHERE order_id = '" + order_id + "'");
	}

	async addTransaction(sagepay_server_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "sagepay_server_order_transaction` SET `sagepay_server_order_id` = '" + sagepay_server_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async getTransactions(sagepay_server_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "sagepay_server_order_transaction` WHERE `sagepay_server_order_id` = '" + sagepay_server_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async getRecurringOrders(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_recurring` WHERE order_id = '" + order_id + "'");
		return query.rows;
	}

	async addRecurringPayment(item, vendor_tx_code) {

		this.load.model('checkout/recurring', this);
		await this.load.language('extension/payment/sagepay_server');

		//trial information
		let trial_text = '';
		if (item['recurring']['trial'] == 1) {
			let trial_amt = this.currency.format(this.tax.calculate(item['recurring']['trial_price'], item['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * item['quantity'] + ' ' + this.session.data['currency'];
			trial_text = sprintf(this.language.get('text_trial'), trial_amt, item['recurring']['trial_cycle'], item['recurring']['trial_frequency'], item['recurring']['trial_duration']);
		} else {
			trial_text = '';
		}

		let recurring_amt = this.currency.format(this.tax.calculate(item['recurring']['price'], item['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * item['quantity'] + ' ' + this.session.data['currency'];
		let recurring_description = trial_text + sprintf(this.language.get('text_recurring'), recurring_amt, item['recurring']['cycle'], item['recurring']['frequency']);

		if (item['recurring']['duration'] > 0) {
			recurring_description += sprintf(this.language.get('text_length'), item['recurring']['duration']);
		}

		//create new recurring and set to pending status as no payment has been made yet.
		const recurring_id = await this.model_checkout_recurring.addRecurring(this.session.data['order_id'], recurring_description, item['recurring']);

		await this.model_checkout_recurring.editReference(recurring_id, vendor_tx_code);
	}

	async updateRecurringPayment(item, order_details) {

		this.load.model('checkout/recurring', this);

		const order_info = await this.model_checkout_order.getOrder(order_details['order_id']);

		//trial information
		let price = '';
		if (item['trial'] == 1) {
			price = this.currency.format(item['trial_price'], this.session.data['currency'], false, false);
		} else {
			price = this.currency.format(item['recurring_price'], this.session.data['currency'], false, false);
		}

		const response_data = await this.setPaymentData(order_info, order_details, price, item['order_recurring_id'], item['recurring_name']);

		let next_payment = new Date();
		let trial_end = new Date();
		let subscription_end = new Date();

		if (item['trial'] == 1 && item['trial_duration'] != 0) {
			next_payment = await this.calculateSchedule(item['trial_frequency'], next_payment, item['trial_cycle']);
			trial_end = await this.calculateSchedule(item['trial_frequency'], trial_end, item['trial_cycle'] * item['trial_duration']);
		} else if (item['trial'] == 1) {
			next_payment = await this.calculateSchedule(item['trial_frequency'], next_payment, item['trial_cycle']);
			trial_end = new Date('0000-00-00');
		}

		if (trial_end > subscription_end && item['recurring_duration'] != 0) {
			subscription_end = new Date(trial_end);
			subscription_end = await this.calculateSchedule(item['recurring_frequency'], subscription_end, item['recurring_cycle'] * item['recurring_duration']);
		} else if (trial_end == subscription_end && item['recurring_duration'] != 0) {
			next_payment = await this.calculateSchedule(item['recurring_frequency'], next_payment, item['recurring_cycle']);
			subscription_end = await this.calculateSchedule(item['recurring_frequency'], subscription_end, item['recurring_cycle'] * item['recurring_duration']);
		} else if (trial_end > subscription_end && item['recurring_duration'] == 0) {
			subscription_end = new Date('0000-00-00');
		} else if (trial_end == subscription_end && item['recurring_duration'] == 0) {
			next_payment = await this.calculateSchedule(item['recurring_frequency'], next_payment, item['recurring_cycle']);
			subscription_end = new Date('0000-00-00');
		}

		await this.addRecurringOrder(order_details['order_id'], response_data, item['order_recurring_id'], date('Y-m-d H:i:s', trial_end), date('Y-m-d H:i:s', subscription_end));

		if (response_data['Status'] == 'OK') {
			await this.updateRecurringOrder(item['order_recurring_id'], date('Y-m-d H:i:s', next_payment));

			await this.addRecurringTransaction(item['order_recurring_id'], response_data, 1);
		} else {
			await this.addRecurringTransaction(item['order_recurring_id'], response_data, 4);
		}
	}

	async setPaymentData(order_info, sagepay_order_info, price, order_recurring_id, recurring_name, i = null) {
		let url = '';
		if (this.config.get('payment_sagepay_server_test') == 'live') {
			url = 'https://live.sagepay.com/gateway/service/repeat.vsp';
			payment_data['VPSProtocol'] = '3.00';
		} else if (this.config.get('payment_sagepay_server_test') == 'test') {
			url = 'https://test.sagepay.com/gateway/service/repeat.vsp';
			payment_data['VPSProtocol'] = '3.00';
		} else if (this.config.get('payment_sagepay_server_test') == 'sim') {
			url = 'https://test.sagepay.com/Simulator/VSPServerGateway.asp?Service=VendorRepeatTx';
			payment_data['VPSProtocol'] = '2.23';
		}

		payment_data['TxType'] = 'REPEAT';
		payment_data['Vendor'] = this.config.get('payment_sagepay_server_vendor');
		payment_data['VendorTxCode'] = order_recurring_id + 'RSD' + date("YmdHis") + mt_rand(1, 999);
		payment_data['Amount'] = this.currency.format(price, this.session.data['currency'], false, false);
		payment_data['Currency'] = this.session.data['currency'];
		payment_data['Description'] = recurring_name.substr(0, 100);
		payment_data['RelatedVPSTxId'] = trim(sagepay_order_info['VPSTxId'], '{}');
		payment_data['RelatedVendorTxCode'] = sagepay_order_info['VendorTxCode'];
		payment_data['RelatedSecurityKey'] = sagepay_order_info['SecurityKey'];
		payment_data['RelatedTxAuthNo'] = sagepay_order_info['TxAuthNo'];

		if ((order_info['shipping_lastname'])) {
			payment_data['DeliverySurname'] = order_info['shipping_lastname'].substr(0, 20);
			payment_data['DeliveryFirstnames'] = order_info['shipping_firstname'].substr(0, 20);
			payment_data['DeliveryAddress1'] = order_info['shipping_address_1'].substr(0, 100);

			if (order_info['shipping_address_2']) {
				payment_data['DeliveryAddress2'] = order_info['shipping_address_2'];
			}

			payment_data['DeliveryCity'] = order_info['shipping_city'].substr(0, 40);
			payment_data['DeliveryPostCode'] = order_info['shipping_postcode'].substr(0, 10);
			payment_data['DeliveryCountry'] = order_info['shipping_iso_code_2'];

			if (order_info['shipping_iso_code_2'] == 'US') {
				payment_data['DeliveryState'] = order_info['shipping_zone_code'];
			}

			payment_data['CustomerName'] = (order_info['firstname'] + ' ' + order_info['lastname']).substr(0, 100);
			payment_data['DeliveryPhone'] = order_info['telephone'].substr(0, 20);
		} else {
			payment_data['DeliveryFirstnames'] = order_info['payment_firstname'];
			payment_data['DeliverySurname'] = order_info['payment_lastname'];
			payment_data['DeliveryAddress1'] = order_info['payment_address_1'];

			if (order_info['payment_address_2']) {
				payment_data['DeliveryAddress2'] = order_info['payment_address_2'];
			}

			payment_data['DeliveryCity'] = order_info['payment_city'];
			payment_data['DeliveryPostCode'] = order_info['payment_postcode'];
			payment_data['DeliveryCountry'] = order_info['payment_iso_code_2'];

			if (order_info['payment_iso_code_2'] == 'US') {
				payment_data['DeliveryState'] = order_info['payment_zone_code'];
			}

			payment_data['DeliveryPhone'] = order_info['telephone'];
		}
		const response_data = await this.sendCurl(url, payment_data, i);
		response_data['VendorTxCode'] = payment_data['VendorTxCode'];
		response_data['Amount'] = payment_data['Amount'];
		response_data['Currency'] = payment_data['Currency'];

		return response_data;
	}

	async cronPayment() {

		this.load.model('account/order', this);
		const recurrings = await this.getProfiles();
		const cron_data = [];
		let i = 0;

		for (let recurring of recurrings) {

			const recurring_order = await this.getRecurringOrder(recurring['order_recurring_id']);

			let today = new Date();
			let unlimited = new Date('0000-00-00');
			let next_payment = new Date(recurring_order['next_payment']);
			let trial_end = new Date(recurring_order['trial_end']);
			let subscription_end = new Date(recurring_order['subscription_end']);

			const order_info = await this.model_account_order.getOrder(recurring['order_id']);
			let price = '', frequency = '', cycle = '';
			if ((today > next_payment) && (trial_end > today || trial_end == unlimited)) {
				price = this.currency.format(recurring['trial_price'], order_info['currency_code'], false, false);
				frequency = recurring['trial_frequency'];
				cycle = recurring['trial_cycle'];
			} else if ((today > next_payment) && (subscription_end > today || subscription_end == unlimited)) {
				price = this.currency.format(recurring['recurring_price'], order_info['currency_code'], false, false);
				frequency = recurring['recurring_frequency'];
				cycle = recurring['recurring_cycle'];
			} else {
				continue;
			}

			const sagepay_order_info = await this.getOrder(recurring['order_id']);

			const response_data = await this.setPaymentData(order_info, sagepay_order_info, price, recurring['order_recurring_id'], recurring['recurring_name'], i);

			cron_data.push(response_data);

			if (response_data['RepeatResponseData_' + i++]['Status'] == 'OK') {
				await this.addRecurringTransaction(recurring['order_recurring_id'], response_data, 1);
				next_payment = await this.calculateSchedule(frequency, next_payment, cycle);
				next_payment = date('Y-m-d H:i:s', next_payment);
				await this.updateRecurringOrder(recurring['order_recurring_id'], next_payment);
			} else {
				await this.addRecurringTransaction(recurring['order_recurring_id'], response_data, 4);
			}
		}
		const log = new Log('sagepay_server_recurring_orders.log');
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

	async addRecurringOrder(order_id, response_data, order_recurring_id, trial_end, subscription_end) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "sagepay_server_order_recurring` SET `order_id` = '" + order_id + "', `order_recurring_id` = '" + order_recurring_id + "', `VPSTxId` = '" + this.db.escape(response_data['VPSTxId']) + "', `VendorTxCode` = '" + this.db.escape(response_data['VendorTxCode']) + "', `SecurityKey` = '" + this.db.escape(response_data['SecurityKey']) + "', `TxAuthNo` = '" + this.db.escape(response_data['TxAuthNo']) + "', `date_added` = now(), `date_modified` = now(), `next_payment` = now(), `trial_end` = '" + trial_end + "', `subscription_end` = '" + subscription_end + "', `currency_code` = '" + this.db.escape(response_data['Currency']) + "', `total` = '" + this.currency.format(response_data['Amount'], response_data['Currency'], false, false) + "'");
	}

	async updateRecurringOrder(order_recurring_id, next_payment) {
		await this.db.query("UPDATE `" + DB_PREFIX + "sagepay_server_order_recurring` SET `next_payment` = '" + next_payment + "', `date_modified` = now() WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}

	async getRecurringOrder(order_recurring_id) {
		const qry = await this.db.query("SELECT * FROM " + DB_PREFIX + "sagepay_server_order_recurring WHERE order_recurring_id = '" + order_recurring_id + "'");
		return qry.row;
	}

	async addRecurringTransaction(order_recurring_id, response_data, type) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring_transaction` SET `order_recurring_id` = '" + order_recurring_id + "', `date_added` = NOW(), `amount` = '" + response_data['Amount'] + "', `type` = '" + type + "', `reference` = '" + this.db.escape(response_data['VendorTxCode']) + "'");
	}

	async getProfiles() {

		let sql = "SELECT`or`.order_recurring_id FROM`" + DB_PREFIX + "order_recurring` `or` JOIN`" + DB_PREFIX + "order` `o` USING(`order_id`)	WHERE o.payment_code = 'sagepay_server'";

		const qry = await this.db.query(sql);

		const order_recurring = [];

		for (let recurring of qry.rows) {
			order_recurring.push(this.getProfile(recurring['order_recurring_id']));
		}
		return order_recurring;
	}

	async getProfile(order_recurring_id) {
		const qry = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_recurring WHERE order_recurring_id = " + order_recurring_id);
		return qry.row;
	}

	async updateCronJobRunTime() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `code` = 'sagepay_server' AND `key` = 'payment_sagepay_server_last_cron_job_run'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` (`store_id`, `code`, `key`, `value`, `serialized`) VALUES (0, 'sagepay_server', 'payment_sagepay_server_last_cron_job_run', NOW(), 0)");
	}


	async sendCurl(url, payment_data, i = null) {
		try {
			const response = await require('axios').post(url, require('querystring').stringify(payment_data), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				timeout: 60000, // Set appropriate timeout
				httpsAgent: new (require('https').Agent)({
					rejectUnauthorized: false // Equivalent to CURLOPT_SSL_VERIFYPEER = 0
				})
			});

			const response_info = response.data.split('\n');
			let data = {};

			response_info.forEach(string => {
				if (!string.includes('=')) return;

				const [key, value] = string.split('=', 2).map(part => part.trim());

				if (i !== null) {
					if (!data[`RepeatResponseData_${i}`]) data[`RepeatResponseData_${i}`] = {};
					data[`RepeatResponseData_${i}`][key] = value;
				} else {
					data[key] = value;
				}
			});

			return data;
		} catch (error) {
			console.error('Error during HTTP request:', error.message);
			// throw error;
			return error;
		}
	}

	async logger(title, data) {
		if (this.config.get('payment_sagepay_server_debug')) {
			const log = new Log('sagepay_server.log');
			const stack = new Error().stack.split('\n');
			const origin = stack[6] ? stack[6].trim().replace(/^at\s/, '') : 'Unknown';
			const logMessage = `${origin} - ${title}: ${JSON.stringify(data, null, 2)}`;
			log.write(logMessage);
		}
	}

	async recurringPayments() {
		/*
		 * Used by the checkout to state the module
		 * supports recurring recurrings.
		 */
		return true;
	}
}