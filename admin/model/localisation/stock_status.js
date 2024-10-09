module.exports = class StockStatusLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addStockStatus(data) {
		let stock_status_id = 0;
		for (let [language_id, value] of Object.keys(data['stock_status'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			if ((stock_status_id)) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "stock_status` SET `stock_status_id` = '" + stock_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
			} else {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "stock_status` SET `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");

				stock_status_id = this.db.getLastId();
			}
		}

		await this.cache.delete('stock_status');

		return stock_status_id;
	}

	/**
	 * @param   stock_status_id
	 * @param data
	 *
	 * @return void
	 */
	async editStockStatus(stock_status_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "stock_status` WHERE `stock_status_id` = '" + stock_status_id + "'");

		for (let [language_id, value] of Object.keys(data['stock_status'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "stock_status` SET `stock_status_id` = '" + stock_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('stock_status');
	}

	/**
	 * @param stock_status_id
	 *
	 * @return void
	 */
	async deleteStockStatus(stock_status_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "stock_status` WHERE `stock_status_id` = '" + stock_status_id + "'");

		await this.cache.delete('stock_status');
	}

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
		let sql = "SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
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

		let stock_status_data = await this.cache.get('stock_status+' + md5(sql));

		if (!stock_status_data) {
			const query = await this.db.query(sql);

			stock_status_data = query.rows;

			await this.cache.set('stock_status+' + md5(sql), stock_status_data);
		}

		return stock_status_data;
	}

	/**
	 * @param stock_status_id
	 *
	 * @return array
	 */
	async getDescriptions(stock_status_id) {
		stock_status_data = [];

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "stock_status` WHERE `stock_status_id` = '" + stock_status_id + "'");

		for (let result of query.rows) {
			stock_status_data[result['language_id']] = {'name' : result['name']};
		}

		return stock_status_data;
	}

	/**
	 * @return int
	 */
	async getTotalStockStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "stock_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}
