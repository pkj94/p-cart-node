module.exports =class Translation extends global['OpencartSystemEngineModel'] {
	/**
	 * @param string route
	 *
	 * @return array
	 */
	async getTranslations(route) {
		const translations = await this.getAllTranslations();

		return translations[route] || [];
	}

	/**
	 * Every translation override of the store and language, grouped by route. Asked for each language
	 * file a page loads (about 20 per page), so loaded once per request and kept in the cache;
	 * admin/model/design/translation.js clears it.
	 *
	 * @return object
	 */
	async getAllTranslations() {
		const store_id = parseInt(this.config.get('config_store_id')) || 0;
		const language_id = parseInt(this.config.get('config_language_id')) || 0;
		const key = 'translation.' + store_id + '.' + language_id;

		if (!this.registry.has(key)) {
			let translation_data = await this.cache.get(key);

			if (!translation_data) {
				const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "translation` WHERE `store_id` = " + this.db.quote(store_id) + " AND `language_id` = " + this.db.quote(language_id) + " ORDER BY `translation_id` ASC");

				translation_data = {};

				for (let result of query.rows) {
					translation_data[result['route']] = translation_data[result['route']] || [];
					translation_data[result['route']].push(result);
				}

				// Made-up ?store_id= values have no rows and are not cached
				if (!store_id || query.num_rows) {
					await this.cache.set(key, translation_data);
				}
			}

			this.registry.set(key, translation_data);
		}

		return this.registry.get(key);
	}
}
