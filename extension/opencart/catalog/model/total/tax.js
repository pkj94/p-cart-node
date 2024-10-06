<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class Tax
 *
 * @package
 */
class Tax extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		foreach ($taxes as $key : $value) {
			if ($value > 0) {
				$totals.push({
					'extension'  : 'opencart',
					'code'       : 'tax',
					'title'      : this.tax.getRateName($key),
					'value'      : $value,
					'sort_order' : this.config.get('total_tax_sort_order')
				];

				$total += $value;
			}
		}
	}
}