const array_diff = require("locutus/php/array/array_diff");

module.exports = class UserGroupUserModel extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addUserGroup(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "user_group` SET `name` = " + this.db.escape(data['name']) + ", `permission` = " + this.db.escape(JSON.stringify(data['permission'] || {})));

		return this.db.getLastId();
	}

	/**
	 * @param   user_group_id
	 * @param data
	 *
	 * @return void
	 */
	async editUserGroup(user_group_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "user_group` SET `name` = " + this.db.escape(data['name']) + ", `permission` = " + this.db.escape(JSON.stringify(data['permission'] || {})) + " WHERE `user_group_id` = '" + user_group_id + "'");
	}

	/**
	 * @param user_group_id
	 *
	 * @return void
	 */
	async deleteUserGroup(user_group_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "user_group` WHERE `user_group_id` = '" + user_group_id + "'");
	}

	/**
	 * @param user_group_id
	 *
	 * @return array
	 */
	async getUserGroup(user_group_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "user_group` WHERE `user_group_id` = '" + user_group_id + "'");

		const user_group = {
			'name': query.row['name'],
			'permission': query.row['permission'] ? JSON.parse(query.row['permission']) : { access: [], modify: [] }
		};

		return user_group;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getUserGroups(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "user_group` ORDER BY `name`";

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
	async getTotalUserGroups() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "user_group`");

		return query.row['total'];
	}

	/**
	 * @param    user_group_id
	 * @param type
	 * @param route
	 *
	 * @return void
	 */
	async addPermission(user_group_id, type, route) {
		const user_group_query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "user_group` WHERE `user_group_id` = '" + user_group_id + "'");

		if (user_group_query.num_rows) {
			let data = JSON.parse(user_group_query.row['permission']);
			data[type] = data[type] || [];
			data[type].push(route);

			await this.db.query("UPDATE `" + DB_PREFIX + "user_group` SET `permission` = " + this.db.escape(JSON.stringify(data)) + " WHERE `user_group_id` = '" + user_group_id + "'");
		}
	}

	/**
	 * @param    user_group_id
	 * @param type
	 * @param route
	 *
	 * @return void
	 */
	async removePermission(user_group_id, type, route) {
		const user_group_query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "user_group` WHERE `user_group_id` = '" + user_group_id + "'");

		if (user_group_query.num_rows) {
			let data = JSON.parse(user_group_query.row['permission'], true);

			if ((data[type])) {
				data[type] = array_diff(data[type], [route]);
			}

			await this.db.query("UPDATE `" + DB_PREFIX + "user_group` SET `permission` = " + this.db.escape(JSON.stringify(data)) + " WHERE `user_group_id` = '" + user_group_id + "'");
		}
	}
}
