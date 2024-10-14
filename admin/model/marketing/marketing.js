module.exports = class MarketingModel extends Model {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addMarketing(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "marketing` SET `name` = " + this.db.escape(data['name']) + ", `description` = " + this.db.escape(data['description']) + ", `code` = " + this.db.escape(data['code']) + ", `date_added` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param   marketing_id
	 * @param data
	 *
	 * @return void
	 */
	async editMarketing(marketing_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "marketing` SET `name` = " + this.db.escape(data['name']) + ", `description` = " + this.db.escape(data['description']) + ", `code` = " + this.db.escape(data['code']) + " WHERE `marketing_id` = '" + marketing_id + "'");
	}

	/**
	 * @param marketing_id
	 *
	 * @return void
	 */
	async deleteMarketing(marketing_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "marketing` WHERE `marketing_id` = '" + marketing_id + "'");
	}

	/**
	 * @param marketing_id
	 *
	 * @return array
	 */
	async getMarketing(marketing_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "marketing` WHERE `marketing_id` = '" + marketing_id + "'");

		return query.row;
	}

	/**
	 * @param code
	 *
	 * @return array
	 */
	async getMarketingByCode(code) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "marketing` WHERE `code` = " + this.db.escape(code));

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getMarketings(data = {}) {
		let implode = [];

		const order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("o.`order_status_id` = '" + order_status_id + "'");
		}

		let sql = "SELECT *, (SELECT COUNT(*) FROM `" + DB_PREFIX + "order` o WHERE (" + implode.join(" OR ") + ") AND o.`marketing_id` = m.`marketing_id`) AS `orders` FROM `" + DB_PREFIX + "marketing` m";

		implode = [];

		if (data['filter_name']) {
			implode.push("m.`name` LIKE " + this.db.escape(data['filter_name'] + '%'));
		}

		if ((data['filter_code'])) {
			implode.push("m.`code` = " + this.db.escape(data['filter_code']));
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(m.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")");
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(m.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'm.name',
			'm.code',
			'm.date_added'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY m.`name`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
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

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalMarketings(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "marketing`";

		let implode = [];

		if (data['filter_name']) {
			implode.push("`name` LIKE " + this.db.escape(data['filter_name']));
		}

		if ((data['filter_code'])) {
			implode.push("`code` = " + this.db.escape(data['filter_code']));
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")");
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param marketing_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getReports(marketing_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `ip`, `store_id`, `country`, `date_added` FROM `" + DB_PREFIX + "marketing_report` WHERE `marketing_id` = '" + marketing_id + "' ORDER BY `date_added` ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param marketing_id
	 *
	 * @return int
	 */
	async getTotalReports(marketing_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "marketing_report` WHERE `marketing_id` = '" + marketing_id + "'");

		return query.row['total'];
	}
}
