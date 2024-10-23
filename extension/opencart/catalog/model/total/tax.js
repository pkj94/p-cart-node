global['\Opencart\Catalog\Model\Extension\Opencart\Total\Tax'] = class Tax extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		for (let [key, value] of Object.entries(taxes)) {
			if (Number(value) > 0) {
				totals.push({
					'extension': 'opencart',
					'code': 'tax',
					'title': await this.tax.getRateName(key),
					'value': Number(value),
					'sort_order': this.config.get('total_tax_sort_order')
				});

				total += Number(value);
			}
		}
		return { totals, taxes, total }
	}
}