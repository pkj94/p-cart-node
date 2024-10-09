module.exports = class OrderStatusLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addOrderStatus(data) {
		let order_status_id = 0;
		for (let [language_id, value] of Object.entries(data['order_status'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			if ((order_status_id)) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "order_status` SET `order_status_id` = '" + order_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
			} else {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "order_status` SET `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");

				order_status_id = this.db.getLastId();
			}
		}

		await this.cache.delete('order_status');

		return order_status_id;
	}

	/**
	 * @param   order_status_id
	 * @param data
	 *
	 * @return void
	 */
	async editOrderStatus(order_status_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "'");

		for (let [language_id, value] of Object.entries(data['order_status'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			await this.db.query("INSERT INTO `" + DB_PREFIX + "order_status` SET `order_status_id` = '" + order_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('order_status');
	}

	/**
	 * @param order_status_id
	 *
	 * @return void
	 */
	async deleteOrderStatus(order_status_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "'");

		await this.cache.delete('order_status');
	}

	/**
	 * @param order_status_id
	 *
	 * @return array
	 */
	async getOrderStatus(order_status_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getOrderStatuses(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

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

		let order_status_data = await this.cache.get('order_status+' + md5(sql));

		if (!order_status_data) {
			const query = await this.db.query(sql);

			order_status_data = query.rows;

			await this.cache.set('order_status+' + md5(sql), order_status_data);
		}

		return order_status_data;
	}

	/**
	 * @param order_status_id
	 *
	 * @return array
	 */
	async getDescriptions(order_status_id) {
		let order_status_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_status` WHERE `order_status_id` = '" + order_status_id + "'");

		for (let result of query.rows) {
			order_status_data[result['language_id']] = { 'name': result['name'] };
		}

		return order_status_data;
	}

	/**
	 * @return int
	 */
	async getTotalOrderStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "order_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}
