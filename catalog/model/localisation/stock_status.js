module.exports = class StockStatus extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param stock_status_id
	 *
	 * @return array
	 */
	async getStockStatus(stock_status_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `stock_status_id` = '" + stock_status_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getStockStatuses(data = {}) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

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

		stock_status_data = await this.cache.get('stock_status.' + md5(sql));

		if (!stock_status_data) {
			const query = await this.db.query(sql);

			stock_status_data = query.rows;

			await this.cache.set('stock_status.' + md5(sql), stock_status_data);
		}

		return stock_status_data;
	}
}
