module.exports = class ModelExtensionTotalTax extends Model {
	async getTotal(total) {
		for (let [key, value] of Object.entries(total['taxes'])) {
			if (value > 0) {
				total['totals'].push({
					'code': 'tax',
					'title': await this.tax.getRateName(key),
					'value': value,
					'sort_order': this.config.get('total_tax_sort_order')
				});

				total['total'] += value;
			}
		}
		return total;
	}
}