global['\Opencart\Catalog\Model\Extension\Opencart\Total\Handling'] = class Handling extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		if ((await this.cart.getSubTotal() > this.config.get('total_handling_total')) && (await this.cart.getSubTotal() > 0)) {
			await this.load.language('extension/opencart/total/handling');

			totals.push({
				'extension': 'opencart',
				'code': 'handling',
				'title': this.language.get('text_handling'),
				'value': this.config.get('total_handling_fee'),
				'sort_order': this.config.get('total_handling_sort_order')
			});

			if (this.config.get('total_handling_tax_class_id')) {
				const tax_rates = this.tax.getRates(this.config.get('total_handling_fee'), this.config.get('total_handling_tax_class_id'));

				for (let tax_rate of tax_rates) {
					if (!(taxes[tax_rate['tax_rate_id']])) {
						taxes[tax_rate['tax_rate_id']] = tax_rate['amount'];
					} else {
						taxes[tax_rate['tax_rate_id']] += tax_rate['amount'];
					}
				}
			}

			total += Number(this.config.get('total_handling_fee'));
		}
		return { totals, taxes, total }
	}
}