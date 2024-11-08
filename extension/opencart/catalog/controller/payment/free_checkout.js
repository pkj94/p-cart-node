global['\Opencart\Catalog\Controller\Extension\Opencart\Payment\FreeCheckout'] = class FreeCheckout extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/payment/free_checkout');

		data['language'] = this.config.get('config_language');

		return await this.load.view('extension/opencart/payment/free_checkout', data);
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('extension/opencart/payment/free_checkout');

		const json = {};

		if (!(this.session.data['order_id'])) {
			json['error'] = this.language.get('error_order');
		}

		if (!(this.session.data['payment_method']) || this.session.data['payment_method']['code'] != 'free_checkout.free_checkout') {
			json['error'] = this.language.get('error_payment_method');
		}

		if (!json.error) {
			this.load.model('checkout/order', this);

			await this.model_checkout_order.addHistory(this.session.data['order_id'], this.config.get('payment_free_checkout_order_status_id'));

			json['redirect'] = await this.url.link('checkout/success', 'language=' + this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
