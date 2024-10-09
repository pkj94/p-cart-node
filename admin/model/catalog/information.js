module.exports = class InformationCatalogModel extends Model {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addInformation(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "information` SET `sort_order` = '" + data['sort_order'] + "', `bottom` = '" + ((data['bottom']) ? data['bottom'] : 0) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "'");

		const information_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['information_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "information_description` SET `information_id` = '" + information_id + "', `language_id` = '" + language_id + "', `title` = " + this.db.escape(value['title']) + ", `description` = " + this.db.escape(value['description']) + ", `meta_title` = " + this.db.escape(value['meta_title']) + ", `meta_description` = " + this.db.escape(value['meta_description']) + ", `meta_keyword` = " + this.db.escape(value['meta_keyword']) + "");
		}

		if ((data['information_store'])) {
			for (let store_id of data['information_store']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "information_to_store` SET `information_id` = '" + information_id + "', `store_id` = '" + store_id + "'");
			}
		}

		// SEO URL
		if ((data['information_seo_url'])) {
			for (let [store_id, language] of Object.entries(data['information_seo_url'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'information_id', `value` = '" + information_id + "', `keyword` = " + this.db.escape(keyword) + "");
				}
			}
		}

		if ((data['information_layout'])) {
			for (let [store_id, layout_id] of Object.entries(data['information_layout'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				await this.db.query("INSERT INTO `" + DB_PREFIX + "information_to_layout` SET `information_id` = '" + information_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		await this.cache.delete('information');

		return information_id;
	}

	/**
	 * @param   information_id
	 * @param data
	 *
	 * @return void
	 */
	async editInformation(information_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "information` SET `sort_order` = '" + data['sort_order'] + "', `bottom` = '" + ((data['bottom']) ? data['bottom'] : 0) + "', `status` = '" + (data['status'] ? data['status'] : 0) + "' WHERE `information_id` = '" + information_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_description` WHERE `information_id` = '" + information_id + "'");

		for (let [language_id, value] of Object.entries(data['information_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "information_description` SET `information_id` = '" + information_id + "', `language_id` = '" + language_id + "', `title` = " + this.db.escape(value['title']) + ", `description` = " + this.db.escape(value['description']) + ", `meta_title` = " + this.db.escape(value['meta_title']) + ", `meta_description` = " + this.db.escape(value['meta_description']) + ", `meta_keyword` = " + this.db.escape(value['meta_keyword']) + "");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_store` WHERE `information_id` = '" + information_id + "'");

		if ((data['information_store'])) {
			for (let store_id of data['information_store']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "information_to_store` SET `information_id` = '" + information_id + "', `store_id` = '" + store_id + "'");
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'information_id' AND `value` = '" + information_id + "'");

		if ((data['information_seo_url'])) {
			for (let [store_id, language] of Object.entries(data['information_seo_url'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + store_id + "', `language_id` = '" + language_id + "', `key` = 'information_id', `value` = '" + information_id + "', `keyword` = " + this.db.escape(keyword));
				}
			}
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_layout` WHERE `information_id` = '" + information_id + "'");

		if ((data['information_layout'])) {
			for (let [store_id, layout_id] of Object.entries(data['information_layout'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				await this.db.query("INSERT INTO `" + DB_PREFIX + "information_to_layout` SET `information_id` = '" + information_id + "', `store_id` = '" + store_id + "', `layout_id` = '" + layout_id + "'");
			}
		}

		await this.cache.delete('information');
	}

	/**
	 * @param information_id
	 *
	 * @return void
	 */
	async deleteInformation(information_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information` WHERE `information_id` = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_description` WHERE `information_id` = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_store` WHERE `information_id` = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "information_to_layout` WHERE `information_id` = '" + information_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'information_id' AND `value` = '" + information_id + "'");

		await this.cache.delete('information');
	}

	/**
	 * @param information_id
	 *
	 * @return array
	 */
	async getInformation(information_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "information` WHERE `information_id` = '" + information_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getInformations(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "information` i LEFT JOIN `" + DB_PREFIX + "information_description` id ON (i.`information_id` = id.`information_id`) WHERE id.`language_id` = '" + this.config.get('config_language_id') + "'";

		let sort_data = [
			'id.title',
			'i.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY id.`title`";
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

		let information_data = await this.cache.get('information.' + md5(sql));

		if (!information_data) {
			let query = await this.db.query(sql);

			information_data = query.rows;

			await this.cache.set('information.' + md5(sql), information_data);
		}

		return information_data;
	}

	/**
	 * @param information_id
	 *
	 * @return array
	 */
	async getDescriptions(information_id) {
		let information_description_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "information_description` WHERE `information_id` = '" + information_id + "'");

		for (let result of query.rows) {
			information_description_data[result['language_id']] = {
				'title': result['title'],
				'description': result['description'],
				'meta_title': result['meta_title'],
				'meta_description': result['meta_description'],
				'meta_keyword': result['meta_keyword']
			};
		}

		return information_description_data;
	}

	/**
	 * @param information_id
	 *
	 * @return array
	 */
	async getStores(information_id) {
		let information_store_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "information_to_store` WHERE `information_id` = '" + information_id + "'");

		for (let result of query.rows) {
			information_store_data.push(result['store_id']);
		}

		return information_store_data;
	}

	/**
	 * @param information_id
	 *
	 * @return array
	 */
	async getSeoUrls(information_id) {
		let information_seo_url_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = 'information_id' AND `value` = '" + information_id + "'");

		for (let result of query.rows) {
			information_seo_url_data[result['store_id']] = information_seo_url_data[result['store_id']] || {}
			information_seo_url_data[result['store_id']][result['language_id']] = result['keyword'];
		}

		return information_seo_url_data;
	}

	/**
	 * @param information_id
	 *
	 * @return array
	 */
	async getLayouts(information_id) {
		let information_layout_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "information_to_layout` WHERE `information_id` = '" + information_id + "'");

		for (let result of query.rows) {
			information_layout_data[result['store_id']] = result['layout_id'];
		}

		return information_layout_data;
	}

	/**
	 * @return int
	 */
	async getTotalInformations() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "information`");

		return query.row['total'];
	}

	/**
	 * @param layout_id
	 *
	 * @return int
	 */
	async getTotalInformationsByLayoutId(layout_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "information_to_layout` WHERE `layout_id` = '" + layout_id + "'");

		return query.row['total'];
	}
}
