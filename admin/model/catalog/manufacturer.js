module.exports = class ManufacturerCatalogModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addManufacturer(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "manufacturer` SET `name` = " + this.db.escape(data['name']) + ", `image` = " + this.db.escape(data['image']) + ", `sort_order` = '" + data['sort_order'] + "'");

		const manufacturer_id = this.db.getLastId();

		if ((data['manufacturer_store'])) {
			for (let store_id of data['manufacturer_store']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "manufacturer_to_store` SET `manufacturer_id` = '" + manufacturer_id + "', `store_id` = '" + store_id + "'");
			}
		}

		// SEO URL
		if ((data['manufacturer_seo_url'])) {
			for (let [store_id, language] of Object.entries(data['manufacturer_seo_url'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'manufacturer_id', `value` = '" + manufacturer_id + "', `keyword` = " + this.db.escape(keyword) + "");
				}
			}
		}

		if ((data['manufacturer_layout'])) {
			for (let [store_id, layout_id] of Object.entries(data['manufacturer_layout'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				await this.db.query("INSERT INTO `" + DB_PREFIX + "manufacturer_to_layout` SET `manufacturer_id` = '" + manufacturer_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		await this.cache.delete('manufacturer');

		return manufacturer_id;
	}

	/**
	 * @param   manufacturer_id
	 * @param data
	 *
	 * @return void
	 */
	async editManufacturer(manufacturer_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "manufacturer` SET `name` = " + this.db.escape(data['name']) + ", `image` = " + this.db.escape(data['image']) + ", `sort_order` = '" + data['sort_order'] + "' WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_store` WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		if ((data['manufacturer_store'])) {
			for (let store_id of data['manufacturer_store']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "manufacturer_to_store` SET `manufacturer_id` = '" + manufacturer_id + "', `store_id` = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'manufacturer_id' AND `value` = '" + manufacturer_id + "'");

		if ((data['manufacturer_seo_url'])) {
			for (let [store_id, language] of Object.entries(data['manufacturer_seo_url'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'manufacturer_id', `value` = '" + manufacturer_id + "', `keyword` = " + this.db.escape(keyword) + "");
				}
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_layout` WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		if ((data['manufacturer_layout'])) {
			for (let [store_id, layout_id] of Object.entries(data['manufacturer_layout'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				await this.db.query("INSERT INTO `" + DB_PREFIX + "manufacturer_to_layout` SET `manufacturer_id` = '" + manufacturer_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		await this.cache.delete('manufacturer');
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return void
	 */
	async deleteManufacturer(manufacturer_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer` WHERE `manufacturer_id` = '" + manufacturer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_store` WHERE `manufacturer_id` = '" + manufacturer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "manufacturer_to_layout` WHERE `manufacturer_id` = '" + manufacturer_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'manufacturer_id' AND `value` = '" + manufacturer_id + "'");

		await this.cache.delete('manufacturer');
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return array
	 */
	async getManufacturer(manufacturer_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "manufacturer` WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getManufacturers(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "manufacturer`";

		if (data['filter_name']) {
			sql += " WHERE `name` LIKE " + this.db.escape(data['filter_name'] + '%');
		}

		let sort_data = [
			'name',
			'sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `name`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
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

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return array
	 */
	async getStores(manufacturer_id) {
		let manufacturer_store_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "manufacturer_to_store` WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		for (let result of query.rows) {
			manufacturer_store_data.push(result['store_id']);
		}

		return manufacturer_store_data;
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return array
	 */
	async getSeoUrls(manufacturer_id) {
		let manufacturer_seo_url_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'manufacturer_id' AND `value` = '" + manufacturer_id + "'");

		for (let result of query.rows) {
			manufacturer_seo_url_data[result['store_id']] = manufacturer_seo_url_data[result['store_id']]||{}
			manufacturer_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return manufacturer_seo_url_data;
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return array
	 */
	async getLayouts(manufacturer_id) {
		let manufacturer_layout_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "manufacturer_to_layout` WHERE `manufacturer_id` = '" + manufacturer_id + "'");

		for (let result of query.rows) {
			manufacturer_layout_data[result['store_id']] = result['layout_id'];
		}

		return manufacturer_layout_data;
	}

	/**
	 * @return int
	 */
	async getTotalManufacturers() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "manufacturer`");

		return query.row['total'];
	}

	/**
	 * @param layout_id
	 *
	 * @return int
	 */
	async getTotalManufacturersByLayoutId(layout_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "manufacturer_to_layout` WHERE `layout_id` = '" + layout_id + "'");

		return query.row['total'];
	}
}
