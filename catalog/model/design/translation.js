module.exports = class ModelDesignTranslation extends Model {
	async getTranslations(route) {
		const language_code = (this.session.data['language']) ? this.session.data['language'] : this.config.get('config_language');

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "translation WHERE store_id = '" + this.config.get('config_store_id') + "' AND language_id = '" + this.config.get('config_language_id') + "' AND (route = '" + this.db.escape(route) + "' OR route = '" + this.db.escape(language_code) + "')");

		return query.rows;
	}
}
