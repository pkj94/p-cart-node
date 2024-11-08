const sprintf = require("locutus/php/strings/sprintf");

module.exports = class PaymentMethod extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/payment_method');

		if ((this.session.data['payment_method'])) {
			data['payment_method'] = this.session.data['payment_method']['name'];
			data['code'] = this.session.data['payment_method']['code'];
		} else {
			data['payment_method'] = '';
			data['code'] = '';
		}

		if ((this.session.data['comment'])) {
			data['comment'] = this.session.data['comment'];
		} else {
			data['comment'] = '';
		}

		this.load.model('catalog/information', this);

		const information_info = await this.model_catalog_information.getInformation(Number(this.config.get('config_checkout_id')));
		if (information_info.information_id) {
			data['agree_text'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information.info', 'language=' + this.config.get('config_language') + '&information_id=' + Number(this.config.get('config_checkout_id'))), information_info['title']);
		} else {
			data['agree_text'] = '';
		}

		data['language'] = this.config.get('config_language');
		return await this.load.view('checkout/payment_method', data);
	}

	/**
	 * @return void
	 */
	async getMethods() {
		await this.load.language('checkout/payment_method');

		const json = {};

		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && !this.session.data['vouchers']) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
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
			// Validate if customer session data is set
			if (!(this.session.data['customer'])) {
				json['error'] = this.language.get('error_customer');
			}

			if (Number(this.config.get('config_checkout_payment_address')) && !(this.session.data['payment_address'])) {
				json['error'] = this.language.get('error_payment_address');
			}

			// Validate shipping
			if (await this.cart.hasShipping()) {
				// Validate shipping address
				if (!(this.session.data['shipping_address']['address_id'])) {
					json['error'] = this.language.get('error_shipping_address');
				}

				// Validate shipping method
				if (!(this.session.data['shipping_method'])) {
					json['error'] = this.language.get('error_shipping_method');
				}
			}
		}

		if (!Object.keys(json).length) {
			let payment_address = {};

			if (Number(this.config.get('config_checkout_payment_address')) && (this.session.data['payment_address'])) {
				payment_address = this.session.data['payment_address'];
			} else if (this.config.get('config_checkout_shipping_address') && (this.session.data['shipping_address']['address_id'])) {
				payment_address = this.session.data['shipping_address'];
			}

			// Payment methods
			this.load.model('checkout/payment_method', this);

			const payment_methods = await this.model_checkout_payment_method.getMethods(payment_address);
			if (Object.keys(payment_methods).length) {
				json['payment_methods'] = this.session.data['payment_methods'] = payment_methods;
			} else {
				json['error'] = sprintf(this.language.get('error_no_payment'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));
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
		await this.load.language('checkout/payment_method');

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
		let payment = [];
		if (!Object.keys(json).length) {
			// Validate has payment address if required
			if (Number(this.config.get('config_checkout_payment_address')) && !(this.session.data['payment_address'])) {
				json['error'] = this.language.get('error_payment_address');
			}

			// Validate shipping
			if (await this.cart.hasShipping()) {
				// Validate shipping address
				if (!(this.session.data['shipping_address']['address_id'])) {
					json['error'] = this.language.get('error_shipping_address');
				}

				// Validate shipping method
				if (!(this.session.data['shipping_method'])) {
					json['error'] = this.language.get('error_shipping_method');
				}
			}

			// Validate payment methods
			if ((this.request.post['payment_method']) && (this.session.data['payment_methods'])) {
				payment = this.request.post['payment_method'].split('.');

				if (!(payment[0]) || !(payment[1]) || !(this.session.data['payment_methods'][payment[0]]['option'][payment[1]])) {
					json['error'] = this.language.get('error_payment_method');
				}
			} else {
				json['error'] = this.language.get('error_payment_method');
			}
		}

		if (!Object.keys(json).length) {
			this.session.data['payment_method'] = this.session.data['payment_methods'][payment[0]]['option'][payment[1]];

			json['success'] = this.language.get('text_success');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async comment() {
		await this.load.language('checkout/payment_method');

		const json = {};
		let order_id = 0;
		if ((this.session.data['order_id'])) {
			order_id = this.session.data['order_id'];
		}

		if (!Object.keys(json).length) {
			this.session.data['comment'] = this.request.post['comment'];

			this.load.model('checkout/order', this);

			const order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info.order_id) {
				await this.model_checkout_order.editComment(order_id, this.request.post['comment']);
			}

			json['success'] = this.language.get('text_comment');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async agree() {
		await this.load.language('checkout/payment_method');

		const json = {};

		if ((this.request.post['agree'])) {
			this.session.data['agree'] = this.request.post['agree'];
		} else {
			delete (this.session.data['agree']);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
