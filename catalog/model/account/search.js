module.exports =class Search extends global['OpencartSystemEngineModel'] {
	/**
	 * @param data
	 *
	 * @return void
	 */
	async addSearch(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_search` SET `store_id` = " + this.db.quote(this.config.get('config_store_id')) + ", `language_id` = " + this.db.quote(this.config.get('config_language_id')) + ", `customer_id` = " + this.db.quote(data['customer_id']) + ", `keyword` = " + this.db.escape(data['keyword']) + ", `category_id` = " + this.db.quote(data['category_id']) + ", `sub_category` = " + this.db.quote(data['sub_category']) + ", `description` = " + this.db.quote(data['description']) + ", `products` = " + this.db.quote(data['products']) + ", `ip` = " + this.db.escape(data['ip']) + ", `date_added` = NOW()");
	}
}
