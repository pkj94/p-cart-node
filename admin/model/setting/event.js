module.exports = class ModelSettingEvent extends Model {
	async addEvent(code, trigger, action, status = 1, sort_order = 0) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "event` SET `code` = '" + this.db.escape(code) + "', `trigger` = '" + this.db.escape(trigger) + "', `action` = '" + this.db.escape(action) + "', `sort_order` = '" + sort_order + "', `status` = '" + status + "'");

		return this.db.getLastId();
	}

	async deleteEvent(event_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `event_id` = '" + event_id + "'");
	}

	async deleteEventByCode(code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "event` WHERE `code` = '" + this.db.escape(code) + "'");
	}

	async enableEvent(event_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "event` SET `status` = '1' WHERE event_id = '" + event_id + "'");
	}

	async disableEvent(event_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "event` SET `status` = '0' WHERE event_id = '" + event_id + "'");
	}

	async uninstall(type, code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "extension` WHERE `type` = '" + this.db.escape(type) + "' AND `code` = '" + this.db.escape(code) + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `code` = '" + this.db.escape(code) + "'");
	}

	async getEvent(event_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "event` WHERE `event_id` = '" + event_id + "' LIMIT 1");

		return query.row;
	}

	async getEventByCode(code) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "event` WHERE `code` = '" + this.db.escape(code) + "' LIMIT 1");

		return query.row;
	}

	async getEvents(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "event`";

		let sort_data = [
			'code',
			'trigger',
			'action',
			'sort_order',
			'status',
			'date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY `" + data['sort'] + "`";
		} else {
			sql += " ORDER BY `sort_order`";
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

	async getTotalEvents() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "event`");

		return query.row['total'];
	}
}