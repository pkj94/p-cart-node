module.exports = class CronSettingModel extends Model {
	/**
	 * @param code
	 * @param description
	 * @param cycle
	 * @param action
	 * @param   status
	 *
	 * @return int
	 */
	async addCron(code, description, cycle, action, status) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "cron` SET `code` = " + this.db.escape(code) + ", `description` = " + this.db.escape(description) + ", `cycle` = " + this.db.escape(cycle) + ", `action` = " + this.db.escape(action) + ", `status` = '" + status + "', `date_added` = NOW(), `date_modified` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param cron_id
	 *
	 * @return void
	 */
	async deleteCron(cron_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "cron` WHERE `cron_id` = '" + cron_id + "'");
	}

	/**
	 * @param code
	 *
	 * @return void
	 */
	async deleteCronByCode(code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "cron` WHERE `code` = " + this.db.escape(code));
	}

	/**
	 * @param cron_id
	 *
	 * @return void
	 */
	async editCron(cron_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "cron` SET `date_modified` = NOW() WHERE `cron_id` = '" + cron_id + "'");
	}

	/**
	 * @param  cron_id
	 * @param status
	 *
	 * @return void
	 */
	async editStatus(cron_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "cron` SET `status` = '" + status + "' WHERE `cron_id` = '" + cron_id + "'");
	}

	/**
	 * @param cron_id
	 *
	 * @return array
	 */
	async getCron(cron_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "cron` WHERE `cron_id` = '" + cron_id + "'");

		return query.row;
	}

	/**
	 * @param code
	 *
	 * @return array
	 */
	async getCronByCode(code) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "cron` WHERE `code` = " + this.db.escape(code) + " LIMIT 1");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getCrons(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "cron`";

		let sort_data = [
			'code',
			'cycle',
			'action',
			'status',
			'date_added',
			'date_modified'
		];

		if (data['sort'] && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `date_added`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}
		data['start'] = data['start'] || 0;
		data['limit'] = data['limit'] || 20;
		if (data['start'] || data['limit']) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalCrons() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "cron`");

		return query.row['total'];
	}
}