module.exports =class WishlistModel extends Model {
	/**
	 * @param product_id
	 *
	 * @return void
	 */
	async addWishlist(product_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_wishlist` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `product_id` = '" + product_id + "'");

		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_wishlist` SET `customer_id` = '" + await this.customer.getId() + "', `product_id` = '" + product_id + "', `date_added` = NOW()");
	}

	/**
	 * @param product_id
	 *
	 * @return void
	 */
	async deleteWishlist(product_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_wishlist` WHERE `customer_id` = '" + await this.customer.getId() + "' AND `product_id` = '" + product_id + "'");
	}

	/**
	 * @return array
	 */
	async getWishlist() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_wishlist` WHERE `customer_id` = '" + await this.customer.getId() + "'");

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalWishlist() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_wishlist` WHERE `customer_id` = '" + await this.customer.getId() + "'");

		return query.row['total'];
	}
}
