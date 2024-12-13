module.exports = class ModelSettingStore extends Model {
	async getStores() {
		let store_data = await this.cache.get('store');

		if (!store_data) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "store ORDER BY url");

			store_data = query.rows;

			await this.cache.set('store', store_data);
		}

		return store_data;
	}
}