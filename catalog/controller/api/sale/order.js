module.exports = class Order extends global['\Opencart\System\Engine\Controller'] {
	/*
	 * Loads order info
	 */
	/**
	 * @return void
	 */
	async load() {
		await this.load.language('api/sale/order');

		const json = {};
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		this.load.model('checkout/order', this);

		const order_info = await this.model_checkout_order.getOrder(order_id);

		if (!order_info) {
			json['error'] = this.language.get('error_order');
		}

		if (!Object.keys(json).length) {
			this.session.data['order_id'] = order_id;

			// Customer Details
			this.session.data['customer'] = {
				'customer_id': order_info['customer_id'],
				'customer_group_id': order_info['customer_group_id'],
				'firstname': order_info['firstname'],
				'lastname': order_info['lastname'],
				'email': order_info['email'],
				'telephone': order_info['telephone'],
				'custom_field': order_info['custom_field']
			};

			// Payment Details
			if (Number(this.config.get('config_checkout_payment_address'))) {
				this.session.data['payment_address'] = {
					'address_id': order_info['payment_address_id'],
					'firstname': order_info['payment_firstname'],
					'lastname': order_info['payment_lastname'],
					'company': order_info['payment_company'],
					'address_1': order_info['payment_address_1'],
					'address_2': order_info['payment_address_2'],
					'postcode': order_info['payment_postcode'],
					'city': order_info['payment_city'],
					'zone_id': order_info['payment_zone_id'],
					'zone': order_info['payment_zone'],
					'zone_code': order_info['payment_zone_code'],
					'country_id': order_info['payment_country_id'],
					'country': order_info['payment_country'],
					'iso_code_2': order_info['payment_iso_code_2'],
					'iso_code_3': order_info['payment_iso_code_3'],
					'address_format': order_info['payment_address_format'],
					'custom_field': order_info['payment_custom_field']
				};
			} else {
				delete (this.session.data['payment_address']);
			}

			this.session.data['payment_method'] = order_info['payment_method'];

			if (order_info['shipping_method']) {
				this.session.data['shipping_address'] = {
					'address_id': order_info['shipping_address_id'],
					'firstname': order_info['shipping_firstname'],
					'lastname': order_info['shipping_lastname'],
					'company': order_info['shipping_company'],
					'address_1': order_info['shipping_address_1'],
					'address_2': order_info['shipping_address_2'],
					'postcode': order_info['shipping_postcode'],
					'city': order_info['shipping_city'],
					'zone_id': order_info['shipping_zone_id'],
					'zone': order_info['shipping_zone'],
					'zone_code': order_info['shipping_zone_code'],
					'country_id': order_info['shipping_country_id'],
					'country': order_info['shipping_country'],
					'iso_code_2': order_info['shipping_iso_code_2'],
					'iso_code_3': order_info['shipping_iso_code_3'],
					'address_format': order_info['shipping_address_format'],
					'custom_field': order_info['shipping_custom_field']
				};

				this.session.data['shipping_method'] = order_info['shipping_method'];
			}

			if (order_info['comment']) {
				this.session.data['comment'] = order_info['comment'];
			}

			if (order_info['currency_code']) {
				this.session.data['currency'] = order_info['currency_code'];
			}

			let products = await this.model_checkout_order.getProducts(order_id);

			for (let product of products) {
				let option_data = [];

				const options = await this.model_checkout_order.getOptions(order_id, product['order_product_id']);

				for (let option of options) {
					if (option['type'] == 'text' || option['type'] == 'textarea' || option['type'] == 'file' || option['type'] == 'date' || option['type'] == 'datetime' || option['type'] == 'time') {
						option_data[option['product_option_id']] = option['value'];
					} else if (option['type'] == 'select' || option['type'] == 'radio') {
						option_data[option['product_option_id']] = option['product_option_value_id'];
					} else if (option['type'] == 'checkbox') {
						option_data[option['product_option_id']].push(option['product_option_value_id']);
					}
				}

				const subscription_info = await this.model_checkout_order.getSubscription(order_id, product['order_product_id']);
				let subscription_plan_id = 0;
				if (subscription_info.subscription_plan_id) {
					subscription_plan_id = subscription_info['subscription_plan_id'];
				} else {
					subscription_plan_id = 0;
				}

				await this.cart.add(product['product_id'], product['quantity'], option_data, subscription_plan_id, true, product['price']);
			}

			this.session.data['vouchers'] = [];

			this.load.model('checkout/voucher', this);

			const vouchers = await this.model_checkout_order.getVouchers(order_id);

			for (let voucher of vouchers) {
				this.session.data['vouchers'].push({
					'code': voucher['code'],
					'description': sprintf(this.language.get('text_for'), this.currency.format(voucher['amount'], this.session.data['currency'], 1 + 0), voucher['to_name']),
					'to_name': voucher['to_name'],
					'to_email': voucher['to_email'],
					'from_name': voucher['from_name'],
					'from_email': voucher['from_email'],
					'voucher_theme_id': voucher['voucher_theme_id'],
					'message': voucher['message'],
					'amount': this.currency.convert(voucher['amount'], this.session.data['currency'], this.config.get('config_currency'))
				});
			}

			if (order_info['affiliate_id']) {
				this.session.data['affiliate_id'] = order_info['affiliate_id'];
			}

			// Coupon, Voucher, Reward
			const order_totals = await this.model_checkout_order.getTotals(order_id);

			for (let order_total of order_totals) {
				// If coupon, voucher or reward points
				let start = order_total['title'].indexOf('(') + 1;
				let end = order_total['title'].indexOf(')');

				if (start && end) {
					this.session.data[order_total['code']] = order_total['title'].substring(start, end - start);
				}
			}

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
		await this.load.language('api/sale/order');

		const json = {};

		if (!(this.request.post['comment'])) {
			json['error'] = this.language.get('error_comment');
		}

		if (!Object.keys(json).length) {
			this.session.data['comment'] = this.request.post['comment'];

			json['success'] = this.language.get('text_success');
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async confirm() {
		await this.load.language('api/sale/order');

		const json = { error: {} };

		// Validate cart has products and has stock.
		if ((await this.cart.hasProducts()(this.session.data['vouchers'] && this.session.data['vouchers'].length))) {
			if (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout'))) {
				json['error']['stock'] = this.language.get('error_stock');
			}
		} else {
			json['error']['product'] = this.language.get('error_product');
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let product of products) {
			if (!product['minimum']) {
				json['error']['minimum'] = sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);

				break;
			}
		}

		// Customer
		if (!(this.session.data['customer'])) {
			json['error']['customer'] = this.language.get('error_customer');
		}

		// Payment Address
		if (Number(this.config.get('config_checkout_payment_address')) && !(this.session.data['payment_address'])) {
			json['error']['payment_address'] = this.language.get('error_payment_address');
		}

		// Shipping
		if (await this.cart.hasShipping()) {
			// Shipping Address
			if (!(this.session.data['shipping_address'])) {
				json['error']['shipping_address'] = this.language.get('error_shipping_address');
			}

			// Validate shipping method
			if (!(this.session.data['shipping_method'])) {
				json['error']['shipping_method'] = this.language.get('error_shipping_method');
			}
		} else {
			delete this.session.data['shipping_address'];
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
		}

		// Payment Method
		if (!this.session.data['payment_method']) {
			json['error']['payment_method'] = this.language.get('error_payment_method');
		}

		if (!Object.keys(json.error).length) {
			let order_data = {};

			// Store Details
			order_data['invoice_prefix'] = this.config.get('config_invoice_prefix');

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

			let points = 0;

			// Products
			order_data['products'] = [];

			for (let product of await this.cart.getProducts()) {
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
						'trial_frequency': product['subscription']['trial_frequency'],
						'trial_cycle': product['subscription']['trial_cycle'],
						'trial_duration': product['subscription']['trial_duration'],
						'trial_remaining': product['subscription']['trial_remaining'],
						'trial_status': product['subscription']['trial_status'],
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

				points += product['reward'];
			}

			// Gift Voucher
			order_data['vouchers'] = [];

			if ((this.session.data['vouchers'])) {
				for (let voucher of this.session.data['vouchers']) {
					order_data['vouchers'].push({
						'description': voucher['description'],
						'code': oc_token(10),
						'to_name': voucher['to_name'],
						'to_email': voucher['to_email'],
						'from_name': voucher['from_name'],
						'from_email': voucher['from_email'],
						'voucher_theme_id': voucher['voucher_theme_id'],
						'message': voucher['message'],
						'amount': voucher['amount']
					});
				}
			}

			if ((this.session.data['comment'])) {
				order_data['comment'] = this.session.data['comment'];
			} else {
				order_data['comment'] = '';
			}

			// Order Totals
			let totals = [];
			let taxes = await this.cart.getTaxes();
			let total = 0;

			this.load.model('checkout/cart', this);

			let totalsData = await this.model_checkout_cart.getTotals(totals, taxes, total);
			totals = totalsData.totals;
			taxes = totalsData.taxes;
			total = totalsData.total;
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

			if ((this.session.data['affiliate_id'])) {
				let subtotal = await this.cart.getSubTotal();

				// Affiliate
				this.load.model('account/affiliate', this);

				const affiliate_info = await this.model_account_affiliate.getAffiliate(this.session.data['affiliate_id']);

				if (affiliate_info.customer_id) {
					order_data['affiliate_id'] = affiliate_info['customer_id'];
					order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
					order_data['tracking'] = affiliate_info['tracking'];
				}
			}

			// We use session to store language code for API access
			order_data['language_id'] = this.config.get('config_language_id');
			order_data['language_code'] = this.config.get('config_language');

			order_data['currency_id'] = this.currency.getId(this.session.data['currency']);
			order_data['currency_code'] = this.session.data['currency'];
			order_data['currency_value'] = this.currency.getValue(this.session.data['currency']);

			order_data['ip'] = (this.request.server.headers['x-forwarded-for'] ||
				this.request.server.connection.remoteAddress ||
				this.request.server.socket.remoteAddress ||
				this.request.server.connection.socket.remoteAddress);

			if ((this.request.server['HTTP_X_FORWARDED_FOR'])) {
				order_data['forwarded_ip'] = this.request.server.headers['x-forwarded-for'].split(',')[0];
			} else if ((this.request.server['HTTP_CLIENT_IP'])) {
				order_data['forwarded_ip'] = this.request.server.connection.remoteAddress;
			} else {
				order_data['forwarded_ip'] = '';
			}

			if (useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source) {
				order_data['user_agent'] = useragent.parse(this.request.server.headers['user-agent'], this.request.server.query.jsuseragent).source;
			} else {
				order_data['user_agent'] = '';
			}

			if (this.request.server.headers['accept-language']) {
				order_data['accept_language'] = this.request.server.headers['accept-language'];
			} else {
				order_data['accept_language'] = '';
			}

			this.load.model('checkout/order', this);

			if (!(this.session.data['order_id'])) {
				this.session.data['order_id'] = await this.model_checkout_order.addOrder(order_data);
			} else {
				const order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

				if (order_info.order_id) {
					await this.model_checkout_order.editOrder(this.session.data['order_id'], order_data);
				}
			}

			json['order_id'] = this.session.data['order_id'];

			// Set the order history
			let order_status_id = this.config.get('config_order_status_id');
			if ((this.request.post['order_status_id'])) {
				order_status_id = this.request.post['order_status_id'];
			} else {
				order_status_id = this.config.get('config_order_status_id');
			}

			await this.model_checkout_order.addHistory(json['order_id'], order_status_id);

			json['success'] = this.language.get('text_success');

			json['points'] = points;

			if ((order_data['affiliate_id'])) {
				json['commission'] = this.currency.format(order_data['commission'], this.config.get('config_currency'));
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		if (typeof this.load.language == 'undefined')
			this.load = this.registry.get('load');
		await this.load.language('api/sale/order');

		const json = {};

		let selected = [];

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if ((this.request.get['order_id'])) {
			selected.push(this.request.get['order_id']);
		}

		for (let order_id of selected) {
			this.load.model('checkout/order', this);

			const order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info.order_id) {
				await this.model_checkout_order.deleteOrder(order_id);
			}
		}

		json['success'] = this.language.get('text_success');

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async addHistory() {
		await this.load.language('api/sale/order');

		const json = {};

		// Add keys for missing post vars
		let keys = [
			'order_id',
			'order_status_id',
			'comment',
			'notify',
			'override'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		this.load.model('checkout/order', this);

		const order_info = await this.model_checkout_order.getOrder(this.request.post['order_id']);

		if (!order_info) {
			json['error'] = this.language.get('error_order');
		}

		if (!Object.keys(json).length) {
			await this.model_checkout_order.addHistory(this.request.post['order_id'], this.request.post['order_status_id'], this.request.post['comment'], this.request.post['notify'], this.request.post['override']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
