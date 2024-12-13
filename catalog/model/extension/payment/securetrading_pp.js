module.exports = class ModelExtensionPaymentSecureTradingPp extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/securetrading_pp');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "zone_to_geo_zone WHERE geo_zone_id = '" + this.config.get('payment_securetrading_pp_geo_zone_id') + "' AND country_id = '" + address['country_id'] + "' AND (zone_id = '" + address['zone_id'] + "' OR zone_id = '0')");

		if (this.config.get('payment_securetrading_pp_total') > total) {
			status = false;
		} else if (!this.config.get('payment_securetrading_pp_geo_zone_id')) {
			status = true;
		} else if (query.num_rows) {
			status = true;
		} else {
			status = false;
		}

		method_data = array();

		if (status) {
			method_data = array(
				'code'        'securetrading_pp',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_securetrading_pp_sort_order')
			});
		}

		return method_data;
	}

	async getOrder(order_id) {
		qry = await this.db.query("SELECT * FROM `" + DB_PREFIX + "securetrading_pp_order` WHERE `order_id` = '" + order_id + "' LIMIT 1");

		return qry.row;
	}

	async editOrder(order_id, order) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET shipping_firstname = '" + this.db.escape(order['shipping_firstname']) + "', shipping_lastname = '" + this.db.escape(order['shipping_lastname']) + "', shipping_address_1 = '" + this.db.escape(order['shipping_address_1']) + "', shipping_address_2 = '" + this.db.escape(order['shipping_address_2']) + "', shipping_city = '" + this.db.escape(order['shipping_city']) + "', shipping_zone = '" + this.db.escape(order['shipping_zone']) + "', shipping_zone_id = " + order['shipping_zone_id'] + ", shipping_country = '" + this.db.escape(order['shipping_country']) + "', shipping_country_id = " + order['shipping_country_id'] + ", shipping_postcode = '" + this.db.escape(order['shipping_postcode']) + "',  payment_firstname = '" + this.db.escape(order['payment_firstname']) + "', payment_lastname = '" + this.db.escape(order['payment_lastname']) + "', payment_address_1 = '" + this.db.escape(order['payment_address_1']) + "', payment_address_2 = '" + this.db.escape(order['payment_address_2']) + "', payment_city = '" + this.db.escape(order['payment_city']) + "', payment_zone = '" + this.db.escape(order['payment_zone']) + "', payment_zone_id = " + order['payment_zone_id'] + ", payment_country = '" + this.db.escape(order['payment_country']) + "', payment_country_id = " + order['payment_country_id'] + ", payment_postcode = '" + this.db.escape(order['payment_postcode']) + "' WHERE order_id = " + order_id);
	}

	async addReference(order_id, reference) {
		await this.db.query("REPLACE INTO " + DB_PREFIX + "securetrading_pp_order SET order_id = " + order_id + ", transaction_reference = '" + this.db.escape(reference) + "', `created` = now()");
	}

	async confirmOrder(order_id, order_status_id, comment = '', notify = false) {

		this.logger('confirmOrder');

		this.load.model('checkout/order',this);

		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET order_status_id = 0 WHERE order_id = "  + order_id);

		await this.model_checkout_order.addOrderHistory(order_id, order_status_id, comment, notify);

		order_info = await this.model_checkout_order.getOrder(order_id);

		securetrading_pp_order = this.getOrder(order_id);

		amount = this.currency.format(order_info['total'], order_info['currency_code'], false, false);

		switch(this.config.get('payment_securetrading_pp_settle_status')){
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
				trans_type = 'default';
		}

		await this.db.query("UPDATE `" + DB_PREFIX + "securetrading_pp_order` SET `settle_type` = '" + this.config.get('payment_securetrading_pp_settle_status') + "', `modified` = now(), `currency_code` = '" + this.db.escape(order_info['currency_code']) + "', `total` = '" + amount + "' WHERE order_id = " + order_info['order_id']);

		await this.db.query("INSERT INTO `" + DB_PREFIX + "securetrading_pp_order_transaction` SET `securetrading_pp_order_id` = '" + securetrading_pp_order['securetrading_pp_order_id'] + "', `amount` = '" + amount + "', type = '" + trans_type + "',  `created` = now()");

	}

	async updateOrder(order_id, order_status_id, comment = '', notify = false) {
		this.load.model('checkout/order',this);

		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET order_status_id = " + order_status_id + " WHERE order_id = " + order_id);

		await this.model_checkout_order.addOrderHistory(order_id, order_status_id, comment, notify);
	}

	async getCountry(iso_code_2) {
		return await this.db.query("SELECT * FROM " + DB_PREFIX + "country WHERE LOWER(iso_code_2) = '" + this.db.escape(iso_code_2) + "'").row;
	}

	async logger(message) {
		log = new Log('secure.log');
		log.write(message);
	}
}