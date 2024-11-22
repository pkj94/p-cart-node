module.exports = class ModelLocalisationReturnReason extends Model {
	async addReturnReason(data) {
		for (data['return_reason'] of language_id : value) {
			if ((return_reason_id)) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "return_reason SET return_reason_id = '" + return_reason_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
			} else {
				await this.db.query("INSERT INTO " + DB_PREFIX + "return_reason SET language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");

				return_reason_id = this.db.getLastId();
			}
		}

		await this.cache.delete('return_reason');
		
		return return_reason_id;
	}

	async editReturnReason(return_reason_id, data) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "return_reason WHERE return_reason_id = '" + return_reason_id + "'");

		for (data['return_reason'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "return_reason SET return_reason_id = '" + return_reason_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		await this.cache.delete('return_reason');
	}

	async deleteReturnReason(return_reason_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "return_reason WHERE return_reason_id = '" + return_reason_id + "'");

		await this.cache.delete('return_reason');
	}

	async getReturnReason(return_reason_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_reason WHERE return_reason_id = '" + return_reason_id + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getReturnReasons(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "return_reason WHERE language_id = '" + this.config.get('config_language_id') + "'";

			sql += " ORDER BY name";

			if ((data['order']) && (data['order'] == 'DESC')) {
				sql += " DESC";
			} else {
				sql += " ASC";
			}

			if ((data['start']) || (data['limit'])) {
				data['start'] = data['start']||0;
if (data['start'] < 0) {
					data['start'] = 0;
				}

				data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
					data['limit'] = 20;
				}

				sql += " LIMIT " + data['start'] + "," + data['limit'];
			}

			const query = await this.db.query(sql);

			return query.rows;
		} else {
			return_reason_data = await this.cache.get('return_reason.' + this.config.get('config_language_id'));

			if (!return_reason_data) {
				const query = await this.db.query("SELECT return_reason_id, name FROM " + DB_PREFIX + "return_reason WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

				return_reason_data = query.rows;

				await this.cache.set('return_reason.' + this.config.get('config_language_id'), return_reason_data);
			}

			return return_reason_data;
		}
	}

	async getReturnReasonDescriptions(return_reason_id) {
		return_reason_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_reason WHERE return_reason_id = '" + return_reason_id + "'");

		for (let result of query.rows ) {
			return_reason_data[result['language_id']] = array('name' : result['name']);
		}

		return return_reason_data;
	}

	async getTotalReturnReasons() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "return_reason WHERE language_id = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}