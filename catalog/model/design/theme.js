module.exports = class ModelDesignTheme extends Model {
	async getTheme(route, theme) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "theme` WHERE `store_id` = '" + this.config.get('config_store_id') + "' AND `theme` = '" + this.db.escape(theme) + "' AND `route` = '" + this.db.escape(route) + "'");
		return query.row;
	}
}