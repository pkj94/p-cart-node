module.exports = class ModelCatalogOption extends Model {
	async addOption(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "option` SET type = '" + this.db.escape(data['type']) + "', sort_order = '" + data['sort_order'] + "'");

		const option_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['option_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "option_description SET option_id = '" + option_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		if ((data['option_value'])) {
			data['option_value'] = Array.isArray(data['option_value']) ? data['option_value'] : Object.values(data['option_value']);
			for (let option_value of data['option_value']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "option_value SET option_id = '" + option_id + "', image = '" + this.db.escape(html_entity_decode(option_value['image'])) + "', sort_order = '" + option_value['sort_order'] + "'");

				const option_value_id = this.db.getLastId();

				for (let [language_id, option_value_description] of Object.entries(option_value['option_value_description'])) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "option_value_description SET option_value_id = '" + option_value_id + "', language_id = '" + language_id + "', option_id = '" + option_id + "', name = '" + this.db.escape(option_value_description['name']) + "'");
				}
			}
		}

		return option_id;
	}

	async editOption(option_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "option` SET type = '" + this.db.escape(data['type']) + "', sort_order = '" + data['sort_order'] + "' WHERE option_id = '" + option_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "option_description WHERE option_id = '" + option_id + "'");

		for (let [language_id, value] of Object.entries(data['option_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "option_description SET option_id = '" + option_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "option_value WHERE option_id = '" + option_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "option_value_description WHERE option_id = '" + option_id + "'");

		if ((data['option_value'])) {
			data['option_value'] = Array.isArray(data['option_value']) ? data['option_value'] : Object.values(data['option_value']);
			for (let option_value of data['option_value']) {
				if (option_value['option_value_id']) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "option_value SET option_value_id = '" + option_value['option_value_id'] + "', option_id = '" + option_id + "', image = '" + this.db.escape(html_entity_decode(option_value['image'])) + "', sort_order = '" + option_value['sort_order'] + "'");
				} else {
					await this.db.query("INSERT INTO " + DB_PREFIX + "option_value SET option_id = '" + option_id + "', image = '" + this.db.escape(html_entity_decode(option_value['image'])) + "', sort_order = '" + option_value['sort_order'] + "'");
				}

				const option_value_id = this.db.getLastId();

				for (let [language_id, option_value_description] of Object.entries(option_value['option_value_description'])) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "option_value_description SET option_value_id = '" + option_value_id + "', language_id = '" + language_id + "', option_id = '" + option_id + "', name = '" + this.db.escape(option_value_description['name']) + "'");
				}
			}

		}
	}

	async deleteOption(option_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "option` WHERE option_id = '" + option_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "option_description WHERE option_id = '" + option_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "option_value WHERE option_id = '" + option_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "option_value_description WHERE option_id = '" + option_id + "'");
	}

	async getOption(option_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "option` o LEFT JOIN " + DB_PREFIX + "option_description od ON (o.option_id = od.option_id) WHERE o.option_id = '" + option_id + "' AND od.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getOptions(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "option` o LEFT JOIN " + DB_PREFIX + "option_description od ON (o.option_id = od.option_id) WHERE od.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND od.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		let sort_data = [
			'od.name',
			'o.type',
			'o.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY od.name";
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
	}

	async getOptionDescriptions(option_id) {
		let option_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_description WHERE option_id = '" + option_id + "'");

		for (let result of query.rows) {
			option_data[result['language_id']] = { 'name': result['name'] };
		}

		return option_data;
	}

	async getOptionValue(option_value_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_value ov LEFT JOIN " + DB_PREFIX + "option_value_description ovd ON (ov.option_value_id = ovd.option_value_id) WHERE ov.option_value_id = '" + option_value_id + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getOptionValues(option_id) {
		let option_value_data = [];

		const option_value_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_value ov LEFT JOIN " + DB_PREFIX + "option_value_description ovd ON (ov.option_value_id = ovd.option_value_id) WHERE ov.option_id = '" + option_id + "' AND ovd.language_id = '" + this.config.get('config_language_id') + "' ORDER BY ov.sort_order, ovd.name");

		for (let option_value of option_value_query.rows) {
			option_value_data.push({
				'option_value_id': option_value['option_value_id'],
				'name': option_value['name'],
				'image': option_value['image'],
				'sort_order': option_value['sort_order']
			});
		}

		return option_value_data;
	}

	async getOptionValueDescriptions(option_id) {
		let option_value_data = [];

		const option_value_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_value WHERE option_id = '" + option_id + "' ORDER BY sort_order");

		for (let option_value of option_value_query.rows) {
			let option_value_description_data = {};

			const option_value_description_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "option_value_description WHERE option_value_id = '" + option_value['option_value_id'] + "'");

			for (let option_value_description of option_value_description_query.rows) {
				option_value_description_data[option_value_description['language_id']] = { 'name': option_value_description['name'] };
			}

			option_value_data.push({
				'option_value_id': option_value['option_value_id'],
				'option_value_description': option_value_description_data,
				'image': option_value['image'],
				'sort_order': option_value['sort_order']
			});
		}

		return option_value_data;
	}

	async getTotalOptions() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "option`");

		return query.row['total'];
	}
}