module.exports = class ControllerExtensionPaymentFreeCheckout extends Controller {
	async index() {
const data = {};
		data['continue'] = await this.url.link('checkout/success');

		return await this.load.view('extension/payment/free_checkout', data);
	}

	async confirm() {
		if ((this.session.data['payment_method']['code']) && this.session.data['payment_method']['code'] == 'free_checkout') {
			this.load.model('checkout/order',this);

			await this.model_checkout_order.addOrderHistory(this.session.data['order_id'], this.config.get('payment_free_checkout_order_status_id'));
		}
	}
}
