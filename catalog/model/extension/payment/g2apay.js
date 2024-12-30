module.exports = class ModelExtensionPaymentG2APay extends Model {

	async getMethod(address, total) {
		await this.load.language('extension/payment/g2apay');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_g2apay_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");
		let status = false;
		if (Number(this.config.get('payment_g2apay_total')) > 0 && Number(this.config.get('payment_g2apay_total')) > total) {
			status = false;
		} else if (!this.config.get('payment_g2apay_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		let method_data = null;

		if (status) {
			method_data = {
				'code': 'g2apay',
				'title': this.language.get('text_title'),
				'terms': '',
				'sort_order': this.config.get('payment_g2apay_sort_order')
			};
		}

		return method_data;
	}

	async addG2aOrder(order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "g2apay_order` SET `order_id` = '" + order_info['order_id'] + "', `date_added` = now(), `modified` = now(), `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async updateOrder(g2apay_order_id, g2apay_transaction_id, type, order_info) {
		await this.db.query("UPDATE `" + DB_PREFIX + "g2apay_order` SET `g2apay_transaction_id` = '" + this.db.escape(g2apay_transaction_id) + "', `modified` = now() WHERE `order_id` = '" + order_info['order_id'] + "'");

		this.addTransaction(g2apay_order_id, type, order_info);

	}

	async addTransaction(g2apay_order_id, type, order_info) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "g2apay_order_transaction` SET `g2apay_order_id` = '" + g2apay_order_id + "', `date_added` = now(), `type` = '" + this.db.escape(type) + "', `amount` = '" + this.currency.format(order_info['total'], order_info['currency_code'], false, false) + "'");
	}

	async getG2aOrder(order_id) {
		const qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "g2apay_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		if (qry.num_rows) {
			return qry.row;
		} else {
			return false;
		}
	}

	async sendCurl(url, fields) {
		try {
			const response = await require('axios').post(url, fields, {
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
			return response.data;
		} catch (error) {
			console.error('Error during HTTP request:', error.message);
			return error;
		}
	}

	async logger(message) {
		if (Number(this.config.get('payment_g2apay_debug')) == 1) {
			const log = new Log('g2apay.log');
			const stack = new Error().stack.split('\n')[6].trim();
			const origin = stack.replace(/^at\s/, '');
			log.write(`Origin: ${origin}\n${JSON.stringify(message, null, 2)}`);
		}
	}
}