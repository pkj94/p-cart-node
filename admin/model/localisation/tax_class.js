module.exports = class ModelLocalisationTaxClass extends Model {
	async addTaxClass(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "tax_class SET title = '" + this.db.escape(data['title']) + "', description = '" + this.db.escape(data['description']) + "', date_added = NOW()");

		const tax_class_id = this.db.getLastId();

		if ((data['tax_rule'])) {
			for (let tax_rule of data['tax_rule']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "tax_rule SET tax_class_id = '" + tax_class_id + "', tax_rate_id = '" + tax_rule['tax_rate_id'] + "', based = '" + this.db.escape(tax_rule['based']) + "', priority = '" + tax_rule['priority'] + "'");
			}
		}

		await this.cache.delete('tax_class');

		return tax_class_id;
	}

	async editTaxClass(tax_class_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "tax_class SET title = '" + this.db.escape(data['title']) + "', description = '" + this.db.escape(data['description']) + "', date_modified = NOW() WHERE tax_class_id = '" + tax_class_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "tax_rule WHERE tax_class_id = '" + tax_class_id + "'");

		if ((data['tax_rule'])) {
			for (let tax_rule of data['tax_rule']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "tax_rule SET tax_class_id = '" + tax_class_id + "', tax_rate_id = '" + tax_rule['tax_rate_id'] + "', based = '" + this.db.escape(tax_rule['based']) + "', priority = '" + tax_rule['priority'] + "'");
			}
		}

		await this.cache.delete('tax_class');
	}

	async deleteTaxClass(tax_class_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "tax_class WHERE tax_class_id = '" + tax_class_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "tax_rule WHERE tax_class_id = '" + tax_class_id + "'");

		await this.cache.delete('tax_class');
	}

	async getTaxClass(tax_class_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "tax_class WHERE tax_class_id = '" + tax_class_id + "'");

		return query.row;
	}

	async getTaxClasses(data = {}) {
		if (Object.keys(data).length) {
			let sql = "SELECT * FROM " + DB_PREFIX + "tax_class";

			sql += " ORDER BY title";

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
		} else {
			let tax_class_data = await this.cache.get('tax_class');

			if (!tax_class_data) {
				const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "tax_class");

				tax_class_data = query.rows;

				await this.cache.set('tax_class', tax_class_data);
			}

			return tax_class_data;
		}
	}

	async getTotalTaxClasses() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "tax_class");

		return query.row['total'];
	}

	async getTaxRules(tax_class_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "tax_rule WHERE tax_class_id = '" + tax_class_id + "' ORDER BY priority ASC");

		return query.rows;
	}

	async getTotalTaxRulesByTaxRateId(tax_rate_id) {
		const query = await this.db.query("SELECT COUNT(DISTINCT tax_class_id) AS total FROM " + DB_PREFIX + "tax_rule WHERE tax_rate_id = '" + tax_rate_id + "'");

		return query.row['total'];
	}
}