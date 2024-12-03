module.exports = class ModelSaleVoucher extends Model {
	async addVoucher(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "voucher SET code = '" + this.db.escape(data['code']) + "', from_name = '" + this.db.escape(data['from_name']) + "', from_email = '" + this.db.escape(data['from_email']) + "', to_name = '" + this.db.escape(data['to_name']) + "', to_email = '" + this.db.escape(data['to_email']) + "', voucher_theme_id = '" + data['voucher_theme_id'] + "', message = '" + this.db.escape(data['message']) + "', amount = '" + data['amount'] + "', status = '" + data['status'] + "', date_added = NOW()");

		return this.db.getLastId();
	}

	async editVoucher(voucher_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "voucher SET code = '" + this.db.escape(data['code']) + "', from_name = '" + this.db.escape(data['from_name']) + "', from_email = '" + this.db.escape(data['from_email']) + "', to_name = '" + this.db.escape(data['to_name']) + "', to_email = '" + this.db.escape(data['to_email']) + "', voucher_theme_id = '" + data['voucher_theme_id'] + "', message = '" + this.db.escape(data['message']) + "', amount = '" + data['amount'] + "', status = '" + data['status'] + "' WHERE voucher_id = '" + voucher_id + "'");
	}

	async deleteVoucher(voucher_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "voucher WHERE voucher_id = '" + voucher_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "voucher_history WHERE voucher_id = '" + voucher_id + "'");
	}

	async getVoucher(voucher_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "voucher WHERE voucher_id = '" + voucher_id + "'");

		return query.row;
	}

	async getVoucherByCode(code) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "voucher WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}

	async getVouchers(data = {}) {
		let sql = "SELECT v.voucher_id, v.order_id, v.code, v.from_name, v.from_email, v.to_name, v.to_email, (SELECT vtd.name FROM " + DB_PREFIX + "voucher_theme_description vtd WHERE vtd.voucher_theme_id = v.voucher_theme_id AND vtd.language_id = '" + this.config.get('config_language_id') + "') AS theme, v.amount, v.status, v.date_added FROM " + DB_PREFIX + "voucher v";

		let sort_data = [
			'v.code',
			'v.from_name',
			'v.to_name',
			'theme',
			'v.amount',
			'v.status',
			'v.date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY v.date_added";
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

	async getTotalVouchers() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "voucher");

		return query.row['total'];
	}

	async getTotalVouchersByVoucherThemeId(voucher_theme_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "voucher WHERE voucher_theme_id = '" + voucher_theme_id + "'");

		return query.row['total'];
	}

	async getVoucherHistories(voucher_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT vh.order_id, CONCAT(o.firstname, ' ', o.lastname) AS customer, vh.amount, vh.date_added FROM " + DB_PREFIX + "voucher_history vh LEFT JOIN `" + DB_PREFIX + "order` o ON (vh.order_id = o.order_id) WHERE vh.voucher_id = '" + voucher_id + "' ORDER BY vh.date_added ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalVoucherHistories(voucher_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "voucher_history WHERE voucher_id = '" + voucher_id + "'");

		return query.row['total'];
	}
}
