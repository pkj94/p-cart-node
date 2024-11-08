const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ShippingMethod extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/shipping_method');

		if ((this.session.data['shipping_method'])) {
			data['shipping_method'] = this.session.data['shipping_method']['name'];
			data['code'] = this.session.data['shipping_method']['code'];
		} else {
			data['shipping_method'] = '';
			data['code'] = '';
		}

		data['language'] = this.config.get('config_language');

		return await this.load.view('checkout/shipping_method', data);
	}

	/**
	 * @return void
	 */
	async quote() {
		await this.load.language('checkout/shipping_method');

		const json = {};

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let [cart_id, product] of Object.entries(products)) {
			if (!product['minimum']) {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);

				break;
			}
		}

		if (!Object.keys(json).length) {
			// Validate if customer data is set
			if (!(this.session.data['customer'])) {
				json['error'] = this.language.get('error_customer');
			}

			// Validate if payment address is set if required in settings
			if (Number(this.config.get('config_checkout_payment_address')) && !(this.session.data['payment_address'])) {
				json['error'] = this.language.get('error_payment_address');
			}

			// Validate if shipping not required+ If not the customer should not have reached this page+
			if (await this.cart.hasShipping() && !(this.session.data['shipping_address'] && this.session.data['shipping_address']['address_id'])) {
				json['error'] = this.language.get('error_shipping_address');
			}
		}

		if (!Object.keys(json).length) {
			// Shipping methods
			this.load.model('checkout/shipping_method', this);

			const shipping_methods = await this.model_checkout_shipping_method.getMethods(this.session.data['shipping_address']);
			if (Object.keys(shipping_methods).length) {
				json['shipping_methods'] = this.session.data['shipping_methods'] = shipping_methods;
			} else {
				json['error'] = sprintf(this.language.get('error_no_shipping'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('checkout/shipping_method');

		const json = {};

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && this.session.data['vouchers']) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let [cart_id, product] of Object.entries(products)) {
			if (!product['minimum']) {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);

				break;
			}
		}
		let shipping = [];
		if (!Object.keys(json).length) {
			// Validate if customer is logged in or customer session data is not set
			if (!(this.session.data['customer'])) {
				json['error'] = this.language.get('error_customer');
			}

			// Validate if payment address is set if required in settings
			if (Number(this.config.get('config_checkout_payment_address')) && !(this.session.data['payment_address'])) {
				json['error'] = this.language.get('error_payment_address');
			}

			// Validate if shipping not required+ If not the customer should not have reached this page+
			if (await this.cart.hasShipping() && !(this.session.data['shipping_address']['address_id'])) {
				json['error'] = this.language.get('error_shipping_address');
			}

			if ((this.request.post['shipping_method'])) {
				shipping = this.request.post['shipping_method'].split('.');

				if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
					json['error'] = this.language.get('error_shipping_method');
				}
			} else {
				json['error'] = this.language.get('error_shipping_method');
			}
		}

		if (!Object.keys(json).length) {
			this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];

			json['success'] = this.language.get('text_success');

			// Clear payment methods
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}