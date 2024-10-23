module.exports =class Subscription extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param subscription_id
	 *
	 * @return array
	 */
	async getSubscription(subscription_id) {
		subscription_data = [];

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription` `s` WHERE `subscription_id` = '" + subscription_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");

		if (query.num_rows) {
			subscription_data = query.row;

			subscription_data['payment_method'] = (query.row['payment_method'] ? JSON.parse(query.row['payment_method'], true) : '');
			subscription_data['shipping_method'] = (query.row['shipping_method'] ? JSON.parse(query.row['shipping_method'], true) : '');
		}

		return subscription_data;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscriptionByOrderProductId(order_id, order_product_id) {
		subscription_data = [];

		const query = await this.db.query("SELECT * FROM  `" + DB_PREFIX + "subscription` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "' AND `customer_id` = '" + await this.customer.getId() + "'");

		if (query.num_rows) {
			subscription_data = query.row;

			subscription_data['payment_method'] = (query.row['payment_method'] ? JSON.parse(query.row['payment_method'], true) : '');
			subscription_data['shipping_method'] = (query.row['shipping_method'] ? JSON.parse(query.row['shipping_method'], true) : '');
		}

		return subscription_data;
	}

	/**
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getSubscriptions(start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 1;
		}

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `subscription_status_id` > '0' AND `store_id` = '" + this.config.get('config_store_id') + "' ORDER BY `subscription_id` DESC LIMIT " + start + "," + limit);

		return query.rows;
    }

	/**
	 * @return int
	 */
	async getTotalSubscriptions() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `subscription_status_id` > '0' AND `store_id` = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
    }

	/**
	 * @param address_id
	 *
	 * @return int
	 */
	async getTotalSubscriptionByShippingAddressId(address_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `shipping_address_id` = '" + address_id + "'");

		return query.row['total'];
	}

	/**
	 * @param address_id
	 *
	 * @return int
	 */
	async getTotalSubscriptionByPaymentAddressId(address_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `payment_address_id` = '" + address_id + "'");

		return query.row['total'];
	}

	/**
	 * @param subscription_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getHistories(subscription_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			let limit = 10;
		}

		const query = await this.db.query("SELECT sh.`date_added`, ss.`name` AS status, sh.`comment`, sh.`notify` FROM `" + DB_PREFIX + "subscription_history` `sh` LEFT JOIN `" + DB_PREFIX + "subscription_status` `ss` ON `sh`.`subscription_status_id` = ss.`subscription_status_id` WHERE sh.`subscription_id` = '" + subscription_id + "' AND ss.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY sh.`date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param subscription_id
	 *
	 * @return int
	 */
	async getTotalHistories(subscription_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription_history` WHERE `subscription_id` = '" + subscription_id + "'");

		return query.row['total'];
	}
}
