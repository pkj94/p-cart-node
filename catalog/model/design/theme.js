module.exports = class Theme extends Model {
	/**
	 * @param string route
	 *
	 * @return array
	 */
	async getTheme(route) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "theme` WHERE `store_id` = '" + this.config.get('config_store_id') + "' AND `route` = " + this.db.escape(route));

		return query.row;
	}
}