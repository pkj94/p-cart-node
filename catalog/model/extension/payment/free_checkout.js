module.exports = class ModelExtensionPaymentFreeCheckout extends Model {
	async getMethod(address, total) {
		await this.load.language('extension/payment/free_checkout');

		if (total <= 0.00) {
			status = true;
		} else {
			status = false;
		}

		let method_data = {};

		if (status) {
			method_data = {
				'code'        'free_checkout',
				'title'       this.language.get('text_title'),
				'terms'       '',
				'sort_order'  this.config.get('payment_free_checkout_sort_order')
			});
		}

		return method_data;
	}
}