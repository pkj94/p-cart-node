const array_diff = require("locutus/php/array/array_diff");

module.exports = class ModelUserUserGroup extends Model {
	async addUserGroup(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "user_group SET name = '" + this.db.escape(data['name']) + "', permission = '" + ((data['permission']) ? this.db.escape(JSON.stringify(data['permission'])) : '') + "'");

		return this.db.getLastId();
	}

	async editUserGroup(user_group_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "user_group SET name = '" + this.db.escape(data['name']) + "', permission = '" + ((data['permission']) ? this.db.escape(JSON.stringify(data['permission'])) : '') + "' WHERE user_group_id = '" + user_group_id + "'");
	}

	async deleteUserGroup(user_group_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_group_id + "'");
	}

	async getUserGroup(user_group_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_group_id + "'");

		const user_group = {
			'name': query.row['name'],
			'permission': query.row['permission'] ? JSON.parse(query.row['permission']) : {}
		};

		return user_group;
	}

	async getUserGroups(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "user_group";

		sql += " ORDER BY name";

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

	async getTotalUserGroups() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "user_group");

		return query.row['total'];
	}

	async addPermission(user_group_id, type, route) {
		const user_group_query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_group_id + "'");

		if (user_group_query.num_rows) {
			const data = JSON.parse(user_group_query.row['permission']);

			data[type].push(route);

			await this.db.query("UPDATE " + DB_PREFIX + "user_group SET permission = '" + this.db.escape(JSON.stringify(data)) + "' WHERE user_group_id = '" + user_group_id + "'");
		}
	}

	async removePermission(user_group_id, type, route) {
		const user_group_query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_group_id + "'");

		if (user_group_query.num_rows) {
			const data = JSON.parse(user_group_query.row['permission']);

			data[type] = data[type].filter(item => item !== route)

			await this.db.query("UPDATE " + DB_PREFIX + "user_group SET permission = '" + this.db.escape(JSON.stringify(data)) + "' WHERE user_group_id = '" + user_group_id + "'");
		}
	}

	async removePermissions(route) {
		const user_groups = await this.getUserGroups();
		for (let user_group of user_groups) {
			let user_group_id = user_group['user_group_id'];
			let permission = user_group['permission'];
			if ((permission)) {
				permission = JSON.parse(permission);
				if ((permission['access'])) {
					await this.removePermission(user_group_id, 'access', route);
				}
				if ((permission['modify'])) {
					await this.removePermission(user_group_id, 'modify', route);
				}
			}
		}
	}
}
