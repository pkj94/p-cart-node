module.exports = class ModelAccountDownload extends Model {
	async getDownload(download_id) {
		const implode = [];

		const order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("o.order_status_id = '" + order_status_id + "'");
		}

		if (implode.length) {
			const query = await this.db.query("SELECT d.filename, d.mask FROM `" + DB_PREFIX + "order` o LEFT JOIN " + DB_PREFIX + "order_product op ON (o.order_id = op.order_id) LEFT JOIN " + DB_PREFIX + "product_to_download p2d ON (op.product_id = p2d.product_id) LEFT JOIN " + DB_PREFIX + "download d ON (p2d.download_id = d.download_id) WHERE o.customer_id = '" + await this.customer.getId() + "' AND (" + implode.join(" OR ") + ") AND d.download_id = '" + download_id + "'");

			return query.row;
		} else {
			return;
		}
	}

	async getDownloads(start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 20;
		}

		const implode = [];

		const order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("o.order_status_id = '" + order_status_id + "'");
		}

		if (implode.length) {
			const query = await this.db.query("SELECT DISTINCT op.order_product_id, d.download_id, o.order_id, o.date_added, dd.name, d.filename FROM `" + DB_PREFIX + "order` o LEFT JOIN " + DB_PREFIX + "order_product op ON (o.order_id = op.order_id) LEFT JOIN " + DB_PREFIX + "product_to_download p2d ON (op.product_id = p2d.product_id) LEFT JOIN " + DB_PREFIX + "download d ON (p2d.download_id = d.download_id) LEFT JOIN " + DB_PREFIX + "download_description dd ON (d.download_id = dd.download_id) WHERE o.customer_id = '" + await this.customer.getId() + "' AND dd.language_id = '" + this.config.get('config_language_id') + "' AND (" + implode.join(" OR ") + ") ORDER BY o.date_added DESC LIMIT " + start + "," + limit);

			return query.rows;
		} else {
			return [];
		}
	}

	async getTotalDownloads() {
		const implode = [];

		const order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("o.order_status_id = '" + order_status_id + "'");
		}

		if (implode.length) {
			const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order` o LEFT JOIN " + DB_PREFIX + "order_product op ON (o.order_id = op.order_id) LEFT JOIN " + DB_PREFIX + "product_to_download p2d ON (op.product_id = p2d.product_id) WHERE o.customer_id = '" + await this.customer.getId() + "' AND (" + implode.join(" OR ") + ")");

			return query.row['total'];
		} else {
			return 0;
		}
	}
}