<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class Credit
 *
 * @package
 */
class Credit extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		this.load.language('extension/opencart/total/credit');

		$balance = this.customer.getBalance();

		if ($balance) {
			$credit = min($balance, $total);

			if ($credit > 0) {
				$totals.push({
					'extension'  : 'opencart',
					'code'       : 'credit',
					'title'      : this.language.get('text_credit'),
					'value'      : -$credit,
					'sort_order' : this.config.get('total_credit_sort_order')
				];

				$total -= $credit;
			}
		}
	}

	/**
	 * @param array $order_info
	 * @param array $order_total
	 *
	 * @return void
	 */
	async confirm(array $order_info, array $order_total) {
		this.load.language('extension/opencart/total/credit');

		if ($order_info['customer_id']) {
			this.db.query("INSERT INTO `" . DB_PREFIX . "customer_transaction` SET `customer_id` = '" . $order_info['customer_id'] . "', `order_id` = '" . $order_info['order_id'] . "', `description` = '" . this.db.escape(sprintf(this.language.get('text_order_id'), $order_info['order_id'])) . "', `amount` = '" . $order_total['value'] . "', `date_added` = NOW()");
		}
	}

	/**
	 * @param int $order_id
	 *
	 * @return void
	 */
	async unconfirm($order_id) {
		this.db.query("DELETE FROM `" . DB_PREFIX . "customer_transaction` WHERE `order_id` = '" . $order_id . "'");
	}
}
