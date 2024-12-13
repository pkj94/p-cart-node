module.exports = class ModelAccountWishlist extends Model {
	async addWishlist(product_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_wishlist WHERE customer_id = '" + await this.customer.getId() + "' AND product_id = '" + product_id + "'");

		await this.db.query("INSERT INTO " + DB_PREFIX + "customer_wishlist SET customer_id = '" + await this.customer.getId() + "', product_id = '" + product_id + "', date_added = NOW()");
	}

	async deleteWishlist(product_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_wishlist WHERE customer_id = '" + await this.customer.getId() + "' AND product_id = '" + product_id + "'");
	}

	async getWishlist() {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_wishlist WHERE customer_id = '" + await this.customer.getId() + "'");

		return query.rows;
	}

	async getTotalWishlist() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "customer_wishlist WHERE customer_id = '" + await this.customer.getId() + "'");

		return query.row['total'];
	}
}
