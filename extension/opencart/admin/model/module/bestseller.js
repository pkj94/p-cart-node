module.exports = class BestsellerModuleModel extends Model {
	/**
	 * @return void
	 */
	async install() {
		await this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "product_bestseller` ( `product_id` int(11) NOT NULL, `total` int(11) NOT NULL, PRIMARY KEY (`product_id`) ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
	}

	/**
	 * @return void
	 */
	async uninstall() {
		await this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "product_bestseller`");
	}

	/**
	 * @param int product_id
	 * @param int total
	 *
	 * @return void
	 */
	async editTotal(product_id, total) {
		await this.db.query("REPLACE INTO `" + DB_PREFIX + "product_bestseller` SET `product_id` = '" + product_id + "', `total` = '" + total + "'");
	}

	/**
	 * @param int product_id
	 *
	 * @return void
	 */
	async delete(product_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "product_bestseller` WHERE `product_id` = '" + product_id + "'");
	}

	/**
	 * @param int start
	 * @param int limit
	 *
	 * @return array
	 */
	async getReports(start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await await this.db.query("SELECT * FROM `" + DB_PREFIX + "product_bestseller` ORDER BY `total` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalReports() {
		let query = await await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_bestseller`");

		return query.row['total'];
	}
}
