module.exports = class NotificationToolModel  extends Model {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addNotification(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "notification` SET `title` = '" + this.db.escape(data['title']) + "', `text` = '" + this.db.escape(data['text']) + "', `status` = '" + data['status'] + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param  notification_id
	 * @param status
	 *
	 * @return void
	 */
	async editStatus(notification_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "notification` SET `status` = '" + status + "' WHERE `notification_id` = '" + notification_id + "'");
	}

	/**
	 * @param notification_id
	 *
	 * @return void
	 */
	async deleteNotification(notification_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "notification` WHERE `notification_id` = '" + notification_id + "'");
	}

	/**
	 * @param notification_id
	 *
	 * @return array
	 */
	async getNotification(notification_id) {
		let query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "notification` WHERE `notification_id` = '" + notification_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getNotifications(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "notification`";

		if (data['filter_status'] && data['filter_status'] !== '') {
			sql += " WHERE `status` = '" + data['filter_status'] + "'";
		}

		sql += " ORDER BY `date_added` DESC";

		if (data['start'] || data['limit']) {
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

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalNotifications(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "notification`";

		if (data['filter_status'] && data['filter_status'] !== '') {
			sql += " WHERE `status` = '" + data['filter_status'] + "'";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}
}
