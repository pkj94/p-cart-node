module.exports = class ModelLocalisationLengthClass extends Model {
	async addLengthClass(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "length_class SET value = '" + data['value'] + "'");

		const length_class_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['length_class_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "length_class_description SET length_class_id = '" + length_class_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(value['title']) + "', unit = '" + this.db.escape(value['unit']) + "'");
		}

		await this.cache.delete('length_class');

		return length_class_id;
	}

	async editLengthClass(length_class_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "length_class SET value = '" + data['value'] + "' WHERE length_class_id = '" + length_class_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "length_class_description WHERE length_class_id = '" + length_class_id + "'");

		for (let [language_id, value] of Object.entries(data['length_class_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "length_class_description SET length_class_id = '" + length_class_id + "', language_id = '" + language_id + "', title = '" + this.db.escape(value['title']) + "', unit = '" + this.db.escape(value['unit']) + "'");
		}

		await this.cache.delete('length_class');
	}

	async deleteLengthClass(length_class_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "length_class WHERE length_class_id = '" + length_class_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "length_class_description WHERE length_class_id = '" + length_class_id + "'");

		await this.cache.delete('length_class');
	}

	async getLengthClasses(data = {}) {
		if (Object.keys(data).length) {
			let sql = "SELECT * FROM " + DB_PREFIX + "length_class lc LEFT JOIN " + DB_PREFIX + "length_class_description lcd ON (lc.length_class_id = lcd.length_class_id) WHERE lcd.language_id = '" + this.config.get('config_language_id') + "'";

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
			let length_class_data = await this.cache.get('length_class.' + this.config.get('config_language_id'));

			if (!length_class_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "length_class lc LEFT JOIN " + DB_PREFIX + "length_class_description lcd ON (lc.length_class_id = lcd.length_class_id) WHERE lcd.language_id = '" + this.config.get('config_language_id') + "'");

				length_class_data = query.rows;

				await this.cache.set('length_class.' + this.config.get('config_language_id'), length_class_data);
			}

			return length_class_data;
		}
	}

	async getLengthClass(length_class_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "length_class lc LEFT JOIN " + DB_PREFIX + "length_class_description lcd ON (lc.length_class_id = lcd.length_class_id) WHERE lc.length_class_id = '" + length_class_id + "' AND lcd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getLengthClassDescriptionByUnit(unit) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "length_class_description WHERE unit = '" + this.db.escape(unit) + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getLengthClassDescriptions(length_class_id) {
		let length_class_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "length_class_description WHERE length_class_id = '" + length_class_id + "'");

		for (let result of query.rows) {
			length_class_data[result['language_id']] = {
				'title': result['title'],
				'unit': result['unit']
			};
		}

		return length_class_data;
	}

	async getTotalLengthClasses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "length_class");

		return query.row['total'];
	}
}