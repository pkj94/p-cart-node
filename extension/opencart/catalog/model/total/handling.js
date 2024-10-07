<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class Handling
 *
 * @package
 */
class Handling extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		if ((this.cart.getSubTotal() > this.config.get('total_handling_total')) && (this.cart.getSubTotal() > 0)) {
			this.load.language('extension/opencart/total/handling');

			$totals.push({
				'extension'  : 'opencart',
				'code'       : 'handling',
				'title'      : this.language.get('text_handling'),
				'value'      : this.config.get('total_handling_fee'),
				'sort_order' : this.config.get('total_handling_sort_order')
			];

			if (this.config.get('total_handling_tax_class_id')) {
				$tax_rates = this.tax.getRates(this.config.get('total_handling_fee'), this.config.get('total_handling_tax_class_id'));

				foreach ($tax_rates as $tax_rate) {
					if (!($taxes[$tax_rate['tax_rate_id']])) {
						$taxes[$tax_rate['tax_rate_id']] = $tax_rate['amount'];
					} else {
						$taxes[$tax_rate['tax_rate_id']] += $tax_rate['amount'];
					}
				}
			}

			$total += this.config.get('total_handling_fee');
		}
	}
}