module.exports = class ModelLocalisationReturnReason extends Model {
	async getReturnReasons(data = {}) {
		if (Object.keys(data).length) {
			let sql = "SELECT * FROM " + DB_PREFIX + "return_reason WHERE language_id = '" + this.config.get('config_language_id') + "'";

			sql += " ORDER BY name";

			if ((data['return']) && (data['return'] == 'DESC')) {
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
		} else {
			let return_reason_data = await this.cache.get('return_reason.' + this.config.get('config_language_id'));

			if (!return_reason_data) {
				const query = await this.db.query("SELECT return_reason_id, name FROM " + DB_PREFIX + "return_reason WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

				return_reason_data = query.rows;

				await this.cache.set('return_reason.' + this.config.get('config_language_id'), return_reason_data);
			}

			return return_reason_data;
		}
	}
}
