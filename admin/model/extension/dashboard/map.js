module.exports = class ModelExtensionDashboardMap extends Model {
	async getTotalOrdersByCountry() {
		let implode = [];
		
		if (Array.isArray(this.config.get('config_complete_status'))) {
			for (this.config.get('config_complete_status') of order_status_id) {
				implode.push(order_status_id;
			}
		}
		
		if (implode.length) {
			const query = await this.db.query("SELECT COUNT(*) AS total, SUM(o.total) AS amount, c.iso_code_2 FROM `" + DB_PREFIX + "order` o INNER JOIN `" + DB_PREFIX + "country` c ON (o.payment_country_id = c.country_id) WHERE o.order_status_id IN(" + implode(',', implode) + ") GROUP BY o.payment_country_id");

			return query.rows;
		} else {
			return {};
		}
	}
}