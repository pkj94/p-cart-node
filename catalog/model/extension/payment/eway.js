module.exports = class ModelExtensionPaymentEway extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/eway');

		if (this.config.get('payment_eway_status')) {
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

		method_data = array();

		if (status) {
			method_data = array(
				'code'  'eway',
				'title'  this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_eway_sort_order')
			});
		}

		return method_data;
	}

	async addOrder(order_data) {

		cap = '';
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

		card_data = array();

		this.load.model('account/address',this);

		for (query.rows as row) {

			card_data.push(array(
				'card_id'  row['card_id'],
				'customer_id'  row['customer_id'],
				'token'  row['token'],
				'digits'  '**** ' + row['digits'],
				'expiry'  row['expiry'],
				'type'  row['type'],
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
		if (this.config.get('payment_eway_test')) {
			url = 'https://api.sandbox.ewaypayments.com/AccessCodes';
		} else {
			url = 'https://api.ewaypayments.com/AccessCodes';
		}

		response = this.sendCurl(url, request);
		response = JSON.parse(response);

		return response;
	}

	async getSharedAccessCode(request) {
		if (this.config.get('payment_eway_test')) {
			url = 'https://api.sandbox.ewaypayments.com/AccessCodesShared';
		} else {
			url = 'https://api.ewaypayments.com/AccessCodesShared';
		}

		response = this.sendCurl(url, request);
		response = JSON.parse(response);

		return response;
	}

	async getAccessCodeResult(access_code) {
		if (this.config.get('payment_eway_test')) {
			url = 'https://api.sandbox.ewaypayments.com/AccessCode/' + access_code;
		} else {
			url = 'https://api.ewaypayments.com/AccessCode/' + access_code;
		}

		response = this.sendCurl(url, '', false);
		response = JSON.parse(response);

		return response;
	}

	async sendCurl(url, data, is_post=true) {
		ch = curl_init(url);

		eway_username = html_entity_decode(this.config.get('payment_eway_username'));
		eway_password = html_entity_decode(this.config.get('payment_eway_password'));

		curl_setopt(ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
		curl_setopt(ch, CURLOPT_USERPWD, eway_username + ":" + eway_password);
		if (is_post) {
		curl_setopt(ch, CURLOPT_POST, 1);
			curl_setopt(ch, CURLOPT_POSTFIELDS, JSON.stringify(data));
		} else {
			curl_setopt(ch, CURLOPT_CUSTOMREQUEST, 'GET');
		}
		curl_setopt(ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(ch, CURLOPT_TIMEOUT, 60);
		curl_setopt(ch, CURLOPT_SSL_VERIFYPEER, 1);
		curl_setopt(ch, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(ch, CURLOPT_FRESH_CONNECT, 1);

		response = curl_exec(ch);

		if (curl_errno(ch) != CURLE_OK) {
			response = new stdClass();
			response.Errors = "POST Error: " + curl_error(ch) + " URL: url";
			this.log.write(array('error'  curl_error(ch), 'errno'  curl_errno(ch)), 'cURL failed');
			response = JSON.stringify(response);
		} else {
			info = curl_getinfo(ch);
			if (info['http_code'] != 200) {
				response = new stdClass();
				if (info['http_code'] == 401 || info['http_code'] == 404 || info['http_code'] == 403) {
					response.Errors = "Please check the API Key and Password";
				} else {
					response.Errors = 'Error connecting to eWAY: ' + info['http_code'];
				}
				response = JSON.stringify(response);
			}
		}

		curl_close(ch);

		return response;
	}

}
