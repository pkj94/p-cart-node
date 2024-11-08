module.exports = class ModelCatalogCategory extends Model {
	async addCategory(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "category SET parent_id = '" + data['parent_id'] + "', `top` = '" + ((data['top']) ? data['top'] : 0) + "', `column` = '" + data['column'] + "', sort_order = '" + data['sort_order'] + "', status = '" + data['status'] + "', date_modified = NOW(), date_added = NOW()");

		category_id = this.db.getLastId();

		if ((data['image'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "category SET image = '" + this.db.escape(data['image']) + "' WHERE category_id = '" + category_id + "'");
		}

		for (data['category_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "category_description SET category_id = '" + category_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "', description = '" + this.db.escape(value['description']) + "', meta_title = '" + this.db.escape(value['meta_title']) + "', meta_description = '" + this.db.escape(value['meta_description']) + "', meta_keyword = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		// MySQL Hierarchical Data Closure Table Pattern
		level = 0;

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + data['parent_id'] + "' ORDER BY `level` ASC");

		for (let result of query.rows ) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_id + "', `path_id` = '" + result['path_id'] + "', `level` = '" + level + "'");

			level++;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_id + "', `path_id` = '" + category_id + "', `level` = '" + level + "'");

		if ((data['category_filter'])) {
			for (data['category_filter'] of filter_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "category_filter SET category_id = '" + category_id + "', filter_id = '" + filter_id + "'");
			}
		}

		if ((data['category_store'])) {
			for (data['category_store'] of store_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "category_to_store SET category_id = '" + category_id + "', store_id = '" + store_id + "'");
			}
		}
		
		if ((data['category_seo_url'])) {
			for (data['category_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "seo_url SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'category_id=" + category_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}
		
		// Set which layout to use with this category
		if ((data['category_layout'])) {
			for (data['category_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "category_to_layout SET category_id = '" + category_id + "', store_id = '" + store_id + "', layout_id = '" + layout_id + "'");
			}
		}

		this.cache.delete('category');

		return category_id;
	}

	async editCategory(category_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "category SET parent_id = '" + data['parent_id'] + "', `top` = '" + ((data['top']) ? data['top'] : 0) + "', `column` = '" + data['column'] + "', sort_order = '" + data['sort_order'] + "', status = '" + data['status'] + "', date_modified = NOW() WHERE category_id = '" + category_id + "'");

		if ((data['image'])) {
			await this.db.query("UPDATE " + DB_PREFIX + "category SET image = '" + this.db.escape(data['image']) + "' WHERE category_id = '" + category_id + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "category_description WHERE category_id = '" + category_id + "'");

		for (data['category_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "category_description SET category_id = '" + category_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "', description = '" + this.db.escape(value['description']) + "', meta_title = '" + this.db.escape(value['meta_title']) + "', meta_description = '" + this.db.escape(value['meta_description']) + "', meta_keyword = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		// MySQL Hierarchical Data Closure Table Pattern
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE path_id = '" + category_id + "' ORDER BY level ASC");

		if (query.rows) {
			for (query.rows of category_path) {
				// Delete the path below the current one
				await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + category_path['category_id'] + "' AND level < '" + category_path['level'] + "'");

				path = {};

				// Get the nodes new parents
				const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + data['parent_id'] + "' ORDER BY level ASC");

				for (let result of query.rows ) {
					path[] = result['path_id'];
				}

				// Get whats left of the nodes current path
				const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + category_path['category_id'] + "' ORDER BY level ASC");

				for (let result of query.rows ) {
					path[] = result['path_id'];
				}

				// Combine the paths with a new level
				level = 0;

				for (path of path_id) {
					await this.db.query("REPLACE INTO `" + DB_PREFIX + "category_path` SET category_id = '" + category_path['category_id'] + "', `path_id` = '" + path_id + "', level = '" + level + "'");

					level++;
				}
			}
		} else {
			// Delete the path below the current one
			await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + category_id + "'");

			// Fix for records with no paths
			level = 0;

			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + data['parent_id'] + "' ORDER BY level ASC");

			for (let result of query.rows ) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET category_id = '" + category_id + "', `path_id` = '" + result['path_id'] + "', level = '" + level + "'");

				level++;
			}

			await this.db.query("REPLACE INTO `" + DB_PREFIX + "category_path` SET category_id = '" + category_id + "', `path_id` = '" + category_id + "', level = '" + level + "'");
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "category_filter WHERE category_id = '" + category_id + "'");

		if ((data['category_filter'])) {
			for (data['category_filter'] of filter_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "category_filter SET category_id = '" + category_id + "', filter_id = '" + filter_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "category_to_store WHERE category_id = '" + category_id + "'");

		if ((data['category_store'])) {
			for (data['category_store'] of store_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "category_to_store SET category_id = '" + category_id + "', store_id = '" + store_id + "'");
			}
		}

		// SEO URL
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE query = 'category_id=" + category_id + "'");

		if ((data['category_seo_url'])) {
			for (data['category_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						await this.db.query("INSERT INTO " + DB_PREFIX + "seo_url SET store_id = '" + store_id + "', language_id = '" + language_id + "', query = 'category_id=" + category_id + "', keyword = '" + this.db.escape(keyword) + "'");
					}
				}
			}
		}
		
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_to_layout WHERE category_id = '" + category_id + "'");

		if ((data['category_layout'])) {
			for (data['category_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "category_to_layout SET category_id = '" + category_id + "', store_id = '" + store_id + "', layout_id = '" + layout_id + "'");
			}
		}

		this.cache.delete('category');
	}

	async deleteCategory(category_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_path WHERE category_id = '" + category_id + "'");

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_path WHERE path_id = '" + category_id + "'");

		for (let result of query.rows ) {
			this.deleteCategory(result['category_id']);
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "category WHERE category_id = '" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_description WHERE category_id = '" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_filter WHERE category_id = '" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_to_store WHERE category_id = '" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "category_to_layout WHERE category_id = '" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "product_to_category WHERE category_id = '" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "seo_url WHERE query = 'category_id=" + category_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_category WHERE category_id = '" + category_id + "'");

		this.cache.delete('category');
	}

	async repairCategories(parent_id = 0) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category WHERE parent_id = '" + parent_id + "'");

		for (query.rows of category) {
			// Delete the path below the current one
			await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + category['category_id'] + "'");

			// Fix for records with no paths
			level = 0;

			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE category_id = '" + parent_id + "' ORDER BY level ASC");

			for (let result of query.rows ) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET category_id = '" + category['category_id'] + "', `path_id` = '" + result['path_id'] + "', level = '" + level + "'");

				level++;
			}

			await this.db.query("REPLACE INTO `" + DB_PREFIX + "category_path` SET category_id = '" + category['category_id'] + "', `path_id` = '" + category['category_id'] + "', level = '" + level + "'");

			this.repairCategories(category['category_id']);
		}
	}

	async getCategory(category_id) {
		const query = await this.db.query("SELECT DISTINCT *, (SELECT GROUP_CONCAT(cd1.name ORDER BY level SEPARATOR '&nbsp;&nbsp;&gt;&nbsp;&nbsp;') FROM " + DB_PREFIX + "category_path cp LEFT JOIN " + DB_PREFIX + "category_description cd1 ON (cp.path_id = cd1.category_id AND cp.category_id != cp.path_id) WHERE cp.category_id = c.category_id AND cd1.language_id = '" + this.config.get('config_language_id') + "' GROUP BY cp.category_id) AS path FROM " + DB_PREFIX + "category c LEFT JOIN " + DB_PREFIX + "category_description cd2 ON (c.category_id = cd2.category_id) WHERE c.category_id = '" + category_id + "' AND cd2.language_id = '" + this.config.get('config_language_id') + "'");
		
		return query.row;
	}

	async getCategories(data = {}) {
		let sql = "SELECT cp.category_id AS category_id, GROUP_CONCAT(cd1.name ORDER BY cp.level SEPARATOR '&nbsp;&nbsp;&gt;&nbsp;&nbsp;') AS name, c1.parent_id, c1.sort_order FROM " + DB_PREFIX + "category_path cp LEFT JOIN " + DB_PREFIX + "category c1 ON (cp.category_id = c1.category_id) LEFT JOIN " + DB_PREFIX + "category c2 ON (cp.path_id = c2.category_id) LEFT JOIN " + DB_PREFIX + "category_description cd1 ON (cp.path_id = cd1.category_id) LEFT JOIN " + DB_PREFIX + "category_description cd2 ON (cp.category_id = cd2.category_id) WHERE cd1.language_id = '" + this.config.get('config_language_id') + "' AND cd2.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND cd2.name LIKE '%" + this.db.escape(data['filter_name']) + "%'";
		}

		sql += " GROUP BY cp.category_id";

		let sort_data = [
			'name',
			'sort_order'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY sort_order";
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

	async getCategoryDescriptions(category_id) {
		category_description_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_description WHERE category_id = '" + category_id + "'");

		for (let result of query.rows ) {
			category_description_data[result['language_id']] = array(
				'name'             : result['name'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword'],
				'description'      : result['description']
			);
		}

		return category_description_data;
	}
	
	async getCategoryPath(category_id) {
		const query = await this.db.query("SELECT category_id, path_id, level FROM " + DB_PREFIX + "category_path WHERE category_id = '" + category_id + "'");

		return query.rows;
	}
	
	async getCategoryFilters(category_id) {
		category_filter_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_filter WHERE category_id = '" + category_id + "'");

		for (let result of query.rows ) {
			category_filter_data[] = result['filter_id'];
		}

		return category_filter_data;
	}

	async getCategoryStores(category_id) {
		category_store_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_to_store WHERE category_id = '" + category_id + "'");

		for (let result of query.rows ) {
			category_store_data[] = result['store_id'];
		}

		return category_store_data;
	}
	
	async getCategorySeoUrls(category_id) {
		category_seo_url_data = {};
		
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "seo_url WHERE query = 'category_id=" + category_id + "'");

		for (let result of query.rows ) {
			category_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return category_seo_url_data;
	}
	
	async getCategoryLayouts(category_id) {
		category_layout_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "category_to_layout WHERE category_id = '" + category_id + "'");

		for (let result of query.rows ) {
			category_layout_data[result['store_id']] = result['layout_id'];
		}

		return category_layout_data;
	}

	async getTotalCategories() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "category");

		return query.row['total'];
	}
	
	async getTotalCategoriesByLayoutId(layout_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "category_to_layout WHERE layout_id = '" + layout_id + "'");

		return query.row['total'];
	}	
}