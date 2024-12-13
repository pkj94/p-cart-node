module.exports = class ModelExtensionPaymentBluePayRedirect extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/bluepay_redirect');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE geo_zone_id = '" + this.config.get('payment_bluepay_redirect_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_bluepay_redirect_total') > 0 && this.config.get('payment_bluepay_redirect_total') > total) {
			status = false;
		} else if (!this.config.get('payment_bluepay_redirect_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'  'bluepay_redirect',
				'title'  this.language.get('text_title'),
				'terms'  '',
				'sort_order'  this.config.get('payment_bluepay_redirect_sort_order')
			});
		}

		return method_data;
	}

	async getCards(customer_id) {

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_card` WHERE customer_id = '" + customer_id + "'");

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

	async addCard(card_data) {
		await this.db.query("INSERT into `" + DB_PREFIX + "bluepay_redirect_card` SET customer_id = '" + this.db.escape(card_data['customer_id']) + "', token = '" + this.db.escape(card_data['Token']) + "', digits = '" + this.db.escape(card_data['Last4Digits']) + "', expiry = '" + this.db.escape(card_data['ExpiryDate']) + "', type = '" + this.db.escape(card_data['CardType']) + "'");
	}

	async addOrder(order_info, response_data) {
		if (this.config.get('payment_bluepay_redirect_transaction') == 'SALE') {
			release_status = 1;
		} else {
			release_status = null;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_redirect_order` SET `order_id` = '" + order_info['order_id'] + "', `transaction_id` = '" + this.db.escape(response_data['RRNO']) + "', `date_added` = now(), `date_modified` = now(), `release_status` = '" + release_status + "',  `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");

		return this.db.getLastId();
	}

	async getOrder(order_id) {
		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			order = qry.row;
			order['transactions'] = this.getTransactions(order['bluepay_redirect_order_id']);

			return order;
		} else {
			return false;
		}
	}

	async addTransaction(bluepay_redirect_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_redirect_order_transaction` SET `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async getTransactions(bluepay_redirect_order_id) {
		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "bluepay_redirect_order_transaction` WHERE `bluepay_redirect_order_id` = '" + bluepay_redirect_order_id + "'");

		if (qry.num_rows) {
			return qry.rows;
		} else {
			return false;
		}
	}

	async logger(message) {
		if (this.config.get('payment_bluepay_redirect_debug') == 1) {
			log = new Log('bluepay_redirect.log');
			log.write(message);
		}
	}

	async sendCurl(url, post_data) {
		curl = curl_init(url);

		curl_setopt(curl, CURLOPT_PORT, 443);
		curl_setopt(curl, CURLOPT_HEADER, 0);
		curl_setopt(curl, CURLOPT_SSL_VERIFYPEER, 0);
		curl_setopt(curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt(curl, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt(curl, CURLOPT_FORBID_REUSE, 1);
		curl_setopt(curl, CURLOPT_FRESH_CONNECT, 1);
		curl_setopt(curl, CURLOPT_POST, 1);
		curl_setopt(curl, CURLOPT_POSTFIELDS, http_build_query(post_data));

		response_data = curl_exec(curl);
		curl_close(curl);

		return JSON.parse(response_data, true);
	}

}
