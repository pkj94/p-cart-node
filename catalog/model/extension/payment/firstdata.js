module.exports = class ModelExtensionPaymentFirstdata extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/firstdata');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_firstdata_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_firstdata_total') > 0 && this.config.get('payment_firstdata_total') > total) {
			status = false;
		} else if (!this.config.get('payment_firstdata_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'        'firstdata',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_firstdata_sort_order')
			});
		}

		return method_data;
	}

	async addOrder(order_info, order_ref, transaction_date) {
		if (this.config.get('payment_firstdata_auto_settle') == 1) {
			settle_status = 1;
		} else {
			settle_status = 0;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_order` SET `order_id` = '" + order_info['order_id'] + "', `order_ref` = '" + this.db.escape(order_ref) + "', `tdate` = '" + this.db.escape(transaction_date) + "', `date_added` = now(), `date_modified` = now(), `capture_status` = '" + settle_status + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false) + "'");

		return this.db.getLastId();
	}

	async getOrder(order_id) {
		order = await this.db.query("SELECT * FROM `" + DB_PREFIX + "firstdata_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		return order.row;
	}

	async addTransaction(fd_order_id, type, order_info = array()) {
		if ((order_info)) {
			amount = this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false);
		} else {
			amount = 0.00;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_order_transaction` SET `firstdata_order_id` = '" + fd_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + amount + "'");
	}

	async addHistory(order_id, order_status_id, comment) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "order_history SET order_id = '" + order_id + "', order_status_id = '" + order_status_id + "', notify = '0', comment = '" + this.db.escape(comment) + "', date_added = NOW()");
	}

	async logger(message) {
		if (this.config.get('payment_firstdata_debug') == 1) {
			log = new Log('firstdata.log');
			log.write(message);
		}
	}

	async mapCurrency(code) {
		currency = array(
			'GBP'  826,
			'USD'  840,
			'EUR'  978,
		});

		if (array_key_exists(code, currency)) {
			return currency[code];
		} else {
			return false;
		}
	}

	async getStoredCards() {
		customer_id = await this.customer.getId();

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "firstdata_card` WHERE `customer_id` = '" + customer_id + "'");

		return query.rows;
	}

	async storeCard(token, customer_id, month, year, digits) {
		existing_card = await this.db.query("SELECT * FROM `" + DB_PREFIX + "firstdata_card` WHERE `token` = '" + this.db.escape(token) + "' AND `customer_id` = '" + customer_id + "' LIMIT 1");

		if (existing_card.num_rows > 0) {
			await this.db.query("UPDATE `" + DB_PREFIX + "firstdata_card` SET `expire_month` = '" + this.db.escape(month) + "', `expire_year` = '" + this.db.escape(year) + "', `digits` = '" + this.db.escape(digits) + "'");
		} else {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "firstdata_card` SET `customer_id` = '" + customer_id + "', `date_added` = now(), `token` = '" + this.db.escape(token) + "', `expire_month` = '" + this.db.escape(month) + "', `expire_year` = '" + this.db.escape(year) + "', `digits` = '" + this.db.escape(digits) + "'");
		}
	}

	async responseHash(total, currency, txn_date, approval_code) {
		tmp = total + this.config.get('payment_firstdata_secret') + currency + txn_date + this.config.get('payment_firstdata_merchant_id') + approval_code;

		ascii = bin2hex(tmp);

		return sha1(ascii);
	}

	async updateVoidStatus(order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "firstdata_order` SET `void_status` = '" + status + "' WHERE `order_id` = '" + order_id + "'");
	}

	async updateCaptureStatus(order_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "firstdata_order` SET `capture_status` = '" + status + "' WHERE `order_id` = '" + order_id + "'");
	}
}