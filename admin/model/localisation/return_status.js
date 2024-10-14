module.exports = class ReturnStatusLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addReturnStatus(data) {
		for (let [language_id, value] of Object.entries(data['return_status'])) {
			if ((return_status_id)) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "return_status` SET `return_status_id` = '" + return_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
			} else {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "return_status` SET `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");

				return_status_id = this.db.getLastId();
			}
		}

		await this.cache.delete('return_status');

		return return_status_id;
	}

	/**
	 * @param   return_status_id
	 * @param data
	 *
	 * @return void
	 */
	async editReturnStatus(return_status_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_status` WHERE `return_status_id` = '" + return_status_id + "'");

		for (let [language_id, value] of Object.entries(data['return_status'])) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "return_status` SET `return_status_id` = '" + return_status_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('return_status');
	}

	/**
	 * @param return_status_id
	 *
	 * @return void
	 */
	async deleteReturnStatus(return_status_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_status` WHERE `return_status_id` = '" + return_status_id + "'");

		await this.cache.delete('return_status');
	}

	/**
	 * @param return_status_id
	 *
	 * @return array
	 */
	async getReturnStatus(return_status_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_status` WHERE `return_status_id` = '" + return_status_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getReturnStatuses(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "return_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

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

		let return_status_data = await this.cache.get('return_status+' + md5(sql));

		if (!return_status_data) {
			const query = await this.db.query(sql);

			return_status_data = query.rows;

			await this.cache.set('return_status+' + md5(sql), return_status_data);
		}

		return return_status_data;
	}

	/**
	 * @param return_status_id
	 *
	 * @return array
	 */
	async getDescriptions(return_status_id) {
		let return_status_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_status` WHERE `return_status_id` = '" + return_status_id + "'");

		for (let result of query.rows) {
			return_status_data[result['language_id']] = { 'name': result['name'] };
		}

		return return_status_data;
	}

	/**
	 * @return int
	 */
	async getTotalReturnStatuses() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "return_status` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}