module.exports = class Theme extends global['OpencartSystemEngineModel'] {
	/**
	 * @param string route
	 *
	 * @return array
	 */
	async getTheme(route) {
		const themes = await this.getThemes();

		return themes[route] || {};
	}

	/**
	 * Every theme override of the store by route. Asked for each template a page renders (about 20 per
	 * page), so loaded once per request and kept in the cache; admin/model/design/theme.js clears it.
	 *
	 * @return object
	 */
	async getThemes() {
		const store_id = parseInt(this.config.get('config_store_id')) || 0;
		const key = 'theme.store.' + store_id;

		if (!this.registry.has(key)) {
			let theme_data = await this.cache.get(key);

			if (!theme_data) {
				const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "theme` WHERE `store_id` = " + this.db.quote(store_id) + " ORDER BY `theme_id` ASC");

				theme_data = {};

				for (let result of query.rows) {
					if (!(result['route'] in theme_data)) {
						theme_data[result['route']] = result;
					}
				}

				// Made-up ?store_id= values have no rows and are not cached
				if (!store_id || query.num_rows) {
					await this.cache.set(key, theme_data);
				}
			}

			this.registry.set(key, theme_data);
		}

		return this.registry.get(key);
	}
}
