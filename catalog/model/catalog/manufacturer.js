module.exports=class ManufacturerModel extends Model {
	/**
	 * @param manufacturer_id
	 *
	 * @return array
	 */
	async getManufacturer(manufacturer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "manufacturer` m LEFT JOIN `" + DB_PREFIX + "manufacturer_to_store` m2s ON (m.`manufacturer_id` = m2s.`manufacturer_id`) WHERE m.`manufacturer_id` = '" + manufacturer_id + "' AND m2s.`store_id` = '" + this.config.get('config_store_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getManufacturers(data = {}) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "manufacturer` m LEFT JOIN `" + DB_PREFIX + "manufacturer_to_store` m2s ON (m.`manufacturer_id` = m2s.`manufacturer_id`) WHERE m2s.`store_id` = '" + this.config.get('config_store_id') + "'";

		sort_data = [
			'name',
			'sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY `" + data['sort'] + "`";
		} else {
			sql += " ORDER BY `name`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		manufacturer_data = await this.cache.get('manufacturer+' + md5(sql));

		if (!manufacturer_data) {
			const query = await this.db.query(sql);

			manufacturer_data = query.rows;

			await this.cache.set('manufacturer+' + md5(sql), manufacturer_data);
		}

		return manufacturer_data;
	}

	/**
	 * @param manufacturer_id
	 *
	 * @return int
	 */
	async getLayoutId(manufacturer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "manufacturer_to_layout` WHERE `manufacturer_id` = '" + manufacturer_id + "' AND `store_id` = '" + this.config.get('config_store_id') + "'");

		if (query.num_rows) {
			return query.row['layout_id'];
		} else {
			return 0;
		}
	}
}
