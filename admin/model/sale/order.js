module.exports = class ModelSaleOrder extends Model {
	async getOrder(order_id) {
		const order_query = await this.db.query("SELECT *, (SELECT CONCAT(c.firstname, ' ', c.lastname) FROM " + DB_PREFIX + "customer c WHERE c.customer_id = o.customer_id) AS customer, (SELECT os.name FROM " + DB_PREFIX + "order_status os WHERE os.order_status_id = o.order_status_id AND os.language_id = '" + this.config.get('config_language_id') + "') AS order_status FROM `" + DB_PREFIX + "order` o WHERE o.order_id = '" + order_id + "'");

		if (order_query.num_rows) {
			let country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + order_query.row['payment_country_id'] + "'");
			let payment_iso_code_2 = '';
			let payment_iso_code_3 = '';
			if (country_query.num_rows) {
				payment_iso_code_2 = country_query.row['iso_code_2'];
				payment_iso_code_3 = country_query.row['iso_code_3'];
			} else {
				payment_iso_code_2 = '';
				payment_iso_code_3 = '';
			}

			let zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + order_query.row['payment_zone_id'] + "'");
			let payment_zone_code = '';
			if (zone_query.num_rows) {
				payment_zone_code = zone_query.row['code'];
			} else {
				payment_zone_code = '';
			}

			country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + order_query.row['shipping_country_id'] + "'");
			let shipping_iso_code_2 = '';
			let shipping_iso_code_3 = '';
			if (country_query.num_rows) {
				shipping_iso_code_2 = country_query.row['iso_code_2'];
				shipping_iso_code_3 = country_query.row['iso_code_3'];
			} else {
				shipping_iso_code_2 = '';
				shipping_iso_code_3 = '';
			}

			zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + order_query.row['shipping_zone_id'] + "'");
			let shipping_zone_code = '';
			if (zone_query.num_rows) {
				shipping_zone_code = zone_query.row['code'];
			} else {
				shipping_zone_code = '';
			}

			let reward = 0;

			const order_product_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_product WHERE order_id = '" + order_id + "'");

			for (order_product_query.rows of product) {
				reward += product['reward'];
			}

			this.load.model('customer/customer', this);

			const affiliate_info = await this.model_customer_customer.getCustomer(order_query.row['affiliate_id']);
			let affiliate_firstname = '';
			let affiliate_lastname = '';
			if (affiliate_info) {
				affiliate_firstname = affiliate_info['firstname'];
				affiliate_lastname = affiliate_info['lastname'];
			} else {
				affiliate_firstname = '';
				affiliate_lastname = '';
			}

			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(order_query.row['language_id']);
			let language_code = '';
			if (language_info.language_id) {
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
				'customer': order_query.row['customer'],
				'customer_group_id': order_query.row['customer_group_id'],
				'firstname': order_query.row['firstname'],
				'lastname': order_query.row['lastname'],
				'email': order_query.row['email'],
				'telephone': order_query.row['telephone'],
				'custom_field': JSON.parse(order_query.row['custom_field']),
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
				'payment_custom_field': JSON.parse(order_query.row['payment_custom_field']),
				'payment_method': order_query.row['payment_method'],
				'payment_code': order_query.row['payment_code'],
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
				'shipping_custom_field': JSON.parse(order_query.row['shipping_custom_field']),
				'shipping_method': order_query.row['shipping_method'],
				'shipping_code': order_query.row['shipping_code'],
				'comment': order_query.row['comment'],
				'total': order_query.row['total'],
				'reward': reward,
				'order_status_id': order_query.row['order_status_id'],
				'order_status': order_query.row['order_status'],
				'affiliate_id': order_query.row['affiliate_id'],
				'affiliate_firstname': affiliate_firstname,
				'affiliate_lastname': affiliate_lastname,
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
			return;
		}
	}

	async getOrders(data = {}) {
		let sql = "SELECT o.order_id, CONCAT(o.firstname, ' ', o.lastname) AS customer, (SELECT os.name FROM " + DB_PREFIX + "order_status os WHERE os.order_status_id = o.order_status_id AND os.language_id = '" + this.config.get('config_language_id') + "') AS order_status, o.shipping_code, o.total, o.currency_code, o.currency_value, o.date_added, o.date_modified FROM `" + DB_PREFIX + "order` o";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',');

			for (let order_status_id of order_statuses) {
				implode.push("o.order_status_id = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " WHERE (" + implode.join(" OR ") + ")";
			}
		} else if ((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " WHERE o.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE o.order_status_id > '0'";
		}

		if ((data['filter_order_id'])) {
			sql += " AND o.order_id = '" + data['filter_order_id'] + "'";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(o.firstname, ' ', o.lastname) LIKE '%" + this.db.escape(data['filter_customer']) + "%'";
		}

		if ((data['filter_date_added'])) {
			sql += " AND DATE(o.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if ((data['filter_date_modified'])) {
			sql += " AND DATE(o.date_modified) = DATE('" + this.db.escape(data['filter_date_modified']) + "')";
		}

		if ((data['filter_total'])) {
			sql += " AND o.total = '" + data['filter_total'] + "'";
		}

		let sort_data = [
			'o.order_id',
			'customer',
			'order_status',
			'o.date_added',
			'o.date_modified',
			'o.total'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY o.order_id";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getOrderProducts(order_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_product WHERE order_id = '" + order_id + "'");

		return query.rows;
	}

	async getOrderOptions(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_option WHERE order_id = '" + order_id + "' AND order_product_id = '" + order_product_id + "' ORDER BY order_option_id ASC");

		return query.rows;
	}

	async getOrderVouchers(order_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_voucher WHERE order_id = '" + order_id + "'");

		return query.rows;
	}

	async getOrderVoucherByVoucherId(voucher_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_voucher` WHERE voucher_id = '" + voucher_id + "'");

		return query.row;
	}

	async getOrderTotals(order_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_total WHERE order_id = '" + order_id + "' ORDER BY sort_order");

		return query.rows;
	}

	async getTotalOrders(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order`";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',');

			for (let order_status_id of order_statuses) {
				implode.push("order_status_id = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " WHERE (" + implode.join(" OR ") + ")";
			}
		} else if ((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " WHERE order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE order_status_id > '0'";
		}

		if ((data['filter_order_id'])) {
			sql += " AND order_id = '" + data['filter_order_id'] + "'";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(firstname, ' ', lastname) LIKE '%" + this.db.escape(data['filter_customer']) + "%'";
		}

		if ((data['filter_date_added'])) {
			sql += " AND DATE(date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if ((data['filter_date_modified'])) {
			sql += " AND DATE(date_modified) = DATE('" + this.db.escape(data['filter_date_modified']) + "')";
		}

		if ((data['filter_total'])) {
			sql += " AND total = '" + data['filter_total'] + "'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getTotalOrdersByStoreId(store_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` WHERE store_id = '" + store_id + "'");

		return query.row['total'];
	}

	async getTotalOrdersByOrderStatusId(order_status_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` WHERE order_status_id = '" + order_status_id + "' AND order_status_id > '0'");

		return query.row['total'];
	}

	async getTotalOrdersByProcessingStatus() {
		let implode = [];

		order_statuses = this.config.get('config_processing_status');

		for (let order_status_id of order_statuses) {
			implode.push("order_status_id = '" + order_status_id + "'");
		}

		if (implode.length) {
			const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` WHERE " + implode.join(" OR "));

			return query.row['total'];
		} else {
			return 0;
		}
	}

	async getTotalOrdersByCompleteStatus() {
		let implode = [];

		let order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("order_status_id = '" + order_status_id + "'");
		}

		if (implode.length) {
			const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` WHERE " + implode.join(" OR ") + "");

			return query.row['total'];
		} else {
			return 0;
		}
	}

	async getTotalOrdersByLanguageId(language_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` WHERE language_id = '" + language_id + "' AND order_status_id > '0'");

		return query.row['total'];
	}

	async getTotalOrdersByCurrencyId(currency_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` WHERE currency_id = '" + currency_id + "' AND order_status_id > '0'");

		return query.row['total'];
	}

	async getTotalSales(data = {}) {
		let sql = "SELECT SUM(total) AS total FROM `" + DB_PREFIX + "order`";

		if ((data['filter_order_status'])) {
			let implode = [];

			let order_statuses = data['filter_order_status'].split(',');

			for (let order_status_id of order_statuses) {
				implode.push("order_status_id = '" + order_status_id + "'");
			}

			if (implode.length) {
				sql += " WHERE (" + implode.join(" OR ") + ")";
			}
		} else if ((data['filter_order_status_id']) && data['filter_order_status_id'] !== '') {
			sql += " WHERE order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE order_status_id > '0'";
		}

		if ((data['filter_order_id'])) {
			sql += " AND order_id = '" + data['filter_order_id'] + "'";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(firstname, ' ', lastname) LIKE '%" + this.db.escape(data['filter_customer']) + "%'";
		}

		if ((data['filter_date_added'])) {
			sql += " AND DATE(date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if ((data['filter_date_modified'])) {
			sql += " AND DATE(date_modified) = DATE('" + this.db.escape(data['filter_date_modified']) + "')";
		}

		if ((data['filter_total'])) {
			sql += " AND total = '" + data['filter_total'] + "'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async createInvoiceNo(order_id) {
		const order_info = await this.getOrder(order_id);

		if (order_info.order_id && !order_info['invoice_no']) {
			const query = await this.db.query("SELECT MAX(invoice_no) AS invoice_no FROM `" + DB_PREFIX + "order` WHERE invoice_prefix = '" + this.db.escape(order_info['invoice_prefix']) + "'");
			let invoice_no = 1;
			if (query.row['invoice_no']) {
				invoice_no = query.row['invoice_no'] + 1;
			} else {
				invoice_no = 1;
			}

			await this.db.query("UPDATE `" + DB_PREFIX + "order` SET invoice_no = '" + invoice_no + "', invoice_prefix = '" + this.db.escape(order_info['invoice_prefix']) + "' WHERE order_id = '" + order_id + "'");

			return order_info['invoice_prefix'] + invoice_no;
		}
	}

	async getOrderHistories(order_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT oh.date_added, os.name AS status, oh.comment, oh.notify FROM " + DB_PREFIX + "order_history oh LEFT JOIN " + DB_PREFIX + "order_status os ON oh.order_status_id = os.order_status_id WHERE oh.order_id = '" + order_id + "' AND os.language_id = '" + this.config.get('config_language_id') + "' ORDER BY oh.date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalOrderHistories(order_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "order_history WHERE order_id = '" + order_id + "'");

		return query.row['total'];
	}

	async getTotalOrderHistoriesByOrderStatusId(order_status_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "order_history WHERE order_status_id = '" + order_status_id + "'");

		return query.row['total'];
	}

	async getEmailsByProductsOrdered(products, start, end) {
		let implode = [];

		for (let product_id of products) {
			implode.push("op.product_id = '" + product_id + "'");
		}

		const query = await this.db.query("SELECT DISTINCT email FROM `" + DB_PREFIX + "order` o LEFT JOIN " + DB_PREFIX + "order_product op ON (o.order_id = op.order_id) WHERE (" + implode.join(" OR ") + ") AND o.order_status_id <> '0' LIMIT " + start + "," + end);

		return query.rows;
	}

	async getTotalEmailsByProductsOrdered(products) {
		let implode = [];

		for (let product_id of products) {
			implode.push("op.product_id = '" + product_id + "'");
		}

		const query = await this.db.query("SELECT COUNT(DISTINCT email) AS total FROM `" + DB_PREFIX + "order` o LEFT JOIN " + DB_PREFIX + "order_product op ON (o.order_id = op.order_id) WHERE (" + implode.join(" OR ") + ") AND o.order_status_id <> '0'");

		return query.row['total'];
	}
}
