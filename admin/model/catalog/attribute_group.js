module.exports = class ModelCatalogAttributeGroup extends Model {
	async addAttributeGroup(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_group SET sort_order = '" + data['sort_order'] + "'");

		attribute_group_id = this.db.getLastId();

		for (data['attribute_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_group_description SET attribute_group_id = '" + attribute_group_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		return attribute_group_id;
	}

	async editAttributeGroup(attribute_group_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "attribute_group SET sort_order = '" + data['sort_order'] + "' WHERE attribute_group_id = '" + attribute_group_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "attribute_group_description WHERE attribute_group_id = '" + attribute_group_id + "'");

		for (data['attribute_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_group_description SET attribute_group_id = '" + attribute_group_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}
	}

	async deleteAttributeGroup(attribute_group_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "attribute_group WHERE attribute_group_id = '" + attribute_group_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "attribute_group_description WHERE attribute_group_id = '" + attribute_group_id + "'");
	}

	async getAttributeGroup(attribute_group_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "attribute_group WHERE attribute_group_id = '" + attribute_group_id + "'");

		return query.row;
	}

	async getAttributeGroups(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "attribute_group ag LEFT JOIN " + DB_PREFIX + "attribute_group_description agd ON (ag.attribute_group_id = agd.attribute_group_id) WHERE agd.language_id = '" + this.config.get('config_language_id') + "'";

		let sort_data = [
			'agd.name',
			'ag.sort_order'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY agd.name";
		}

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
	}

	async getAttributeGroupDescriptions(attribute_group_id) {
		attribute_group_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "attribute_group_description WHERE attribute_group_id = '" + attribute_group_id + "'");

		for (let result of query.rows ) {
			attribute_group_data[result['language_id']] = array('name' : result['name']);
		}

		return attribute_group_data;
	}

	async getTotalAttributeGroups() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "attribute_group");

		return query.row['total'];
	}
}