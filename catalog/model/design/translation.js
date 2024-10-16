module.exports =class TranslationController extends Model {
	/**
	 * @param string route
	 *
	 * @return array
	 */
	async getTranslations(route) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "translation` WHERE `store_id` = '" + this.config.get('config_store_id') + "' AND `language_id` = '" + this.config.get('config_language_id') + "' AND `route` = '" + this.db.escape(route) + "'");

		return query.rows;
	}
}
