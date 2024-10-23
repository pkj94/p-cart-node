module.exports = class SubscriptionStatusLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addSubscriptionStatus(data) {
		let subscription_status_id = 0;
		for (let [language_id, value] of Object.entries(data['subscription_status'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			if ((subscription_status_id)) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_status` SET `subscription_status_id` = '" + subscription_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
			} else {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_status` SET `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");

				subscription_status_id = this.db.getLastId();
			}
		}

		await this.cache.delete('subscription_status');

		return subscription_status_id;
	}

	/**
	 * @param   subscription_status_id
	 * @param data
	 *
	 * @return void
	 */
	async editSubscriptionStatus(subscription_status_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription_status` WHERE `subscription_status_id` = '" + subscription_status_id + "'");

		for (let [language_id, value] of Object.entries(data['subscription_status'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_status` SET `subscription_status_id` = '" + subscription_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('subscription_status');
	}

	/**
	 * @param subscription_status_id
	 *
	 * @return void
	 */
	async deleteSubscriptionStatus(subscription_status_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription_status` WHERE `subscription_status_id` = '" + subscription_status_id + "'");

		await this.cache.delete('subscription_status');
	}

	/**
	 * @param subscription_status_id
	 *
	 * @return array
	 */
	async getSubscriptionStatus(subscription_status_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_status` WHERE `subscription_status_id` = '" + subscription_status_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getSubscriptionStatuses(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "subscription_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

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

		let subscription_status_data = await this.cache.get('subscription_status+' + md5(sql));

		if (!subscription_status_data) {
			const query = await this.db.query(sql);

			subscription_status_data = query.rows;

			await this.cache.set('subscription_status+' + md5(sql), subscription_status_data);
		}

		return subscription_status_data;
	}

	/**
	 * @param subscription_status_id
	 *
	 * @return array
	 */
	async getDescriptions(subscription_status_id) {
		let subscription_status_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_status` WHERE `subscription_status_id` = '" + subscription_status_id + "'");

		for (let result of query.rows) {
			subscription_status_data[result['language_id']] = { 'name': result['name'] };
		}

		return subscription_status_data;
	}

	/**
	 * @return int
	 */
	async getTotalSubscriptionStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}
