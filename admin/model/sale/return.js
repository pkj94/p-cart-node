module.exports = class ModelSaleReturn extends Model {
	async addReturn(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "return` SET order_id = '" + data['order_id'] + "', product_id = '" + data['product_id'] + "', customer_id = '" + data['customer_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', product = '" + this.db.escape(data['product']) + "', model = '" + this.db.escape(data['model']) + "', quantity = '" + data['quantity'] + "', opened = '" + data['opened'] + "', return_reason_id = '" + data['return_reason_id'] + "', return_action_id = '" + data['return_action_id'] + "', return_status_id = '" + data['return_status_id'] + "', comment = '" + this.db.escape(data['comment']) + "', date_ordered = '" + this.db.escape(data['date_ordered']) + "', date_added = NOW(), date_modified = NOW()");

		return this.db.getLastId();
	}

	async editReturn(return_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "return` SET order_id = '" + data['order_id'] + "', product_id = '" + data['product_id'] + "', customer_id = '" + data['customer_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', product = '" + this.db.escape(data['product']) + "', model = '" + this.db.escape(data['model']) + "', quantity = '" + data['quantity'] + "', opened = '" + data['opened'] + "', return_reason_id = '" + data['return_reason_id'] + "', return_action_id = '" + data['return_action_id'] + "', comment = '" + this.db.escape(data['comment']) + "', date_ordered = '" + this.db.escape(data['date_ordered']) + "', date_modified = NOW() WHERE return_id = '" + return_id + "'");
	}

	async deleteReturn(return_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return` WHERE `return_id` = '" + return_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "return_history` WHERE `return_id` = '" + return_id + "'");
	}

	async getReturn(return_id) {
		const query = await this.db.query("SELECT DISTINCT *, (SELECT CONCAT(c.firstname, ' ', c.lastname) FROM " + DB_PREFIX + "customer c WHERE c.customer_id = r.customer_id) AS customer, (SELECT rs.name FROM " + DB_PREFIX + "return_status rs WHERE rs.return_status_id = r.return_status_id AND rs.language_id = '" + this.config.get('config_language_id') + "') AS return_status FROM `" + DB_PREFIX + "return` r WHERE r.return_id = '" + return_id + "'");

		return query.row;
	}

	async getReturns(data = {}) {
		let sql = "SELECT *, CONCAT(r.firstname, ' ', r.lastname) AS customer, (SELECT rs.name FROM " + DB_PREFIX + "return_status rs WHERE rs.return_status_id = r.return_status_id AND rs.language_id = '" + this.config.get('config_language_id') + "') AS return_status FROM `" + DB_PREFIX + "return` r";

		let implode = [];

		if ((data['filter_return_id'])) {
			implode.push("r.return_id = '" + data['filter_return_id'] + "'");
		}

		if ((data['filter_order_id'])) {
			implode.push("r.order_id = '" + data['filter_order_id'] + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(r.firstname, ' ', r.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "%'");
		}

		if ((data['filter_product'])) {
			implode.push("r.product = '" + this.db.escape(data['filter_product']) + "'");
		}

		if ((data['filter_model'])) {
			implode.push("r.model = '" + this.db.escape(data['filter_model']) + "'");
		}

		if ((data['filter_return_status_id'])) {
			implode.push("r.return_status_id = '" + data['filter_return_status_id'] + "'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(r.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if ((data['filter_date_modified'])) {
			implode.push("DATE(r.date_modified) = DATE('" + this.db.escape(data['filter_date_modified']) + "')");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'r.return_id',
			'r.order_id',
			'customer',
			'r.product',
			'r.model',
			'status',
			'r.date_added',
			'r.date_modified'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY r.return_id";
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

	async getTotalReturns(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "return`r";

		let implode = [];

		if ((data['filter_return_id'])) {
			implode.push("r.return_id = '" + data['filter_return_id'] + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(r.firstname, ' ', r.lastname) LIKE '" + this.db.escape(data['filter_customer']) + "%'");
		}

		if ((data['filter_order_id'])) {
			implode.push("r.order_id = '" + this.db.escape(data['filter_order_id']) + "'");
		}

		if ((data['filter_product'])) {
			implode.push("r.product = '" + this.db.escape(data['filter_product']) + "'");
		}

		if ((data['filter_model'])) {
			implode.push("r.model = '" + this.db.escape(data['filter_model']) + "'");
		}

		if ((data['filter_return_status_id'])) {
			implode.push("r.return_status_id = '" + data['filter_return_status_id'] + "'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(r.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if ((data['filter_date_modified'])) {
			implode.push("DATE(r.date_modified) = DATE('" + this.db.escape(data['filter_date_modified']) + "')");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getTotalReturnsByReturnStatusId(return_status_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "return` WHERE return_status_id = '" + return_status_id + "'");

		return query.row['total'];
	}

	async getTotalReturnsByReturnReasonId(return_reason_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "return` WHERE return_reason_id = '" + return_reason_id + "'");

		return query.row['total'];
	}

	async getTotalReturnsByReturnActionId(return_action_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "return` WHERE return_action_id = '" + return_action_id + "'");

		return query.row['total'];
	}

	async addReturnHistory(return_id, return_status_id, comment, notify) {
		await this.db.query("UPDATE `" + DB_PREFIX + "return` SET `return_status_id` = '" + return_status_id + "', date_modified = NOW() WHERE return_id = '" + return_id + "'");
		await this.db.query("INSERT INTO `" + DB_PREFIX + "return_history` SET `return_id` = '" + return_id + "', return_status_id = '" + return_status_id + "', notify = '" + notify + "', comment = '" + this.db.escape(strip_tags(comment)) + "', date_added = NOW()");
	}

	async getReturnHistories(return_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT rh.date_added, rs.name AS status, rh.comment, rh.notify FROM " + DB_PREFIX + "return_history rh LEFT JOIN " + DB_PREFIX + "return_status rs ON rh.return_status_id = rs.return_status_id WHERE rh.return_id = '" + return_id + "' AND rs.language_id = '" + this.config.get('config_language_id') + "' ORDER BY rh.date_added DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalReturnHistories(return_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "return_history WHERE return_id = '" + return_id + "'");

		return query.row['total'];
	}

	async getTotalReturnHistoriesByReturnStatusId(return_status_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "return_history WHERE return_status_id = '" + return_status_id + "'");

		return query.row['total'];
	}
}