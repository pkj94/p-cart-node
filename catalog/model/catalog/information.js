module.exports=class InformationModel extends Model {
	/**
	 * @param information_id
	 *
	 * @return array
	 */
	async getInformation(information_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "information` i LEFT JOIN `" + DB_PREFIX + "information_description` id ON (i.`information_id` = id.`information_id`) LEFT JOIN `" + DB_PREFIX + "information_to_store` i2s ON (i.`information_id` = i2s.`information_id`) WHERE i.`information_id` = '" + information_id + "' AND id.`language_id` = '" + this.config.get('config_language_id') + "' AND i2s.`store_id` = '" + this.config.get('config_store_id') + "' AND i.`status` = '1'");

		return query.row;
	}

	/**
	 * @return array
	 */
	async getInformations() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "information` i LEFT JOIN `" + DB_PREFIX + "information_description` id ON (i.`information_id` = id.`information_id`) LEFT JOIN `" + DB_PREFIX + "information_to_store` i2s ON (i.`information_id` = i2s.`information_id`) WHERE id.`language_id` = '" + this.config.get('config_language_id') + "' AND i2s.`store_id` = '" + this.config.get('config_store_id') + "' AND i.`status` = '1' ORDER BY i.`sort_order`, LCASE(id.`title`) ASC");

		return query.rows;
	}

	/**
	 * @param information_id
	 *
	 * @return int
	 */
	async getLayoutId(information_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "information_to_layout` WHERE `information_id` = '" + information_id + "' AND `store_id` = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}
}
