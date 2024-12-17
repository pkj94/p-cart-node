module.exports = class ModelExtensionPaymentBluePayRedirect extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/bluepay_redirect');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE geo_zone_id = '" + this.config.get('payment_bluepay_redirect_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (this.config.get('payment_bluepay_redirect_total') > 0 && this.config.get('payment_bluepay_redirect_total') > total) {
			status = false;
		} else if (!this.config.get('payment_bluepay_redirect_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code': 'bluepay_redirect',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_bluepay_redirect_sort_order')
			};
		}

		return method_data;
	}

	async getCards(customer_id) {

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_card` WHERE customer_id = '" + customer_id + "'");

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

	async addCard(card_data) {
		await this.db.query("INSERT into `" + DB_PREFIX + "bluepay_redirect_card` SET customer_id = '" + this.db.escape(card_data['customer_id']) + "', token = '" + this.db.escape(card_data['Token']) + "', digits = '" + this.db.escape(card_data['Last4Digits']) + "', expiry = '" + this.db.escape(card_data['ExpiryDate']) + "', type = '" + this.db.escape(card_data['CardType']) + "'");
	}

	async addOrder(order_info, response_data) {
		let release_status = null;
		if (this.config.get('payment_bluepay_redirect_transaction') == 'SALE') {
			release_status = 1;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_redirect_order` SET `order_id` = '" + order_info['order_id'] + "', `transaction_id` = '" + this.db.escape(response_data['RRNO']) + "', `date_added` = now(), `date_modified` = now(), `release_status` = '" + release_status + "',  `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");

		return this.db.getLastId();
	}

	async getOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			const order = qry.row;
			order['transactions'] = await this.getTransactions(order['bluepay_redirect_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async addTransaction(bluepay_redirect_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_redirect_order_transaction` SET `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async getTransactions(bluepay_redirect_order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_order_transaction` WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async logger(message) {
		if (this.config.get('payment_bluepay_redirect_debug') == 1) {
			const log = new Log('bluepay_redirect.log');
			await log.write(message);
		}
	}

	async sendCurl(url, postData) {
		try {
			const response = await require('axios').post(url, require('querystring').stringify(postData), {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, httpsAgent: new (require('https').Agent)({
					rejectUnauthorized: false // Equivalent to CURLOPT_SSL_VERIFYPEER = 0 
				}),
				maxRedirects: 5, // Equivalent to CURLOPT_FOLLOWLOCATION // Additional options to mimic CURLOPT_FORBID_REUSE and CURLOPT_FRESH_CONNECT are not directly available in axios 
			});
			return response.data;
		} catch (error) {
			console.error('Error during HTTP request:', error.message);
			return null;
		}
	}

}
