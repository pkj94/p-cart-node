<?php
namespace Opencart\Admin\Model\Extension\Opencart\Report;
/**
 * Class ProductViewed
 *
 * @package Opencart\Admin\Model\Extension\Opencart\Report
 */
class ProductViewedModel extends Model {
	/**
	 * @return void
	 */
	async install() {
		this.db.query("CREATE TABLE IF NOT EXISTS `" + DB_PREFIX + "product_viewed` (
		  `product_id` INT(11) NOT NULL,
		  `viewed` INT(11) NOT NULL,
		  PRIMARY KEY (`product_id`)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci");
	}

	/**
	 * @return void
	 */
	async uninstall() {
		this.db.query("DROP TABLE IF EXISTS `" + DB_PREFIX + "product_viewed`");
	}

	/**
	 * @param int product_id
	 * @param int viewed
	 *
	 * @return void
	 */
	async addReport(int product_id, int viewed) {
		this.db.query("INSERT INTO `" + DB_PREFIX + "product_viewed` SET `product_id` = '" + product_id + "', `viewed` = '" + viewed + "'");
	}

	/**
	 * @param int start
	 * @param int limit
	 *
	 * @return array
	 */
	async getViewed(int start = 0, int limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT `product_id`, `viewed` FROM `" + DB_PREFIX + "product_viewed` ORDER BY `viewed` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalViewed() {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "product_viewed`");

		return query.row['total'];
	}

	/**
	 * @return int
	 */
	async getTotal() {
		let query = await this.db.query("SELECT SUM(`viewed`) AS `total` FROM `" + DB_PREFIX + "product_viewed`");

		return query.row['total'];
	}

	/**
	 * @return void
	 */
	async clear() {
		this.db.query("TRUNCATE TABLE `" + DB_PREFIX + "product_viewed`");
	}
}
