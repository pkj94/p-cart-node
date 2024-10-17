const nl2br = require("locutus/php/strings/nl2br");

module.exports = class BankTransferController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/payment/bank_transfer');

		data['bank'] = nl2br(this.config.get('payment_bank_transfer_bank_' + this.config.get('config_language_id')));

		data['language'] = this.config.get('config_language');

		return await this.load.view('extension/opencart/payment/bank_transfer', data);
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('extension/opencart/payment/bank_transfer');

		const json = {};

		if (!(this.session.data['order_id'])) {
			json['error'] = this.language.get('error_order');
		}

		if (!(this.session.data['payment_method']) || this.session.data['payment_method']['code'] != 'bank_transfer.bank_transfer') {
			json['error'] = this.language.get('error_payment_method');
		}

		if (!json.error) {
			let comment = this.language.get('text_instruction') + "\n\n";
			comment += this.config.get('payment_bank_transfer_bank_' + this.config.get('config_language_id')) + "\n\n";
			comment += this.language.get('text_payment');

			this.load.model('checkout/order', this);

			await this.model_checkout_order.addHistory(this.session.data['order_id'], this.config.get('payment_bank_transfer_order_status_id'), comment, true);

			json['redirect'] = await this.url.link('checkout/success', 'language=' + this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
