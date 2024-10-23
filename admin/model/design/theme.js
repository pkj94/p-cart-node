module.exports = class ThemeDesignModel  extends global['\Opencart\System\Engine\Model'] {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param    store_id
	 * @param route
	 * @param code
	 *
	 * @return void
	 */
	async editTheme(store_id, route, code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "theme` WHERE `store_id` = '" + store_id + "' AND `route` = " + this.db.escape(route) );
		
		await this.db.query("INSERT INTO `" + DB_PREFIX + "theme` SET `store_id` = '" + store_id + "', `route` = " + this.db.escape(route) + ", `code` = " + this.db.escape(code) + ", `date_added` = NOW()");
	}

	/**
	 * @param theme_id
	 *
	 * @return void
	 */
	async deleteTheme(theme_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "theme` WHERE `theme_id` = '" + theme_id + "'");
	}

	/**
	 * @param    store_id
	 * @param route
	 *
	 * @return array
	 */
	async getTheme(store_id, route) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "theme` WHERE `store_id` = '" + store_id + "' AND `route` = " + this.db.escape(route) );

		return query.row;
	}

	/**
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getThemes(start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}		
		
		let query = await this.db.query("SELECT *, (SELECT `name` FROM `" + DB_PREFIX + "store` s WHERE s.`store_id` = t.`store_id`) AS `store` FROM `" + DB_PREFIX + "theme` t ORDER BY t.`date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalThemes() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "theme`");

		return query.row['total'];
	}	
}