<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class LowOrderFee
 *
 * @package
 */
class LowOrderFee extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		if (this.cart.getSubTotal() && (this.cart.getSubTotal() < this.config.get('total_low_order_fee_total'))) {
			this.load.language('extension/opencart/total/low_order_fee');

			$totals.push({
				'extension'  : 'opencart',
				'code'       : 'low_order_fee',
				'title'      : this.language.get('text_low_order_fee'),
				'value'      : this.config.get('total_low_order_fee_fee'),
				'sort_order' : this.config.get('total_low_order_fee_sort_order')
			];

			if (this.config.get('total_low_order_fee_tax_class_id')) {
				$tax_rates = this.tax.getRates(this.config.get('total_low_order_fee_fee'), this.config.get('total_low_order_fee_tax_class_id'));

				foreach ($tax_rates as $tax_rate) {
					if (!($taxes[$tax_rate['tax_rate_id']])) {
						$taxes[$tax_rate['tax_rate_id']] = $tax_rate['amount'];
					} else {
						$taxes[$tax_rate['tax_rate_id']] += $tax_rate['amount'];
					}
				}
			}

			$total += this.config.get('total_low_order_fee_fee');
		}
	}
}