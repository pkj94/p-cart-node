module.exports =class Gdpr extends Model {
	/**
	 * @param string code
	 * @param string email
	 * @param string action
	 *
	 * @return void
	 */
	async addGdpr(code, email, action) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "gdpr` SET `store_id` = " + this.db.escape(this.config.get('config_store_id')) + ", `language_id` = " + this.db.escape(this.config.get('config_language_id')) + ", `code` = " + this.db.escape(code) + ", `email` = " + this.db.escape(email) + ", `action` = " + this.db.escape(action) + ", `date_added` = NOW()");
	}

	/**
	 * @param gdpr_id
	 * @param status
	 *
	 * @return void
	 */
	async editStatus(gdpr_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "gdpr` SET `status` = '" + status + "' WHERE `gdpr_id` = '" + gdpr_id + "'");
	}

	/**
	 * @param gdpr_id
	 *
	 * @return array
	 */
	async getGdpr(gdpr_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "gdpr` WHERE `gdpr_id` = '" + gdpr_id + "'");

		return query.row;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getGdprByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "gdpr` WHERE `code` = " + this.db.escape(code) + "");

		return query.row;
	}

	/**
	 * @param string email
	 *
	 * @return array
	 */
	async getGdprsByEmail(email) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "gdpr` WHERE `email` = " + this.db.escape(email) );

		return query.rows;
	}

	/**
	 * @return array
	 */
	async getExpires() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "gdpr` WHERE `status` = '2' AND DATE(`date_added`) <= DATE(" + this.db.escape(date('Y-m-d', strtotime('+' + this.config.get('config_gdpr_limit') + ' days'))) + ") ORDER BY `date_added` DESC");

		return query.rows;
	}
}
