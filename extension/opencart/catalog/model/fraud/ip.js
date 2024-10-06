<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Fraud;
/**
 * Class Ip
 *
 * @package
 */
class Ip extends \Opencart\System\Engine\Model {
	/**
	 * @param array $order_info
	 *
	 * @return int
	 */
	async check(array $order_info): int {
		$status = false;

		if ($order_info['customer_id']) {
			this.load.model('account/customer');

			const results = await this.model_account_customer.getIps($order_info['customer_id']);

			for(let result of results) {
				$query = this.db.query("SELECT * FROM `" . DB_PREFIX . "fraud_ip` WHERE `ip` = '" . this.db.escape(result['ip']) . "'");

				if ($query.num_rows) {
					$status = true;

					break;
				}
			}
		} else {
			$query = this.db.query("SELECT * FROM `" . DB_PREFIX . "fraud_ip` WHERE `ip` = '" . this.db.escape($order_info['ip']) . "'");

			if ($query.num_rows) {
				$status = true;
			}
		}

		if ($status) {
			return this.config.get('fraud_ip_order_status_id');
		} else {
			return 0;
		}
	}
}
