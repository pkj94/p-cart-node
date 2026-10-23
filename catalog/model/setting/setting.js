module.exports = class Setting extends global['OpencartSystemEngineModel'] {
	/**
	 * @param store_id
	 *
	 * @return array
	 */
	async getSettings(store_id = 0) {
		// Read on every request, so kept in the cache; admin/model/setting/setting.js clears it on save
		store_id = parseInt(store_id) || 0;
		let setting_data = await this.cache.get('setting.store.' + store_id);

		if (!setting_data) {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE `store_id` = " + this.db.quote(store_id) + " OR `store_id` = 0 ORDER BY `store_id` ASC");
			setting_data = query.rows;

			// Only stores that exist, so made-up ?store_id= values don't fill the cache
			if (!store_id || setting_data.some(result => result['store_id'] == store_id)) {
				await this.cache.set('setting.store.' + store_id, setting_data);
			}
		}

		return setting_data;
	}

	/**
	 * @param string code
	 * @param    store_id
	 *
	 * @return array
	 */
	async getSetting(code, store_id = 0) {
		let setting_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "setting` WHERE `store_id` = " + this.db.quote(store_id) + " AND `code` = " + this.db.escape(code));

		for (let result of query.rows) {
			if (!result['serialized']) {
				setting_data[result['key']] = result['value'];
			} else {
				setting_data[result['key']] = oc_json_decode(result['value'], []);
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
		const query = await this.db.query("SELECT `value` FROM `" + DB_PREFIX + "setting` WHERE `store_id` = " + this.db.quote(store_id) + " AND `key` = " + this.db.escape(key) );

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return '';
		}
	}
}
