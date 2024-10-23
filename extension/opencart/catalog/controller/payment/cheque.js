const nl2br = require("locutus/php/strings/nl2br");

global['\Opencart\Catalog\Controller\Extension\Opencart\Payment\Cheque'] = class Cheque extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/payment/cheque');

		data['payable'] = this.config.get('payment_cheque_payable');
		data['address'] = nl2br(this.config.get('config_address'));

		data['language'] = this.config.get('config_language');

		return await this.load.view('extension/opencart/payment/cheque', data);
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('extension/opencart/payment/cheque');

		const json = {};

		if (!(this.session.data['order_id'])) {
			json['error'] = this.language.get('error_order');
		}

		if (!(this.session.data['payment_method']) || this.session.data['payment_method']['code'] != 'cheque.cheque') {
			json['error'] = this.language.get('error_payment_method');
		}

		if (!json.error) {
			let comment = this.language.get('text_payable') + "\n";
			comment += this.config.get('payment_cheque_payable') + "\n\n";
			comment += this.language.get('text_address') + "\n";
			comment += this.config.get('config_address') + "\n\n";
			comment += this.language.get('text_payment') + "\n";

			this.load.model('checkout/order', this);

			await this.model_checkout_order.addHistory(this.session.data['order_id'], this.config.get('payment_cheque_order_status_id'), comment, true);

			json['redirect'] = await this.url.link('checkout/success', 'language=' + this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}