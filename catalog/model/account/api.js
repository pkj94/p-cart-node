module.exports =class Api extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param string username
	 * @param string key
	 *
	 * @return array
	 */
	async login(username, key) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api` WHERE `username` = " + this.db.escape(username) + " AND `key` = " + this.db.escape(key) + " AND `status` = '1'");

		return query.row;
	}

	/**
	 * @param    api_id
	 * @param string session_id
	 * @param string ip
	 *
	 * @return int
	 */
	async addSession(api_id, session_id, ip) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "api_session` SET `api_id` = '" + api_id + "', `session_id` = " + this.db.escape(session_id) + ", `ip` = " + this.db.escape(ip) + ", `date_added` = NOW(), `date_modified` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param api_id
	 *
	 * @return array
	 */
	async getIps(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_ip` WHERE `api_id` = '" + api_id + "'");

		return query.rows;
	}
}
