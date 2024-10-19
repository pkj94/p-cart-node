module.exports =class DownloadModel extends Model {
	/**
	 * @param download_id
	 *
	 * @return array
	 */
	async getDownload(download_id) {
		implode = [];

		order_statuses = this.config.get('config_complete_status');

		for (order_statuses as order_status_id) {
			implode.push("o.`order_status_id` = '" + order_status_id + "'";
		}

		if (implode) {
			const query = await this.db.query("SELECT d.`filename`, d.`mask` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_product` op ON (o.`order_id` = op.`order_id`) LEFT JOIN `" + DB_PREFIX + "product_to_download` p2d ON (op.`product_id` = p2d.`product_id`) LEFT JOIN `" + DB_PREFIX + "download` d ON (p2d.`download_id` = d.`download_id`) WHERE o.`customer_id` = '" + await this.customer.getId() + "' AND (" + implode.join(" OR ") + ") AND d.`download_id` = '" + download_id + "'");

			return query.row;
		}

		return [];
	}

	/**
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getDownloads(start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 20;
		}

		implode = [];

		order_statuses = this.config.get('config_complete_status');

		for (order_statuses as order_status_id) {
			implode.push("o.`order_status_id` = '" + order_status_id + "'";
		}

		if (implode) {
			const query = await this.db.query("SELECT DISTINCT d.`download_id`, o.`order_id`, o.`date_added`, dd.`name`, d.`filename` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_product` op ON (o.`order_id` = op.`order_id`) LEFT JOIN `" + DB_PREFIX + "product_to_download` p2d ON (op.`product_id` = p2d.`product_id`) LEFT JOIN `" + DB_PREFIX + "download` d ON (p2d.`download_id` = d.`download_id`) LEFT JOIN `" + DB_PREFIX + "download_description` dd ON (d.`download_id` = dd.`download_id`) WHERE o.`customer_id` = '" + await this.customer.getId() + "' AND o.`store_id` = '" + this.config.get('config_store_id') + "' AND (" + implode.join(" OR ") + ") AND dd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY dd.`name` ASC LIMIT " + start + "," + limit);

			return query.rows;
		}

		return [];
	}

	/**
	 * @return int
	 */
	async getTotalDownloads() {
		implode = [];

		order_statuses = this.config.get('config_complete_status');

		for (order_statuses as order_status_id) {
			implode.push("o.`order_status_id` = '" + order_status_id + "'";
		}

		if (implode) {
			const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "order_product` op ON (o.`order_id` = op.`order_id`) LEFT JOIN `" + DB_PREFIX + "product_to_download` p2d ON (op.`product_id` = p2d.`product_id`) WHERE o.`customer_id` = '" + await this.customer.getId() + "' AND o.`store_id` = '" + this.config.get('config_store_id') + "' AND (" + implode.join(" OR ") + ") AND p2d.`download_id` > 0");

			return query.row['total'];
		}

		return 0;
	}

	/**
	 * @param    download_id
	 * @param string ip
	 * @param string country
	 *
	 * @return void
	 */
	async addReport(download_id, ip, country = '') {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "download_report` SET `download_id` = '" + download_id + "', `store_id` = '" + this.config.get('config_store_id') + "', `ip` = " + this.db.escape(ip) + ", `country` = " + this.db.escape(country) + ", `date_added` = NOW()");
	}
}
