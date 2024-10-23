module.exports = class TaxRateLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addTaxRate(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "tax_rate` SET `name` = " + this.db.escape(data['name']) + ", `rate` = '" + data['rate'] + "', `type` = " + this.db.escape(data['type']) + ", `geo_zone_id` = '" + data['geo_zone_id'] + "', `date_added` = NOW(), `date_modified` = NOW()");

		const tax_rate_id = this.db.getLastId();

		if ((data['tax_rate_customer_group'])) {
			for (let customer_group_id of data['tax_rate_customer_group']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "tax_rate_to_customer_group` SET `tax_rate_id` = '" + tax_rate_id + "', `customer_group_id` = '" + customer_group_id + "'");
			}
		}

		return tax_rate_id;
	}

	/**
	 * @param   tax_rate_id
	 * @param data
	 *
	 * @return void
	 */
	async editTaxRate(tax_rate_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "tax_rate` SET `name` = " + this.db.escape(data['name']) + ", `rate` = '" + data['rate'] + "', `type` = " + this.db.escape(data['type']) + ", `geo_zone_id` = '" + data['geo_zone_id'] + "', `date_modified` = NOW() WHERE `tax_rate_id` = '" + tax_rate_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_rate_to_customer_group` WHERE `tax_rate_id` = '" + tax_rate_id + "'");

		if ((data['tax_rate_customer_group'])) {
			for (let customer_group_id of data['tax_rate_customer_group']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "tax_rate_to_customer_group` SET `tax_rate_id` = '" + tax_rate_id + "', `customer_group_id` = '" + customer_group_id + "'");
			}
		}
	}

	/**
	 * @param tax_rate_id
	 *
	 * @return void
	 */
	async deleteTaxRate(tax_rate_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_rate` WHERE `tax_rate_id` = '" + tax_rate_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_rate_to_customer_group` WHERE `tax_rate_id` = '" + tax_rate_id + "'");
	}

	/**
	 * @param tax_rate_id
	 *
	 * @return array
	 */
	async getTaxRate(tax_rate_id) {
		const query = await this.db.query("SELECT tr.`tax_rate_id`, tr.`name` AS name, tr.`rate`, tr.`type`, tr.`geo_zone_id`, gz.`name` AS geo_zone, tr.`date_added`, tr.`date_modified` FROM `" + DB_PREFIX + "tax_rate` tr LEFT JOIN `" + DB_PREFIX + "geo_zone` gz ON (tr.`geo_zone_id` = gz.`geo_zone_id`) WHERE tr.`tax_rate_id` = '" + tax_rate_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getTaxRates(data = {}) {
		let sql = "SELECT tr.`tax_rate_id`, tr.`name` AS name, tr.`rate`, tr.`type`, gz.`name` AS geo_zone, tr.`date_added`, tr.`date_modified` FROM `" + DB_PREFIX + "tax_rate` tr LEFT JOIN `" + DB_PREFIX + "geo_zone` gz ON (tr.`geo_zone_id` = gz.`geo_zone_id`)";

		let sort_data = [
			'tr.name',
			'tr.rate',
			'tr.type',
			'gz.name',
			'tr.date_added',
			'tr.date_modified'
		];

		if ((data['sort']) && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY tr.`name`";
		}

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

		const query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param tax_rate_id
	 *
	 * @return array
	 */
	async getCustomerGroups(tax_rate_id) {
		let tax_customer_group_data = [];

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "tax_rate_to_customer_group` WHERE `tax_rate_id` = '" + tax_rate_id + "'");

		for (let result of query.rows) {
			tax_customer_group_data.push(result['customer_group_id']);
		}

		return tax_customer_group_data;
	}

	/**
	 * @return int
	 */
	async getTotalTaxRates() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "tax_rate`");

		return query.row['total'];
	}

	/**
	 * @param geo_zone_id
	 *
	 * @return int
	 */
	async getTotalTaxRatesByGeoZoneId(geo_zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "tax_rate` WHERE `geo_zone_id` = '" + geo_zone_id + "'");

		return query.row['total'];
	}
}
