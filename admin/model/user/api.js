module.exports = class ApiModel extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addApi(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "api` SET `username` = " + this.db.escape(data['username']) + ", `key` = " + this.db.escape(data['key']) + ", `status` = '" + ((data['status']) ? data['status'] : 0) + "', `date_added` = NOW(), `date_modified` = NOW()");

		const api_id = this.db.getLastId();

		if ((data['api_ip'])) {
			for (let ip of data['api_ip']) {
				if (ip) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET `api_id` = '" + api_id + "', `ip` = " + this.db.escape(ip));
				}
			}
		}

		return api_id;
	}

	/**
	 * @param int   api_id
	 * @param data
	 *
	 * @return void
	 */
	async editApi(api_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "api` SET `username` = " + this.db.escape(data['username']) + ", `key` = " + this.db.escape(data['key']) + ", `status` = '" + ((data['status']) ? data['status'] : 0) + "', `date_modified` = NOW() WHERE `api_id` = '" + api_id + "'");

		await this.db.query("DELETE FROM `" + DB_PREFIX + "api_ip` WHERE `api_id` = '" + api_id + "'");

		if ((data['api_ip'])) {
			for (let ip of data['api_ip']) {
				if (ip) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET `api_id` = '" + api_id + "', `ip` = " + this.db.escape(ip));
				}
			}
		}
	}

	/**
	 * @param int api_id
	 *
	 * @return void
	 */
	async deleteApi(api_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api` WHERE `api_id` = '" + api_id + "'");
	}

	/**
	 * @param int api_id
	 *
	 * @return array
	 */
	async getApi(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api` WHERE `api_id` = '" + api_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getApis(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "api`";

		let sort_data = [
			'username',
			'status',
			'date_added',
			'date_modified'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `username`";
		}

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

		const query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalApis() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "api`");

		return query.row['total'];
	}

	/**
	 * @param int    api_id
	 * @param ip
	 *
	 * @return void
	 */
	async addIp(api_id, ip) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET `api_id` = '" + api_id + "', `ip` = " + this.db.escape(ip));
	}

	/**
	 * @param int api_id
	 *
	 * @return array
	 */
	async getIps(api_id) {
		let ip_data = [];

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_ip` WHERE `api_id` = '" + api_id + "'");

		for (let result of query.rows) {
			ip_data.push(result['ip']);
		}

		return ip_data;
	}

	/**
	 * @param int    api_id
	 * @param session_id
	 * @param ip
	 *
	 * @return int
	 */
	async addSession(api_id, session_id, ip) {
		const api_ip_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_ip` WHERE `ip` = " + this.db.escape(ip));

		if (!api_ip_query.num_rows) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET `api_id` = '" + api_id + "', `ip` = " + this.db.escape(ip));
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "api_session` SET `api_id` = '" + api_id + "', `session_id` = " + this.db.escape(session_id) + ", `ip` = " + this.db.escape(ip) + ", `date_added` = NOW(), `date_modified` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param int api_id
	 *
	 * @return array
	 */
	async getSessions(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_session` WHERE `api_id` = '" + api_id + "'");

		return query.rows;
	}

	/**
	 * @param int api_session_id
	 *
	 * @return void
	 */
	async deleteSession(api_session_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api_session` WHERE `api_session_id` = '" + api_session_id + "'");
	}

	/**
	 * @param session_id
	 *
	 * @return void
	 */
	async deleteSessionBySessionId(session_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api_session` WHERE `session_id` = " + this.db.escape(session_id) );
	}
}
