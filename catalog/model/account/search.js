<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class SearchController extends Model {
	/**
	 * @param array data
	 *
	 * @return void
	 */
	async addSearch(array data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_search` SET `store_id` = '" + this.config.get('config_store_id') + "', `language_id` = '" + this.config.get('config_language_id') + "', `customer_id` = '" + data['customer_id'] + "', `keyword` = '" + this.db.escape(data['keyword']) + "', `category_id` = '" + data['category_id'] + "', `sub_category` = '" + data['sub_category'] + "', `description` = '" + data['description'] + "', `products` = '" + data['products'] + "', `ip` = '" + this.db.escape(data['ip']) + "', `date_added` = NOW()");
	}
}
