module.exports=class Review extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param   product_id
	 * @param data
	 *
	 * @return int
	 */
	async addReview(product_id, data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "review` SET `author` = " + this.db.escape(data['name']) + ", `customer_id` = '" + await this.customer.getId() + "', `product_id` = '" + product_id + "', `text` = " + this.db.escape(data['text']) + ", `rating` = '" + data['rating'] + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	/**
	 * @param product_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getReviewsByProductId(product_id, start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 20;
		}

		const query = await this.db.query("SELECT r.`author`, r.`rating`, r.`text`, r.`date_added` FROM `" + DB_PREFIX + "review` r LEFT JOIN `" + DB_PREFIX + "product` p ON (r.`product_id` = p.`product_id`) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.`product_id` = pd.`product_id`) WHERE r.`product_id` = '" + product_id + "' AND p.`date_available` <= NOW() AND p.`status` = '1' AND r.`status` = '1' AND pd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY r.`date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param product_id
	 *
	 * @return int
	 */
	async getTotalReviewsByProductId(product_id) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "review` r LEFT JOIN `" + DB_PREFIX + "product` p ON (r.`product_id` = p.`product_id`) LEFT JOIN `" + DB_PREFIX + "product_description` pd ON (p.`product_id` = pd.`product_id`) WHERE p.`product_id` = '" + product_id + "' AND p.`date_available` <= NOW() AND p.`status` = '1' AND r.`status` = '1' AND pd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row['total'];
	}
}
