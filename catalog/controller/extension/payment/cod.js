module.exports = class ControllerExtensionPaymentCod extends Controller {
	async index() {
const data = {};
		return await this.load.view('extension/payment/cod');
	}

	async confirm() {
		const json = {};
		
		if ((this.session.data['payment_method']['code']) && this.session.data['payment_method']['code'] == 'cod') {
			this.load.model('checkout/order',this);

			await this.model_checkout_order.addOrderHistory(this.session.data['order_id'], this.config.get('payment_cod_order_status_id'));
		
			json['redirect'] = await this.url.link('checkout/success');
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);		
	}
}
