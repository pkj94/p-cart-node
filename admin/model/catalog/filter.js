module.exports = class FilterCatalogModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addFilter(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_group` SET `sort_order` = '" + data['sort_order'] + "'");

		const filter_group_id = this.db.getLastId();

		for (let [language_id, value] of Object.entries(data['filter_group_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_group_description` SET `filter_group_id` = '" + filter_group_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		if ((data['filter'])) {
			for (let filter of data['filter']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "filter` SET `filter_group_id` = '" + filter_group_id + "', `sort_order` = '" + filter['sort_order'] + "'");

				let filter_id = this.db.getLastId();

				for (let [language_id, filter_description] of Object.entries(filter['filter_description'])) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_description` SET `filter_id` = '" + filter_id + "', `language_id` = '" + language_id + "', `filter_group_id` = '" + filter_group_id + "', `name` = " + this.db.escape(filter_description['name']));
				}
			}
		}

		return filter_group_id;
	}

	/**
	 * @param   filter_group_id
	 * @param data
	 *
	 * @return void
	 */
	async editFilter(filter_group_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "filter_group` SET `sort_order` = '" + data['sort_order'] + "' WHERE `filter_group_id` = '" + filter_group_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_group_description` WHERE `filter_group_id` = '" + filter_group_id + "'");

		for (let [language_id, value] of Object.entries(data['filter_group_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_group_description` SET `filter_group_id` = '" + filter_group_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter` WHERE `filter_group_id` = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_description` WHERE `filter_group_id` = '" + filter_group_id + "'");

		if ((data['filter'])) {
			for (let filter of data['filter']) {
				if (filter['filter_id']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "filter` SET `filter_id` = '" + filter['filter_id'] + "', `filter_group_id` = '" + filter_group_id + "', `sort_order` = '" + filter['sort_order'] + "'");
				} else {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "filter` SET `filter_group_id` = '" + filter_group_id + "', `sort_order` = '" + filter['sort_order'] + "'");
				}

				let filter_id = this.db.getLastId();

				for (let [language_id, filter_description] of Object.entries(filter['filter_description'])) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					await this.db.query("INSERT INTO `" + DB_PREFIX + "filter_description` SET `filter_id` = '" + filter_id + "', `language_id` = '" + language_id + "', `filter_group_id` = '" + filter_group_id + "', `name` = " + this.db.escape(filter_description['name']));
				}
			}
		}
	}

	/**
	 * @param filter_group_id
	 *
	 * @return void
	 */
	async deleteFilter(filter_group_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_group` WHERE `filter_group_id` = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_group_description` WHERE `filter_group_id` = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter` WHERE `filter_group_id` = '" + filter_group_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "filter_description` WHERE `filter_group_id` = '" + filter_group_id + "'");
	}

	/**
	 * @param filter_group_id
	 *
	 * @return array
	 */
	async getGroup(filter_group_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter_group` fg LEFT JOIN `" + DB_PREFIX + "filter_group_description` fgd ON (fg.`filter_group_id` = fgd.`filter_group_id`) WHERE fg.`filter_group_id` = '" + filter_group_id + "' AND fgd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getGroups(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "filter_group` fg LEFT JOIN `" + DB_PREFIX + "filter_group_description` fgd ON (fg.`filter_group_id` = fgd.`filter_group_id`) WHERE fgd.`language_id` = '" + this.config.get('config_language_id') + "'";

		let sort_data = [
			'fgd.name',
			'fg.sort_order'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY fgd.`name`";
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
	 * @param filter_group_id
	 *
	 * @return array
	 */
	async getGroupDescriptions(filter_group_id) {
		let filter_group_data = [];

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter_group_description` WHERE `filter_group_id` = '" + filter_group_id + "'");

		for (let result of query.rows) {
			filter_group_data[result['language_id']] = { 'name': result['name'] };
		}

		return filter_group_data;
	}

	/**
	 * @param filter_id
	 *
	 * @return array
	 */
	async getFilter(filter_id) {
		let query = await this.db.query("SELECT *, (SELECT `name` FROM `" + DB_PREFIX + "filter_group_description` fgd WHERE f.`filter_group_id` = fgd.`filter_group_id` AND fgd.`language_id` = '" + this.config.get('config_language_id') + "') AS `group` FROM `" + DB_PREFIX + "filter` f LEFT JOIN `" + DB_PREFIX + "filter_description` fd ON (f.`filter_id` = fd.`filter_id`) WHERE f.`filter_id` = '" + filter_id + "' AND fd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getFilters(data) {
		let sql = "SELECT *, (SELECT name FROM `" + DB_PREFIX + "filter_group_description` fgd WHERE f.`filter_group_id` = fgd.`filter_group_id` AND fgd.`language_id` = '" + this.config.get('config_language_id') + "') AS `group` FROM `" + DB_PREFIX + "filter` f LEFT JOIN `" + DB_PREFIX + "filter_description` fd ON (f.`filter_id` = fd.`filter_id`) WHERE fd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if (data['filter_name']) {
			sql += " AND fd.`name` LIKE " + this.db.escape(data['filter_name'] + '%') + "";
		}

		sql += " ORDER BY f.`sort_order` ASC";

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
	 * @param filter_group_id
	 *
	 * @return array
	 */
	async getDescriptions(filter_group_id) {
		let filter_data = [];

		let filter_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter` WHERE `filter_group_id` = '" + filter_group_id + "'");

		for (let filter of filter_query.rows) {
			let filter_description_data = {};

			let filter_description_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "filter_description` WHERE `filter_id` = '" + filter['filter_id'] + "'");

			for (let filter_description of filter_description_query.rows) {
				filter_description_data[filter_description['language_id']] = { 'name': filter_description['name'] };
			}

			filter_data.push({
				'filter_id': filter['filter_id'],
				'filter_description': filter_description_data,
				'sort_order': filter['sort_order']
			});
		}

		return filter_data;
	}

	/**
	 * @return int
	 */
	async getTotalGroups() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "filter_group`");

		return query.row['total'];
	}
}
