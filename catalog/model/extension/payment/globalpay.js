module.exports = class ModelExtensionPaymentGlobalpay extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/globalpay');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_globalpay_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_globalpay_total') > 0 && this.config.get('payment_globalpay_total') > total) {
			status = false;
		} else if (!this.config.get('payment_globalpay_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'        'globalpay',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_globalpay_sort_order')
			});
		}

		return method_data;
	}

	async addOrder(order_info, pas_ref, auth_code, account, order_ref) {
		if (this.config.get('payment_globalpay_auto_settle') == 1) {
			settle_status = 1;
		} else {
			settle_status = 0;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "globalpay_order` SET `order_id` = '" + order_info['order_id'] + "', `settle_type` = '" + this.config.get('payment_globalpay_auto_settle') + "', `order_ref` = '" + this.db.escape(order_ref) + "', `order_ref_previous` = '" + this.db.escape(order_ref) + "', `date_added` = now(), `date_modified` = now(), `capture_status` = '" + settle_status + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `pasref` = '" + this.db.escape(pas_ref) + "', `pasref_previous` = '" + this.db.escape(pas_ref) + "', `authcode` = '" + this.db.escape(auth_code) + "', `account` = '" + this.db.escape(account) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false) + "'");

		return this.db.getLastId();
	}

	async addTransaction(globalpay_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "globalpay_order_transaction` SET `globalpay_order_id` = '" + globalpay_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], order_info['currency_value'], false) + "'");
	}

	async addHistory(order_id, order_status_id, comment) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "order_history SET order_id = '" + order_id + "', order_status_id = '" + order_status_id + "', notify = '0', comment = '" + this.db.escape(comment) + "', date_added = NOW()");
	}

	async logger(message) {
		if (this.config.get('payment_globalpay_debug') == 1) {
			log = new Log('globalpay.log');
			log.write(message);
		}
	}
}