module.exports = class ModelCatalogRecurring extends Model {
	async addRecurring(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "recurring` SET `sort_order` = " + data['sort_order'] + ", `status` = " + data['status'] + ", `price` = " + data['price'] + ", `frequency` = '" + this.db.escape(data['frequency']) + "', `duration` = " + data['duration'] + ", `cycle` = " + data['cycle'] + ", `trial_status` = " + data['trial_status'] + ", `trial_price` = " + data['trial_price'] + ", `trial_frequency` = '" + this.db.escape(data['trial_frequency']) + "', `trial_duration` = " + data['trial_duration'] + ", `trial_cycle` = '" + data['trial_cycle'] + "'");

		const recurring_id = this.db.getLastId();

		for (let [language_id, recurring_description] of Object.entries(data['recurring_description'])) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "recurring_description` (`recurring_id`, `language_id`, `name`) VALUES (" + recurring_id + ", " + language_id + ", '" + this.db.escape(recurring_description['name']) + "')");
		}

		return recurring_id;
	}

	async editRecurring(recurring_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "recurring_description` WHERE recurring_id = '" + recurring_id + "'");

		await this.db.query("UPDATE `" + DB_PREFIX + "recurring` SET `price` = '" + data['price'] + "', `frequency` = '" + this.db.escape(data['frequency']) + "', `duration` = '" + data['duration'] + "', `cycle` = '" + data['cycle'] + "', `sort_order` = '" + data['sort_order'] + "', `status` = '" + data['status'] + "', `trial_price` = '" + data['trial_price'] + "', `trial_frequency` = '" + this.db.escape(data['trial_frequency']) + "', `trial_duration` = '" + data['trial_duration'] + "', `trial_cycle` = '" + data['trial_cycle'] + "', `trial_status` = '" + data['trial_status'] + "' WHERE recurring_id = '" + recurring_id + "'");

		for (let [language_id, recurring_description] of Object.entries(data['recurring_description'])) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "recurring_description` (`recurring_id`, `language_id`, `name`) VALUES (" + recurring_id + ", " + language_id + ", '" + this.db.escape(recurring_description['name']) + "')");
		}
	}

	async copyRecurring(recurring_id) {
		let data = await this.getRecurring(recurring_id);

		data['recurring_description'] = await this.getRecurringDescription(recurring_id);

		for (let recurring_description of data['recurring_description']) {
			recurring_description['name'] += ' - 2';
		}

		await this.addRecurring(data);
	}

	async deleteRecurring(recurring_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "recurring` WHERE recurring_id = " + recurring_id + "");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "recurring_description` WHERE recurring_id = " + recurring_id + "");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_recurring` WHERE recurring_id = " + recurring_id + "");
		await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `recurring_id` = 0 WHERE `recurring_id` = " + recurring_id + "");
	}

	async getRecurring(recurring_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "recurring` WHERE recurring_id = '" + recurring_id + "'");

		return query.row;
	}

	async getRecurringDescription(recurring_id) {
		let recurring_description_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "recurring_description` WHERE `recurring_id` = '" + recurring_id + "'");

		for (let result of query.rows) {
			recurring_description_data[result['language_id']] = { 'name': result['name'] };
		}

		return recurring_description_data;
	}

	async getRecurrings(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "recurring` r LEFT JOIN " + DB_PREFIX + "recurring_description rd ON (r.recurring_id = rd.recurring_id) WHERE rd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND rd.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		let sort_data = [
			'rd.name',
			'r.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY rd.name";
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

	async getTotalRecurrings() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "recurring`");

		return query.row['total'];
	}
}