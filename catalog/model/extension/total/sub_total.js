module.exports = class ModelExtensionTotalSubTotal extends Model {
	async getTotal(total) {
		await this.load.language('extension/total/sub_total');

		const sub_total = await this.cart.getSubTotal();

		if ((this.session.data['vouchers'])) {
			for (let voucher of this.session.data['vouchers']) {
				sub_total += voucher['amount'];
			}
		}

		total['totals'].push({
			'code': 'sub_total',
			'title': this.language.get('text_sub_total'),
			'value': sub_total,
			'sort_order': this.config.get('total_sub_total_sort_order')
		});

		total['total'] += sub_total;
		return total;
	}
}
