module.exports =class ReturnReason extends Model {
	/**
	 * @param data
	 *
	 * @return array
	 */
	async getReturnReasons(data = {}) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "return_reason` WHERE `language_id` = '" + this.config.get('config_language_id') + "' ORDER BY `name`";

		if ((data['return']) && (data['return'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		return_reason_data = await this.cache.get('return_reason.' + md5(sql));

		if (!return_reason_data) {
			const query = await this.db.query(sql);

			return_reason_data = query.rows;

			await this.cache.set('return_reason.' + md5(sql), return_reason_data);
		}

		return return_reason_data;
	}
}
