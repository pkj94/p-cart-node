global['\Opencart\Catalog\Model\Extension\Opencart\Total\SubTotal'] = class SubTotal extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		await this.load.language('extension/opencart/total/sub_total');

		let sub_total = await this.cart.getSubTotal();
		if (this.session.data['vouchers'] && this.session.data['vouchers'].length) {
			for (let voucher of this.session.data['vouchers']) {
				sub_total += voucher['amount'];
			}
		}

		totals.push({
			'extension': 'opencart',
			'code': 'sub_total',
			'title': this.language.get('text_sub_total'),
			'value': sub_total,
			'sort_order': this.config.get('total_sub_total_sort_order')
		});

		total += sub_total;
		return { totals, taxes, total }
	}

}