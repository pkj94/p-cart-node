<?php
namespace Opencart\Catalog\Model\Report;
/**
 *
 *
 * @package Opencart\Catalog\Model\Report
 */
class StatisticsModel extends Model {
	/**
	 * @return array
	 */
	async getStatistics() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "statistics`");

		return query.rows;
	}

	/**
	 * @param string code
	 *
	 * @return float
	 */
	async getValue(code): {
		const query = await this.db.query("SELECT `value` FROM `" + DB_PREFIX + "statistics` WHERE `code` = " + this.db.escape(code) + "");

		if (query.num_rows) {
			return query.row['value'];
		} else {
			return 0;
		}
	}

	/**
	 * @param string code
	 * @param  value
	 *
	 * @return void
	 */
	async addValue(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "statistics` SET `value` = (`value` + '" + value + "') WHERE `code` = " + this.db.escape(code) + "");
	}

	/**
	 * @param string code
	 * @param  value
	 *
	 * @return void
	 */
	async removeValue(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "statistics` SET `value` = (`value` - '" + value + "') WHERE `code` = " + this.db.escape(code) + "");
	}

	/**
	 * @param string code
	 * @param  value
	 *
	 * @return void
	 */
	async editValue(code, value) {
		await this.db.query("UPDATE `" + DB_PREFIX + "statistics` SET `value` = '" + value + "' WHERE `code` = " + this.db.escape(code) + "");
	}	
}
