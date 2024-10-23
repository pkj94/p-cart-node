module.exports = class Cron extends global['\Opencart\System\Engine\Model'] {
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
	 * @param bool status
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
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "cron` WHERE `cron_id` = '" + cron_id + "'");

		return query.row;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getCronByCode(code) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "cron` WHERE `code` = " + this.db.escape(code) + " LIMIT 1");

		return query.row;
	}

	/**
	 * @return array
	 */
	async getCrons() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "cron` ORDER BY `date_modified` DESC");

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalCrons() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "cron`");

		return query.row['total'];
	}
}