module.exports = class CustomerSubscriptionReportModel extends Model {
	/**
	 * @param data
	 *
	 * @return array
	 */
	async getTransactions(data = []) {
		let sql = "SELECT `s`.`subscription_id`, `s`.`customer_id`, CONCAT(c.`firstname`, ' ', c.`lastname`) AS customer, c.`email`, cgd.`name` AS customer_group, c.`status`, SUM(st.`amount`) AS `total` FROM `" + DB_PREFIX + "subscription_transaction` st LEFT JOIN `" + DB_PREFIX + "subscription` `s` ON (st.`subscription_id` = `s`.`subscription_id`) LEFT JOIN `" + DB_PREFIX + "customer` c ON (`s`.`customer_id` = c.`customer_id`) LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (c.`customer_group_id` = cgd.`customer_group_id`) WHERE cgd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_date_start']) {
			sql += " AND DATE(st.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")";
		}

		if (data['filter_date_end']) {
			sql += " AND DATE(st.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")";
		}

		if (data['filter_customer']) {
			sql += " AND CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE " + this.db.escape(data['filter_customer']) + "";
		}

		sql += " GROUP BY `s`.`customer_id` ORDER BY total DESC";

		if (isset(data['start']) || isset(data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalTransactions(data = []) {
		sql = "SELECT COUNT(DISTINCT `s`.`customer_id`) AS `total` FROM `" + DB_PREFIX + "subscription_transaction` st LEFT JOIN `" + DB_PREFIX + "subscription` s ON (st.`subscription_id` = `s`.`subscription_id`) LEFT JOIN `" + DB_PREFIX + "customer` c ON (`s`.`customer_id` = c.`customer_id`)";

		const implode = [];

		if (data['filter_date_start']) {
			implode.push("DATE(st.`date_added`) >= DATE(" + this.db.escape(data['filter_date_start']) + ")");
		}

		if (data['filter_date_end']) {
			implode.push("DATE(st.`date_added`) <= DATE(" + this.db.escape(data['filter_date_end']) + ")");
		}

		if (data['filter_customer']) {
			implode.push("CONCAT(c.`firstname`, ' ', c.`lastname`) LIKE " + this.db.escape(data['filter_customer']) + "");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
