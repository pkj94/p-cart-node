module.exports = class ControllerExtensionPaymentBankTransfer extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/bank_transfer');

		data['bank'] = nl2br(this.config.get('payment_bank_transfer_bank' + this.config.get('config_language_id')));

		return await this.load.view('extension/payment/bank_transfer', data);
	}

	async confirm() {
		const json = {};
		
		if ((this.session.data['payment_method']['code']) && this.session.data['payment_method']['code'] == 'bank_transfer') {
			await this.load.language('extension/payment/bank_transfer');

			this.load.model('checkout/order',this);

			comment  = this.language.get('text_instruction') + "\n\n";
			comment += this.config.get('payment_bank_transfer_bank' + this.config.get('config_language_id')) + "\n\n";
			comment += this.language.get('text_payment');

			await this.model_checkout_order.addOrderHistory(this.session.data['order_id'], this.config.get('payment_bank_transfer_order_status_id'), comment, true);
		
			json['redirect'] = await this.url.link('checkout/success');
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);		
	}
}