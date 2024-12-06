module.exports = class ModelExtensionReportCustomerTransaction extends Model {
	async getTransactions(data = {}) {
		let sql = "SELECT ct.customer_id, CONCAT(c.firstname, ' ', c.lastname) AS customer, c.email, cgd.name AS customer_group, c.status, SUM(ct.amount) AS total FROM `" + DB_PREFIX + "customer_transaction` ct LEFT JOIN `" + DB_PREFIX + "customer` c ON (ct.customer_id = c.customer_id) LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (c.customer_group_id = cgd.customer_group_id) WHERE cgd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_date_start'])) {
			sql += " AND DATE(ct.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(ct.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		if ((data['filter_customer'])) {
			sql += " AND CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'";
		}

		sql += " GROUP BY ct.customer_id ORDER BY total DESC";

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

	async getTotalTransactions(data = {}) {
		let sql = "SELECT COUNT(DISTINCT ct.customer_id) AS total FROM `" + DB_PREFIX + "customer_transaction` ct LEFT JOIN `" + DB_PREFIX + "customer` c ON (ct.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(ct.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')");
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(ct.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')");
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
}