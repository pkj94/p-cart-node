module.exports = class StockStatus extends global['OpencartSystemEngineModel'] {
	/**
	 * @param stock_status_id
	 *
	 * @return array
	 */
	async getStockStatus(stock_status_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `stock_status_id` = " + this.db.quote(stock_status_id) + " AND `language_id` = " + this.db.quote(this.config.get('config_language_id')));

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getStockStatuses(data = {}) {
		let stock_status_data;
		let sql = "SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `language_id` = " + this.db.quote(this.config.get('config_language_id')) + " ORDER BY `name`";

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

			sql += " LIMIT " + (parseInt(data['start']) || 0) + "," + (parseInt(data['limit']) || 0);
		}

		stock_status_data = await this.cache.get('stock_status.' + md5(sql));

		if (!stock_status_data) {
			const query = await this.db.query(sql);

			stock_status_data = query.rows;

			await this.cache.set('stock_status.' + md5(sql), stock_status_data);
		}

		return stock_status_data;
	}
}
