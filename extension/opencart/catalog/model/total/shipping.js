<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class Shipping
 *
 * @package
 */
class Shipping extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		if (this.cart.hasShipping() && (this.session.data['shipping_method'])) {
			$totals.push({
				'extension'  : 'opencart',
				'code'       : 'shipping',
				'title'      : this.session.data['shipping_method']['name'],
				'value'      : this.session.data['shipping_method']['cost'],
				'sort_order' : this.config.get('total_shipping_sort_order')
			];

			if ((this.session.data['shipping_method']['tax_class_id'])) {
				$tax_rates = this.tax.getRates(this.session.data['shipping_method']['cost'], this.session.data['shipping_method']['tax_class_id']);

				foreach ($tax_rates as $tax_rate) {
					if (!($taxes[$tax_rate['tax_rate_id']])) {
						$taxes[$tax_rate['tax_rate_id']] = $tax_rate['amount'];
					} else {
						$taxes[$tax_rate['tax_rate_id']] += $tax_rate['amount'];
					}
				}
			}

			$total += this.session.data['shipping_method']['cost'];
		}
	}
}
