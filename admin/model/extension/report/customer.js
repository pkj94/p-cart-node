const mktime = require("locutus/php/datetime/mktime");
const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class ModelExtensionReportCustomer extends Model {
	async getTotalCustomersByDay() {
		const customer_data = {};

		for (let i = 0; i < 24; i++) {
			customer_data[i] = {
				'hour': i,
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, HOUR(date_added) AS hour FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) = DATE(NOW()) GROUP BY HOUR(date_added) ORDER BY date_added ASC");

		for (let result of query.rows) {
			customer_data[result['hour']] = {
				'hour': result['hour'],
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getTotalCustomersByWeek() {
		const customer_data = {};

		let date_start = strtotime('-' + date('w') + ' days');

		for (let i = 0; i < 7; i++) {
			let date1 = date('Y-m-d', date_start + (i * 86400000));

			customer_data[date('w', new Date(date1))] = {
				'day': date('D', new Date(date1)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) >= DATE('" + this.db.escape(date('Y-m-d', date_start)) + "') GROUP BY DAYNAME(date_added)");

		for (let result of query.rows) {
			customer_data[date('w', new Date(result['date_added']))] = {
				'day': date('D', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getTotalCustomersByMonth() {
		const customer_data = {};

		for (let i = 1; i <= date('t'); i++) {
			let date1 = date('Y') + '-' + date('m') + '-' + i;

			customer_data[date('j', new Date(date))] = {
				'day': date('d', new Date(date)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE DATE(date_added) >= DATE('" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "') GROUP BY DATE(date_added)");

		for (let result of query.rows) {
			customer_data[date('j', new Date(result['date_added']))] = {
				'day': date('d', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getTotalCustomersByYear() {
		const customer_data = {};

		for (let i = 1; i <= 12; i++) {
			customer_data[i] = {
				'month': date('M', mktime(0, 0, 0, i)),
				'total': 0
			};
		}

		const query = await this.db.query("SELECT COUNT(*) AS total, date_added FROM `" + DB_PREFIX + "customer` WHERE YEAR(date_added) = YEAR(NOW()) GROUP BY MONTH(date_added)");

		for (let result of query.rows) {
			customer_data[date('n', new Date(result['date_added']))] = {
				'month': date('M', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return customer_data;
	}

	async getOrders(data = {}) {
		let sql = "SELECT c.customer_id, CONCAT(c.firstname, ' ', c.lastname) AS customer, c.email, cgd.name AS customer_group, c.status, o.order_id, SUM(op.quantity) AS products, o.total AS total FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_product` op ON (o.order_id = op.order_id) LEFT JOIN `" + DB_PREFIX + "customer` c ON (o.customer_id = c.customer_id) LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (c.customer_group_id = cgd.customer_group_id) WHERE o.customer_id > 0 AND cgd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_date_start'])) {
			sql += " AND DATE(o.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(o.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'";
		}

		if ((data['filter_order_status_id'])) {
			sql += " AND o.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND o.order_status_id > '0'";
		}

		sql += " GROUP BY o.order_id";

		sql = "SELECT t.customer_id, t.customer, t.email, t.customer_group, t.status, COUNT(DISTINCT t.order_id) AS orders, SUM(t.products) AS products, SUM(t.total) AS total FROM (" + sql + ") AS t GROUP BY t.customer_id ORDER BY total DESC";

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

	async getTotalOrders(data = {}) {
		let sql = "SELECT COUNT(DISTINCT o.customer_id) AS total FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "customer` c ON (o.customer_id = c.customer_id) WHERE o.customer_id > '0'";

		if ((data['filter_date_start'])) {
			sql += " AND DATE(o.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(o.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'";
		}

		if ((data['filter_order_status_id'])) {
			sql += " AND o.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND o.order_status_id > '0'";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getRewardPoints(data = {}) {
		let sql = "SELECT cr.customer_id, CONCAT(c.firstname, ' ', c.lastname) AS customer, c.email, cgd.name AS customer_group, c.status, SUM(cr.points) AS points, COUNT(o.order_id) AS orders, SUM(o.total) AS total FROM " + DB_PREFIX + "customer_reward cr LEFT JOIN `" + DB_PREFIX + "customer` c ON (cr.customer_id = c.customer_id) LEFT JOIN " + DB_PREFIX + "customer_group_description cgd ON (c.customer_group_id = cgd.customer_group_id) LEFT JOIN `" + DB_PREFIX + "order` o ON (cr.order_id = o.order_id) WHERE cgd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_date_start'])) {
			sql += " AND DATE(cr.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(cr.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'";
		}

		sql += " GROUP BY cr.customer_id ORDER BY points DESC";

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

	async getTotalRewardPoints(data = {}) {
		let sql = "SELECT COUNT(DISTINCT cr.customer_id) AS total FROM `" + DB_PREFIX + "customer_reward` cr LEFT JOIN `" + DB_PREFIX + "customer` c ON (cr.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(cr.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')");
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(cr.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getCustomerActivities(data = {}) {
		let sql = "SELECT ca.customer_activity_id, ca.customer_id, ca.key, ca.data, ca.ip, ca.date_added FROM " + DB_PREFIX + "customer_activity ca LEFT JOIN " + DB_PREFIX + "customer c ON (ca.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(ca.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')");
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(ca.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("ca.ip LIKE '" + this.db.escape(data['filter_ip']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		sql += " ORDER BY ca.date_added DESC";

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

	async getTotalCustomerActivities(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "customer_activity` ca LEFT JOIN " + DB_PREFIX + "customer c ON (ca.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(ca.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')");
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(ca.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("ca.ip LIKE '" + this.db.escape(data['filter_ip']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getCustomerSearches(data = {}) {
		let sql = "SELECT cs.customer_id, cs.keyword, cs.category_id, cs.products, cs.ip, cs.date_added, CONCAT(c.firstname, ' ', c.lastname) AS customer FROM " + DB_PREFIX + "customer_search cs LEFT JOIN " + DB_PREFIX + "customer c ON (cs.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(cs.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')");
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(cs.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')");
		}

		if ((data['filter_keyword'])) {
			implode.push("cs.keyword LIKE '" + this.db.escape(data['filter_keyword']) + "%'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("cs.ip LIKE '" + this.db.escape(data['filter_ip']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		sql += " ORDER BY cs.date_added DESC";

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

	async getTotalCustomerSearches(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "customer_search` cs LEFT JOIN " + DB_PREFIX + "customer c ON (cs.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(cs.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')");
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(cs.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')");
		}

		if ((data['filter_keyword'])) {
			implode.push("cs.keyword LIKE '" + this.db.escape(data['filter_keyword']) + "%'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if ((data['filter_ip'])) {
			implode.push("cs.ip LIKE '" + this.db.escape(data['filter_ip']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
}
