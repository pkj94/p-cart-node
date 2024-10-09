module.exports = class ReviewCatalogModel extends Model {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addReview(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "review` SET `author` = " + this.db.escape(data['author']) + ", `product_id` = '" + data['product_id'] + "', `text` = " + this.db.escape(strip_tags(data['text'])) + ", `rating` = '" + data['rating'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_added` = " + this.db.escape(data['date_added']));

		const review_id = this.db.getLastId();

		// Update product rating
		this.load.model('catalog/product', this);

		this.registry.get('model_catalog_product').editRating(data['product_id'], this.getRating(data['product_id']));

		await this.cache.delete('product');

		return review_id;
	}

	/**
	 * @param   review_id
	 * @param data
	 *
	 * @return void
	 */
	async editReview(review_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "review` SET `author` = " + this.db.escape(data['author']) + ", `product_id` = '" + data['product_id'] + "', `text` = " + this.db.escape(strip_tags(data['text'])) + ", `rating` = '" + data['rating'] + "', `status` = '" + (data['status'] ? data['status'] : 0) + "', `date_added` = " + this.db.escape(data['date_added']) + ", `date_modified` = NOW() WHERE `review_id` = '" + review_id + "'");

		// Update product rating
		this.load.model('catalog/product', this);

		this.registry.get('model_catalog_product').editRating(data['product_id'], this.getRating(data['product_id']));

		await this.cache.delete('product');
	}

	/**
	 * @param review_id
	 *
	 * @return void
	 */
	async deleteReview(review_id) {
		const review_info = await this.getReview(review_id);

		if (review_info && review_info.review_id) {
			await this.db.query("DELETE FROM `" + DB_PREFIX + "review` WHERE `review_id` = '" + review_info['review_id'] + "'");

			// Update product rating
			this.load.model('catalog/product', this);

			this.registry.get('model_catalog_product').editRating(review_info['product_id'], this.getRating(review_info['product_id']));

			await this.cache.delete('product');
		}
	}

	/**
	 * @param review_id
	 *
	 * @return array
	 */
	async getReview(review_id) {
		let query = await this.db.query("SELECT DISTINCT *, (SELECT pd.`name` FROM `" + DB_PREFIX + "product_description` pd WHERE pd.`product_id` = r.`product_id` AND pd.`language_id` = '" + this.config.get('config_language_id') + "') AS product FROM `" + DB_PREFIX + "review` r WHERE r.`review_id` = '" + review_id + "'");

		return query.row;
	}

	/**
	 * @param product_id
	 *
	 * @return int
	 */
	async getRating(product_id) {
		let query = await this.db.query("SELECT AVG(`rating`) AS `total` FROM `" + DB_PREFIX + "review` WHERE `product_id` = '" + product_id + "' AND `status` = '1'");

		if (query.num_rows) {
			return query.row['total'];
		} else {
			return 0;
		}
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getReviews(data = {}) {
		let sql = "SELECT r.`review_id`, pd.`name`, r.`author`, r.`rating`, r.`status`, r.`date_added` FROM `" + DB_PREFIX + "review` r LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (r.`product_id` = pd.`product_id`) WHERE pd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_product'])) {
			sql += " AND pd.`name` LIKE " + this.db.escape(data['filter_product'] + '%');
		}

		if ((data['filter_author'])) {
			sql += " AND r.`author` LIKE " + this.db.escape(data['filter_author'] + '%');
		}

		if (typeof data['filter_status'] != 'undefined' && data['filter_status'] !== '') {
			sql += " AND r.`status` = '" + data['filter_status'] + "'";
		}

		if ((data['filter_date_from'])) {
			sql += " AND DATE(r.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			sql += " AND DATE(r.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		let sort_data = [
			'pd.name',
			'r.author',
			'r.rating',
			'r.status',
			'r.date_added'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY r.`date_added`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
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

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalReviews(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "review` r LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (r.`product_id` = pd.`product_id`) WHERE pd.`language_id` = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_product'])) {
			sql += " AND pd.`name` LIKE " + this.db.escape(data['filter_product'] + '%');
		}

		if ((data['filter_author'])) {
			sql += " AND r.`author` LIKE " + this.db.escape(data['filter_author'] + '%');
		}

		if (typeof data['filter_status'] != 'undefined' && data['filter_status'] !== '') {
			sql += " AND r.`status` = '" + data['filter_status'] + "'";
		}

		if ((data['filter_date_from'])) {
			sql += " AND DATE(r.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")";
		}

		if ((data['filter_date_to'])) {
			sql += " AND DATE(r.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")";
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @return int
	 */
	async getTotalReviewsAwaitingApproval() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "review` WHERE `status` = '0'");

		return query.row['total'];
	}
}
