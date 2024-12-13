module.exports = class ModelExtensionTotalShipping extends Model {
	async getTotal(total) {
		if (await this.cart.hasShipping() && (this.session.data['shipping_method'])) {
			total['totals'].push({
				'code': 'shipping',
				'title': this.session.data['shipping_method']['title'],
				'value': this.session.data['shipping_method']['cost'],
				'sort_order': this.config.get('total_shipping_sort_order')
			});

			if (this.session.data['shipping_method']['tax_class_id']) {
				const tax_rates = await this.tax.getRates(this.session.data['shipping_method']['cost'], this.session.data['shipping_method']['tax_class_id']);

				for (let tax_rate of tax_rates) {
					if (!(total['taxes'][tax_rate['tax_rate_id']])) {
						total['taxes'][tax_rate['tax_rate_id']] = tax_rate['amount'];
					} else {
						total['taxes'][tax_rate['tax_rate_id']] += tax_rate['amount'];
					}
				}
			}

			total['total'] += this.session.data['shipping_method']['cost'];
		}
		return total;
	}
}