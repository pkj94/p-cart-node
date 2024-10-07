module.exports = class OnlineReportModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return array
	 */
	async getOnline(data = {}) {
		let sql = "SELECT `co`.`ip`, `co`.`customer_id`, `co`.`url`, `co`.`referer`, `co`.`date_added` FROM `" + DB_PREFIX + "customer_online` `co` LEFT JOIN `" + DB_PREFIX + "customer` `c` ON (`co`.`customer_id` = `c`.`customer_id`)";

		let implode = [];

		if ((data['filter_ip'])) {
			implode.push("`co`.`ip` LIKE " + this.db.escape(data['filter_ip']) + "");
		}

		if ((data['filter_customer'])) {
			implode.push("`co`.`customer_id` > '0' AND CONCAT(`c`.`firstname`, ' ', `c`.`lastname`) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		sql += " ORDER BY `co`.`date_added` DESC";

		if (data['start'] || data['limit']) {
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
	async getTotalOnline(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_online` `co` LEFT JOIN `" + DB_PREFIX + "customer` `c` ON (`co`.`customer_id` = `c`.`customer_id`)";

		let implode = [];

		if ((data['filter_ip'])) {
			implode.push("`co`.`ip` LIKE " + this.db.escape(data['filter_ip']) + "");
		}

		if ((data['filter_customer'])) {
			implode.push("`co`.`customer_id` > '0' AND CONCAT(`c`.`firstname`, ' ', `c`.`lastname`) LIKE '" + this.db.escape(data['filter_customer']) + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
