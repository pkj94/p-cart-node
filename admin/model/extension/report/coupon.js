module.exports = class ModelExtensionReportCoupon extends Model {
	async getCoupons(data = {}) {
		let sql = "SELECT ch.coupon_id, c.name, c.code, COUNT(DISTINCT ch.order_id) AS `orders`, SUM(ch.amount) AS total FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "coupon` c ON (ch.coupon_id = c.coupon_id)";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(ch.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(ch.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		sql += " GROUP BY ch.coupon_id ORDER BY total DESC";

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start']||0;
if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getTotalCoupons(data = {}) {
		let sql = "SELECT COUNT(DISTINCT coupon_id) AS total FROM `" + DB_PREFIX + "coupon_history`";

		let implode = [];

		if ((data['filter_date_start'])) {
			implode.push("DATE(date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			implode.push("DATE(date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
}