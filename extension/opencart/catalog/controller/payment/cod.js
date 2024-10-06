<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Payment;
/**
 * Class Cod
 *
 * @package
 */
class CodController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		this.load.language('extension/opencart/payment/cod');

		data['language'] = this.config.get('config_language');

		return await this.load.view('extension/opencart/payment/cod', data);
	}

	/**
	 * @return void
	 */
	async confirm() {
		this.load.language('extension/opencart/payment/cod');

		const json = {};

		if (!isset(this.session.data['order_id'])) {
			$json['error'] = this.language.get('error_order');
		}

		if (!isset(this.session.data['payment_method']) || this.session.data['payment_method']['code'] != 'cod.cod') {
			$json['error'] = this.language.get('error_payment_method');
		}

		if (!json.error) {
			this.load.model('checkout/order');

			await this.model_checkout_order.addHistory(this.session.data['order_id'], this.config.get('payment_cod_order_status_id'));

			$json['redirect'] = this.url.link('checkout/success', 'language=' . this.config.get('config_language'), true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
