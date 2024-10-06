<?php
namespace Opencart\Catalog\Model\Extension\Opencart\Total;
/**
 * Class Total
 *
 * @package
 */
class Total extends \Opencart\System\Engine\Model {
	/**
	 * @param array $totals
	 * @param array $taxes
	 * @param float $total
	 *
	 * @return void
	 */
	async getTotal(array &$totals, array &$taxes, float &$total) {
		this.load.language('extension/opencart/total/total');

		$totals.push({
			'extension'  : 'opencart',
			'code'       : 'total',
			'title'      : this.language.get('text_total'),
			'value'      : $total,
			'sort_order' : this.config.get('total_total_sort_order')
		];
	}
}