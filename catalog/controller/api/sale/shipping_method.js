<?php
namespace Opencart\Catalog\Controller\Api\Sale;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Api\Sale
 */
class ShippingMethodController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('api/sale/shipping_method');

		const json = {};

		if (this.cart.hasShipping()) {
			if (!(this.session.data['shipping_address'])) {
				json['error'] = this.language.get('error_shipping_address');
			}
		} else {
			json['error'] = this.language.get('error_shipping');
		}

		if (!Object.keys(json).length) {
			this.load.model('checkout/shipping_method');

			shipping_methods = await this.model_checkout_shipping_method.getMethods(this.session.data['shipping_address']);

			if (shipping_methods) {
				json['shipping_methods'] = this.session.data['shipping_methods'] = shipping_methods;
			} else {
				json['error'] = this.language.get('error_no_shipping');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('api/sale/shipping_method');

		const json = {};

		if (this.cart.hasShipping()) {
			if (!(this.session.data['shipping_address'])) {
				json['error'] = this.language.get('error_shipping_address');
			}

			if ((this.request.post['shipping_method'])) {
				shipping = explode('+', this.request.post['shipping_method']);

				if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
					json['error'] = this.language.get('error_shipping_method');
				}
			} else {
				json['error'] = this.language.get('error_shipping_method');
			}
		} else {
			json['error'] = this.language.get('error_shipping');
		}

		if (!Object.keys(json).length) {
			this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}