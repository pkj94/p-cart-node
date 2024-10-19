<?php
namespace Opencart\Catalog\Model\Marketing;
/**
 *
 *
 * @package Opencart\Catalog\Model\Marketing
 */
class MarketingModel extends Model {
	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getMarketingByCode(code) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "marketing` WHERE `code` = " + this.db.escape(code) + "");

		return query.row;
	}

	/**
	 * @param    marketing_id
	 * @param string ip
	 * @param string country
	 *
	 * @return void
	 */
	async addReport(marketing_id, ip, country = '') {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "marketing_report` SET `marketing_id` = '" + marketing_id + "', `store_id` = '" + this.config.get('config_store_id') + "', `ip` = " + this.db.escape(ip) + ", `country` = " + this.db.escape(country) + ", `date_added` = NOW()");
	}
}
