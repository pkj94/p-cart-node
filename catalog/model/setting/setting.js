module.exports = class SettingModel extends Model {
	/**
	 * @param store_id
	 *
	 * @return array
	 */
	async getSettings(store_id = 0) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE `store_id` = '" + store_id + "' OR `store_id` = 0 ORDER BY `store_id` ASC");
		return query.rows;
	}

	/**
	 * @param string code
	 * @param    store_id
	 *
	 * @return array
	 */
	async getSetting(code, store_id = 0) {
		let setting_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE `store_id` = '" + store_id + "' AND `code` = " + this.db.escape(code) + "");

		for (let result of query.rows) {
			if (!result['serialized']) {
				setting_data[result['key']] = result['value'];
			} else {
				setting_data[result['key']] = JSON.parse(result['value'], true);
			}
		}

		return setting_data;
	}

	/**
	 * @param string key
	 * @param    store_id
	 *
	 * @return string
	 */
	async getValue(key, store_id = 0) {
		const query = await this.db.query("SELECT `value` FROM `" + DB_PREFIX + "setting` WHERE `store_id` = '" + store_id + "' AND `key` = '" + this.db.escape(key) + "'");

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return '';
		}
	}
}
