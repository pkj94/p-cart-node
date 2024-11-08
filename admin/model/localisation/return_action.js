module.exports = class ModelLocalisationReturnAction extends Model {
	async addReturnAction(data) {
		for (data['return_action'] of language_id : value) {
			if ((return_action_id)) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "return_action SET return_action_id = '" + return_action_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
			} else {
				await this.db.query("INSERT INTO " + DB_PREFIX + "return_action SET language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");

				return_action_id = this.db.getLastId();
			}
		}

		this.cache.delete('return_action');
		
		return return_action_id;
	}

	async editReturnAction(return_action_id, data) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "return_action WHERE return_action_id = '" + return_action_id + "'");

		for (data['return_action'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "return_action SET return_action_id = '" + return_action_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		this.cache.delete('return_action');
	}

	async deleteReturnAction(return_action_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "return_action WHERE return_action_id = '" + return_action_id + "'");

		this.cache.delete('return_action');
	}

	async getReturnAction(return_action_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_action WHERE return_action_id = '" + return_action_id + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getReturnActions(data = {}) {
		if (data) {
			let sql = "SELECT * FROM " + DB_PREFIX + "return_action WHERE language_id = '" + this.config.get('config_language_id') + "'";

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
			return_action_data = this.cache.get('return_action.' + this.config.get('config_language_id'));

			if (!return_action_data) {
				const query = await this.db.query("SELECT return_action_id, name FROM " + DB_PREFIX + "return_action WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

				return_action_data = query.rows;

				this.cache.set('return_action.' + this.config.get('config_language_id'), return_action_data);
			}

			return return_action_data;
		}
	}

	async getReturnActionDescriptions(return_action_id) {
		return_action_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "return_action WHERE return_action_id = '" + return_action_id + "'");

		for (let result of query.rows ) {
			return_action_data[result['language_id']] = array('name' : result['name']);
		}

		return return_action_data;
	}

	async getTotalReturnActions() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "return_action WHERE language_id = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}