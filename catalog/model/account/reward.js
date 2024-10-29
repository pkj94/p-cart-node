module.exports =class Reward extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param data
	 *
	 * @return array
	 */
	async getRewards(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + await this.customer.getId() + "'";

		let sort_data = [
			'points',
			'description',
			'date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY `" + data['sort'] + "`";
		} else {
			sql += " ORDER BY `date_added`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalRewards() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + await this.customer.getId() + "'");

		return query.row['total'];
	}

	/**
	 * @return int
	 */
	async getTotalPoints() {
		const query = await this.db.query("SELECT SUM(`points`) AS `total` FROM `" + DB_PREFIX + "customer_reward` WHERE `customer_id` = '" + await this.customer.getId() + "' GROUP BY `customer_id`");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}
}
