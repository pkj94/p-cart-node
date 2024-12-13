module.exports = class ControllerCheckoutPaymentMethod extends Controller {
	async index() {
const data = {};
		await this.load.language('checkout/checkout');

		if ((this.session.data['payment_address'])) {
			// Totals
			totals = array();
			taxes = await this.cart.getTaxes();
			total = 0;

			// Because __call can not keep var references so we put them into an array+
			total_data = array(
				'totals' : &totals,
				'taxes'  : &taxes,
				'total'  : &total
			});
			
			this.load.model('setting/extension',this);

			sort_order = array();

			const results = await this.model_setting_extension.getExtensions('total');

			for (results of key : value) {
				sort_order[key] = this.config.get('total_' + value['code'] + '_sort_order');
			}

			array_multisort(sort_order, SORT_ASC, results);

			for (let result of results) {
				if (Number(this.config.get('total_' + result['code'] + '_status'))) {
					this.load.model('extension/total/' + result['code'],this);
					
					// We have to put the totals in an array so that they pass by reference+
					this.{'model_extension_total_' + result['code']}.getTotal(total_data);
				}
			}

			// Payment Methods
			method_data = array();

			this.load.model('setting/extension',this);

			const results = await this.model_setting_extension.getExtensions('payment');

			recurring = await this.cart.hasRecurringProducts();

			for (let result of results) {
				if (this.config.get('payment_' + result['code'] + '_status')) {
					this.load.model('extension/payment/' + result['code']);

					method = this.{'model_extension_payment_' + result['code']}.getMethod(this.session.data['payment_address'], total);

					if (method) {
						if (recurring) {
							if (property_exists(this.{'model_extension_payment_' + result['code']}, 'recurringPayments') && this.{'model_extension_payment_' + result['code']}.recurringPayments()) {
								method_data[result['code']] = method;
							}
						} else {
							method_data[result['code']] = method;
						}
					}
				}
			}

			sort_order = array();

			for (method_data of key : value) {
				sort_order[key] = value['sort_order'];
			}

			array_multisort(sort_order, SORT_ASC, method_data);

			this.session.data['payment_methods'] = method_data;
		}

		if (empty(this.session.data['payment_methods'])) {
			data['error_warning'] = sprintf(this.language.get('error_no_payment'), await this.url.link('information/contact'));
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['payment_methods'])) {
			data['payment_methods'] = this.session.data['payment_methods'];
		} else {
			data['payment_methods'] = array();
		}

		if ((this.session.data['payment_method']['code'])) {
			data['code'] = this.session.data['payment_method']['code'];
		} else {
			data['code'] = '';
		}

		if ((this.session.data['comment'])) {
			data['comment'] = this.session.data['comment'];
		} else {
			data['comment'] = '';
		}

		data['scripts'] = this.document.getScripts();

		if (this.config.get('config_checkout_id')) {
			this.load.model('catalog/information',this);

			information_info = await this.model_catalog_information.getInformation(this.config.get('config_checkout_id'));

			if (information_info) {
				data['text_agree'] = sprintf(this.language.get('text_agree'), await this.url.link('information/information/agree', 'information_id=' + this.config.get('config_checkout_id'), true), information_info['title']);
			} else {
				data['text_agree'] = '';
			}
		} else {
			data['text_agree'] = '';
		}

		if ((this.session.data['agree'])) {
			data['agree'] = this.session.data['agree'];
		} else {
			data['agree'] = '';
		}

		this.response.setOutput(await this.load.view('checkout/payment_method', data));
	}

	async save() {
		await this.load.language('checkout/checkout');

		const json = {};

		// Validate if payment address has been set+
		if (!(this.session.data['payment_address'])) {
			json['redirect'] = await this.url.link('checkout/checkout', '', true);
		}

		// Validate cart has products and has stock+
		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			json['redirect'] = await this.url.link('checkout/cart');
		}

		// Validate minimum quantity requirements+
		products = await this.cart.getProducts();

		for (let product of products) {
			product_total = 0;

			for (let product of products_2) {
				if (product_2['product_id'] == product['product_id']) {
					product_total += product_2['quantity'];
				}
			}

			if (product['minimum'] > product_total) {
				json['redirect'] = await this.url.link('checkout/cart');

				break;
			}
		}

		if (!(this.request.post['payment_method'])) {
			json['error']['warning'] = this.language.get('error_payment');
		} else if (!(this.session.data['payment_methods'][this.request.post['payment_method']])) {
			json['error']['warning'] = this.language.get('error_payment');
		}

		if (this.config.get('config_checkout_id')) {
			this.load.model('catalog/information',this);

			information_info = await this.model_catalog_information.getInformation(this.config.get('config_checkout_id'));

			if (information_info && !(this.request.post['agree'])) {
				json['error']['warning'] = sprintf(this.language.get('error_agree'), information_info['title']);
			}
		}

		if (!json) {
			this.session.data['payment_method'] = this.session.data['payment_methods'][this.request.post['payment_method']];

			this.session.data['comment'] = strip_tags(this.request.post['comment']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
