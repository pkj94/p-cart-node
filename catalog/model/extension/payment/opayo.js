const array_replace_recursive = require("locutus/php/array/array_replace_recursive");
const strftime = require("locutus/php/datetime/strftime");
const mt_rand = require("locutus/php/math/mt_rand");
const trim = require("locutus/php/strings/trim");

module.exports = class ModelExtensionPaymentOpayo extends Model {

	async getMethod(address, total) {
		await this.load.language('extension/payment/opayo');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + this.config.get('payment_opayo_geo_zone_id') + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");
		let status = false;
		if (Number(this.config.get('payment_opayo_total')) > 0 && Number(this.config.get('payment_opayo_total')) > total) {
			status = false;
		} else if (!this.config.get('payment_opayo_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = null;

		if (status) {
			method_data = {
				'code': 'opayo',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_opayo_sort_order')
			};
		}

		return method_data;
	}

	async getCards(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_card` WHERE `customer_id` = '" + customer_id + "' ORDER BY `card_id`");

		const card_data = [];

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

	async addCard(card_data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "opayo_card` SET `customer_id` = '" + this.db.escape(card_data['customer_id']) + "', `digits` = '" + this.db.escape(card_data['Last4Digits']) + "', `expiry` = '" + this.db.escape(card_data['ExpiryDate']) + "', `type` = '" + this.db.escape(card_data['CardType']) + "', `token` = '" + this.db.escape(card_data['Token']) + "'");

		return this.db.getLastId();
	}

	async updateCard(card_id, token) {
		await this.db.query("UPDATE `" + DB_PREFIX + "opayo_card` SET `token` = '" + this.db.escape(token) + "' WHERE `card_id` = '" + card_id + "'");
	}

	async getCard(card_id, token) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_card` WHERE (`card_id` = '" + this.db.escape(card_id) + "' OR `token` = '" + this.db.escape(token) + "') AND `customer_id` = '" + await this.customer.getId() + "'");

		if (query.num_rows) {
			return query.row;
		} else {
			return false;
		}
	}

	async deleteCard(card_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "opayo_card` WHERE `card_id` = '" + card_id + "'");
	}

	async addOrder(order_id, response_data, payment_data, card_id) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "opayo_order` SET `order_id` = '" + order_id + "', `VPSTxId` = '" + this.db.escape(response_data['VPSTxId']) + "', `VendorTxCode` = '" + this.db.escape(payment_data['VendorTxCode']) + "', `SecurityKey` = '" + this.db.escape(response_data['SecurityKey']) + "', `TxAuthNo` = '" + this.db.escape(response_data['TxAuthNo']) + "', `date_added` = now(), `date_modified` = now(), `currency_code` = '" + this.db.escape(payment_data['Currency']) + "', `total` = '" + this.currency.format(payment_data['Amount'], payment_data['Currency'], false, false) + "', `card_id` = '" + this.db.escape(card_id) + "'");

		return this.db.getLastId();
	}

	async getOrder(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (query.num_rows) {
			const order = query.row;

			order['transactions'] = await this.getOrderTransactions(order['opayo_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async updateOrder(order_info, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "opayo_order` SET `SecurityKey` = '" + this.db.escape(data['SecurityKey']) + "',  `VPSTxId` = '" + this.db.escape(data['VPSTxId']) + "', `TxAuthNo` = '" + this.db.escape(data['TxAuthNo']) + "' WHERE `order_id` = '" + order_info['order_id'] + "'");

		return this.db.getLastId();
	}

	async deleteOrder(vendor_tx_code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "opayo_order` WHERE `order_id` = '" + vendor_tx_code + "'");
	}

	async addOrderTransaction(opayo_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "opayo_order_transaction` SET `opayo_order_id` = '" + opayo_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async getOrderTransactions(opayo_order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_order_transaction` WHERE `opayo_order_id` = '" + opayo_order_id + "'");

		if (query.num_rows) {
			return query.rows;
		} else {
			return false;
		}
	}

	async recurringPayment(item, vendor_tx_code) {
		this.load.model('checkout/recurring', this);
		this.load.model('extension/payment/opayo', this);
		let price = '', trial_text = '';
		if (item['recurring']['trial'] == 1) {
			price = item['recurring']['trial_price'];
			trial_amt = this.currency.format(this.tax.calculate(item['recurring']['trial_price'], item['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * item['quantity'] + ' ' + this.session.data['currency'];
			trial_text = sprintf(this.language.get('text_trial'), trial_amt, item['recurring']['trial_cycle'], item['recurring']['trial_frequency'], item['recurring']['trial_duration']);
		} else {
			price = item['recurring']['price'];
			trial_text = '';
		}

		let recurring_amt = this.currency.format(this.tax.calculate(item['recurring']['price'], item['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'], false, false) * item['quantity'] + ' ' + this.session.data['currency'];
		let recurring_description = trial_text + sprintf(this.language.get('text_recurring'), recurring_amt, item['recurring']['cycle'], item['recurring']['frequency']);

		if (item['recurring']['duration'] > 0) {
			recurring_description += sprintf(this.language.get('text_length'), item['recurring']['duration']);
		}

		const order_recurring_id = await this.addRecurring(this.session.data['order_id'], recurring_description, item, vendor_tx_code);

		await this.editRecurringStatus(order_recurring_id, 1);

		const order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		const opayo_order_info = await this.getOrder(this.session.data['order_id']);

		let next_payment = new Date();
		let trial_end = new Date();
		let subscription_end = new Date();

		if ((item['recurring']['trial'] == 1) && (item['recurring']['trial_duration'] != 0)) {
			next_payment = await this.calculateSchedule(item['recurring']['trial_frequency'], next_payment, item['recurring']['trial_cycle']);
			trial_end = await this.calculateSchedule(item['recurring']['trial_frequency'], trial_end, item['recurring']['trial_cycle'] * item['recurring']['trial_duration']);
		} else if (item['recurring']['trial'] == 1) {
			next_payment = await this.calculateSchedule(item['recurring']['trial_frequency'], next_payment, item['recurring']['trial_cycle']);
			trial_end = new Date('0000-00-00');
		}

		if (new Date(date('Y-m-d H:i:s', trial_end)) > new Date(date('Y-m-d H:i:s', subscription_end)) && item['recurring']['duration'] != 0) {
			subscription_end = new Date(date('Y-m-d H:i:s', trial_end));
			subscription_end = await this.calculateSchedule(item['recurring']['frequency'], subscription_end, item['recurring']['cycle'] * item['recurring']['duration']);
		} else if (new Date(date('Y-m-d H:i:s', trial_end)) == new Date(date('Y-m-d H:i:s', subscription_end)) && item['recurring']['duration'] != 0) {
			next_payment = await this.calculateSchedule(item['recurring']['frequency'], next_payment, item['recurring']['cycle']);
			subscription_end = await this.calculateSchedule(item['recurring']['frequency'], subscription_end, item['recurring']['cycle'] * item['recurring']['duration']);
		} else if (new Date(date('Y-m-d H:i:s', trial_end)) > new Date('Y-m-d H:i:s', date(subscription_end)) && item['recurring']['duration'] == 0) {
			subscription_end = new Date('0000-00-00');
		} else if (new Date(date('Y-m-d H:i:s', trial_end)) == new Date(date('Y-m-d H:i:s', subscription_end)) && item['recurring']['duration'] == 0) {
			next_payment = await this.calculateSchedule(item['recurring']['frequency'], next_payment, item['recurring']['cycle']);
			subscription_end = new Date('0000-00-00');
		}
		let recurring_expiry = '';
		if (new Date(date('Y-m-d H:i:s', trial_end)) >= new Date(date('Y-m-d H:i:s', subscription_end))) {
			recurring_expiry = new Date(date('Y-m-d', trial_end));
		} else {
			recurring_expiry = new Date(date('Y-m-d', subscription_end));
		}

		const recurring_frequency = this.calculateRecurringFrequency(next_payment);

		const response_data = await this.setPaymentData(order_info, opayo_order_info, price, order_recurring_id, item['recurring']['name'], recurring_expiry, recurring_frequency);

		await this.addRecurringOrder(this.session.data['order_id'], response_data, order_recurring_id, new Date(date('Y-m-d H:i:s', trial_end)), new Date(date('Y-m-d H:i:s', subscription_end)));

		if (response_data['Status'] == 'OK') {
			await this.updateRecurringOrder(order_recurring_id, new Date(date('Y-m-d H:i:s', next_payment)));

			await this.addRecurringTransaction(order_recurring_id, response_data, 1);
		} else {
			await this.addRecurringTransaction(order_recurring_id, response_data, 4);
		}
	}
	calculateRecurringFrequency(nextPayment) {
		const now = new Date();
		const nextPaymentDate = new Date(nextPayment);
		const timeDiff = Math.abs(nextPaymentDate.getTime() - now.getTime()); const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
		return daysDiff;
	}
	async cronPayment() {
		this.load.model('checkout/order', this);

		const recurrings = await this.getProfiles();
		const cron_data = [];
		let i = 0;

		for (let recurring of recurrings) {
			if (recurring['status'] == 1) {
				const recurring_order = await this.getRecurringOrder(recurring['order_recurring_id']);

				if (recurring_order) {
					let today = new Date();
					let unlimited = new Date('0000-00-00');
					let next_payment = new Date(recurring_order['next_payment']);
					let trial_end = new Date(recurring_order['trial_end']);
					let subscription_end = new Date(recurring_order['subscription_end']);

					const order_info = await this.model_checkout_order.getOrder(recurring['order_id']);
					let price = '', frequency = '', cycle = '';
					if ((new Date('Y-m-d H:i:s', date(today)) > new Date(date('Y-m-d H:i:s', next_payment))) && (new Date(date('Y-m-d H:i:s', trial_end)) > new Date(date('Y-m-d H:i:s', today)) || new Date(date('Y-m-d H:i:s', trial_end)) == new Date(date('Y-m-d H:i:s', unlimited)))) {
						price = this.currency.format(recurring['trial_price'], order_info['currency_code'], false, false);
						frequency = recurring['trial_frequency'];
						cycle = recurring['trial_cycle'];
						next_payment = await this.calculateSchedule(frequency, next_payment, cycle);
					} else if ((new Date(date('Y-m-d H:i:s', today)) > new Date(date('Y-m-d H:i:s', next_payment))) && (new Date(date('Y-m-d H:i:s', subscription_end)) > new Date(date('Y-m-d H:i:s', today)) || new Date(date('Y-m-d H:i:s', subscription_end)) == new Date(date('Y-m-d H:i:s', unlimited)))) {
						price = this.currency.format(recurring['recurring_price'], order_info['currency_code'], false, false);
						frequency = recurring['recurring_frequency'];
						cycle = recurring['recurring_cycle'];
						next_payment = await this.calculateSchedule(frequency, next_payment, cycle);
					} else {
						continue;
					}

					const opayo_order_info = await this.getOrder(recurring['order_id']);
					let recurring_expiry = '';
					if (new Date(date('Y-m-d H:i:s', trial_end)) >= new Date(date('Y-m-d H:i:s', subscription_end))) {
						recurring_expiry = new Date(date('Y-m-d', trial_end));
					} else {
						recurring_expiry = new Date(date('Y-m-d', subscription_end));
					}

					const recurring_frequency = this.calculateRecurringFrequency(next_payment);

					const response_data = await this.setPaymentData(order_info, opayo_order_info, price, recurring['order_recurring_id'], recurring['recurring_name'], recurring_expiry, recurring_frequency, i);

					cron_data.push(response_data);

					if (response_data['RepeatResponseData_' + i++]['Status'] == 'OK') {
						await this.addRecurringTransaction(recurring['order_recurring_id'], response_data, 1);

						await this.updateRecurringOrder(recurring['order_recurring_id'], new Date(date('Y-m-d H:i:s', next_payment)));
					} else {
						await this.addRecurringTransaction(recurring['order_recurring_id'], response_data, 4);
					}
				}
			}
		}

		const log = new Log('opayo_recurring_orders.log');

		log.write(JSON.stringify(cron_data, true));

		return cron_data;
	}

	async setPaymentData(order_info, opayo_order_info, price, order_recurring_id, recurring_name, recurring_expiry, recurring_frequency, i = null) {
		// Setting
		const _config = new Config();
		await _config.load('opayo');

		const config_setting = _config.get('payze_opayo');

		const setting = { ...config_setting, ...this.config.get('payment_opayo_setting') };
		let url = '';
		if (setting['general']['environment'] == 'live') {
			url = 'https://live.opayo.eu.elavon.com/gateway/service/repeat.vsp';
			payment_data['VPSProtocol'] = '4.00';
		} else if (setting['general']['environment'] == 'test') {
			url = 'https://sandbox.opayo.eu.elavon.com/gateway/service/repeat.vsp';
			payment_data['VPSProtocol'] = '4.00';
		}

		payment_data['TxType'] = 'REPEAT';
		payment_data['Vendor'] = this.config.get('payment_opayo_vendor');
		payment_data['VendorTxCode'] = order_recurring_id + 'RSD' + strftime("%Y%m%d%H%M%S") + mt_rand(1, 999);
		payment_data['Amount'] = this.currency.format(price, this.session.data['currency'], false, false);
		payment_data['Currency'] = this.session.data['currency'];
		payment_data['Description'] = recurring_name.substr(0, 100);
		payment_data['RelatedVPSTxId'] = trim(opayo_order_info['VPSTxId'], '{}');
		payment_data['RelatedVendorTxCode'] = opayo_order_info['VendorTxCode'];
		payment_data['RelatedSecurityKey'] = opayo_order_info['SecurityKey'];
		payment_data['RelatedTxAuthNo'] = opayo_order_info['TxAuthNo'];
		payment_data['COFUsage'] = 'SUBSEQUENT';
		payment_data['InitiatedType'] = 'MIT';
		payment_data['MITType'] = 'RECURRING';
		payment_data['RecurringExpiry'] = recurring_expiry;
		payment_data['RecurringFrequency'] = recurring_frequency;

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

		response_data = await this.sendCurl(url, payment_data, i);

		response_data['VendorTxCode'] = payment_data['VendorTxCode'];
		response_data['Amount'] = payment_data['Amount'];
		response_data['Currency'] = payment_data['Currency'];

		return response_data;
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
		await this.db.query("INSERT INTO `" + DB_PREFIX + "opayo_order_recurring` SET `order_id` = '" + order_id + "', `order_recurring_id` = '" + order_recurring_id + "', `VPSTxId` = '" + this.db.escape(response_data['VPSTxId']) + "', `VendorTxCode` = '" + this.db.escape(response_data['VendorTxCode']) + "', `SecurityKey` = '" + this.db.escape(response_data['SecurityKey']) + "', `TxAuthNo` = '" + this.db.escape(response_data['TxAuthNo']) + "', `date_added` = now(), `date_modified` = now(), `next_payment` = now(), `trial_end` = '" + trial_end + "', `subscription_end` = '" + subscription_end + "', `currency_code` = '" + this.db.escape(response_data['Currency']) + "', `total` = '" + this.currency.format(response_data['Amount'], response_data['Currency'], false, false) + "'");
	}

	async updateRecurringOrder(order_recurring_id, next_payment) {
		await this.db.query("UPDATE `" + DB_PREFIX + "opayo_order_recurring` SET `next_payment` = '" + next_payment + "', `date_modified` = now() WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}

	async getRecurringOrder(order_recurring_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "opayo_order_recurring` WHERE `order_recurring_id` = '" + order_recurring_id + "'");
		return qry.row;
	}

	async addRecurring(order_id, description, data, reference) {
		const order_recurring_id = await this.model_checkout_recurring.addRecurring(order_id, description, data);
		await this.model_checkout_recurring.editReference(order_recurring_id, reference);
		return order_recurring_id;
	}

	async editRecurringStatus(order_recurring_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `status` = '" + status + "' WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}

	async addRecurringTransaction(order_recurring_id, response_data, type) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring_transaction` SET `order_recurring_id` = '" + order_recurring_id + "', `date_added` = NOW(), `amount` = '" + response_data['Amount'] + "', `type` = '" + type + "', `reference` = '" + this.db.escape(response_data['VendorTxCode']) + "'");
	}

	async getProfiles() {
		const query = await this.db.query("SELECT `or`.`order_recurring_id` FROM `" + DB_PREFIX + "order_recurring` `or` JOIN `" + DB_PREFIX + "order` `o` USING(`order_id`) WHERE o.payment_code = 'opayo' AND `or`.`status` = '1'");

		const order_recurring = [];

		for (let recurring of query.rows) {
			order_recurring.push(await this.getProfile(recurring['order_recurring_id']));
		}

		return order_recurring;
	}

	async getProfile(order_recurring_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_recurring` WHERE `order_recurring_id` = '" + order_recurring_id + "'");

		return query.row;
	}

	async updateCronRunTime() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `code` = 'opayo' AND `key` = 'payment_opayo_last_cron_run'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` (`store_id`, `code`, `key`, `value`, `serialized`) VALUES (0, 'opayo', 'payment_opayo_last_cron_run', NOW(), 0)");
	}

	async sendCurl(url, payment_data, i = null) {
		try {
			const response = await require('axios').post(url, querystring.stringify(payment_data), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				timeout: 60000, // Set appropriate timeout 
				httpsAgent: new (require('https').Agent)({
					rejectUnauthorized: false // Equivalent to CURLOPT_SSL_VERIFYPEER = 0 
				})
			});
			const response_info = response.data.split('\n');
			let data = {};
			response_info.forEach(string => {
				if (!string.includes('='))
					return;
				const [key, value] = string.split('=', 2).map(part => part.trim());
				if (i !== null) {
					if (!data[`RepeatResponseData_${i}`])
						data[`RepeatResponseData_${i}`] = {};
					data[`RepeatResponseData_${i}`][key] = value;
				} else {
					data[key] = value;
				}
			});
			return data;
		} catch (error) {
			console.error('Error during HTTP request:', error.message);
			// throw error;
			return data;
		}
	}

	async log(title, data) {
		const _config = new Config();
		await _config.load('opayo');

		const config_setting = _config.get('opayo_setting');

		const setting = { ...config_setting, ...this.config.get('payment_opayo_setting') };

		if (setting['general']['debug']) {
			const log = new Log('opayo.log');

			log.write(title + ': ' + JSON.stringify(data, true));
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
