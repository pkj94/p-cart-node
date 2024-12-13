module.exports = class ModelExtensionPaymentSecureTradingWs extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/securetrading_ws');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_securetrading_ws_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_securetrading_ws_total') > total) {
			status = false;
		} else if (!this.config.get('payment_securetrading_ws_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'        'securetrading_ws',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_securetrading_ws_sort_order')
			});
		}

		return method_data;
	}

	async call(data) {
		ch = curl_init();

		defaults = array(
			CURLOPT_POST  1,
			CURLOPT_HEADER  0,
			CURLOPT_SSL_VERIFYPEER  0,
			CURLOPT_URL  'https://webservices.securetrading.net/xml/',
			CURLOPT_FRESH_CONNECT  1,
			CURLOPT_RETURNTRANSFER  1,
			CURLOPT_FORBID_REUSE  1,
			CURLOPT_TIMEOUT  15,
			CURLOPT_HTTPHEADER  array(
				'User-Agent: OpenCart - Secure Trading WS',
				'Content-Length: ' + strlen(data),
				'Authorization: Basic ' + base64_encode(this.config.get('payment_securetrading_ws_username') + ':' + this.config.get('payment_securetrading_ws_password')),
			),
			CURLOPT_POSTFIELDS  data,
		});

		curl_setopt_array(ch, defaults);

		response = curl_exec(ch);

		if (response === false) {
			this.log.write('Secure Trading WS CURL Error: (' + curl_errno(ch) + ') ' + curl_error(ch));
		}

		curl_close(ch);

		return response;
	}

	async format(number, currency, value = '', format = false) {

		decimal_place = this.currency.getDecimalPlace(currency);

		if (!value) {
			value = this.currency.getValue(currency);
		}

		amount = value ? number * value : number;

		amount = number_format(amount, decimal_place);

		if (!format) {
			return amount;
		}
	}

	async getOrder(order_id) {
		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "securetrading_ws_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		return qry.row;
	}

	async addMd(order_id, md) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "securetrading_ws_order SET order_id = " + order_id + ", md = '" + this.db.escape(md) + "', `created` = now(), `modified` = now()");
	}

	async removeMd(md) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "securetrading_ws_order WHERE md = '" + this.db.escape(md) + "'");
	}

	async updateReference(order_id, transaction_reference) {
		await this.db.query("UPDATE " + DB_PREFIX + "securetrading_ws_order SET transaction_reference = '" + this.db.escape(transaction_reference) + "' WHERE order_id = " + order_id);

		if (this.db.countAffected() == 0) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "securetrading_ws_order SET order_id = " + order_id + ", transaction_reference = '" + this.db.escape(transaction_reference) + "', `created` = now(), `modified` = now()");
		}
	}

	async getOrderId(md) {
		row = await this.db.query("SELECT order_id FROM " + DB_PREFIX + "securetrading_ws_order WHERE md = '" + this.db.escape(md) + "' LIMIT 1").row;

		if ((row['order_id']) && (row['order_id'])) {
			return row['order_id'];
		} else {
			return false;
		}
	}

	async confirmOrder(order_id, order_status_id, comment = '', notify = false) {
		this.load.model('checkout/order',this);

		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET order_status_id = 0 WHERE order_id = " + order_id);

		await this.model_checkout_order.addOrderHistory(order_id, order_status_id, comment, notify);

		order_info = await this.model_checkout_order.getOrder(order_id);

		securetrading_ws_order = this.getOrder(order_info['order_id']);

		amount = this.currency.format(order_info['total'], order_info['currency_code'], false, false);

		switch(this.config.get('payment_securetrading_ws_settle_status')){
			case 0:
				trans_type = 'auth';
				break;
			case 1:
				trans_type = 'auth';
				break;
			case 2:
				trans_type = 'suspended';
				break;
			case 100:
				trans_type = 'payment';
				break;
			default :
				trans_type = '';
		}

		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_ws_order` SET `settle_type` = '" + this.config.get('payment_securetrading_ws_settle_status') + "', `modified` = now(), `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + amount + "' WHERE order_id = " + order_info['order_id']);

		await this.db.query("INSERT INTO `" + DB_PREFIX + "securetrading_ws_order_transaction` SET `securetrading_ws_order_id` = '" + securetrading_ws_order['securetrading_ws_order_id'] + "', `amount` = '" + amount + "', type = '" + trans_type + "',  `created` = now()");
	}

	async updateOrder(order_id, order_status_id, comment = '', notify = false) {
		this.load.model('checkout/order',this);

		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET order_status_id = " + order_status_id + " WHERE order_id = "  + order_id);

		await this.model_checkout_order.addOrderHistory(order_id, order_status_id, comment, notify);
	}

	async logger(message) {
		log = new Log('secure.log');
		log.write(message);
	}
}
