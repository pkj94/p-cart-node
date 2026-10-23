module.exports =class Extension extends global['OpencartSystemEngineModel'] {
	/**
	 * @return array
	 */
	async getExtensions() {
		// Read on every request, so kept in the cache; admin/model/setting/extension.js clears it on change
		let extension_data = await this.cache.get('extension.folders');

		if (!extension_data) {
			const query = await this.db.query("SELECT DISTINCT `extension` FROM `" + DB_PREFIX + "extension`");
			extension_data = query.rows;

			await this.cache.set('extension.folders', extension_data);
		}

		return extension_data;
	}

	/**
	 * @param string type
	 *
	 * @return array
	 */
	async getExtensionsByType(type) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension` WHERE `type` = " + this.db.escape(type) );

		return query.rows;
	}

	/**
	 * @param string type
	 * @param string code
	 *
	 * @return array
	 */
	async getExtensionByCode(type, code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension` WHERE `type` = " + this.db.escape(type) + " AND `code` = " + this.db.escape(code) + "");

		return query.row;
	}
}