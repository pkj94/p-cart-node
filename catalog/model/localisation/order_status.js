module.exports = class ModelLocalisationOrderStatus extends Model {
	async getOrderStatus(order_status_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_status WHERE order_status_id = '" + order_status_id + "' AND language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getOrderStatuses() {
		let order_status_data = await this.cache.get('order_status.' + this.config.get('config_language_id'));

		if (!order_status_data) {
			const query = await this.db.query("SELECT order_status_id, name FROM " + DB_PREFIX + "order_status WHERE language_id = '" + this.config.get('config_language_id') + "' ORDER BY name");

			order_status_data = query.rows;

			await this.cache.set('order_status.' + this.config.get('config_language_id'), order_status_data);
		}

		return order_status_data;
	}
}