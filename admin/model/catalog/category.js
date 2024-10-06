<?php
namespace Opencart\Admin\Model\Catalog;
/**
 * Class Category
 *
 * @package Opencart\Admin\Model\Catalog
 */
class CategoryModel  extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addCategory(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "category` SET `image` = '" + this.db.escape(data['image']) + "', `parent_id` = '" + data['parent_id'] + "', `top` = '" + (isset(data['top']) ? data['top'] : 0) + "', `column` = '" + data['column'] + "', `sort_order` = '" + data['sort_order'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_modified` = NOW(), `date_added` = NOW()");

		category_id = this.db.getLastId();

		for (data['category_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "category_description` SET `category_id` = '" + category_id + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(value['name']) + "', `description` = '" + this.db.escape(value['description']) + "', `meta_title` = '" + this.db.escape(value['meta_title']) + "', `meta_description` = '" + this.db.escape(value['meta_description']) + "', `meta_keyword` = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		// MySQL Hierarchical Data Closure Table Pattern
		level = 0;

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + data['parent_id'] + "' ORDER BY `level` ASC");

		for (query.rows of result) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_id + "', `path_id` = '" + result['path_id'] + "', `level` = '" + level + "'");

			level++;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_id + "', `path_id` = '" + category_id + "', `level` = '" + level. "'");

		if (isset(data['category_filter'])) {
			for (data['category_filter'] of filter_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_filter` SET `category_id` = '" + category_id + "', `filter_id` = '" + filter_id + "'");
			}
		}

		if (isset(data['category_store'])) {
			for (data['category_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_to_store` SET `category_id` = '" + category_id + "', `store_id` = '" + store_id + "'");
			}
		}

		// Seo urls on categories need to be done differently to they include the full keyword path
		parent_path = this.getPath(data['parent_id']);

		if (!parent_path) {
			path = category_id;
		} else {
			path = parent_path + '_' + category_id;
		}

		this.load.model('design/seo_url');

		for (data['category_seo_url'] of store_id : language) {
			for (language of language_id : keyword) {
				seo_url_info = this.model_design_seo_url.getSeoUrlByKeyValue('path', parent_path, store_id, language_id);

				if (seo_url_info) {
					keyword = seo_url_info['keyword'] + '/' + keyword;
				}

				await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'path', `value`= '" + this.db.escape(path) + "', `keyword` = '" + this.db.escape(keyword) + "'");
			}
		}

		// Set which layout to use with this category
		if (isset(data['category_layout'])) {
			for (data['category_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_to_layout` SET `category_id` = '" + category_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		return category_id;
	}

	/**
	 * @param   category_id
	 * @param data
	 *
	 * @return void
	 */
	async editCategory(category_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "category` SET `image` = '" + this.db.escape(data['image']) + "', `parent_id` = '" + data['parent_id'] + "', `top` = '" + (isset(data['top']) ? data['top'] : 0) + "', `column` = '" + data['column'] + "', `sort_order` = '" + data['sort_order'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_modified` = NOW() WHERE `category_id` = '" + category_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_description` WHERE `category_id` = '" + category_id + "'");

		for (data['category_description'] of language_id : value) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "category_description` SET `category_id` = '" + category_id + "', `language_id` = '" + language_id + "', `name` = '" + this.db.escape(value['name']) + "', `description` = '" + this.db.escape(value['description']) + "', `meta_title` = '" + this.db.escape(value['meta_title']) + "', `meta_description` = '" + this.db.escape(value['meta_description']) + "', `meta_keyword` = '" + this.db.escape(value['meta_keyword']) + "'");
		}

		// Old path
		path_old = this.getPath(category_id);

		// MySQL Hierarchical Data Closure Table Pattern
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `path_id` = '" + category_id + "' ORDER BY `level` ASC");

		if (query.rows) {
			for (query.rows of category_path) {
				// Delete the path below the current one
				await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + category_path['category_id'] + "' AND `level` < '" + category_path['level'] + "'");

				paths = [];

				// Get the nodes new parents
				let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + data['parent_id'] + "' ORDER BY `level` ASC");

				for (query.rows of result) {
					paths[] = result['path_id'];
				}

				// Get whats left of the nodes current path
				let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + category_path['category_id'] + "' ORDER BY `level` ASC");

				for (query.rows of result) {
					paths[] = result['path_id'];
				}

				// Combine the paths with a new level
				level = 0;

				for (paths of path_id) {
					await this.db.query("REPLACE INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_path['category_id'] + "', `path_id` = '" + path_id + "', `level` = '" + level + "'");

					level++;
				}
			}
		} else {
			// Delete the path below the current one
			await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + category_id + "'");

			// Fix for records with no paths
			level = 0;

			let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + data['parent_id'] + "' ORDER BY `level` ASC");

			for (query.rows of result) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_id + "', `path_id` = '" + result['path_id'] + "', `level` = '" + level + "'");

				level++;
			}

			await this.db.query("REPLACE INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category_id + "', `path_id` = '" + category_id + "', `level` = '" + level + "'");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_filter` WHERE `category_id` = '" + category_id + "'");

		if (isset(data['category_filter'])) {
			for (data['category_filter'] of filter_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_filter` SET `category_id` = '" + category_id + "', `filter_id` = '" + filter_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_store` WHERE `category_id` = '" + category_id + "'");

		if (isset(data['category_store'])) {
			for (data['category_store'] of store_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_to_store` SET `category_id` = '" + category_id + "', `store_id` = '" + store_id + "'");
			}
		}

		// Seo urls on categories need to be done differently to they include the full keyword path
		path_parent = this.getPath(data['parent_id']);

		if (!path_parent) {
			path_new = category_id;
		} else {
			path_new = path_parent + '_' + category_id;
		}

		// Get old data to so we know what to replace
		seo_url_data = this.getSeoUrls(category_id);

		// Delete the old path
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'path' AND `value` = '" + this.db.escape(path_old) + "'");

		this.load.model('design/seo_url');

		for (data['category_seo_url'] of store_id : language) {
			for (language of language_id : keyword) {
				parent_info = this.model_design_seo_url.getSeoUrlByKeyValue('path', path_parent, store_id, language_id);

				if (parent_info) {
					keyword = parent_info['keyword'] + '/' + keyword;
				}

				await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'path', `value` = '" + this.db.escape(path_new) + "', `keyword` = '" + this.db.escape(keyword) + "'");

				// Update sub category seo urls
				if (isset(seo_url_data[store_id][language_id])) {
					await this.db.query("UPDATE `" + DB_PREFIX + "seo_url` SET `value` = CONCAT('" + this.db.escape(path_new + '_') + "', SUBSTRING(`value`, " + (strlen(path_old + '_') + 1) + ")), `keyword` = CONCAT('" + this.db.escape(keyword) + "', SUBSTRING(`keyword`, " + (oc_strlen(seo_url_data[store_id][language_id]) + 1) + ")) WHERE `store_id` = '" + store_id + "' AND `language_id` = '" + language_id + "' AND `key` = 'path' AND `value` LIKE '" + this.db.escape(path_old + '\_%') + "'");
				}
			}
		}

		// Layouts
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_layout` WHERE `category_id` = '" + category_id + "'");

		if (isset(data['category_layout'])) {
			for (data['category_layout'] of store_id : layout_id) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_to_layout` SET `category_id` = '" + category_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}
	}

	/**
	 * @param category_id
	 *
	 * @return void
	 */
	async deleteCategory(category_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_description` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_filter` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_store` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_to_layout` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_to_category` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_category` WHERE `category_id` = '" + category_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'path' AND `value` = '" + this.db.escape(this.getPath(category_id)) + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + category_id + "'");

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `path_id` = '" + category_id + "'");

		for (query.rows of result) {
			this.deleteCategory(result['category_id']);
		}
	}

	/**
	 * @param parent_id
	 *
	 * @return void
	 */
	async repairCategories(parent_id = 0) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category` WHERE `parent_id` = '" + parent_id + "'");

		for (query.rows of category) {
			// Delete the path below the current one
			await this.db.query("DELETE FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + category['category_id'] + "'");

			// Fix for records with no paths
			level = 0;

			let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + parent_id + "' ORDER BY `level` ASC");

			for (query.rows of result) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category['category_id'] + "', `path_id` = '" + result['path_id'] + "', `level` = '" + level + "'");

				level++;
			}

			await this.db.query("REPLACE INTO `" + DB_PREFIX + "category_path` SET `category_id` = '" + category['category_id'] + "', `path_id` = '" + category['category_id'] + "', `level` = '" + level + "'");

			this.repairCategories(category['category_id']);
		}
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getCategory(category_id) {
		let query = await this.db.query("SELECT DISTINCT *, (SELECT GROUP_CONCAT(cd1.`name` ORDER BY `level` SEPARATOR ' > ') FROM `" + DB_PREFIX + "category_path` cp LEFT JOIN `" + DB_PREFIX + "category_description` cd1 ON (cp.`path_id` = cd1.`category_id` AND cp.`category_id` != cp.`path_id`) WHERE cp.`category_id` = c.`category_id` AND cd1.`language_id` = '" + this.config.get('config_language_id') + "' GROUP BY cp.`category_id`) AS `path` FROM `" + DB_PREFIX + "category` c LEFT JOIN `" + DB_PREFIX + "category_description` cd2 ON (c.`category_id` = cd2.`category_id`) WHERE c.`category_id` = '" + category_id + "' AND cd2.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param category_id
	 *
	 * @return string
	 */
	async getPath(category_id) {
		return implode('_', array_column(this.getPaths(category_id), 'path_id'));
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getPaths(category_id) {
		let query = await this.db.query("SELECT `category_id`, `path_id`, `level` FROM `" + DB_PREFIX + "category_path` WHERE `category_id` = '" + category_id + "' ORDER BY `level` ASC");

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCategories(data = {}) {
		let sql = "SELECT cp.`category_id` AS `category_id`, GROUP_CONCAT(cd1.`name` ORDER BY cp.`level` SEPARATOR ' > ') AS `name`, c1.`parent_id`, c1.`sort_order`, c1.`status` FROM `" + DB_PREFIX + "category_path` cp LEFT JOIN `" + DB_PREFIX + "category` c1 ON (cp.`category_id` = c1.`category_id`) LEFT JOIN `" + DB_PREFIX + "category` c2 ON (cp.`path_id` = c2.`category_id`) LEFT JOIN `" + DB_PREFIX + "category_description` cd1 ON (cp.`path_id` = cd1.`category_id`) LEFT JOIN `" + DB_PREFIX + "category_description` cd2 ON (cp.`category_id` = cd2.`category_id`) WHERE cd1.`language_id` = '" + this.config.get('config_language_id') + "' AND cd2.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND cd2.`name` LIKE '" + this.db.escape(data['filter_name']) + "'";
		}

		sql += " GROUP BY cp.`category_id`";

		sort_data = [
			'name',
			'sort_order'
		];

		if (data['sort'] && in_array(data['sort'], sort_data)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `sort_order`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getDescriptions(category_id) {
		category_description_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_description` WHERE `category_id` = '" + category_id + "'");

		for (query.rows of result) {
			category_description_data[result['language_id']] = [
				'name'             : result['name'],
				'meta_title'       : result['meta_title'],
				'meta_description' : result['meta_description'],
				'meta_keyword'     : result['meta_keyword'],
				'description'      : result['description']
			];
		}

		return category_description_data;
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getFilters(category_id) {
		category_filter_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_filter` WHERE `category_id` = '" + category_id + "'");

		for (query.rows of result) {
			category_filter_data[] = result['filter_id'];
		}

		return category_filter_data;
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getSeoUrls(category_id) {
		category_seo_url_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'path' AND `value` = '" + this.db.escape(this.getPath(category_id)) + "'");

		for (query.rows of result) {
			category_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return category_seo_url_data;
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getStores(category_id) {
		category_store_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_to_store` WHERE `category_id` = '" + category_id + "'");

		for (query.rows of result) {
			category_store_data[] = result['store_id'];
		}

		return category_store_data;
	}

	/**
	 * @param category_id
	 *
	 * @return array
	 */
	async getLayouts(category_id) {
		category_layout_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "category_to_layout` WHERE `category_id` = '" + category_id + "'");

		for (query.rows of result) {
			category_layout_data[result['store_id']] = result['layout_id'];
		}

		return category_layout_data;
	}

	/**
	 * @return int
	 */
	async getTotalCategories() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "category`");

		return query.row['total'];
	}

	/**
	 * @param layout_id
	 *
	 * @return int
	 */
	async getTotalCategoriesByLayoutId(layout_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "category_to_layout` WHERE `layout_id` = '" + layout_id + "'");

		return query.row['total'];
	}
}
