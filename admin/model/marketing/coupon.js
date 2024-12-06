module.exports = class ModelMarketingCoupon extends Model {
	async addCoupon(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "coupon SET name = '" + this.db.escape(data['name']) + "', code = '" + this.db.escape(data['code']) + "', discount = '" + data['discount'] + "', type = '" + this.db.escape(data['type']) + "', total = '" + data['total'] + "', logged = '" + data['logged'] + "', shipping = '" + data['shipping'] + "', date_start = '" + this.db.escape(data['date_start']) + "', date_end = '" + this.db.escape(data['date_end']) + "', uses_total = '" + data['uses_total'] + "', uses_customer = '" + data['uses_customer'] + "', status = '" + data['status'] + "', date_added = NOW()");

		const coupon_id = this.db.getLastId();

		if ((data['coupon_product'])) {
			data['coupon_product'] = Array.isArray(data['coupon_product']) ? data['coupon_product'] : [data['coupon_product']];
			for (let product_id of data['coupon_product']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "coupon_product SET coupon_id = '" + coupon_id + "', product_id = '" + product_id + "'");
			}
		}

		if ((data['coupon_category'])) {
			data['coupon_category'] = Array.isArray(data['coupon_category']) ? data['coupon_category'] : [data['coupon_category']];
			for (let category_id of data['coupon_category']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "coupon_category SET coupon_id = '" + coupon_id + "', category_id = '" + category_id + "'");
			}
		}

		return coupon_id;
	}

	async editCoupon(coupon_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "coupon SET name = '" + this.db.escape(data['name']) + "', code = '" + this.db.escape(data['code']) + "', discount = '" + data['discount'] + "', type = '" + this.db.escape(data['type']) + "', total = '" + data['total'] + "', logged = '" + data['logged'] + "', shipping = '" + data['shipping'] + "', date_start = '" + this.db.escape(data['date_start']) + "', date_end = '" + this.db.escape(data['date_end']) + "', uses_total = '" + data['uses_total'] + "', uses_customer = '" + data['uses_customer'] + "', status = '" + data['status'] + "' WHERE coupon_id = '" + coupon_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_product WHERE coupon_id = '" + coupon_id + "'");

		if ((data['coupon_product'])) {
			data['coupon_product'] = Array.isArray(data['coupon_product']) ? data['coupon_product'] : [data['coupon_product']];
			for (let product_id of data['coupon_product']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "coupon_product SET coupon_id = '" + coupon_id + "', product_id = '" + product_id + "'");
			}
		}

		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_category WHERE coupon_id = '" + coupon_id + "'");

		if ((data['coupon_category'])) {
			data['coupon_category'] = Array.isArray(data['coupon_category']) ? data['coupon_category'] : [data['coupon_category']];
			for (let category_id of data['coupon_category']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "coupon_category SET coupon_id = '" + coupon_id + "', category_id = '" + category_id + "'");
			}
		}
	}

	async deleteCoupon(coupon_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon WHERE coupon_id = '" + coupon_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_product WHERE coupon_id = '" + coupon_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_category WHERE coupon_id = '" + coupon_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "coupon_history WHERE coupon_id = '" + coupon_id + "'");
	}

	async getCoupon(coupon_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "coupon WHERE coupon_id = '" + coupon_id + "'");

		return query.row;
	}

	async getCouponByCode(code) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "coupon WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}

	async getCoupons(data = {}) {
		let sql = "SELECT coupon_id, name, code, discount, date_start, date_end, status FROM " + DB_PREFIX + "coupon";

		let sort_data = [
			'name',
			'code',
			'discount',
			'date_start',
			'date_end',
			'status'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY name";
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

	async getCouponProducts(coupon_id) {
		const coupon_product_data = [];

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "coupon_product WHERE coupon_id = '" + coupon_id + "'");

		for (let result of query.rows) {
			coupon_product_data.push(result['product_id']);
		}

		return coupon_product_data;
	}

	async getCouponCategories(coupon_id) {
		const coupon_category_data = [];

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "coupon_category WHERE coupon_id = '" + coupon_id + "'");

		for (let result of query.rows) {
			coupon_category_data.push(result['category_id']);
		}

		return coupon_category_data;
	}

	async getTotalCoupons() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "coupon");

		return query.row['total'];
	}

	async getCouponHistories(coupon_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT ch.order_id, CONCAT(c.firstname, ' ', c.lastname) AS customer, ch.amount, ch.date_added FROM " + DB_PREFIX + "coupon_history ch LEFT JOIN " + DB_PREFIX + "customer c ON (ch.customer_id = c.customer_id) WHERE ch.coupon_id = '" + coupon_id + "' ORDER BY ch.date_added ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getTotalCouponHistories(coupon_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "coupon_history WHERE coupon_id = '" + coupon_id + "'");

		return query.row['total'];
	}
}