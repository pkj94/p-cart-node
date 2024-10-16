<?php
namespace Opencart\Catalog\Model\Account;
/**
 *
 *
 * @package Opencart\Catalog\Model\Account
 */
class ActivityController extends Model {
	/**
	 * @param string key
	 * @param array  data
	 *
	 * @return void
	 */
	async addActivity(key, array data) {
		if ((data['customer_id'])) {
			customer_id = data['customer_id'];
		} else {
			customer_id = 0;
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_activity` SET `customer_id` = '" + customer_id + "', `key` = '" + this.db.escape(key) + "', `data` = '" + this.db.escape(json_encode(data)) + "', `ip` = '" + this.db.escape(this.request.server['REMOTE_ADDR']) + "', `date_added` = NOW()");
	}
}