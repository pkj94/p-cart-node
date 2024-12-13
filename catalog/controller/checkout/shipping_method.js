module.exports = class ControllerCheckoutShippingMethod extends Controller {
	async index() {
		const data = {};
		await this.load.language('checkout/checkout');

		if ((this.session.data['shipping_address'])) {
			// Shipping Methods
			let method_data = {};

			this.load.model('setting/extension', this);

			const results = await this.model_setting_extension.getExtensions('shipping');

			for (let result of results) {
				if (this.config.get('shipping_' + result['code'] + '_status')) {
					this.load.model('extension/shipping/' + result['code'], this);
					const quote = await this['model_extension_shipping_' + result['code']].getQuote(this.session.data['shipping_address']);
					// console.log('model_extension_shipping_' + result['code'], quote,this.session.data)

					if (quote) {
						method_data[result['code']] = {
							'title': quote['title'],
							'quote': quote['quote'],
							'sort_order': quote['sort_order'],
							'error': quote['error']
						};
					}
				}
			}
			method_data = Object.entries(method_data)
				.sort(([, a], [, b]) => a.sort_order - b.sort_order)
				.reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

			this.session.data['shipping_methods'] = method_data;
		}

		if (!(this.session.data['shipping_methods'])) {
			data['error_warning'] = sprintf(this.language.get('error_no_shipping'), await this.url.link('information/contact'));
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['shipping_methods'])) {
			data['shipping_methods'] = this.session.data['shipping_methods'];
		} else {
			data['shipping_methods'] = [];
		}

		if ((this.session.data['shipping_method'] && this.session.data['shipping_method']['code'])) {
			data['code'] = this.session.data['shipping_method']['code'];
		} else {
			data['code'] = '';
		}

		if ((this.session.data['comment'])) {
			data['comment'] = this.session.data['comment'];
		} else {
			data['comment'] = '';
		}
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('checkout/shipping_method', data));
	}

	async save() {
		await this.load.language('checkout/checkout');

		const json = {};

		// Validate if shipping is required+ If not the customer should not have reached this page.
		if (!await this.cart.hasShipping()) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate if shipping address has been set+
		if (!(this.session.data['shipping_address'])) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate cart has products and has stock+
		if ((!await this.cart.hasProducts() && !(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart');
		}

		// Validate minimum quantity requirements.
		const products = await this.cart.getProducts();

		for (let product of products) {
			let product_total = 0;

			for (let product_2 of products) {
				if (product_2['product_id'] == product['product_id']) {
					product_total += product_2['quantity'];
				}
			}

			if (product['minimum'] > product_total) {
				json['redirect'] = await this.url.link('checkout/cart');

				break;
			}
		}

		if (!(this.request.post['shipping_method'])) {
			json['error'] = json['error'] || {};
			json['error']['warning'] = this.language.get('error_shipping');
		} else {
			const shipping = this.request.post['shipping_method'].split('.');

			if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
				json['error'] = json['error'] || {};
				json['error']['warning'] = this.language.get('error_shipping');
			}
		}

		if (!Object.keys(json).length) {
			this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];

			this.session.data['comment'] = strip_tags(this.request.post['comment']);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}