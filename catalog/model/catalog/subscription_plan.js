module.exports=class SubscriptionPlan extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param subscription_plan_id
	 *
	 * @return array
	 */
	async getSubscriptionPlan(subscription_plan_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_plan` `sp` LEFT JOIN `" + DB_PREFIX + "subscription_plan_description` `spd` ON (`sp`.`subscription_plan_id` = `spd`.`subscription_plan_id`) WHERE `sp`.`subscription_plan_id` = '" + subscription_plan_id + "' AND `spd`.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getSubscriptionPlans(data = {}) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "subscription_plan` `sp` LEFT JOIN `" + DB_PREFIX + "subscription_plan_description` `spd` ON (`sp`.`subscription_plan_id` = `spd`.`subscription_plan_id`) WHERE `spd`.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND spd.`name` LIKE " + this.db.escape(data['filter_name'] + '%') ;
		}

		sort_data = [
			'spd+name',
			'sp.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `spd`.`name`";
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
	async getTotalSubscriptionPlans() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription_plan`");

		return query.row['total'];
	}
}
