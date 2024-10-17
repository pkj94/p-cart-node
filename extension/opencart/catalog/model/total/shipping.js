module.exports = class ShippingModel extends Model {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		if (await this.cart.hasShipping() && (this.session.data['shipping_method'])) {
			totals.push({
				'extension': 'opencart',
				'code': 'shipping',
				'title': this.session.data['shipping_method']['name'],
				'value': this.session.data['shipping_method']['cost'],
				'sort_order': this.config.get('total_shipping_sort_order')
			});

			if ((this.session.data['shipping_method']['tax_class_id'])) {
				const tax_rates = await this.tax.getRates(this.session.data['shipping_method']['cost'], this.session.data['shipping_method']['tax_class_id']);

				for (let tax_rate of tax_rates) {
					if (!(taxes[tax_rate['tax_rate_id']])) {
						taxes[tax_rate['tax_rate_id']] = tax_rate['amount'];
					} else {
						taxes[tax_rate['tax_rate_id']] += tax_rate['amount'];
					}
				}
			}

			total += this.session.data['shipping_method']['cost'];
		}
		return { totals, taxes, total }
	}
}
