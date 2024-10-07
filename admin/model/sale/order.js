module.exports = class OrderSaleModel extends Model {
	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getOrder(order_id) {
		let order_query = await this.db.query("SELECT *, (SELECT `os`.`name` FROM `" + DB_PREFIX + "order_status` os WHERE `os`.`order_status_id` = `o`.`order_status_id` AND `os`.`language_id` = '" + this.config.get('config_language_id') + "') AS `order_status` FROM `" + DB_PREFIX + "order` `o` WHERE `o`.`order_id` = '" + order_id + "'");

		if (order_query.num_rows) {
			let country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE `country_id` = '" + order_query.row['payment_country_id'] + "'");

			if (country_query.num_rows) {
				payment_iso_code_2 = country_query.row['iso_code_2'];
				payment_iso_code_3 = country_query.row['iso_code_3'];
			} else {
				payment_iso_code_2 = '';
				payment_iso_code_3 = '';
			}

			let zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + order_query.row['payment_zone_id'] + "'");

			if (zone_query.num_rows) {
				payment_zone_code = zone_query.row['code'];
			} else {
				payment_zone_code = '';
			}

			country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE `country_id` = '" + order_query.row['shipping_country_id'] + "'");

			if (country_query.num_rows) {
				shipping_iso_code_2 = country_query.row['iso_code_2'];
				shipping_iso_code_3 = country_query.row['iso_code_3'];
			} else {
				shipping_iso_code_2 = '';
				shipping_iso_code_3 = '';
			}

			zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE `zone_id` = '" + order_query.row['shipping_zone_id'] + "'");

			if (zone_query.num_rows) {
				shipping_zone_code = zone_query.row['code'];
			} else {
				shipping_zone_code = '';
			}

			reward = 0;

			let order_product_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");

			for (let product of order_product_query.rows) {
				reward += product['reward'];
			}

			this.load.model('customer/customer');

			let affiliate_info = await this.model_customer_customer.getCustomer(order_query.row['affiliate_id']);

			if (affiliate_info) {
				affiliate = affiliate_info['firstname'] + ' ' + affiliate_info['lastname'];
			} else {
				affiliate = '';
			}

			this.load.model('localisation/language', this);

			let language_info = await this.model_localisation_language.getLanguage(order_query.row['language_id']);

			if (language_info) {
				language_code = language_info['code'];
			} else {
				language_code = this.config.get('config_language');
			}

			return {
				'order_id': order_query.row['order_id'],
				'invoice_no': order_query.row['invoice_no'],
				'invoice_prefix': order_query.row['invoice_prefix'],
				'store_id': order_query.row['store_id'],
				'store_name': order_query.row['store_name'],
				'store_url': order_query.row['store_url'],
				'customer_id': order_query.row['customer_id'],
				'customer_group_id': order_query.row['customer_group_id'],
				'firstname': order_query.row['firstname'],
				'lastname': order_query.row['lastname'],
				'email': order_query.row['email'],
				'telephone': order_query.row['telephone'],
				'custom_field': json_decode(order_query.row['custom_field'], true),
				'payment_address_id': order_query.row['payment_address_id'],
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
				'payment_custom_field': json_decode(order_query.row['payment_custom_field'], true),
				'payment_method': json_decode(order_query.row['payment_method'], true),
				'shipping_address_id': order_query.row['shipping_address_id'],
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
				'shipping_custom_field': json_decode(order_query.row['shipping_custom_field'], true),
				'shipping_method': json_decode(order_query.row['shipping_method'], true),
				'comment': order_query.row['comment'],
				'total': order_query.row['total'],
				'reward': reward,
				'order_status_id': order_query.row['order_status_id'],
				'order_status': order_query.row['order_status'],
				'affiliate_id': order_query.row['affiliate_id'],
				'affiliate': affiliate,
				'commission': order_query.row['commission'],
				'language_id': order_query.row['language_id'],
				'language_code': language_code,
				'currency_id': order_query.row['currency_id'],
				'currency_code': order_query.row['currency_code'],
				'currency_value': order_query.row['currency_value'],
				'ip': order_query.row['ip'],
				'forwarded_ip': order_query.row['forwarded_ip'],
				'user_agent': order_query.row['user_agent'],
				'accept_language': order_query.row['accept_language'],
				'date_added': order_query.row['date_added'],
				'date_modified': order_query.row['date_modified']
			};
		} else {
			return {};
		}
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getOrders(data = {}) {
		let sql = "SELECT o.`order_id`, CONCAT(o.`firstname`, ' ', o.`lastname`) AS customer, (SELECT os.`name` FROM `" + DB_PREFIX + "order_status` os WHERE os.`order_status_id` = o.`order_status_id` AND os.`language_id` = '" + this.config.get('config_language_id') + "') AS order_status, o.`store_name`, o.`shipping_method`, o.`total`, o.`currency_code`, o.`currency_value`, o.`date_added`, o.`date_modified` FROM `" + DB_PREFIX + "order` o";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',',);

			for (let order_status_id of order_statuses) {
				implode.push("o.`order_status_id` = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " WHERE (" + implode.join(" OR ") + ")";
			}
		} else if ((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " WHERE o.`order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE o.`order_status_id` > '0'";
		}

		if ((data['filter_order_id'])) {
			sql += " AND o.`order_id` = '" + data['filter_order_id'] + "'";
		}

		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			sql += " AND o.`store_id` = '" + data['filter_store_id'] + "'";
		}

		if ((data['filter_customer_id'])) {
			sql += " AND o.`customer_id` = '" + data['filter_customer_id'] + "'";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(o.`firstname`, ' ', o.`lastname`) LIKE " + this.db.escape('%' + data['filter_customer'] + '%') + "";
		}

		if ((data['filter_email'])) {
			sql += " AND o.`email` LIKE " + this.db.escape('%' + data['filter_email'] + '%') + "";
		}

		if ((data['filter_date_from'])) {
			sql += " AND DATE(o.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			sql += " AND DATE(o.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if ((data['filter_total'])) {
			sql += " AND o.`total` = '" + data['filter_total'] + "'";
		}

		let sort_data = [
			'o.order_id',
			'o.store_name',
			'customer',
			'order_status',
			'o.date_added',
			'o.date_modified',
			'o.total'
		];

		if (data['sort'] && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY o.`order_id`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param subscription_id
	 *
	 * @return array
	 */
	async getOrdersBySubscriptionId(subscription_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order` WHERE `subscription_id` = '" + subscription_id + "'");

		return query.rows;
	}

	/**
	 * @param subscription_id
	 *
	 * @return int
	 */
	async getTotalOrdersBySubscriptionId(subscription_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE `subscription_id` = '" + subscription_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getProducts(order_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "' ORDER BY order_product_id ASC");

		return query.rows;
	}
	async getProductByOrderProductId(order_id, product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "' and `product_id` = '" + product_id + "' ORDER BY order_product_id ASC");

		return query.row;
	}

	/**
	 * @param product_id
	 *
	 * @return int
	 */
	async getTotalProductsByProductId(product_id) {
		let sql = "SELECT SUM(op.quantity) AS `total` FROM `" + DB_PREFIX + "order_product` `op` LEFT JOIN `" + DB_PREFIX + "order` `o` ON (`op`.`order_id` = `o`.`order_id`) WHERE `op`.`product_id` = '" + product_id + "'";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',',);

			for (let order_status_id of order_statuses) {
				implode.push("`order_status_id` = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " AND (" + implode.join(" OR ") + ")";
			}
		} else if((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " AND `order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND `order_status_id` > '0'";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getOptions(order_id, order_product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_option` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscription(order_id, order_product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_subscription` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.row;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getVouchers(order_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_voucher` WHERE `order_id` = '" + order_id + "'");

		return query.rows;
	}

	/**
	 * @param voucher_id
	 *
	 * @return array
	 */
	async getVoucherByVoucherId(voucher_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_voucher` WHERE `voucher_id` = '" + voucher_id + "'");

		return query.row;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getTotals(order_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_total` WHERE `order_id` = '" + order_id + "' ORDER BY `sort_order`");

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalOrders(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order`";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',',);

			for (let order_status_id of order_statuses) {
				implode.push("`order_status_id` = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " WHERE (" + implode.join(" OR ") + ")";
			}
		} else if((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " WHERE `order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE `order_status_id` > '0'";
		}

		if ((data['filter_order_id'])) {
			sql += " AND `order_id` = '" + data['filter_order_id'] + "'";
		}

		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			sql += " AND `store_id` = '" + data['filter_store_id'] + "'";
		}

		if ((data['filter_customer_id'])) {
			sql += " AND `customer_id` = '" + data['filter_customer_id'] + "'";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(`firstname`, ' ', `lastname`) LIKE " + this.db.escape('%' + data['filter_customer'] + '%') + "";
		}

		if ((data['filter_email'])) {
			sql += " AND `email` LIKE " + this.db.escape('%' + data['filter_email'] + '%') + "";
		}

		if ((data['filter_date_from'])) {
			sql += " AND DATE(`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			sql += " AND DATE(`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		if ((data['filter_total'])) {
			sql += " AND `total` = '" + data['filter_total'] + "'";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param store_id
	 *
	 * @return int
	 */
	async getTotalOrdersByStoreId(store_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE `store_id` = '" + store_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_status_id
	 *
	 * @return int
	 */
	async getTotalOrdersByOrderStatusId(order_status_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE `order_status_id` = '" + order_status_id + "' AND `order_status_id` > '0'");

		return query.row['total'];
	}

	/**
	 * @return int
	 */
	async getTotalOrdersByProcessingStatus() {
		let implode = [];

		order_statuses = this.config.get('config_processing_status');

		for (let order_status_id of order_statuses) {
			implode.push("`order_status_id` = '" + order_status_id + "'");
		}

		if (implode.length) {
			let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE " + implode.join(" OR "));

			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @return int
	 */
	async getTotalOrdersByCompleteStatus() {
		let implode = [];

		order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("`order_status_id` = '" + order_status_id + "'");
		}

		if (implode.length) {
			let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE " + implode.join(" OR ") + "");

			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param language_id
	 *
	 * @return int
	 */
	async getTotalOrdersByLanguageId(language_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE `language_id` = '" + language_id + "' AND `order_status_id` > '0'");

		return query.row['total'];
	}

	/**
	 * @param currency_id
	 *
	 * @return int
	 */
	async getTotalOrdersByCurrencyId(currency_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` WHERE `currency_id` = '" + currency_id + "' AND `order_status_id` > '0'");

		return query.row['total'];
	}

	/**
	 * @param data
	 *
	 * @return float
	 */
	async getTotalSales(data = {}) {
		let sql = "SELECT SUM(`total`) AS `total` FROM `" + DB_PREFIX + "order`";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',',);

			for (let order_status_id of order_statuses) {
				implode.push("`order_status_id` = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " WHERE (" + implode.join(" OR ") + ")";
			}
		} else if((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " WHERE `order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE `order_status_id` > '0'";
		}

		if ((data['filter_order_id'])) {
			sql += " AND `order_id` = '" + data['filter_order_id'] + "'";
		}

		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			sql += " AND `store_id` = '" + data['filter_store_id'] + "'";
		}

		if ((data['filter_customer_id'])) {
			sql += " AND `customer_id` = '" + data['filter_customer_id'] + "'";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(`firstname`, ' ', `lastname`) LIKE " + this.db.escape('%' + data['filter_customer'] + '%') + "";
		}

		if ((data['filter_email'])) {
			sql += " AND `email` LIKE " + this.db.escape('%' + data['filter_email'] + '%');
		}

		if ((data['filter_date_added'])) {
			sql += " AND DATE(`date_added`) = DATE(" + this.db.escape(data['filter_date_added']) + ")";
		}

		if ((data['filter_date_modified'])) {
			sql += " AND DATE(`date_modified`) = DATE(" + this.db.escape(data['filter_date_modified']) + ")";
		}

		if ((data['filter_total'])) {
			sql += " AND `total` = '" + data['filter_total'] + "'";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param order_id
	 *
	 * @return string
	 */
	async createInvoiceNo(order_id) {
		order_info = this.getOrder(order_id);

		if (order_info && !order_info['invoice_no']) {
			let query = await this.db.query("SELECT MAX(`invoice_no`) AS invoice_no FROM `" + DB_PREFIX + "order` WHERE `invoice_prefix` = " + this.db.escape(order_info['invoice_prefix']));
			let invoice_no = 1;
			if (query.row['invoice_no']) {
				invoice_no = query.row['invoice_no'] + 1;
			}
			await this.db.query("UPDATE `" + DB_PREFIX + "order` SET `invoice_no` = '" + invoice_no + "', `invoice_prefix` = " + this.db.escape(order_info['invoice_prefix']) + " WHERE `order_id` = '" + order_id + "'");

			return order_info['invoice_prefix'] + invoice_no;
		}

		return '';
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getRewardTotal(order_id) {
		let query = await this.db.query("SELECT SUM(reward) AS `total` FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getHistories(order_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT oh.`date_added`, os.`name` AS `status`, oh.`comment`, oh.`notify` FROM `" + DB_PREFIX + "order_history` oh LEFT JOIN `" + DB_PREFIX + "order_status` os ON oh.`order_status_id` = os.`order_status_id` WHERE oh.`order_id` = '" + order_id + "' AND os.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY oh.`date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return int
	 */
	async getTotalHistories(order_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_history` WHERE `order_id` = '" + order_id + "'");

		return query.row['total'];
	}

	/**
	 * @param order_status_id
	 *
	 * @return int
	 */
	async getTotalHistoriesByOrderStatusId(order_status_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_history` WHERE `order_status_id` = '" + order_status_id + "'");

		return query.row['total'];
	}

	/**
	 * @param products
	 * @param   start
	 * @param   end
	 *
	 * @return array
	 */
	async getEmailsByProductsOrdered(products, start, end) {
		let implode = [];

		for (let product_id of products) {
			implode.push("op.`product_id` = '" + product_id + "'");
		}

		let query = await this.db.query("SELECT DISTINCT o.`email` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_product` op ON (o.`order_id` = op.`order_id`) WHERE (" + implode.join(" OR ") + ") AND o.`order_status_id` <> '0' LIMIT " + start + "," + end);

		return query.rows;
	}

	/**
	 * @param products
	 *
	 * @return int
	 */
	async getTotalEmailsByProductsOrdered(products) {
		let implode = [];

		for (let product_id of products) {
			implode.push("op.`product_id` = '" + product_id + "'");
		}

		let query = await this.db.query("SELECT COUNT(DISTINCT o.`email`) AS `total` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_product` op ON (o.`order_id` = op.`order_id`) WHERE (" + implode.join(" OR ") + ") AND o.`order_status_id` <> '0'");

		return query.row['total'];
	}
}
