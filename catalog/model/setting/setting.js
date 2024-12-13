module.exports = class ModelSettingSetting extends Model {
	async getSetting(code, store_id = 0) {
		const data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "setting WHERE store_id = '" + store_id + "' AND `code` = '" + this.db.escape(code) + "'");

		for (let result of query.rows) {
			if (!result['serialized']) {
				data[result['key']] = result['value'];
			} else {
				data[result['key']] = JSON.parse(result['value'], true);
			}
		}

		return data;
	}

	async getSettingValue(key, store_id = 0) {
		const query = await this.db.query("SELECT value FROM " + DB_PREFIX + "setting WHERE store_id = '" + store_id + "' AND `key` = '" + this.db.escape(key) + "'");

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return null;
		}
	}
}