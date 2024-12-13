module.exports = class ModelExtensionTotalLowOrderFee extends Model {
	async getTotal(total) {
		if (await this.cart.getSubTotal() && (await this.cart.getSubTotal() < this.config.get('total_low_order_fee_total'))) {
			await this.load.language('extension/total/low_order_fee');

			total['totals'].push({
				'code': 'low_order_fee',
				'title': this.language.get('text_low_order_fee'),
				'value': Number(this.config.get('total_low_order_fee_fee')),
				'sort_order': this.config.get('total_low_order_fee_sort_order')
			});

			if (this.config.get('total_low_order_fee_tax_class_id')) {
				const tax_rates = await this.tax.getRates(Number(this.config.get('total_low_order_fee_fee')), this.config.get('total_low_order_fee_tax_class_id'));

				for (let tax_rate of tax_rates) {
					if (!(total['taxes'][tax_rate['tax_rate_id']])) {
						total['taxes'][tax_rate['tax_rate_id']] = tax_rate['amount'];
					} else {
						total['taxes'][tax_rate['tax_rate_id']] += tax_rate['amount'];
					}
				}
			}

			total['total'] += Number(this.config.get('total_low_order_fee_fee'));
		}
		return total;
	}
}