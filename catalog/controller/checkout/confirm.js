const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Confirm extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/confirm');

		// Order Totals
		let totals = [];
		let taxes = await this.cart.getTaxes();
		let total = 0;

		this.load.model('checkout/cart', this);

		let totalData = await this.model_checkout_cart.getTotals(totals, taxes, total);
		total = totalData.total;
		taxes = totalData.taxes;
		totals = totalData.totals;
	
		let status = (await this.customer.isLogged() || !Number(this.config.get('config_customer_price')));
		
		// Validate customer data is set
		if (!this.session.data['customer']) {
			status = false;
		}
		
		// Validate cart has products and has stock.
		if ((!await this.cart.hasProducts() && !this.session.data['vouchers']) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			status = false;
		}
		
		// Validate minimum quantity requirements+
		let products = await this.model_checkout_cart.getProducts();

		for (let product of products) {
			if (!product['minimum']) {
				status = false;

				break;
			}
		}
		
		// Shipping
		if (await this.cart.hasShipping()) {
			// Validate shipping address
			if (!(this.session.data['shipping_address'] && this.session.data['shipping_address']['address_id'])) {
				status = false;
			}
			
			// Validate shipping method
			if (!(this.session.data['shipping_method'])) {
				status = false;
			}
		} else {
			delete this.session.data['shipping_address'];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
		}
		
		// Validate has payment address if required
		if (Number(this.config.get('config_checkout_payment_address')) && !(this.session.data['payment_address'])) {
			status = false;
		}
		
		// Validate payment methods
		if (!(this.session.data['payment_method'])) {
			status = false;
		}
		
		// Validate checkout terms
		if (Number(this.config.get('config_checkout_id')) && !this.session.data['agree']) {
			status = false;
		}
		
		// Generate order if payment method is set
		if (status) {
			let order_data = {};

			order_data['invoice_prefix'] = this.config.get('config_invoice_prefix');

			// Store Details
			order_data['store_id'] = this.config.get('config_store_id');
			order_data['store_name'] = this.config.get('config_name');
			order_data['store_url'] = this.config.get('config_url');

			// Customer Details
			order_data['customer_id'] = this.session.data['customer']['customer_id'];
			order_data['customer_group_id'] = this.session.data['customer']['customer_group_id'];
			order_data['firstname'] = this.session.data['customer']['firstname'];
			order_data['lastname'] = this.session.data['customer']['lastname'];
			order_data['email'] = this.session.data['customer']['email'];
			order_data['telephone'] = this.session.data['customer']['telephone'];
			order_data['custom_field'] = this.session.data['customer']['custom_field'];

			// Payment Details
			if (Number(this.config.get('config_checkout_payment_address'))) {
				order_data['payment_address_id'] = this.session.data['payment_address']['address_id'];
				order_data['payment_firstname'] = this.session.data['payment_address']['firstname'];
				order_data['payment_lastname'] = this.session.data['payment_address']['lastname'];
				order_data['payment_company'] = this.session.data['payment_address']['company'];
				order_data['payment_address_1'] = this.session.data['payment_address']['address_1'];
				order_data['payment_address_2'] = this.session.data['payment_address']['address_2'];
				order_data['payment_city'] = this.session.data['payment_address']['city'];
				order_data['payment_postcode'] = this.session.data['payment_address']['postcode'];
				order_data['payment_zone'] = this.session.data['payment_address']['zone'];
				order_data['payment_zone_id'] = this.session.data['payment_address']['zone_id'];
				order_data['payment_country'] = this.session.data['payment_address']['country'];
				order_data['payment_country_id'] = this.session.data['payment_address']['country_id'];
				order_data['payment_address_format'] = this.session.data['payment_address']['address_format'];
				order_data['payment_custom_field'] = (this.session.data['payment_address']['custom_field']) ? this.session.data['payment_address']['custom_field'] : [];
			} else {
				order_data['payment_address_id'] = 0;
				order_data['payment_firstname'] = '';
				order_data['payment_lastname'] = '';
				order_data['payment_company'] = '';
				order_data['payment_address_1'] = '';
				order_data['payment_address_2'] = '';
				order_data['payment_city'] = '';
				order_data['payment_postcode'] = '';
				order_data['payment_zone'] = '';
				order_data['payment_zone_id'] = 0;
				order_data['payment_country'] = '';
				order_data['payment_country_id'] = 0;
				order_data['payment_address_format'] = '';
				order_data['payment_custom_field'] = [];
			}

			order_data['payment_method'] = this.session.data['payment_method'];

			// Shipping Details
			if (await this.cart.hasShipping()) {
				order_data['shipping_address_id'] = this.session.data['shipping_address']['address_id'];
				order_data['shipping_firstname'] = this.session.data['shipping_address']['firstname'];
				order_data['shipping_lastname'] = this.session.data['shipping_address']['lastname'];
				order_data['shipping_company'] = this.session.data['shipping_address']['company'];
				order_data['shipping_address_1'] = this.session.data['shipping_address']['address_1'];
				order_data['shipping_address_2'] = this.session.data['shipping_address']['address_2'];
				order_data['shipping_city'] = this.session.data['shipping_address']['city'];
				order_data['shipping_postcode'] = this.session.data['shipping_address']['postcode'];
				order_data['shipping_zone'] = this.session.data['shipping_address']['zone'];
				order_data['shipping_zone_id'] = this.session.data['shipping_address']['zone_id'];
				order_data['shipping_country'] = this.session.data['shipping_address']['country'];
				order_data['shipping_country_id'] = this.session.data['shipping_address']['country_id'];
				order_data['shipping_address_format'] = this.session.data['shipping_address']['address_format'];
				order_data['shipping_custom_field'] = (this.session.data['shipping_address']['custom_field']) ? this.session.data['shipping_address']['custom_field'] : [];

				order_data['shipping_method'] = this.session.data['shipping_method'];
			} else {
				order_data['shipping_address_id'] = 0;
				order_data['shipping_firstname'] = '';
				order_data['shipping_lastname'] = '';
				order_data['shipping_company'] = '';
				order_data['shipping_address_1'] = '';
				order_data['shipping_address_2'] = '';
				order_data['shipping_city'] = '';
				order_data['shipping_postcode'] = '';
				order_data['shipping_zone'] = '';
				order_data['shipping_zone_id'] = 0;
				order_data['shipping_country'] = '';
				order_data['shipping_country_id'] = 0;
				order_data['shipping_address_format'] = '';
				order_data['shipping_custom_field'] = [];

				order_data['shipping_method'] = [];
			}

			if ((this.session.data['comment'])) {
				order_data['comment'] = this.session.data['comment'];
			} else {
				order_data['comment'] = '';
			}

			let total_data = {
				'totals': totals,
				'taxes': taxes,
				'total': total
			};

			order_data = { ...order_data, ...total_data };

			order_data['affiliate_id'] = 0;
			order_data['commission'] = 0;
			order_data['marketing_id'] = 0;
			order_data['tracking'] = '';

			if ((this.session.data['tracking'])) {
				const subtotal = await this.cart.getSubTotal();

				// Affiliate
				if (this.config.get('config_affiliate_status')) {
					this.load.model('account/affiliate', this);

					const affiliate_info = await this.model_account_affiliate.getAffiliateByTracking(this.session.data['tracking']);

					if (affiliate_info.affiliate_id) {
						order_data['affiliate_id'] = affiliate_info['customer_id'];
						order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
						order_data['tracking'] = this.session.data['tracking'];
					}
				}

				this.load.model('marketing/marketing', this);

				const marketing_info = await this.model_marketing_marketing.getMarketingByCode(this.session.data['tracking']);

				if (marketing_info.marketing_id) {
					order_data['marketing_id'] = marketing_info['marketing_id'];
					order_data['tracking'] = this.session.data['tracking'];
				}
			}

			order_data['language_id'] = this.config.get('config_language_id');
			order_data['language_code'] = this.config.get('config_language');

			order_data['currency_id'] = this.currency.getId(this.session.data['currency']);
			order_data['currency_code'] = this.session.data['currency'];
			order_data['currency_value'] = this.currency.getValue(this.session.data['currency']);

			order_data['ip'] = (this.request.server.headers['x-forwarded-for'] ||
				this.request.server.connection.remoteAddress ||
				this.request.server.socket.remoteAddress ||
				this.request.server.connection.socket.remoteAddress);

			if ((this.request.server.headers['x-forwarded-for'])) {
				order_data['forwarded_ip'] = this.request.server.headers['x-forwarded-for'].split(',')[0];
			} else if ((this.request.server.connection.remoteAddress)) {
				order_data['forwarded_ip'] = this.request.server.connection.remoteAddress;
			} else {
				order_data['forwarded_ip'] = '';
			}

			if (useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source) {
				order_data['user_agent'] = useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source;
			} else {
				order_data['user_agent'] = '';
			}

			if ((this.request.server.headers['accept-language'])) {
				order_data['accept_language'] = this.request.server.headers['accept-language'];
			} else {
				order_data['accept_language'] = '';
			}

			// Products
			order_data['products'] = [];

			for (let product of products) {
				let option_data = [];

				for (let option of product['option']) {
					option_data.push({
						'product_option_id': option['product_option_id'],
						'product_option_value_id': option['product_option_value_id'],
						'option_id': option['option_id'],
						'option_value_id': option['option_value_id'],
						'name': option['name'],
						'value': option['value'],
						'type': option['type']
					});
				}

				let subscription_data = {};

				if (product['subscription']) {
					subscription_data = {
						'subscription_plan_id': product['subscription']['subscription_plan_id'],
						'name': product['subscription']['name'],
						'trial_price': product['subscription']['trial_price'],
						'trial_tax': this.tax.getTax(product['subscription']['trial_price'], product['tax_class_id']),
						'trial_frequency': product['subscription']['trial_frequency'],
						'trial_cycle': product['subscription']['trial_cycle'],
						'trial_duration': product['subscription']['trial_duration'],
						'trial_remaining': product['subscription']['trial_remaining'],
						'trial_status': product['subscription']['trial_status'],
						'price': product['subscription']['price'],
						'tax': this.tax.getTax(product['subscription']['price'], product['tax_class_id']),
						'frequency': product['subscription']['frequency'],
						'cycle': product['subscription']['cycle'],
						'duration': product['subscription']['duration']
					};
				}

				order_data['products'].push({
					'product_id': product['product_id'],
					'master_id': product['master_id'],
					'name': product['name'],
					'model': product['model'],
					'option': option_data,
					'subscription': subscription_data,
					'download': product['download'],
					'quantity': product['quantity'],
					'subtract': product['subtract'],
					'price': product['price'],
					'total': product['total'],
					'tax': this.tax.getTax(product['price'], product['tax_class_id']),
					'reward': product['reward']
				});
			}

			// Gift Voucher
			order_data['vouchers'] = [];

			if ((this.session.data['vouchers'])) {
				order_data['vouchers'] = this.session.data['vouchers'];
			}

			this.load.model('checkout/order', this);

			if (!(this.session.data['order_id'])) {
				this.session.data['order_id'] = await this.model_checkout_order.addOrder(order_data);
			} else {
				const order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

				if (order_info.order_id && !order_info['order_status_id']) {
					await this.model_checkout_order.editOrder(this.session.data['order_id'], order_data);
				}
			}
		}

		// Display prices
		let price_status = false;
		if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
			price_status = true;
		}

		this.load.model('tool/upload', this);

		data['products'] = [];

		for (let product of products) {
			if (product['option']) {
				for (let [key, option] of Object.entries(product['option'])) {
					product['option'][key]['value'] = (oc_strlen(option['value']) > 20 ? oc_substr(option['value'], 0, 20) + '++' : option['value']);
				}
			}

			let description = '';
			if (product['subscription'].subscription_plan_id) {
				if (product['subscription']['trial_status']) {
					let trial_price = this.currency.format(this.tax.calculate(product['subscription']['trial_price'], product['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
					let trial_cycle = product['subscription']['trial_cycle'];
					let trial_frequency = this.language.get('text_' + product['subscription']['trial_frequency']);
					let trial_duration = product['subscription']['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
				}

				let price = this.currency.format(this.tax.calculate(product['subscription']['price'], product['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				let cycle = product['subscription']['cycle'];
				let frequency = this.language.get('text_' + product['subscription']['frequency']);
				let duration = product['subscription']['duration'];

				if (duration) {
					description += sprintf(this.language.get('text_subscription_duration'), price_status ? price : '', cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price_status ? price : '', cycle, frequency);
				}
			}

			data['products'].push({
				'cart_id': product['cart_id'],
				'product_id': product['product_id'],
				'name': product['name'],
				'model': product['model'],
				'option': product['option'],
				'subscription': description,
				'quantity': product['quantity'],
				'price': price_status ? this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']) : '',
				'total': price_status ? this.currency.format(this.tax.calculate(product['total'], product['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']) : '',
				'reward': product['reward'],
				'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product['product_id'])
			});
		}

		// Gift Voucher
		data['vouchers'] = [];

		const vouchers = await this.model_checkout_cart.getVouchers();

		for (let voucher of vouchers) {
			data['vouchers'].push({
				'description': voucher['description'],
				'amount': this.currency.format(voucher['amount'], this.session.data['currency'])
			});
		}

		data['totals'] = [];

		for (let total of totals) {
			data['totals'].push({
				'title': total['title'],
				'text': this.currency.format(total['value'], this.session.data['currency'])
			});
		}

		// Validate if payment method has been set+
		let code = '';
		if ((this.session.data['payment_method'])) {
			code = oc_substr(this.session.data['payment_method']['code'], 0, this.session.data['payment_method']['code'].indexOf('.'));
		} else {
			code = '';
		}

		const extension_info = await this.model_setting_extension.getExtensionByCode('payment', code);
		if (status && extension_info.extension_id) {
			data['payment'] = await this.load.controller('extension/' + extension_info['extension'] + '/payment/' + extension_info['code']);
		} else {
			data['payment'] = '';
		}

		// Validate if payment method has been set+
		return await this.load.view('checkout/confirm', data);
	}

	/**
	 * @return void
	 */
	async confirm() {
		this.response.setOutput(await this.index());
	}
}
