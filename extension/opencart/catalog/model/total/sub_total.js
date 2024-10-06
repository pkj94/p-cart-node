<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class SubTotal
 *
 * @package
 */
class SubTotal extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		this.load.language('extension/opencart/total/sub_total');

		$sub_total = this.cart.getSubTotal();

		if (!empty(this.session.data['vouchers'])) {
			foreach (this.session.data['vouchers'] as $voucher) {
				$sub_total += $voucher['amount'];
			}
		}

		$totals.push({
			'extension'  : 'opencart',
			'code'       : 'sub_total',
			'title'      : this.language.get('text_sub_total'),
			'value'      : $sub_total,
			'sort_order' : this.config.get('total_sub_total_sort_order')
		];

		$total += $sub_total;
	}
}