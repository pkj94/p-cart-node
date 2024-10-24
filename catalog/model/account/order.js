module.exports = class Order extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getOrder(order_id) {
		const order_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order` WHERE `order_id` = '" + order_id + "' AND `customer_id` = '" + await this.customer.getId() + "' AND `customer_id` != '0' AND `order_status_id` > '0'");

		if (order_query.num_rows) {
			let country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE `country_id` = '" + order_query.row['payment_country_id'] + "'");
			let payment_iso_code_2 = '';
			let payment_iso_code_3 = '';
			if (country_query.num_rows) {
				payment_iso_code_2 = country_query.row['iso_code_2'];
				payment_iso_code_3 = country_query.row['iso_code_3'];
			}

			let zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + order_query.row['payment_zone_id'] + "'");
			let payment_zone_code = '';
			if (zone_query.num_rows) {
				payment_zone_code = zone_query.row['code'];
			}

			country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + order_query.row['shipping_country_id'] + "'");
			let shipping_iso_code_2 = '';
			let shipping_iso_code_3 = '';
			if (country_query.num_rows) {
				shipping_iso_code_2 = country_query.row['iso_code_2'];
				shipping_iso_code_3 = country_query.row['iso_code_3'];
			}

			zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + order_query.row['shipping_zone_id'] + "'");
			let shipping_zone_code = '';
			if (zone_query.num_rows) {
				shipping_zone_code = zone_query.row['code'];
			}

			return {
				'order_id': order_query.row['order_id'],
				'invoice_no': order_query.row['invoice_no'],
				'invoice_prefix': order_query.row['invoice_prefix'],
				'store_id': order_query.row['store_id'],
				'store_name': order_query.row['store_name'],
				'store_url': order_query.row['store_url'],
				'customer_id': order_query.row['customer_id'],
				'firstname': order_query.row['firstname'],
				'lastname': order_query.row['lastname'],
				'telephone': order_query.row['telephone'],
				'email': order_query.row['email'],
				'payment_firstname': order_query.row['payment_firstname'],
				'payment_lastname': order_query.row['payment_lastname'],
				'payment_company': order_query.row['payment_company'],
				'payment_address_1': order_query.row['payment_address_1'],
				'payment_address_2': order_query.row['payment_address_2'],
				'payment_postcode': order_query.row['payment_postcode'],
				'payment_city': order_query.row['payment_city'],
				'payment_zone_id': order_query.row['payment_zone_id'],
				'payment_zone': order_query.row['payment_zone'],
				'payment_zone_code': payment_zone_code,
				'payment_country_id': order_query.row['payment_country_id'],
				'payment_country': order_query.row['payment_country'],
				'payment_iso_code_2': payment_iso_code_2,
				'payment_iso_code_3': payment_iso_code_3,
				'payment_address_format': order_query.row['payment_address_format'],
				'payment_method': order_query.row['payment_method'] ? JSON.parse(order_query.row['payment_method'], true) : '',
				'shipping_firstname': order_query.row['shipping_firstname'],
				'shipping_lastname': order_query.row['shipping_lastname'],
				'shipping_company': order_query.row['shipping_company'],
				'shipping_address_1': order_query.row['shipping_address_1'],
				'shipping_address_2': order_query.row['shipping_address_2'],
				'shipping_postcode': order_query.row['shipping_postcode'],
				'shipping_city': order_query.row['shipping_city'],
				'shipping_zone_id': order_query.row['shipping_zone_id'],
				'shipping_zone': order_query.row['shipping_zone'],
				'shipping_zone_code': shipping_zone_code,
				'shipping_country_id': order_query.row['shipping_country_id'],
				'shipping_country': order_query.row['shipping_country'],
				'shipping_iso_code_2': shipping_iso_code_2,
				'shipping_iso_code_3': shipping_iso_code_3,
				'shipping_address_format': order_query.row['shipping_address_format'],
				'shipping_method': order_query.row['shipping_method'] ? JSON.parse(order_query.row['shipping_method'], true) : '',
				'comment': order_query.row['comment'],
				'total': order_query.row['total'],
				'order_status_id': order_query.row['order_status_id'],
				'language_id': order_query.row['language_id'],
				'currency_id': order_query.row['currency_id'],
				'currency_code': order_query.row['currency_code'],
				'currency_value': order_query.row['currency_value'],
				'date_modified': order_query.row['date_modified'],
				'date_added': order_query.row['date_added'],
				'ip': order_query.row['ip']
			};
		} else {
			return {};
		}
	}

	/**
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getOrders(start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 1;
		}

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `order_status_id` > '0' AND `store_id` = '" + this.config.get('config_store_id') + "' ORDER BY `order_id` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param subscription_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getOrdersBySubscriptionId(subscription_id, start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 1;
		}

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order` WHERE `subscription_id` = '" + subscription_id + "' AND `customer_id` = '" + await this.customer.getId() + "' AND `order_status_id` > '0' AND `store_id` = '" + this.config.get('config_store_id') + "' ORDER BY `order_id` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param subscription_id
	 *
	 * @return int
	 */
	async getTotalOrdersBySubscriptionId(subscription_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE `subscription_id` = '" + subscription_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");

		return query.row['total'];
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getProduct(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.row;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getProducts(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getOptions(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_option` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscription(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_subscription` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.row;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getVouchers(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_voucher` WHERE `order_id` = '" + order_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getTotals(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_total` WHERE `order_id` = '" + order_id + "' ORDER BY `sort_order`");

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getHistories(order_id) {
		const query = await this.db.query("SELECT `date_added`, os.`name` AS status, oh.`comment`, oh.`notify` FROM `" + DB_PREFIX + "order_history` oh LEFT JOIN `" + DB_PREFIX + "order_status` os ON oh.`order_status_id` = os.`order_status_id` WHERE oh.`order_id` = '" + order_id + "' AND os.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY oh.`date_added`");

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalHistories(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_history` WHERE `order_id` = '" + order_id + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @return int
	 */
	async getTotalOrders() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` o WHERE `customer_id` = '" + await this.customer.getId() + "' AND o.`order_status_id` > '0' AND o.`store_id` = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param product_id
	 *
	 * @return int
	 */
	async getTotalOrdersByProductId(product_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_product` op LEFT JOIN `" + DB_PREFIX + "order` o ON (op.`order_id` = o.`order_id`) WHERE o.`customer_id` = '" + await this.customer.getId() + "' AND op.`product_id` = '" + product_id + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalProductsByOrderId(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalVouchersByOrderId(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_voucher` WHERE `order_id` = '" + order_id + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}
}
