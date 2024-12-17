const getdate = require("locutus/php/datetime/getdate");

module.exports = class ModelExtensionPaymentCardConnect extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/cardconnect');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE `geo_zone_id` = '" + this.config.get('cardconnect_geo_zone') + "' AND `country_id` = '" + address['country_id'] + "' AND (`zone_id` = '" + address['zone_id'] + "' OR `zone_id` = '0')");
		let status = false;
		if (this.config.get('cardconnect_total') > 0 && this.config.get('cardconnect_total') > total) {
			status = false;
		} else if (!this.config.get('cardconnect_geo_zone')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code': 'cardconnect',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('cardconnect_sort_order')
			};
		}

		return method_data;
	}

	async getCardTypes() {
		const cards = [];

		cards.push({
			'text': 'Visa',
			'value': 'VISA'
		});

		cards.push({
			'text': 'MasterCard',
			'value': 'MASTERCARD'
		});

		cards.push({
			'text': 'Discover Card',
			'value': 'DISCOVER'
		});

		cards.push({
			'text': 'American Express',
			'value': 'AMEX'
		});

		return cards;
	}

	async getMonths() {
		const months = [];

		for (i = 1; i <= 12; i++) {
			months.push({
				'text': sprintf('%02d', i),
				'value': sprintf('%02d', i)
			});
		}

		return months;
	}

	async getYears() {
		const years = [];

		const today = getdate();

		for (let i = today['year']; i < today['year'] + 11; i++) {
			years.push({
				'text': sprintf('%02d', i % 100),
				'value': sprintf('%02d', i % 100)
			});
		}

		return years;
	}

	async getCard(token, customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardconnect_card` WHERE `token` = '" + this.db.escape(token) + "' AND `customer_id` = '" + customer_id + "'");

		if (query.num_rows) {
			return query.row;
		} else {
			return false;
		}
	}

	async getCards(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cardconnect_card` WHERE `customer_id` = '" + customer_id + "'");

		return query.rows;
	}

	async addCard(cardconnect_order_id, customer_id, profileid, token, type, account, expiry) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_card` SET `cardconnect_order_id` = '" + cardconnect_order_id + "', `customer_id` = '" + customer_id + "', `profileid` = '" + this.db.escape(profileid) + "', `token` = '" + this.db.escape(token) + "', `type` = '" + this.db.escape(type) + "', `account` = '" + this.db.escape(account) + "', `expiry` = '" + this.db.escape(expiry) + "', `date_added` = NOW()");
	}

	async deleteCard(token, customer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "cardconnect_card` WHERE `token` = '" + this.db.escape(token) + "' AND `customer_id` = '" + customer_id + "'");
	}

	async addOrder(order_info, payment_method) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_order` SET `order_id` = '" + order_info['order_id'] + "', `customer_id` = '" + await this.customer.getId() + "', `payment_method` = '" + this.db.escape(payment_method) + "', `retref` = '" + this.db.escape(order_info['retref']) + "', `authcode` = '" + this.db.escape(order_info['authcode']) + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	async addTransaction(cardconnect_order_id, type, status, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cardconnect_order_transaction` SET `cardconnect_order_id` = '" + cardconnect_order_id + "', `type` = '" + this.db.escape(type) + "', `retref` = '" + this.db.escape(order_info['retref']) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "', `status` = '" + this.db.escape(status) + "', `date_modified` = NOW(), `date_added` = NOW()");
	}

	async getSettlementStatuses(merchant_id, date) {
		await this.log('Getting settlement statuses from CardConnect');
		const url = `${this.getCurlUrl()}?merchid=${merchant_id}&date=${date}`; const headers = {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + Buffer.from(`${this.config.cardconnect_api_username}:${this.config.cardconnect_api_password}`).toString('base64')
		};
		await this.model_extension_payment_cardconnect.log('Header:', headers);
		await this.model_extension_payment_cardconnect.log('URL:', url);
		try {
			const response = await require('axios').get(url, {
				headers,
				timeout: 30000,
				httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
			});
			await this.log('SUCCESS', response.data);
			const responseData = response.data; // Handle any errors in the response 
			if (responseData.Error) {
				throw new Error(responseData.Error.Message);
			}
			return responseData;
		} catch (error) {
			this.model_extension_payment_cardconnect.log('ERROR', { message: error.message, stack: error.stack });
			throw new Error(this.config.error_process_order);
		}
	}

	async updateTransactionStatusByRetref(retref, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "cardconnect_order_transaction` SET `status` = '" + this.db.escape(status) + "', `date_modified` = NOW() WHERE `retref` = '" + this.db.escape(retref) + "'");
	}

	async updateCronRunTime() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `key` = 'cardconnect_cron_time'");

		await this.db.query("INSERT INTO `" + DB_PREFIX + "setting` SET `store_id` = '0', `code` = 'cardconnect', `key` = 'cardconnect_cron_time', `value` = NOW(), `serialized` = '0'");
	}

	async log(data) {
		if (this.config.get('cardconnect_logging')) {
			const log = new Log('cardconnect.log');

			await log.write(data);
		}
	}
}