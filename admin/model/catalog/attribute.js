module.exports = class ModelCatalogAttribute extends Model {
	async addAttribute(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "attribute SET attribute_group_id = '" + data['attribute_group_id'] + "', sort_order = '" + data['sort_order'] + "'");

		attribute_id = this.db.getLastId();

		for (data['attribute_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_description SET attribute_id = '" + attribute_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		return attribute_id;
	}

	async editAttribute(attribute_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "attribute SET attribute_group_id = '" + data['attribute_group_id'] + "', sort_order = '" + data['sort_order'] + "' WHERE attribute_id = '" + attribute_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "attribute_description WHERE attribute_id = '" + attribute_id + "'");

		for (data['attribute_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "attribute_description SET attribute_id = '" + attribute_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}
	}

	async deleteAttribute(attribute_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "attribute WHERE attribute_id = '" + attribute_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "attribute_description WHERE attribute_id = '" + attribute_id + "'");
	}

	async getAttribute(attribute_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "attribute a LEFT JOIN " + DB_PREFIX + "attribute_description ad ON (a.attribute_id = ad.attribute_id) WHERE a.attribute_id = '" + attribute_id + "' AND ad.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getAttributes(data = {}) {
		let sql = "SELECT *, (SELECT agd.name FROM " + DB_PREFIX + "attribute_group_description agd WHERE agd.attribute_group_id = a.attribute_group_id AND agd.language_id = '" + this.config.get('config_language_id') + "') AS attribute_group FROM " + DB_PREFIX + "attribute a LEFT JOIN " + DB_PREFIX + "attribute_description ad ON (a.attribute_id = ad.attribute_id) WHERE ad.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND ad.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_attribute_group_id'])) {
			sql += " AND a.attribute_group_id = '" + this.db.escape(data['filter_attribute_group_id']) + "'";
		}

		let sort_data = [
			'ad.name',
			'attribute_group',
			'a.sort_order'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY attribute_group, ad.name";
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

	async getAttributeDescriptions(attribute_id) {
		attribute_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "attribute_description WHERE attribute_id = '" + attribute_id + "'");

		for (let result of query.rows ) {
			attribute_data[result['language_id']] = array('name' : result['name']);
		}

		return attribute_data;
	}

	async getTotalAttributes() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "attribute");

		return query.row['total'];
	}

	async getTotalAttributesByAttributeGroupId(attribute_group_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "attribute WHERE attribute_group_id = '" + attribute_group_id + "'");

		return query.row['total'];
	}
}
