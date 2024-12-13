module.exports = 
class ModelExtensionPaymentBluePayHosted extends Model {

	async getMethod(address, total) {
		await this.load.language('extension/payment/bluepay_hosted');

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone_to_geo_zone` WHERE geo_zone_id = '" + this.config.get('payment_bluepay_hosted_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_bluepay_hosted_total') > 0 && this.config.get('payment_bluepay_hosted_total') > total) {
			status = false;
		} else if (!this.config.get('payment_bluepay_hosted_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'  'bluepay_hosted',
				'title'  this.language.get('text_title'),
				'terms'  '',
				'sort_order'  this.config.get('payment_bluepay_hosted_sort_order')
			});
		}

		return method_data;
	}

	async addOrder(order_info, response_data) {
		if (this.config.get('payment_bluepay_hosted_transaction') == 'SALE') {
			release_status = 1;
		} else {
			release_status = null;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_hosted_order` SET `order_id` = '" + order_info['order_id'] + "', `transaction_id` = '" + this.db.escape(response_data['RRNO']) + "', `date_added` = now(), `date_modified` = now(), `release_status` = '" + release_status + "', `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");

		return this.db.getLastId();
	}

	async addTransaction(bluepay_hosted_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "bluepay_hosted_order_transaction` SET `bluepay_hosted_order_id` = '" + bluepay_hosted_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async logger(message) {
		if (this.config.get('payment_bluepay_hosted_debug') == 1) {
			log = new Log('bluepay_hosted.log');
			log.write(message);
		}
	}

}
