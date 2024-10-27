global['\Opencart\Catalog\Model\Extension\Opencart\Payment\FreeCheckout'] = class FreeCheckout extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param address
	 *
	 * @return array
	 */
	async getMethods(address = {}) {
		await this.load.language('extension/opencart/payment/free_checkout');

		let total = await this.cart.getTotal();
		let amounts = []
		if (this.session.data['vouchers'] && this.session.data['vouchers'].length) {
			amounts = this.session.data.vouchers.map(voucher => voucher.amount);
		}
		total = total + amounts.reduce((a, b) => a + b, 0);
		let status = false;
		if (total <= 0) {
			status = true;
		} else if (await this.cart.hasSubscription()) {
			status = false;
		} else {
			status = false;
		}
		let method_data = {};

		if (status) {
			let option_data = {
				free_checkout: {
					'code': 'free_checkout.free_checkout',
					'name': this.language.get('heading_title')
				}
			};

			method_data = {
				'code': 'free_checkout',
				'name': this.language.get('heading_title'),
				'option': option_data,
				'sort_order': this.config.get('payment_free_checkout_sort_order')
			};
		}

		return method_data;
	}
}