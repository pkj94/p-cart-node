module.exports = class ProductPurchasedReportModel extends Model {
	/**
	 * @param array data
	 *
	 * @return array
	 */
	async getPurchased(data = {}) {
		let sql = "SELECT op.`name`, op.`model`, SUM(op.`quantity`) AS quantity, SUM((op.`price` + op.`tax`) * op.`quantity`) AS `total` FROM `" + DB_PREFIX + "order_product` op LEFT JOIN `" + DB_PREFIX + "order` o ON (op.`order_id` = o.`order_id`)";

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

		sql += " GROUP BY op.`product_id` ORDER BY total DESC";

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
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
	async getTotalPurchased(data = {}) {
		sql = "SELECT COUNT(DISTINCT op.`product_id`) AS `total` FROM `" + DB_PREFIX + "order_product` op LEFT JOIN `" + DB_PREFIX + "order` o ON (op.`order_id` = o.`order_id`)";

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

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
