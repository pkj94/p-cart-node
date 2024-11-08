module.exports = class ModelLocalisationReturnStatus extends Model {
	async addReturnStatus(data) {
		for (data['return_status'] of language_id : value) {
			if ((return_status_id)) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "return_status SET return_status_id = '" + return_status_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
			} else {
				await this.db.query("INSERT INTO " + DB_PREFIX + "return_status SET language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");

				return_status_id = this.db.getLastId();
			}
		}

		this.cache.delete('return_status');
		
		return return_status_id;
	}

	async editReturnStatus(return_status_id, data) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "return_status WHERE return_status_id = '" + return_status_id + "'");

		for (data['return_status'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "return_status SET return_status_id = '" + return_status_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		this.cache.delete('return_status');
	}

	async deleteReturnStatus(return_status_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "return_status WHERE return_status_id = '" + return_status_id + "'");

		this.cache.delete('return_status');
	}

	async getReturnStatus(return_status_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_status WHERE return_status_id = '" + return_status_id + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getReturnStatuses(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "return_status WHERE language_id = '" + this.config.get('config_language_id') + "'";

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
			return_status_data = this.cache.get('return_status.' + this.config.get('config_language_id'));

			if (!return_status_data) {
				const query = await this.db.query("SELECT return_status_id, name FROM " + DB_PREFIX + "return_status WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

				return_status_data = query.rows;

				this.cache.set('return_status.' + this.config.get('config_language_id'), return_status_data);
			}

			return return_status_data;
		}
	}

	async getReturnStatusDescriptions(return_status_id) {
		return_status_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_status WHERE return_status_id = '" + return_status_id + "'");

		for (let result of query.rows ) {
			return_status_data[result['language_id']] = array('name' : result['name']);
		}

		return return_status_data;
	}

	async getTotalReturnStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "return_status WHERE language_id = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}