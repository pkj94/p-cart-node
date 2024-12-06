module.exports = class ModelExtensionReportProduct extends Model {
	async getProductsViewed(data = {}) {
		let sql = "SELECT pd.name, p.model, p.viewed FROM " + DB_PREFIX + "product p LEFT JOIN " + DB_PREFIX + "product_description pd ON (p.product_id = pd.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "' AND p.viewed > 0 ORDER BY p.viewed DESC";

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

	async getTotalProductViews() {
		const query = await this.db.query("SELECT SUM(viewed) AS total FROM " + DB_PREFIX + "product");

		return query.row['total'];
	}

	async getTotalProductsViewed() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "product WHERE viewed > 0");

		return query.row['total'];
	}

	async reset() {
		await this.db.query("UPDATE " + DB_PREFIX + "product SET viewed = '0'");
	}

	async getPurchased(data = {}) {
		let sql = "SELECT op.name, op.model, SUM(op.quantity) AS quantity, SUM((op.price + op.tax) * op.quantity) AS total FROM " + DB_PREFIX + "order_product op LEFT JOIN `" + DB_PREFIX + "order` o ON (op.order_id = o.order_id)";

		if ((data['filter_order_status_id'])) {
			sql += " WHERE o.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE o.order_status_id > '0'";
		}

		if ((data['filter_date_start'])) {
			sql += " AND DATE(o.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(o.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		sql += " GROUP BY op.product_id ORDER BY total DESC";

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

	async getTotalPurchased(data) {
		let sql = "SELECT COUNT(DISTINCT op.product_id) AS total FROM `" + DB_PREFIX + "order_product` op LEFT JOIN `" + DB_PREFIX + "order` o ON (op.order_id = o.order_id)";

		if ((data['filter_order_status_id'])) {
			sql += " WHERE o.order_status_id = '" + data['filter_order_status_id'] + "'";
		} else {
			sql += " WHERE o.order_status_id > '0'";
		}

		if ((data['filter_date_start'])) {
			sql += " AND DATE(o.date_added) >= DATE('" + this.db.escape(data['filter_date_start']) + "')";
		}

		if ((data['filter_date_end'])) {
			sql += " AND DATE(o.date_added) <= DATE('" + this.db.escape(data['filter_date_end']) + "')";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
}
