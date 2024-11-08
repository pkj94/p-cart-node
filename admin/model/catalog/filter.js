module.exports = class ModelCatalogFilter extends Model {
	async addFilter(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_group` SET sort_order = '" + data['sort_order'] + "'");

		filter_group_id = this.db.getLastId();

		for (data['filter_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "filter_group_description SET filter_group_id = '" + filter_group_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		if ((data['filter'])) {
			for (data['filter'] of filter) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "filter SET filter_group_id = '" + filter_group_id + "', sort_order = '" + filter['sort_order'] + "'");

				filter_id = this.db.getLastId();

				for (filter['filter_description'] of language_id : filter_description) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "filter_description SET filter_id = '" + filter_id + "', language_id = '" + language_id + "', filter_group_id = '" + filter_group_id + "', name = '" + this.db.escape(filter_description['name']) + "'");
				}
			}
		}

		return filter_group_id;
	}

	async editFilter(filter_group_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "filter_group` SET sort_order = '" + data['sort_order'] + "' WHERE filter_group_id = '" + filter_group_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "filter_group_description WHERE filter_group_id = '" + filter_group_id + "'");

		for (data['filter_group_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "filter_group_description SET filter_group_id = '" + filter_group_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "filter WHERE filter_group_id = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "filter_description WHERE filter_group_id = '" + filter_group_id + "'");

		if ((data['filter'])) {
			for (data['filter'] of filter) {
				if (filter['filter_id']) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "filter SET filter_id = '" + filter['filter_id'] + "', filter_group_id = '" + filter_group_id + "', sort_order = '" + filter['sort_order'] + "'");
				} else {
					await this.db.query("INSERT INTO " + DB_PREFIX + "filter SET filter_group_id = '" + filter_group_id + "', sort_order = '" + filter['sort_order'] + "'");
				}

				filter_id = this.db.getLastId();

				for (filter['filter_description'] of language_id : filter_description) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "filter_description SET filter_id = '" + filter_id + "', language_id = '" + language_id + "', filter_group_id = '" + filter_group_id + "', name = '" + this.db.escape(filter_description['name']) + "'");
				}
			}
		}
	}

	async deleteFilter(filter_group_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_group` WHERE filter_group_id = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_group_description` WHERE filter_group_id = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter` WHERE filter_group_id = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_description` WHERE filter_group_id = '" + filter_group_id + "'");
	}

	async getFilterGroup(filter_group_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter_group` fg LEFT JOIN " + DB_PREFIX + "filter_group_description fgd ON (fg.filter_group_id = fgd.filter_group_id) WHERE fg.filter_group_id = '" + filter_group_id + "' AND fgd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getFilterGroups(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "filter_group` fg LEFT JOIN " + DB_PREFIX + "filter_group_description fgd ON (fg.filter_group_id = fgd.filter_group_id) WHERE fgd.language_id = '" + this.config.get('config_language_id') + "'";

		let sort_data = [
			'fgd.name',
			'fg.sort_order'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY fgd.name";
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

	async getFilterGroupDescriptions(filter_group_id) {
		filter_group_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "filter_group_description WHERE filter_group_id = '" + filter_group_id + "'");

		for (let result of query.rows ) {
			filter_group_data[result['language_id']] = array('name' : result['name']);
		}

		return filter_group_data;
	}

	async getFilter(filter_id) {
		const query = await this.db.query("SELECT *, (SELECT name FROM " + DB_PREFIX + "filter_group_description fgd WHERE f.filter_group_id = fgd.filter_group_id AND fgd.language_id = '" + this.config.get('config_language_id') + "') AS `group` FROM " + DB_PREFIX + "filter f LEFT JOIN " + DB_PREFIX + "filter_description fd ON (f.filter_id = fd.filter_id) WHERE f.filter_id = '" + filter_id + "' AND fd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getFilters(data) {
		let sql = "SELECT *, (SELECT name FROM " + DB_PREFIX + "filter_group_description fgd WHERE f.filter_group_id = fgd.filter_group_id AND fgd.language_id = '" + this.config.get('config_language_id') + "') AS `group` FROM " + DB_PREFIX + "filter f LEFT JOIN " + DB_PREFIX + "filter_description fd ON (f.filter_id = fd.filter_id) WHERE fd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND fd.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		sql += " ORDER BY f.sort_order ASC";

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

	async getFilterDescriptions(filter_group_id) {
		filter_data = {};

		filter_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "filter WHERE filter_group_id = '" + filter_group_id + "'");

		for (filter_query.rows of filter) {
			filter_description_data = {};

			filter_description_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "filter_description WHERE filter_id = '" + filter['filter_id'] + "'");

			for (filter_description_query.rows of filter_description) {
				filter_description_data[filter_description['language_id']] = array('name' : filter_description['name']);
			}

			filter_data.push({
				'filter_id'          : filter['filter_id'],
				'filter_description' : filter_description_data,
				'sort_order'         : filter['sort_order']
			);
		}

		return filter_data;
	}

	async getTotalFilterGroups() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "filter_group`");

		return query.row['total'];
	}
}
