module.exports = class ModelExtensionTotalHandling extends Model {
	async getTotal(total) {
		if ((await this.cart.getSubTotal() > this.config.get('total_handling_total')) && (await this.cart.getSubTotal() > 0) && (await this.cart.hasDownload() == false) && this.cart.hasShipping() == true) {
			await this.load.language('extension/total/handling');

			total['totals'].push({
				'code': 'handling',
				'title': this.language.get('text_handling'),
				'value': this.config.get('total_handling_fee'),
				'sort_order': this.config.get('total_handling_sort_order')
			});

			if (this.config.get('total_handling_tax_class_id')) {
				const tax_rates = await this.tax.getRates(this.config.get('total_handling_fee'), this.config.get('total_handling_tax_class_id'));

				for (let tax_rate of tax_rates) {
					if (!(total['taxes'][tax_rate['tax_rate_id']])) {
						total['taxes'][tax_rate['tax_rate_id']] = tax_rate['amount'];
					} else {
						total['taxes'][tax_rate['tax_rate_id']] += tax_rate['amount'];
					}
				}
			}

			total['total'] += this.config.get('total_handling_fee');
		}
		return total;
	}
}