module.exports = class SeoUrlDesignModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addSeoUrl(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "seo_url` SET `store_id` = '" + data['store_id'] + "', `language_id` = '" + data['language_id'] + "', `key` = " + this.db.escape(data['key']) + ", `value` = " + this.db.escape(data['value']) + ", `keyword` = " + this.db.escape(data['keyword']) + ", `sort_order` = '" + data['sort_order'] + "'");

		return this.db.getLastId();
	}

	/**
	 * @param   seo_url_id
	 * @param data
	 *
	 * @return void
	 */
	async editSeoUrl(seo_url_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "seo_url` SET `store_id` = '" + data['store_id'] + "', `language_id` = '" + data['language_id'] + "', `key` = " + this.db.escape(data['key']) + ", `value` = " + this.db.escape(data['value']) + ", `keyword` = " + this.db.escape(data['keyword']) + ", `sort_order` = '" + data['sort_order'] + "' WHERE `seo_url_id` = '" + seo_url_id + "'");
	}

	/**
	 * @param seo_url_id
	 *
	 * @return void
	 */
	async deleteSeoUrl(seo_url_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "seo_url` WHERE `seo_url_id` = '" + seo_url_id + "'");
	}

	/**
	 * @param seo_url_id
	 *
	 * @return array
	 */
	async getSeoUrl(seo_url_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `seo_url_id` = '" + seo_url_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getSeoUrls(data = {}) {
		let sql = "SELECT *, (SELECT `name` FROM `" + DB_PREFIX + "store` s WHERE s.`store_id` = su.`store_id`) AS `store`, (SELECT `name` FROM `" + DB_PREFIX + "language` l WHERE l.`language_id` = su.`language_id`) AS `language` FROM `" + DB_PREFIX + "seo_url` su";

		let implode = [];

		if ((data['filter_keyword'])) {
			implode.push("`keyword` LIKE " + this.db.escape(data['filter_keyword']) );
		}

		if ((data['filter_key'])) {
			implode.push("`key` = " + this.db.escape(data['filter_key']));
		}

		if ((data['filter_value'])) {
			implode.push("`value` LIKE " + this.db.escape(data['filter_value']));
		}

		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			implode.push("`store_id` = '" + data['filter_store_id'] + "'");
		}

		if ((data['filter_language_id']) && data['filter_language_id'] !== '') {
			implode.push("`language_id` = '" + data['filter_language_id'] + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'keyword',
			'key',
			'value',
			'sort_order',
			'store_id',
			'language_id'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY `" + data['sort'] + "`";
		} else {
			sql += " ORDER BY `key`";
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
	 * @param data
	 *
	 * @return int
	 */
	async getTotalSeoUrls(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "seo_url`";

		let implode = [];

		if ((data['filter_keyword'])) {
			implode.push("`keyword` LIKE " + this.db.escape(data['filter_keyword']));
		}

		if ((data['filter_key'])) {
			implode.push("`key` = " + this.db.escape(data['filter_key']));
		}

		if ((data['filter_value'])) {
			implode.push("`value` LIKE " + this.db.escape(data['filter_value']) );
		}

		if ((data['filter_store_id']) && data['filter_store_id'] !== '') {
			implode.push("`store_id` = '" + data['filter_store_id'] + "'");
		}

		if ((data['filter_language_id']) && data['filter_language_id'] !== '') {
			implode.push("`language_id` = '" + data['filter_language_id'] + "'");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param key
	 * @param value
	 * @param    store_id
	 * @param    language_id
	 *
	 * @return array
	 */
	async getSeoUrlByKeyValue(key, value, store_id, language_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE `key` = " + this.db.escape(key) + " AND `value` = " + this.db.escape(value) + " AND `store_id` = '" + store_id + "' AND `language_id` = '" + language_id + "'");

		return query.row;
	}

	/**
	 * @param keyword
	 * @param    store_id
	 * @param    language_id
	 *
	 * @return array
	 */
	async getSeoUrlByKeyword(keyword, store_id, language_id = 0) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "seo_url` WHERE (`keyword` = " + this.db.escape(keyword) + " OR `keyword` LIKE " + this.db.escape('%/' + keyword) + ") AND `store_id` = '" + store_id + "'";

		if (language_id) {
			sql += " AND `language_id` = '" + language_id + "'";
		}

		let query = await this.db.query(sql);

		return query.row;
	}
}
