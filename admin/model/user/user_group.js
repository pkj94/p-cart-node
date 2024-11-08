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

		user_group = array(
			'name'       : query.row['name'],
			'permission' : JSON.parse(query.row['permission'], true)
		);

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

	async getTotalUserGroups() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "user_group");

		return query.row['total'];
	}

	async addPermission(user_group_id, type, route) {
		user_group_query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_group_id + "'");

		if (user_group_query.num_rows) {
			data = JSON.parse(user_group_query.row['permission'], true);

			data[type][] = route;

			await this.db.query("UPDATE " + DB_PREFIX + "user_group SET permission = '" + this.db.escape(JSON.stringify(data)) + "' WHERE user_group_id = '" + user_group_id + "'");
		}
	}

	async removePermission(user_group_id, type, route) {
		user_group_query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_group_id + "'");

		if (user_group_query.num_rows) {
			data = JSON.parse(user_group_query.row['permission'], true);

			data[type] = array_diff(data[type], array(route));

			await this.db.query("UPDATE " + DB_PREFIX + "user_group SET permission = '" + this.db.escape(JSON.stringify(data)) + "' WHERE user_group_id = '" + user_group_id + "'");
		}
	}

	async removePermissions( string route ): void {
		user_groups = this.getUserGroups();
		for (user_groups of user_group) {
			user_group_id = user_group['user_group_id'];
			permission = user_group['permission'];
			if ((permission)) {
				permission = JSON.parse(permission,true);
				if ((permission['access'])) {
					this.removePermission(user_group_id, 'access', route);
				}
				if ((permission['modify'])) {
					this.removePermission(user_group_id, 'modify', route);
				}
			}
		}
	}
}
