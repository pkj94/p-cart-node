module.exports =class ApiModel extends Model {
	/**
	 * @param string username
	 * @param string key
	 *
	 * @return array
	 */
	async login(username, key) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api` a LEFT JOIN `" + DB_PREFIX + "api_ip` ai ON (a.`api_id` = ai.`api_id`) WHERE a.`username` = '" + this.db.escape(username) + "' AND a.`key` = '" + this.db.escape(key) + "'");

		return query.row;
	}

	/**
	 * @param string token
	 *
	 * @return array
	 */
	async getApiByToken(token) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "api` a LEFT JOIN `" + DB_PREFIX + "api_session` `as` ON (a.`api_id` = `as`.`api_id`) LEFT JOIN `" + DB_PREFIX + "api_ip` ai ON (a.`api_id` = ai.`api_id`) WHERE a.`status` = '1' AND `as`.`session_id` = " + this.db.escape(token) + " AND ai.`ip` = " + this.db.escape((this.request.server.headers['x-forwarded-for'] ||
					this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress)) + "");

		return query.row;
	}

	/**
	 * @param api_id
	 *
	 * @return array
	 */
	async getSessions(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_session` WHERE TIMESTAMPADD(HOUR, 1, `date_modified`) < NOW() AND `api_id` = '" + api_id + "'");

		return query.rows;
	}

	/**
	 * @param api_id
	 *
	 * @return array
	 */
	async deleteSessions(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_session` WHERE TIMESTAMPADD(HOUR, 1, `date_modified`) < NOW() AND `api_id` = '" + api_id + "'");

		return query.rows;
	}

	/**
	 * @param string api_session_id
	 *
	 * @return void
	 */
	async updateSession(api_session_id) {
		// keep the session alive
		await this.db.query("UPDATE `" + DB_PREFIX + "api_session` SET `date_modified` = NOW() WHERE `api_session_id` = '" + api_session_id + "'");
	}

	/**
	 * @return void
	 */
	async cleanSessions() {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api_session` WHERE TIMESTAMPADD(HOUR, 1, `date_modified`) < NOW()");
	}
}
