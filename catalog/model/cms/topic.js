module.exports = class Topic extends global['OpencartSystemEngineModel'] {
	/**
	 * @param topic_id
	 *
	 * @return array
	 */
	async getTopic(topic_id) {
		let topic_data;
		const sql = "SELECT DISTINCT * FROM `" + DB_PREFIX + "topic` `t` LEFT JOIN `" + DB_PREFIX + "topic_description` `td` ON (`t`.`topic_id` = `td`.`topic_id`) LEFT JOIN `" + DB_PREFIX + "topic_to_store` `t2s` ON (`t`.`topic_id` = `t2s`.`topic_id`) WHERE `t`.`topic_id` = " + this.db.quote(topic_id) + " AND `td`.`language_id` = " + this.db.quote(this.config.get('config_language_id')) + " AND `t2s`.`store_id` = " + this.db.quote(this.config.get('config_store_id'));

		topic_data = await this.cache.get('topic.' + md5(sql));

		if (!topic_data) {
			const query = await this.db.query(sql);

			topic_data = query.rows;

			await this.cache.set('topic.' + md5(sql), topic_data);
		}

		return topic_data;
	}

	/**
	 * @return array
	 */
	async getTopics() {
		let topic_data;
		const sql = "SELECT * FROM `" + DB_PREFIX + "topic` `t` LEFT JOIN `" + DB_PREFIX + "topic_description` `td` ON (`t`.`topic_id` = `td`.`topic_id`) LEFT JOIN `" + DB_PREFIX + "topic_to_store` `t2s` ON (`t`.`topic_id` = `t2s`.`topic_id`) WHERE `td`.`language_id` = " + this.db.quote(this.config.get('config_language_id')) + " AND `t2s`.`store_id` = " + this.db.quote(this.config.get('config_store_id')) + " ORDER BY `t`.`sort_order` DESC";

		topic_data = await this.cache.get('topic.' + md5(sql));

		if (!topic_data) {
			const query = await this.db.query(sql);

			topic_data = query.rows;

			await this.cache.set('topic.' + md5(sql), topic_data);
		}

		return topic_data;
	}
}
