module.exports = class LowOrderFeeModel extends Model {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		if (await this.cart.getSubTotal() && (await this.cart.getSubTotal() < this.config.get('total_low_order_fee_total'))) {
			await this.load.language('extension/opencart/total/low_order_fee');

			totals.push({
				'extension'  : 'opencart',
				'code'       : 'low_order_fee',
				'title'      : this.language.get('text_low_order_fee'),
				'value'      : this.config.get('total_low_order_fee_fee'),
				'sort_order' : this.config.get('total_low_order_fee_sort_order')
			});

			if (this.config.get('total_low_order_fee_tax_class_id')) {
				const tax_rates = await this.tax.getRates(this.config.get('total_low_order_fee_fee'), this.config.get('total_low_order_fee_tax_class_id'));

				for (let tax_rate of tax_rates) {
					if (!(taxes[tax_rate['tax_rate_id']])) {
						taxes[tax_rate['tax_rate_id']] = tax_rate['amount'];
					} else {
						taxes[tax_rate['tax_rate_id']] += tax_rate['amount'];
					}
				}
			}

			total += this.config.get('total_low_order_fee_fee');
		}
		return { totals, taxes, total }
	}
}