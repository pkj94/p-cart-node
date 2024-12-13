module.exports = class ControllerExtensionPaymentCheque extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/cheque');

		data['payable'] = this.config.get('payment_cheque_payable');
		data['address'] = nl2br(this.config.get('config_address'));

		return await this.load.view('extension/payment/cheque', data);
	}

	async confirm() {
		const json = {};
		
		if ((this.session.data['payment_method']['code']) && this.session.data['payment_method']['code'] == 'cheque') {
			await this.load.language('extension/payment/cheque');

			this.load.model('checkout/order',this);

			comment  = this.language.get('text_payable') + "\n";
			comment += this.config.get('payment_cheque_payable') + "\n\n";
			comment += this.language.get('text_address') + "\n";
			comment += this.config.get('config_address') + "\n\n";
			comment += this.language.get('text_payment') + "\n";
			
			await this.model_checkout_order.addOrderHistory(this.session.data['order_id'], this.config.get('payment_cheque_order_status_id'), comment, true);
			
			json['redirect'] = await this.url.link('checkout/success');
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}