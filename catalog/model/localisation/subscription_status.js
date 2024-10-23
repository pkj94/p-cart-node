module.exports =class SubscriptionStatus extends global['\Opencart\System\Engine\Model'] {
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
	 * @return array
	 */
	async getSubscriptionStatuses() {
		const sql = "SELECT `subscription_status_id`, `name` FROM `" + DB_PREFIX + "subscription_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

		subscription_status_data = await this.cache.get('subscription_status+'+ md5(sql));

		if (!subscription_status_data) {
			const query = await this.db.query(sql);

			subscription_status_data = query.rows;

			await this.cache.set('subscription_status+'+ md5(sql), subscription_status_data);
		}

		return subscription_status_data;
	}
}