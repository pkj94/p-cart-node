module.exports = class ModelSettingStore extends Model {
	async addStore(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "store SET name = '" + this.db.escape(data['config_name']) + "', `url` = '" + this.db.escape(data['config_url']) + "', `ssl` = '" + this.db.escape(data['config_ssl']) + "'");

		store_id = this.db.getLastId();

		// Layout Route
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "layout_route WHERE store_id = '0'");

		for (query.rows of layout_route) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "layout_route SET layout_id = '" + layout_route['layout_id'] + "', route = '" + this.db.escape(layout_route['route']) + "', store_id = '" + store_id + "'");
		}

		await this.cache.delete('store');

		return store_id;
	}

	async editStore(store_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "store SET name = '" + this.db.escape(data['config_name']) + "', `url` = '" + this.db.escape(data['config_url']) + "', `ssl` = '" + this.db.escape(data['config_ssl']) + "' WHERE store_id = '" + store_id + "'");

		await this.cache.delete('store');
	}

	async deleteStore(store_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "store WHERE store_id = '" + store_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "layout_route WHERE store_id = '" + store_id + "'");

		await this.cache.delete('store');
	}

	async getStore(store_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "store WHERE store_id = '" + store_id + "'");

		return query.row;
	}

	async getStores(data = {}) {
		let store_data = await this.cache.get('store');

		if (!store_data) {
			const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "store ORDER BY url");

			store_data = query.rows;

			await this.cache.set('store', store_data);
		}

		return store_data;
	}

	async getTotalStores() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "store");

		return query.row['total'];
	}

	async getTotalStoresByLayoutId(layout_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_layout_id' AND `value` = '" + layout_id + "' AND store_id != '0'");

		return query.row['total'];
	}

	async getTotalStoresByLanguage(language) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_language' AND `value` = '" + this.db.escape(language) + "' AND store_id != '0'");

		return query.row['total'];
	}

	async getTotalStoresByCurrency(currency) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_currency' AND `value` = '" + this.db.escape(currency) + "' AND store_id != '0'");

		return query.row['total'];
	}

	async getTotalStoresByCountryId(country_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_country_id' AND `value` = '" + country_id + "' AND store_id != '0'");

		return query.row['total'];
	}

	async getTotalStoresByZoneId(zone_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_zone_id' AND `value` = '" + zone_id + "' AND store_id != '0'");

		return query.row['total'];
	}

	async getTotalStoresByCustomerGroupId(customer_group_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_customer_group_id' AND `value` = '" + customer_group_id + "' AND store_id != '0'");

		return query.row['total'];
	}

	async getTotalStoresByInformationId(information_id) {
		account_query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_account_id' AND `value` = '" + information_id + "' AND store_id != '0'");

		checkout_query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_checkout_id' AND `value` = '" + information_id + "' AND store_id != '0'");

		return (account_query.row['total'] + checkout_query.row['total']);
	}

	async getTotalStoresByOrderStatusId(order_status_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "setting WHERE `key` = 'config_order_status_id' AND `value` = '" + order_status_id + "' AND store_id != '0'");

		return query.row['total'];
	}
}