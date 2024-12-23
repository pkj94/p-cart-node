module.exports = class StatisticsReportModel extends global['\Opencart\System\Engine\Model'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return array
	 */
	async getStatistics() {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "statistics`");

		return query.rows;
	}

	/**
	 * @param code
	 *
	 * @return float
	 */
	async getValue(code) {
		let query = await this.db.query("SELECT `value` FROM `" + DB_PREFIX + "statistics` WHERE `code` = " + this.db.escape(code) + "");

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return 0;
		}
	}

	/**
	 * @param code
	 * @param  value
	 *
	 * @return void
	 */
	async addValue(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "statistics` SET `value` = (`value` + '" + value + "') WHERE `code` = " + this.db.escape(code));
	}

	/**
	 * @param code
	 * @param  value
	 *
	 * @return void
	 */
	async removeValue(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "statistics` SET `value` = (`value` - '" + value + "') WHERE `code` = " + this.db.escape(code));
	}

	/**
	 * @param code
	 * @param  value
	 *
	 * @return void
	 */
	async editValue(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "statistics` SET `value` = '" + value + "' WHERE `code` = " + this.db.escape(code));
	}
}
