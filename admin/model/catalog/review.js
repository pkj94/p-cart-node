const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ModelCatalogReview extends Model {
	async addReview(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "review SET author = '" + this.db.escape(data['author']) + "', product_id = '" + data['product_id'] + "', text = '" + this.db.escape(strip_tags(data['text'])) + "', rating = '" + data['rating'] + "', status = '" + data['status'] + "', date_added = '" + this.db.escape(data['date_added']) + "'");

		const review_id = this.db.getLastId();

		await this.cache.delete('product');

		return review_id;
	}

	async editReview(review_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "review SET author = '" + this.db.escape(data['author']) + "', product_id = '" + data['product_id'] + "', text = '" + this.db.escape(strip_tags(data['text'])) + "', rating = '" + data['rating'] + "', status = '" + data['status'] + "', date_added = '" + this.db.escape(data['date_added']) + "', date_modified = NOW() WHERE review_id = '" + review_id + "'");

		await this.cache.delete('product');
	}

	async deleteReview(review_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "review WHERE review_id = '" + review_id + "'");

		await this.cache.delete('product');
	}

	async getReview(review_id) {
		const query = await this.db.query("SELECT DISTINCT *, (SELECT pd.name FROM " + DB_PREFIX + "product_description pd WHERE pd.product_id = r.product_id AND pd.language_id = '" + this.config.get('config_language_id') + "') AS product FROM " + DB_PREFIX + "review r WHERE r.review_id = '" + review_id + "'");

		return query.row;
	}

	async getReviews(data = {}) {
		let sql = "SELECT r.review_id, pd.name, r.author, r.rating, r.status, r.date_added FROM " + DB_PREFIX + "review r LEFT JOIN " + DB_PREFIX + "product_description pd ON (r.product_id = pd.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_product'])) {
			sql += " AND pd.name LIKE '" + this.db.escape(data['filter_product']) + "%'";
		}

		if ((data['filter_author'])) {
			sql += " AND r.author LIKE '" + this.db.escape(data['filter_author']) + "%'";
		}

		if ((data['filter_status']) && data['filter_status'] !== '') {
			sql += " AND r.status = '" + data['filter_status'] + "'";
		}

		if ((data['filter_date_added'])) {
			sql += " AND DATE(r.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		let sort_data = [
			'pd.name',
			'r.author',
			'r.rating',
			'r.status',
			'r.date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY r.date_added";
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

	async getTotalReviews(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM " + DB_PREFIX + "review r LEFT JOIN " + DB_PREFIX + "product_description pd ON (r.product_id = pd.product_id) WHERE pd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_product'])) {
			sql += " AND pd.name LIKE '" + this.db.escape(data['filter_product']) + "%'";
		}

		if ((data['filter_author'])) {
			sql += " AND r.author LIKE '" + this.db.escape(data['filter_author']) + "%'";
		}

		if ((data['filter_status']) && data['filter_status'] !== '') {
			sql += " AND r.status = '" + data['filter_status'] + "'";
		}

		if ((data['filter_date_added'])) {
			sql += " AND DATE(r.date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')";
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}

	async getTotalReviewsAwaitingApproval() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "review WHERE status = '0'");

		return query.row['total'];
	}
}