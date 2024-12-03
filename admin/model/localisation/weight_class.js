module.exports = class ModelLocalisationWeightClass extends Model {
	async addWeightClass(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "weight_class SET value = '" + data['value'] + "'");

		const weight_class_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['weight_class_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "weight_class_description SET weight_class_id = '" + weight_class_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(value['title']) + "', unit = '" + this.db.escape(value['unit']) + "'");
		}

		await this.cache.delete('weight_class');

		return weight_class_id;
	}

	async editWeightClass(weight_class_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "weight_class SET value = '" + data['value'] + "' WHERE weight_class_id = '" + weight_class_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "weight_class_description WHERE weight_class_id = '" + weight_class_id + "'");

		for (let [language_id, value] of Object.entries(data['weight_class_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "weight_class_description SET weight_class_id = '" + weight_class_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(value['title']) + "', unit = '" + this.db.escape(value['unit']) + "'");
		}

		await this.cache.delete('weight_class');
	}

	async deleteWeightClass(weight_class_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "weight_class WHERE weight_class_id = '" + weight_class_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "weight_class_description WHERE weight_class_id = '" + weight_class_id + "'");

		await this.cache.delete('weight_class');
	}

	async getWeightClasses(data = {}) {
		if (Object.keys(data).length) {
			let sql = "SELECT * FROM " + DB_PREFIX + "weight_class wc LEFT JOIN " + DB_PREFIX + "weight_class_description wcd ON (wc.weight_class_id = wcd.weight_class_id) WHERE wcd.language_id = '" + this.config.get('config_language_id') + "'";

			let sort_data = [
				'title',
				'unit',
				'value'
			];

			if ((data['sort']) && sort_data.includes(data['sort'])) {
				sql += " ORDER BY " + data['sort'];
			} else {
				sql += " ORDER BY title";
			}

			if ((data['order']) && (data['order'] == 'DESC')) {
				sql += " DESC";
			} else {
				sql += " ASC";
			}

			if ((data['start']) || (data['limit'])) {
				data['start'] = data['start'] || 0;
				if (data['start'] < 0) {
					data['start'] = 0;
				}

				data['limit'] = data['limit'] || 20;
				if (data['limit'] < 1) {
					data['limit'] = 20;
				}

				sql += " LIMIT " + data['start'] + "," + data['limit'];
			}

			const query = await this.db.query(sql);

			return query.rows;
		} else {
			let weight_class_data = await this.cache.get('weight_class.' + this.config.get('config_language_id'));

			if (!weight_class_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "weight_class wc LEFT JOIN " + DB_PREFIX + "weight_class_description wcd ON (wc.weight_class_id = wcd.weight_class_id) WHERE wcd.language_id = '" + this.config.get('config_language_id') + "'");

				weight_class_data = query.rows;

				await this.cache.set('weight_class.' + this.config.get('config_language_id'), weight_class_data);
			}

			return weight_class_data;
		}
	}

	async getWeightClass(weight_class_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "weight_class wc LEFT JOIN " + DB_PREFIX + "weight_class_description wcd ON (wc.weight_class_id = wcd.weight_class_id) WHERE wc.weight_class_id = '" + weight_class_id + "' AND wcd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getWeightClassDescriptionByUnit(unit) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "weight_class_description WHERE unit = '" + this.db.escape(unit) + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getWeightClassDescriptions(weight_class_id) {
		let weight_class_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "weight_class_description WHERE weight_class_id = '" + weight_class_id + "'");

		for (let result of query.rows) {
			weight_class_data[result['language_id']] = {
				'title': result['title'],
				'unit': result['unit']
			};
		}

		return weight_class_data;
	}

	async getTotalWeightClasses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "weight_class");

		return query.row['total'];
	}
}