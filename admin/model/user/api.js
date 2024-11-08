module.exports = class ModelUserApi extends Model {
	async addApi(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "api` SET username = '" + this.db.escape(data['username']) + "', `key` = '" + this.db.escape(data['key']) + "', status = '" + data['status'] + "', date_added = NOW(), date_modified = NOW()");

		api_id = this.db.getLastId();

		if ((data['api_ip'])) {
			for (data['api_ip'] of ip) {
				if (ip) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET api_id = '" + api_id + "', ip = '" + this.db.escape(ip) + "'");
				}
			}
		}
		
		return api_id;
	}

	async editApi(api_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "api` SET username = '" + this.db.escape(data['username']) + "', `key` = '" + this.db.escape(data['key']) + "', status = '" + data['status'] + "', date_modified = NOW() WHERE api_id = '" + api_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "api_ip WHERE api_id = '" + api_id + "'");

		if ((data['api_ip'])) {
			for (data['api_ip'] of ip) {
				if (ip) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET api_id = '" + api_id + "', ip = '" + this.db.escape(ip) + "'");
				}
			}
		}
	}

	async deleteApi(api_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api` WHERE api_id = '" + api_id + "'");
	}

	async getApi(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api` WHERE api_id = '" + api_id + "'");

		return query.row;
	}

	async getApis(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "api`";

		let sort_data = [
			'username',
			'status',
			'date_added',
			'date_modified'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY username";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start']||0;
if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getTotalApis() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "api`");

		return query.row['total'];
	}

	async addApiIp(api_id, ip) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET api_id = '" + api_id + "', ip = '" + this.db.escape(ip) + "'");
	}

	async getApiIps(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_ip` WHERE api_id = '" + api_id + "'");

		return query.rows;
	}

	async addApiSession(api_id, session_id, ip) {
		api_ip_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_ip` WHERE ip = '" + this.db.escape(ip) + "'");
		
		if (!api_ip_query.num_rows) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "api_ip` SET api_id = '" + api_id + "', ip = '" + this.db.escape(ip) + "'");
		}
 		
		await this.db.query("INSERT INTO `" + DB_PREFIX + "api_session` SET api_id = '" + api_id + "', session_id = '" + this.db.escape(session_id) + "', ip = '" + this.db.escape(ip) + "', date_added = NOW(), date_modified = NOW()");

		return this.db.getLastId();
	}
	
	async getApiSessions(api_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "api_session` WHERE api_id = '" + api_id + "'");

		return query.rows;
	}
	
	async deleteApiSession(api_session_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api_session` WHERE api_session_id = '" + api_session_id + "'");
	}
	
	async deleteApiSessionBySessionId(session_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "api_session` WHERE session_id = '" + this.db.escape(session_id) + "'");
	}		
}
