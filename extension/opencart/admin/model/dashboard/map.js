global['Opencart\Admin\Model\Extension\Opencart\Dashboard\Map'] = class Map extends global['\Opencart\System\Engine\Model']  {
	/**
	 * @return array
	 */
	async getTotalOrdersByCountry() {
		const implode = [];

		if (Array.isArray(this.config.get('config_complete_status'))) {
			for (let order_status_id of this.config.get('config_complete_status')) {
				implode.push("'" + order_status_id + "'");
			}
		}

		if (implode.length) {
			let query = await this.db.query("SELECT COUNT(*) AS `total`, SUM(o.`total`) AS `amount`, c.`iso_code_2` FROM `" + DB_PREFIX + "order` o LEFT JOIN `" + DB_PREFIX + "country` c ON (o.`payment_country_id` = c.`country_id`) WHERE o.`order_status_id` IN(" + implode.join(',') + ") AND o.`payment_country_id` != '0' GROUP BY o.`payment_country_id`");

			return query.rows;
		} else {
			return [];
		}
	}
}
