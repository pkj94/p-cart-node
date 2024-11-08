module.exports = class ModelExtensionDashboardOnline extends Model {
	async getTotalOnline(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "customer_online` co LEFT JOIN " + DB_PREFIX + "customer c ON (co.customer_id = c.customer_id)";

		let implode = [];

		if ((data['filter_ip'])) {
			implode.push("co.ip LIKE '" + this.db.escape(data['filter_ip']) + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("co.customer_id > 0 AND CONCAT(c.firstname, ' ', c.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
}