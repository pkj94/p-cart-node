module.exports = class ModelSettingSetting extends Model {
	async getSetting(code, store_id = 0) {
		const setting_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "setting WHERE store_id = '" + store_id + "' AND `code` = '" + this.db.escape(code) + "'");

		for (let result of query.rows) {
			if (!result['serialized']) {
				setting_data[result['key']] = result['value'];
			} else {
				setting_data[result['key']] = JSON.parse(result['value'], true);
			}
		}

		return setting_data;
	}

	async editSetting(code, data, store_id = 0) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE store_id = '" + store_id + "' AND `code` = '" + this.db.escape(code) + "'");

		for (let [key, value] of Object.entries(data)) {
			if (key.substr(0, code.length) == code) {
				if (!Array.isArray(value)) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "setting SET store_id = '" + store_id + "', `code` = '" + this.db.escape(code) + "', `key` = '" + this.db.escape(key) + "', `value` = " + this.db.escapeDb(value));
				} else {
					await this.db.query("INSERT INTO " + DB_PREFIX + "setting SET store_id = '" + store_id + "', `code` = '" + this.db.escape(code) + "', `key` = '" + this.db.escape(key) + "', `value` = '" + this.db.escape(JSON.stringify(value, true)) + "', serialized = '1'");
				}
			}
		}
	}

	async deleteSetting(code, store_id = 0) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "setting WHERE store_id = '" + store_id + "' AND `code` = '" + this.db.escape(code) + "'");
	}

	async getSettingValue(key, store_id = 0) {
		const query = await this.db.query("SELECT value FROM " + DB_PREFIX + "setting WHERE store_id = '" + store_id + "' AND `key` = '" + this.db.escape(key) + "'");

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return null;
		}
	}

	async editSettingValue(code = '', key = '', value = '', store_id = 0) {
		if (!Array.isArray(value)) {
			await this.db.query("UPDATE " + DB_PREFIX + "setting SET `value` = '" + this.db.escape(value) + "', serialized = '0'  WHERE `code` = '" + this.db.escape(code) + "' AND `key` = '" + this.db.escape(key) + "' AND store_id = '" + store_id + "'");
		} else {
			await this.db.query("UPDATE " + DB_PREFIX + "setting SET `value` = '" + this.db.escape(JSON.stringify(value)) + "', serialized = '1' WHERE `code` = '" + this.db.escape(code) + "' AND `key` = '" + this.db.escape(key) + "' AND store_id = '" + store_id + "'");
		}
	}
}
