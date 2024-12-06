module.exports = class ModelExtensionReportMarketing extends Model {
	async getMarketing(data = {}) {
		let sql = "SELECT m.marketing_id, m.name AS campaign, m.code, m.clicks AS clicks, (SELECT COUNT(DISTINCT order_id) FROM `" + DB_PREFIX + "order` o1 WHERE o1.marketing_id = m.marketing_id";

		if ((data['filter_order_status_id'])) {
			sql += " AND o1.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND o1.order_status_id > '0'";
		}

		if ((data['filter_date_start'])) {
			sql += " AND DATE(o1.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(o1.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		sql += ") AS `orders`, (SELECT SUM(total) FROM `" + DB_PREFIX + "order` o2 WHERE o2.marketing_id = m.marketing_id";

		if ((data['filter_order_status_id'])) {
			sql += " AND o2.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " AND o2.order_status_id > '0'";
		}

		if ((data['filter_date_start'])) {
			sql += " AND DATE(o2.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(o2.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		sql += " GROUP BY o2.marketing_id) AS `total` FROM `" + DB_PREFIX + "marketing` m ORDER BY m.date_added ASC";

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

	async getTotalMarketing(data = {}) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "marketing`");

		return query.row['total'];
	}
}