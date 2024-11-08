module.exports = class ModelUserUser extends Model {
	async addUser(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "user` SET username = '" + this.db.escape(data['username']) + "', user_group_id = '" + data['user_group_id'] + "', salt = '" + this.db.escape(salt = token(9)) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(data['password'])))) + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', image = '" + this.db.escape(data['image']) + "', status = '" + data['status'] + "', date_added = NOW()");

		return this.db.getLastId();
	}

	async editUser(user_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "user` SET username = '" + this.db.escape(data['username']) + "', user_group_id = '" + data['user_group_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', image = '" + this.db.escape(data['image']) + "', status = '" + data['status'] + "' WHERE user_id = '" + user_id + "'");

		if (data['password']) {
			await this.db.query("UPDATE `" + DB_PREFIX + "user` SET salt = '" + this.db.escape(salt = token(9)) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(data['password'])))) + "' WHERE user_id = '" + user_id + "'");
		}
	}

	async editPassword(user_id, password) {
		await this.db.query("UPDATE `" + DB_PREFIX + "user` SET salt = '" + this.db.escape(salt = token(9)) + "', password = '" + this.db.escape(sha1(salt + sha1(salt + sha1(password)))) + "', code = '' WHERE user_id = '" + user_id + "'");
	}

	async editCode(email, code) {
		await this.db.query("UPDATE `" + DB_PREFIX + "user` SET code = '" + this.db.escape(code) + "' WHERE LCASE(email) = '" + this.db.escape(oc_strtolower(email)) + "'");
	}

	async deleteUser(user_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "user` WHERE user_id = '" + user_id + "'");
	}

	async getUser(user_id) {
		const query = await this.db.query("SELECT *, (SELECT ug.name FROM `" + DB_PREFIX + "user_group` ug WHERE ug.user_group_id = u.user_group_id) AS user_group FROM `" + DB_PREFIX + "user` u WHERE u.user_id = '" + user_id + "'");

		return query.row;
	}

	async getUserByUsername(username) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "user` WHERE username = '" + this.db.escape(username) + "'");

		return query.row;
	}

	async getUserByEmail(email) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "user` WHERE LCASE(email) = '" + this.db.escape(oc_strtolower(email)) + "'");

		return query.row;
	}

	async getUserByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "user` WHERE code = '" + this.db.escape(code) + "' AND code != ''");

		return query.row;
	}

	async getUsers(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "user`";

		let sort_data = [
			'username',
			'status',
			'date_added'
		];

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

	async getTotalUsers() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "user`");

		return query.row['total'];
	}

	async getTotalUsersByGroupId(user_group_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "user` WHERE user_group_id = '" + user_group_id + "'");

		return query.row['total'];
	}

	async getTotalUsersByEmail(email) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "user` WHERE LCASE(email) = '" + this.db.escape(oc_strtolower(email)) + "'");

		return query.row['total'];
	}

	async addLoginAttempt(username) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_login WHERE email = '" + this.db.escape(oc_strtolower(username)) + "'");

		if (!query.num_rows) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "customer_login SET email = '" + this.db.escape(oc_strtolower(username)) + "', ip = '" + this.db.escape(this.request.server['REMOTE_ADDR']) + "', total = 1, date_added = '" + this.db.escape(date('Y-m-d H:i:s')) + "', date_modified = '" + this.db.escape(date('Y-m-d H:i:s')) + "'");
		} else {
			await this.db.query("UPDATE " + DB_PREFIX + "customer_login SET total = (total + 1), date_modified = '" + this.db.escape(date('Y-m-d H:i:s')) + "' WHERE customer_login_id = '" + query.row['customer_login_id'] + "'");
		}
	}

	async getLoginAttempts(username) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_login` WHERE email = '" + this.db.escape(oc_strtolower(username)) + "'");

		return query.row;
	}

	async deleteLoginAttempts(username) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_login` WHERE email = '" + this.db.escape(oc_strtolower(username)) + "'");
	}
}