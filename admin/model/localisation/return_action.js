module.exports = class ReturnActionLocalisationModel extends Model {
	constructor(registry) {
		super(registry);
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addReturnAction(data) {
		for (let [language_id, value] of Object.entries(data['return_action'])) {
			if ((return_action_id)) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "return_action` SET `return_action_id` = '" + return_action_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
			} else {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "return_action` SET `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");

				return_action_id = this.db.getLastId();
			}
		}

		await this.cache.delete('return_action');

		return return_action_id;
	}

	/**
	 * @param   return_action_id
	 * @param data
	 *
	 * @return void
	 */
	async editReturnAction(return_action_id, data) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_action` WHERE `return_action_id` = '" + return_action_id + "'");

		for (let [language_id, value] of Object.entries(data['return_action'])) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "return_action` SET `return_action_id` = '" + return_action_id + "', `language_id` = '" + language_id + "', `name` = " + this.db.escape(value['name']) + "");
		}

		await this.cache.delete('return_action');
	}

	/**
	 * @param return_action_id
	 *
	 * @return void
	 */
	async deleteReturnAction(return_action_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_action` WHERE `return_action_id` = '" + return_action_id + "'");

		await this.cache.delete('return_action');
	}

	/**
	 * @param return_action_id
	 *
	 * @return array
	 */
	async getReturnAction(return_action_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_action` WHERE `return_action_id` = '" + return_action_id + "' AND `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getReturnActions(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "return_action` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

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

		let return_action_data = await this.cache.get('return_action+' + md5(sql));

		if (!return_action_data) {
			const query = await this.db.query(sql);

			return_action_data = query.rows;

			await this.cache.set('return_action+' + md5(sql), return_action_data);
		}

		return return_action_data;
	}

	/**
	 * @param return_action_id
	 *
	 * @return array
	 */
	async getDescriptions(return_action_id) {
		let return_action_data = {};

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "return_action` WHERE `return_action_id` = '" + return_action_id + "'");

		for (let result of query.rows) {
			return_action_data[result['language_id']] = { 'name': result['name'] };
		}

		return return_action_data;
	}

	/**
	 * @return int
	 */
	async getTotalReturnActions() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "return_action` WHERE `language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}
