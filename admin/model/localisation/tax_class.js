module.exports = class TaxClassLocalisationModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addTaxClass(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "tax_class` SET `title` = " + this.db.escape(data['title']) + ", `description` = " + this.db.escape(data['description']) + ", `date_added` = NOW()");

		const tax_class_id = this.db.getLastId();

		if ((data['tax_rule'])) {
			for (let tax_rule of data['tax_rule']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "tax_rule` SET `tax_class_id` = '" + tax_class_id + "', `tax_rate_id` = '" + tax_rule['tax_rate_id'] + "', `based` = " + this.db.escape(tax_rule['based']) + ", `priority` = '" + tax_rule['priority'] + "'");
			}
		}

		await this.cache.delete('tax_class');

		return tax_class_id;
	}

	/**
	 * @param   tax_class_id
	 * @param data
	 *
	 * @return void
	 */
	async editTaxClass(tax_class_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "tax_class` SET `title` = " + this.db.escape(data['title']) + ", `description` = " + this.db.escape(data['description']) + ", `date_modified` = NOW() WHERE `tax_class_id` = '" + tax_class_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_rule` WHERE `tax_class_id` = '" + tax_class_id + "'");

		if ((data['tax_rule'])) {
			for (let tax_rule of data['tax_rule']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "tax_rule` SET `tax_class_id` = '" + tax_class_id + "', `tax_rate_id` = '" + tax_rule['tax_rate_id'] + "', `based` = " + this.db.escape(tax_rule['based']) + ", `priority` = '" + tax_rule['priority'] + "'");
			}
		}

		await this.cache.delete('tax_class');
	}

	/**
	 * @param tax_class_id
	 *
	 * @return void
	 */
	async deleteTaxClass(tax_class_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_class` WHERE `tax_class_id` = '" + tax_class_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "tax_rule` WHERE `tax_class_id` = '" + tax_class_id + "'");

		await this.cache.delete('tax_class');
	}

	/**
	 * @param tax_class_id
	 *
	 * @return array
	 */
	async getTaxClass(tax_class_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "tax_class` WHERE `tax_class_id` = '" + tax_class_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getTaxClasses(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "tax_class` ORDER BY `title`";

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

		let tax_class_data = await this.cache.get('tax_class+' + md5(sql));

		if (!tax_class_data) {
			const query = await this.db.query(sql);

			tax_class_data = query.rows;

			await this.cache.set('tax_class+' + md5(sql), tax_class_data);
		}

		return tax_class_data;
	}

	/**
	 * @return int
	 */
	async getTotalTaxClasses() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "tax_class`");

		return query.row['total'];
	}

	/**
	 * @param tax_class_id
	 *
	 * @return array
	 */
	async getTaxRules(tax_class_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "tax_rule` WHERE `tax_class_id` = '" + tax_class_id + "' ORDER BY `priority` ASC");

		return query.rows;
	}

	/**
	 * @param tax_rate_id
	 *
	 * @return int
	 */
	async getTotalTaxRulesByTaxRateId(tax_rate_id) {
		const query = await this.db.query("SELECT COUNT(DISTINCT `tax_class_id`) AS `total` FROM `" + DB_PREFIX + "tax_rule` WHERE `tax_rate_id` = '" + tax_rate_id + "'");

		return query.row['total'];
	}
}
