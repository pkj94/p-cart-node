module.exports = class ModelCustomerCustomField extends Model {
	async addCustomField(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "custom_field` SET type = '" + this.db.escape(data['type']) + "', value = '" + this.db.escape(data['value']) + "', validation = '" + this.db.escape(data['validation']) + "', location = '" + this.db.escape(data['location']) + "', status = '" + data['status'] + "', sort_order = '" + data['sort_order'] + "'");

		const custom_field_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['custom_field_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_description SET custom_field_id = '" + custom_field_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		if ((data['custom_field_customer_group'])) {
			for (let [cfid, custom_field_customer_group] of Object.entries(data['custom_field_customer_group'])) {
				if ((custom_field_customer_group['customer_group_id'])) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_customer_group SET custom_field_id = '" + custom_field_id + "', customer_group_id = '" + custom_field_customer_group['customer_group_id'] + "', required = '" + ((custom_field_customer_group['required']) ? 1 : 0) + "'");
				}
			}
		}

		if ((data['custom_field_value'])) {
			for (let [id, custom_field_value] of Object.entries(data['custom_field_value'])) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_value SET custom_field_id = '" + custom_field_id + "', sort_order = '" + custom_field_value['sort_order'] + "'");

				const custom_field_value_id = this.db.getLastId();

				for (let [language_id, custom_field_value_description] of Object.entries(custom_field_value['custom_field_value_description'])) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_value_description SET custom_field_value_id = '" + custom_field_value_id + "', language_id = '" + language_id + "', custom_field_id = '" + custom_field_id + "', name = '" + this.db.escape(custom_field_value_description['name']) + "'");
				}
			}
		}

		return custom_field_id;
	}

	async editCustomField(custom_field_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "custom_field` SET type = '" + this.db.escape(data['type']) + "', value = '" + this.db.escape(data['value']) + "', validation = '" + this.db.escape(data['validation']) + "', location = '" + this.db.escape(data['location']) + "', status = '" + data['status'] + "', sort_order = '" + data['sort_order'] + "' WHERE custom_field_id = '" + custom_field_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "custom_field_description WHERE custom_field_id = '" + custom_field_id + "'");

		for (let [language_id, value] of Object.entries(data['custom_field_description'])) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_description SET custom_field_id = '" + custom_field_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "custom_field_customer_group WHERE custom_field_id = '" + custom_field_id + "'");

		if ((data['custom_field_customer_group'])) {
			for (let [cfid, custom_field_customer_group] of Object.entries(data['custom_field_customer_group'])) {
				if ((custom_field_customer_group['customer_group_id'])) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_customer_group SET custom_field_id = '" + custom_field_id + "', customer_group_id = '" + custom_field_customer_group['customer_group_id'] + "', required = '" + ((custom_field_customer_group['required']) ? 1 : 0) + "'");
				}
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "custom_field_value WHERE custom_field_id = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "custom_field_value_description WHERE custom_field_id = '" + custom_field_id + "'");

		if ((data['custom_field_value'])) {
			for (let [id, custom_field_value] of Object.entries(data['custom_field_value'])) {
				if (custom_field_value['custom_field_value_id']) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_value SET custom_field_value_id = '" + custom_field_value['custom_field_value_id'] + "', custom_field_id = '" + custom_field_id + "', sort_order = '" + custom_field_value['sort_order'] + "'");
				} else {
					await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_value SET custom_field_id = '" + custom_field_id + "', sort_order = '" + custom_field_value['sort_order'] + "'");
				}

				const custom_field_value_id = this.db.getLastId();

				for (let [language_id, custom_field_value_description] of Object.entries(custom_field_value['custom_field_value_description'])) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "custom_field_value_description SET custom_field_value_id = '" + custom_field_value_id + "', language_id = '" + language_id + "', custom_field_id = '" + custom_field_id + "', name = '" + this.db.escape(custom_field_value_description['name']) + "'");
				}
			}
		}
	}

	async deleteCustomField(custom_field_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field` WHERE custom_field_id = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_description` WHERE custom_field_id = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_customer_group` WHERE custom_field_id = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value` WHERE custom_field_id = '" + custom_field_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "custom_field_value_description` WHERE custom_field_id = '" + custom_field_id + "'");
	}

	async getCustomField(custom_field_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field` cf LEFT JOIN " + DB_PREFIX + "custom_field_description cfd ON (cf.custom_field_id = cfd.custom_field_id) WHERE cf.custom_field_id = '" + custom_field_id + "' AND cfd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getCustomFields(data = {}) {
		let sql = '';
		if (!(data['filter_customer_group_id'])) {
			sql = "SELECT * FROM `" + DB_PREFIX + "custom_field` cf LEFT JOIN " + DB_PREFIX + "custom_field_description cfd ON (cf.custom_field_id = cfd.custom_field_id) WHERE cfd.language_id = '" + this.config.get('config_language_id') + "'";
		} else {
			sql = "SELECT * FROM " + DB_PREFIX + "custom_field_customer_group cfcg LEFT JOIN `" + DB_PREFIX + "custom_field` cf ON (cfcg.custom_field_id = cf.custom_field_id) LEFT JOIN " + DB_PREFIX + "custom_field_description cfd ON (cf.custom_field_id = cfd.custom_field_id) WHERE cfd.language_id = '" + this.config.get('config_language_id') + "'";
		}

		if ((data['filter_name'])) {
			sql += " AND cfd.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_customer_group_id'])) {
			sql += " AND cfcg.customer_group_id = '" + data['filter_customer_group_id'] + "'";
		}

		let sort_data = [
			'cfd.name',
			'cf.type',
			'cf.location',
			'cf.status',
			'cf.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY cfd.name";
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

	async getCustomFieldDescriptions(custom_field_id) {
		const custom_field_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_description WHERE custom_field_id = '" + custom_field_id + "'");

		for (let result of query.rows) {
			custom_field_data[result['language_id']] = { 'name': result['name'] };
		}

		return custom_field_data;
	}

	async getCustomFieldValue(custom_field_value_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_value cfv LEFT JOIN " + DB_PREFIX + "custom_field_value_description cfvd ON (cfv.custom_field_value_id = cfvd.custom_field_value_id) WHERE cfv.custom_field_value_id = '" + custom_field_value_id + "' AND cfvd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getCustomFieldValues(custom_field_id) {
		const custom_field_value_data = {};

		const custom_field_value_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_value cfv LEFT JOIN " + DB_PREFIX + "custom_field_value_description cfvd ON (cfv.custom_field_value_id = cfvd.custom_field_value_id) WHERE cfv.custom_field_id = '" + custom_field_id + "' AND cfvd.language_id = '" + this.config.get('config_language_id') + "' ORDER BY cfv.sort_order ASC");

		for (let custom_field_value of custom_field_value_query.rows) {
			custom_field_value_data[custom_field_value['custom_field_value_id']] = {
				'custom_field_value_id': custom_field_value['custom_field_value_id'],
				'name': custom_field_value['name']
			};
		}

		return custom_field_value_data;
	}

	async getCustomFieldCustomerGroups(custom_field_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "custom_field_customer_group` WHERE custom_field_id = '" + custom_field_id + "'");

		return query.rows;
	}

	async getCustomFieldValueDescriptions(custom_field_id) {
		const custom_field_value_data = [];

		const custom_field_value_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_value WHERE custom_field_id = '" + custom_field_id + "'");

		for (let custom_field_value of custom_field_value_query.rows) {
			const custom_field_value_description_data = {};

			const custom_field_value_description_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "custom_field_value_description WHERE custom_field_value_id = '" + custom_field_value['custom_field_value_id'] + "'");

			for (let custom_field_value_description of custom_field_value_description_query.rows) {
				custom_field_value_description_data[custom_field_value_description['language_id']] = { 'name': custom_field_value_description['name'] };
			}

			custom_field_value_data.push({
				'custom_field_value_id': custom_field_value['custom_field_value_id'],
				'custom_field_value_description': custom_field_value_description_data,
				'sort_order': custom_field_value['sort_order']
			});
		}

		return custom_field_value_data;
	}

	async getTotalCustomFields() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "custom_field`");

		return query.row['total'];
	}
}