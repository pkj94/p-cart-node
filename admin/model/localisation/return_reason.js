module.exports = class ReturnReasonLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addReturnReason(data) {
		for (let [language_id, value] of Object.entries(data['return_reason'])) {
			if ((return_reason_id)) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "return_reason` SET `return_reason_id` = '" + return_reason_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
			} else {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "return_reason` SET `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");

				return_reason_id = this.db.getLastId();
			}
		}

		await this.cache.delete('return_reason');

		return return_reason_id;
	}

	/**
	 * @param   return_reason_id
	 * @param data
	 *
	 * @return void
	 */
	async editReturnReason(return_reason_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_reason` WHERE `return_reason_id` = '" + return_reason_id + "'");

		for (let [language_id, value] of Object.entries(data['return_reason'])) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "return_reason` SET `return_reason_id` = '" + return_reason_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('return_reason');
	}

	/**
	 * @param return_reason_id
	 *
	 * @return void
	 */
	async deleteReturnReason(return_reason_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_reason` WHERE `return_reason_id` = '" + return_reason_id + "'");

		await this.cache.delete('return_reason');
	}

	/**
	 * @param return_reason_id
	 *
	 * @return array
	 */
	async getReturnReason(return_reason_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_reason` WHERE `return_reason_id` = '" + return_reason_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getReturnReasons(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "return_reason` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

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

		let return_reason_data = await this.cache.get('return_reason+' + md5(sql));

		if (!return_reason_data) {
			const query = await this.db.query(sql);

			return_reason_data = query.rows;

			await this.cache.set('return_reason+' + md5(sql), return_reason_data);
		}

		return return_reason_data;
	}

	/**
	 * @param return_reason_id
	 *
	 * @return array
	 */
	async getDescriptions(return_reason_id) {
		let return_reason_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_reason` WHERE `return_reason_id` = '" + return_reason_id + "'");

		for (let result of query.rows) {
			return_reason_data[result['language_id']] = { 'name': result['name'] };
		}

		return return_reason_data;
	}

	/**
	 * @return int
	 */
	async getTotalReturnReasons() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "return_reason` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}
