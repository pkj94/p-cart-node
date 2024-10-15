const mktime = require("locutus/php/datetime/mktime");

module.exports = class SaleReportModel extends Model {
	/**
	 * @param array data
	 *
	 * @return float
	 */
	async getTotalSales(data = {}) {
		let sql = "SELECT SUM(`total`) AS `total` FROM `" + DB_PREFIX + "order` WHERE `order_status_id` > '0'";

		if (data['filter_date_added']) {
			sql += " AND DATE(`date_added`) = DATE(" + this.db.escape(data['filter_date_added']) + ")";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @return array
	 */
	async getTotalOrdersByCountry() {
		let query = await this.db.query("SELECT COUNT(*) AS total, SUM(o.`total`) AS amount, c.`iso_code_2` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "country` c ON (o.`payment_country_id` = c.`country_id`) WHERE o.`order_status_id` > '0' GROUP BY o.`payment_country_id`");

		return query.rows;
	}

	/**
	 * @return array
	 */
	async getTotalOrdersByDay() {
		const implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		for (let i = 0; i < 24; i++) {
			order_data[i] = {
				'hour': i,
				'total': 0
			};
		}

		let query = await this.db.query("SELECT COUNT(*) AS total, HOUR(`date_added`) AS hour FROM `" + DB_PREFIX + "order` WHERE `order_status_id` IN(" + implode.join(",") + ") AND DATE(`date_added`) = DATE(NOW()) GROUP BY HOUR(`date_added`) ORDER BY `date_added` ASC");

		for (let result of query.rows) {
			order_data[result['hour']] = {
				'hour': result['hour'],
				'total': result['total']
			};
		}

		return order_data;
	}

	/**
	 * @return array
	 */
	async getTotalOrdersByWeek() {
		const implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		let date_start = new Date('-' + date('w') + ' days');

		for (let i = 0; i < 7; i++) {
			date = date('Y-m-d', date_start + (i * 86400));

			order_data[date('w', new Date(date))] = {
				'day': date('D', new Date(date)),
				'total': 0
			};
		}

		let query = await this.db.query("SELECT COUNT(*) AS total, `date_added` FROM `" + DB_PREFIX + "order` WHERE `order_status_id` IN(" + implode.join(",") + ") AND DATE(`date_added`) >= DATE(" + this.db.escape(date('Y-m-d', date_start)) + ") GROUP BY DAYNAME(`date_added`)");

		for (let result of query.rows) {
			order_data[date('w', new Date(result['date_added']))] = {
				'day': date('D', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return order_data;
	}

	/**
	 * @return array
	 */
	async getTotalOrdersByMonth() {
		const implode = [];

		for (this.config.get('config_complete_status') of order_status_id) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		for (let i = 1; i <= date('t'); i++) {
			date = date('Y') + '-' + date('m') + '-' + i;

			order_data[date('j', new Date(date))] = {
				'day': date('d', new Date(date)),
				'total': 0
			};
		}

		let query = await this.db.query("SELECT COUNT(*) AS total, `date_added` FROM `" + DB_PREFIX + "order` WHERE `order_status_id` IN(" + implode.join(",") + ") AND DATE(`date_added`) >= DATE('" + this.db.escape(date('Y') + '-' + date('m') + '-1') + "') GROUP BY DATE(`date_added`)");

		for (let result of query.rows) {
			order_data[date('j', new Date(result['date_added']))] = {
				'day': date('d', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return order_data;
	}

	/**
	 * @return array
	 */
	async getTotalOrdersByYear() {
		const implode = [];

		for (let order_status_id of this.config.get('config_complete_status')) {
			implode.push("'" + order_status_id + "'");
		}

		let order_data = {};

		for (let i = 1; i <= 12; i++) {
			order_data[i] = {
				'month': date('M', mktime(0, 0, 0, i, 1)),
				'total': 0
			};
		}

		let query = await this.db.query("SELECT COUNT(*) AS total, `date_added` FROM `" + DB_PREFIX + "order` WHERE `order_status_id` IN(" + implode.join(",") + ") AND YEAR(`date_added`) = YEAR(NOW()) GROUP BY MONTH(`date_added`)");

		for (let result of query.rows) {
			order_data[date('n', new Date(result['date_added']))] = {
				'month': date('M', new Date(result['date_added'])),
				'total': result['total']
			};
		}

		return order_data;
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getOrders(data = {}) {
		let sql = "SELECT MIN(o.`date_added`) AS date_start, MAX(o.`date_added`) AS date_end, COUNT(*) AS orders, SUM((SELECT SUM(op.`quantity`) FROM `" + DB_PREFIX + "order_product` `op` WHERE `op`.`order_id` = `o`.`order_id` GROUP BY `op`.`order_id`)) AS products, SUM((SELECT SUM(`ot`.`value`) FROM `" + DB_PREFIX + "order_total` ot WHERE ot.`order_id` = o.`order_id` AND ot.`code` = 'tax' GROUP BY ot.`order_id`)) AS tax, SUM(o.`total`) AS `total` FROM `" + DB_PREFIX + "order` o";

		if (data['filter_order_status_id']) {
			sql += " WHERE o.`order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE o.`order_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(o.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(o.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}

		switch (group) {
			case 'day':
				sql += " GROUP BY YEAR(o.`date_added`), MONTH(o.`date_added`), DAY(o.`date_added`)";
				break;
			default:
			case 'week':
				sql += " GROUP BY YEAR(o.`date_added`), WEEK(o.`date_added`)";
				break;
			case 'month':
				sql += " GROUP BY YEAR(o.`date_added`), MONTH(o.`date_added`)";
				break;
			case 'year':
				sql += " GROUP BY YEAR(o.`date_added`)";
				break;
		}

		sql += " ORDER BY o.`date_added` DESC";

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param array data
	 *
	 * @return int
	 */
	async getTotalOrders(data = {}) {
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}
		let sql = '';
		switch (group) {
			case 'day':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`), MONTH(`date_added`), DAY(`date_added`)) AS `total` FROM `" + DB_PREFIX + "order`";
				break;
			default:
			case 'week':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`), WEEK(`date_added`)) AS `total` FROM `" + DB_PREFIX + "order`";
				break;
			case 'month':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`), MONTH(`date_added`)) AS `total` FROM `" + DB_PREFIX + "order`";
				break;
			case 'year':
				sql = "SELECT COUNT(DISTINCT YEAR(`date_added`)) AS `total` FROM `" + DB_PREFIX + "order`";
				break;
		}

		if (data['filter_order_status_id']) {
			sql += " WHERE `order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE `order_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getTaxes(data = {}) {
		let sql = "SELECT MIN(o.`date_added`) AS date_start, MAX(o.`date_added`) AS date_end, ot.`title`, SUM(ot.`value`) AS total, COUNT(o.`order_id`) AS `orders` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_total` ot ON (ot.`order_id` = o.`order_id`) WHERE ot.`code` = 'tax'";

		if (data['filter_order_status_id']) {
			sql += " AND `o`.`order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND `o`.`order_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(o.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(o.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}

		switch (group) {
			case 'day':
				sql += " GROUP BY YEAR(`o`.`date_added`), MONTH(`o`.`date_added`), DAY(`o`.`date_added`), `ot`.`title`";
				break;
			default:
			case 'week':
				sql += " GROUP BY YEAR(`o`.`date_added`), WEEK(`o`.`date_added`), `ot`.`title`";
				break;
			case 'month':
				sql += " GROUP BY YEAR(`o`.`date_added`), MONTH(`o`.`date_added`), `ot`.`title`";
				break;
			case 'year':
				sql += " GROUP BY YEAR(`o`.`date_added`), ot.`title`";
				break;
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param array data
	 *
	 * @return int
	 */
	async getTotalTaxes(data = {}) {
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}
		let sql = '';
		switch (group) {
			case 'day':
				sql = "SELECT COUNT(DISTINCT YEAR(o.`date_added`), MONTH(`o`.`date_added`), DAY(`o`.`date_added`), `ot`.`title`) AS `total` FROM `" + DB_PREFIX + "order` `o`";
				break;
			default:
			case 'week':
				sql = "SELECT COUNT(DISTINCT YEAR(`o`.`date_added`), WEEK(`o`.`date_added`), `ot`.`title`) AS `total` FROM `" + DB_PREFIX + "order` `o`";
				break;
			case 'month':
				sql = "SELECT COUNT(DISTINCT YEAR(`o`.`date_added`), MONTH(`o`.`date_added`), `ot`.`title`) AS `total` FROM `" + DB_PREFIX + "order` `o`";
				break;
			case 'year':
				sql = "SELECT COUNT(DISTINCT YEAR(`o`.`date_added`), `ot`.`title`) AS `total` FROM `" + DB_PREFIX + "order` `o`";
				break;
		}

		sql += " LEFT JOIN `" + DB_PREFIX + "order_total` `ot` ON (`o`.`order_id` = `ot`.`order_id`) WHERE `ot`.`code` = 'tax'";

		if (data['filter_order_status_id']) {
			sql += " AND `o`.`order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND `o`.`order_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(`o`.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(`o`.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getShipping(data = {}) {
		let sql = "SELECT MIN(o.`date_added`) AS date_start, MAX(o.`date_added`) AS date_end, ot.`title`, SUM(ot.`value`) AS total, COUNT(o.`order_id`) AS orders FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_total` ot ON (o.`order_id` = ot.`order_id`) WHERE ot.`code` = 'shipping'";

		if (data['filter_order_status_id']) {
			sql += " AND `o`.`order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND `o`.`order_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(`o`.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(`o`.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}

		switch (group) {
			case 'day':
				sql += " GROUP BY YEAR(`o`.`date_added`), MONTH(`o`.`date_added`), DAY(`o`.`date_added`), `ot`.`title`";
				break;
			default:
			case 'week':
				sql += " GROUP BY YEAR(`o`.`date_added`), WEEK(`o`.`date_added`), `ot`.`title`";
				break;
			case 'month':
				sql += " GROUP BY YEAR(`o`.`date_added`), MONTH(`o`.`date_added`), `ot`.`title`";
				break;
			case 'year':
				sql += " GROUP BY YEAR(`o`.`date_added`), `ot`.`title`";
				break;
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param array data
	 *
	 * @return int
	 */
	async getTotalShipping(data = {}) {
		let group = 'week';
		if (data['filter_group']) {
			group = data['filter_group'];
		}
		let sql = '';
		switch (group) {
			case 'day':
				sql = "SELECT COUNT(DISTINCT YEAR(o.`date_added`), MONTH(o.`date_added`), DAY(o.`date_added`), ot.`title`) AS `total` FROM `" + DB_PREFIX + "order` o";
				break;
			default:
			case 'week':
				sql = "SELECT COUNT(DISTINCT YEAR(o.`date_added`), WEEK(o.`date_added`), ot.`title`) AS `total` FROM `" + DB_PREFIX + "order` o";
				break;
			case 'month':
				sql = "SELECT COUNT(DISTINCT YEAR(o.`date_added`), MONTH(o.`date_added`), ot.`title`) AS `total` FROM `" + DB_PREFIX + "order` o";
				break;
			case 'year':
				sql = "SELECT COUNT(DISTINCT YEAR(o.`date_added`), ot.`title`) AS `total` FROM `" + DB_PREFIX + "order` o";
				break;
		}

		sql += " LEFT JOIN `" + DB_PREFIX + "order_total` ot ON (o.`order_id` = ot.`order_id`) WHERE ot.`code` = 'shipping'";

		if (data['filter_order_status_id']) {
			sql += " AND `order_status_id` = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND `order_status_id` > '0'";
		}

		if (data['filter_date_start']) {
			sql += " AND DATE(o.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(o.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
