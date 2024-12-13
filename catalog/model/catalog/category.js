module.exports = class ModelCatalogCategory extends Model {
	async getCategory(category_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "category c LEFT JOIN " + DB_PREFIX + "category_description cd ON (c.category_id = cd.category_id) LEFT JOIN " + DB_PREFIX + "category_to_store c2s ON (c.category_id = c2s.category_id) WHERE c.category_id = '" + category_id + "' AND cd.language_id = '" + this.config.get('config_language_id') + "' AND c2s.store_id = '" + this.config.get('config_store_id') + "' AND c.status = '1'");

		return query.row;
	}

	async getCategories(parent_id = 0) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category c LEFT JOIN " + DB_PREFIX + "category_description cd ON (c.category_id = cd.category_id) LEFT JOIN " + DB_PREFIX + "category_to_store c2s ON (c.category_id = c2s.category_id) WHERE c.parent_id = '" + parent_id + "' AND cd.language_id = '" + this.config.get('config_language_id') + "' AND c2s.store_id = '" + this.config.get('config_store_id') + "'  AND c.status = '1' ORDER BY c.sort_order, LCASE(cd.name)");

		return query.rows;
	}

	async getCategoryFilters(category_id) {
		const implode = [];

		const query = await this.db.query("SELECT filter_id FROM " + DB_PREFIX + "category_filter WHERE category_id = '" + category_id + "'");

		for (let result of query.rows) {
			implode.push(result['filter_id']);
		}

		const filter_group_data = [];

		if (implode.length) {
			const filter_group_query = await this.db.query("SELECT DISTINCT f.filter_group_id, fgd.name, fg.sort_order FROM " + DB_PREFIX + "filter f LEFT JOIN " + DB_PREFIX + "filter_group fg ON (f.filter_group_id = fg.filter_group_id) LEFT JOIN " + DB_PREFIX + "filter_group_description fgd ON (fg.filter_group_id = fgd.filter_group_id) WHERE f.filter_id IN (" + implode.join(',') + ") AND fgd.language_id = '" + this.config.get('config_language_id') + "' GROUP BY f.filter_group_id ORDER BY fg.sort_order, LCASE(fgd.name)");

			for (let filter_group of filter_group_query.rows) {
				const filter_data = [];

				const filter_query = await this.db.query("SELECT DISTINCT f.filter_id, fd.name FROM " + DB_PREFIX + "filter f LEFT JOIN " + DB_PREFIX + "filter_description fd ON (f.filter_id = fd.filter_id) WHERE f.filter_id IN (" + implode.join(',') + ") AND f.filter_group_id = '" + filter_group['filter_group_id'] + "' AND fd.language_id = '" + this.config.get('config_language_id') + "' ORDER BY f.sort_order, LCASE(fd.name)");

				for (let filter of filter_query.rows) {
					filter_data.push({
						'filter_id': filter['filter_id'],
						'name': filter['name']
					});
				}

				if (filter_data.length) {
					filter_group_data.push({
						'filter_group_id': filter_group['filter_group_id'],
						'name': filter_group['name'],
						'filter': filter_data
					});
				}
			}
		}

		return filter_group_data;
	}

	async getCategoryLayoutId(category_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_to_layout WHERE category_id = '" + category_id + "' AND store_id = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}

	async getTotalCategoriesByCategoryId(parent_id = 0) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "category c LEFT JOIN " + DB_PREFIX + "category_to_store c2s ON (c.category_id = c2s.category_id) WHERE c.parent_id = '" + parent_id + "' AND c2s.store_id = '" + this.config.get('config_store_id') + "' AND c.status = '1'");

		return query.row['total'];
	}
}