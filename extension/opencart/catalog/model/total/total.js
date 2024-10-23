global['\Opencart\Catalog\Model\Extension\Opencart\Total\Total'] = class Total extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		await this.load.language('extension/opencart/total/total');

		totals.push({
			'extension': 'opencart',
			'code': 'total',
			'title': this.language.get('text_total'),
			'value': total,
			'sort_order': this.config.get('total_total_sort_order')
		});
		return { totals, taxes, total }
	}
}