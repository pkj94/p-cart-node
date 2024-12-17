module.exports = class ModelExtensionPaymentEway extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/eway');
		let status = false;
		if (Number(this.config.get('payment_eway_status'))) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_eway_standard_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
			if (!this.config.get('payment_eway_standard_geo_zone_id')) {
				status = true;
			} else if (query.num_rows) {
				status = true;
			} else {
				status = false;
			}
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code': 'eway',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_eway_sort_order')
			};
		}

		return method_data;
	}

	async addOrder(order_data) {
		let cap = '';
		if (this.config.get('payment_eway_transaction_method') == 'payment') {
			cap = ",`capture_status` = '1'";
		}
		await this.db.query("INSERT INTO `" + DB_PREFIX + "eway_order` SET `order_id` = '" + order_data['order_id'] + "', `created` = NOW(), `modified` = NOW(), `debug_data` = '" + this.db.escape(order_data['debug_data']) + "', `amount` = '" + this.currency.format(order_data['amount'], order_data['currency_code'], false, false) + "', `currency_code` = '" + this.db.escape(order_data['currency_code']) + "', `transaction_id` = '" + this.db.escape(order_data['transaction_id']) + "'{cap}");

		return this.db.getLastId();
	}

	async addTransaction(eway_order_id, type, transactionid, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "eway_transactions` SET `eway_order_id` = '" + eway_order_id + "', `created` = NOW(), `transaction_id` = '" + this.db.escape(transactionid) + "', `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");

		return this.db.getLastId();
	}

	async getCards(customer_id) {

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "eway_card WHERE customer_id = '" + customer_id + "'");

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

	async checkToken(token_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "eway_card WHERE token_id = '" + token_id + "'");
		if (query.num_rows) {
			return true;
		} else {
			return false;
		}
	}

	async addCard(order_id, card_data) {
		await this.db.query("INSERT into " + DB_PREFIX + "eway_card SET customer_id = '" + this.db.escape(card_data['customer_id']) + "', order_id = '" + this.db.escape(order_id) + "', digits = '" + this.db.escape(card_data['Last4Digits']) + "', expiry = '" + this.db.escape(card_data['ExpiryDate']) + "', type = '" + this.db.escape(card_data['CardType']) + "'");
	}

	async updateCard(order_id, token) {
		await this.db.query("UPDATE " + DB_PREFIX + "eway_card SET token = '" + this.db.escape(token) + "' WHERE order_id = '" + order_id + "'");
	}

	async updateFullCard(card_id, token, card_data) {
		await this.db.query("UPDATE " + DB_PREFIX + "eway_card SET token = '" + this.db.escape(token) + "', digits = '" + this.db.escape(card_data['Last4Digits']) + "', expiry = '" + this.db.escape(card_data['ExpiryDate']) + "', type = '" + this.db.escape(card_data['CardType']) + "' WHERE card_id = '" + card_id + "'");
	}

	async deleteCard(order_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "eway_card WHERE order_id = '" + order_id + "'");
	}

	async getAccessCode(request) {
		let url = '';
		if (Number(this.config.get('payment_eway_test'))) {
			url = 'https://api.sandbox.ewaypayments.com/AccessCodes';
		} else {
			url = 'https://api.ewaypayments.com/AccessCodes';
		}

		const response = await this.sendCurl(url, request);
		// response = JSON.parse(response);

		return response;
	}

	async getSharedAccessCode(request) {
		let url = '';
		if (Number(this.config.get('payment_eway_test'))) {
			url = 'https://api.sandbox.ewaypayments.com/AccessCodesShared';
		} else {
			url = 'https://api.ewaypayments.com/AccessCodesShared';
		}

		const response = await this.sendCurl(url, request);
		// response = JSON.parse(response);

		return response;
	}

	async getAccessCodeResult(access_code) {
		let url = '';
		if (Number(this.config.get('payment_eway_test'))) {
			url = 'https://api.sandbox.ewaypayments.com/AccessCode/' + access_code;
		} else {
			url = 'https://api.ewaypayments.com/AccessCode/' + access_code;
		}

		const response = await this.sendCurl(url, '', false);
		// response = JSON.parse(response);

		return response;
	}


	async sendCurl(url, data, is_post = true) {
		const eway_username = this.config.payment_eway_username;
		const eway_password = this.config.payment_eway_password;
		const auth = Buffer.from(`${eway_username}:${eway_password}`).toString('base64');

		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${auth}`
		};

		const options = {
			method: is_post ? 'POST' : 'GET',
			url: url,
			headers: headers,
			timeout: 60000,
			httpsAgent: new (require('https').Agent)({
				rejectUnauthorized: true
			}),
			data: is_post ? data : null
		};

		try {
			const response = await require('axios')(options);
			if (response.status !== 200) {
				let errorResponse = {
					Errors: 'Error connecting to eWAY: ' + response.status
				};
				if (response.status === 401 || response.status === 403 || response.status === 404) {
					errorResponse.Errors = "Please check the API Key and Password";
				}
				throw errorResponse;
			}
			return response.data;
		} catch (error) {
			let errorResponse = {
				Errors: `POST Error: ${error.message} URL: ${url}`
			};
			console.error('cURL failed', { error: error.message, errno: error.code });
			throw errorResponse;
		}
	}


}
