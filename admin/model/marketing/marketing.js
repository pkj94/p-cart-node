module.exports = class ModelMarketingMarketing extends Model {
	async addMarketing(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "marketing SET name = '" + this.db.escape(data['name']) + "', description = '" + this.db.escape(data['description']) + "', code = '" + this.db.escape(data['code']) + "', date_added = NOW()");

		return this.db.getLastId();
	}

	async editMarketing(marketing_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "marketing SET name = '" + this.db.escape(data['name']) + "', description = '" + this.db.escape(data['description']) + "', code = '" + this.db.escape(data['code']) + "' WHERE marketing_id = '" + marketing_id + "'");
	}

	async deleteMarketing(marketing_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "marketing WHERE marketing_id = '" + marketing_id + "'");
	}

	async getMarketing(marketing_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "marketing WHERE marketing_id = '" + marketing_id + "'");

		return query.row;
	}

	async getMarketingByCode(code) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "marketing WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}

	async getMarketings(data = {}) {
		let implode = [];

		order_statuses = this.config.get('config_complete_status');

		for (let order_status_id of order_statuses) {
			implode.push("o.order_status_id = '" + order_status_id + "'";
		}

		let sql = "SELECT *, (SELECT COUNT(*) FROM `" + DB_PREFIX + "order` o WHERE (" + implode.join(" OR ") + ") AND o.marketing_id = m.marketing_id) AS orders FROM " + DB_PREFIX + "marketing m";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("m.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		if ((data['filter_code'])) {
			implode.push("m.code = '" + this.db.escape(data['filter_code']) + "'";
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(m.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'm.name',
			'm.code',
			'm.date_added'
		});

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY m.name";
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

	async getTotalMarketings(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM " + DB_PREFIX + "marketing";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("name LIKE '" + this.db.escape(data['filter_name']) + "'";
		}

		if ((data['filter_code'])) {
			implode.push("code = '" + this.db.escape(data['filter_code']) + "'";
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
}