module.exports = class ControllerCheckoutConfirm extends Controller {
	async index() {
const data = {};
		redirect = '';

		if (await this.cart.hasShipping()) {
			// Validate if shipping address has been set+
			if (!(this.session.data['shipping_address'])) {
				redirect = await this.url.link('checkout/checkout', '', true);
			}

			// Validate if shipping method has been set+
			if (!(this.session.data['shipping_method'])) {
				redirect = await this.url.link('checkout/checkout', '', true);
			}
		} else {
			delete this.session.data['shipping_address']);
			delete this.session.data['shipping_method']);
			delete this.session.data['shipping_methods']);
		}

		// Validate if payment address has been set+
		if (!(this.session.data['payment_address'])) {
			redirect = await this.url.link('checkout/checkout', '', true);
		}

		// Validate if payment method has been set+
		if (!(this.session.data['payment_method'])) {
			redirect = await this.url.link('checkout/checkout', '', true);
		}

		// Validate cart has products and has stock+
		if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
			redirect = await this.url.link('checkout/cart');
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
				redirect = await this.url.link('checkout/cart');

				break;
			}
		}

		if (!redirect) {
			order_data = array();

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

			sort_order = array();

			for (totals of key : value) {
				sort_order[key] = value['sort_order'];
			}

			array_multisort(sort_order, SORT_ASC, totals);

			order_data['totals'] = totals;

			await this.load.language('checkout/checkout');

			order_data['invoice_prefix'] = this.config.get('config_invoice_prefix');
			order_data['store_id'] = this.config.get('config_store_id');
			order_data['store_name'] = this.config.get('config_name');

			if (order_data['store_id']) {
				order_data['store_url'] = this.config.get('config_url');
			} else {
				if (this.request.server['HTTPS']) {
					order_data['store_url'] = HTTPS_SERVER;
				} else {
					order_data['store_url'] = HTTP_SERVER;
				}
			}
			
			this.load.model('account/customer',this);

			if (await this.customer.isLogged()) {
				customer_info = await this.model_account_customer.getCustomer(await this.customer.getId());

				order_data['customer_id'] = await this.customer.getId();
				order_data['customer_group_id'] = customer_info['customer_group_id'];
				order_data['firstname'] = customer_info['firstname'];
				order_data['lastname'] = customer_info['lastname'];
				order_data['email'] = customer_info['email'];
				order_data['telephone'] = customer_info['telephone'];
				order_data['custom_field'] = JSON.parse(customer_info['custom_field'], true);
			} else if ((this.session.data['guest'])) {
				order_data['customer_id'] = 0;
				order_data['customer_group_id'] = this.session.data['guest']['customer_group_id'];
				order_data['firstname'] = this.session.data['guest']['firstname'];
				order_data['lastname'] = this.session.data['guest']['lastname'];
				order_data['email'] = this.session.data['guest']['email'];
				order_data['telephone'] = this.session.data['guest']['telephone'];
				order_data['custom_field'] = this.session.data['guest']['custom_field'];
			}

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
			order_data['payment_custom_field'] = ((this.session.data['payment_address']['custom_field']) ? this.session.data['payment_address']['custom_field'] : array());

			if ((this.session.data['payment_method']['title'])) {
				order_data['payment_method'] = this.session.data['payment_method']['title'];
			} else {
				order_data['payment_method'] = '';
			}

			if ((this.session.data['payment_method']['code'])) {
				order_data['payment_code'] = this.session.data['payment_method']['code'];
			} else {
				order_data['payment_code'] = '';
			}

			if (await this.cart.hasShipping()) {
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
				order_data['shipping_custom_field'] = ((this.session.data['shipping_address']['custom_field']) ? this.session.data['shipping_address']['custom_field'] : array());

				if ((this.session.data['shipping_method']['title'])) {
					order_data['shipping_method'] = this.session.data['shipping_method']['title'];
				} else {
					order_data['shipping_method'] = '';
				}

				if ((this.session.data['shipping_method']['code'])) {
					order_data['shipping_code'] = this.session.data['shipping_method']['code'];
				} else {
					order_data['shipping_code'] = '';
				}
			} else {
				order_data['shipping_firstname'] = '';
				order_data['shipping_lastname'] = '';
				order_data['shipping_company'] = '';
				order_data['shipping_address_1'] = '';
				order_data['shipping_address_2'] = '';
				order_data['shipping_city'] = '';
				order_data['shipping_postcode'] = '';
				order_data['shipping_zone'] = '';
				order_data['shipping_zone_id'] = '';
				order_data['shipping_country'] = '';
				order_data['shipping_country_id'] = '';
				order_data['shipping_address_format'] = '';
				order_data['shipping_custom_field'] = array();
				order_data['shipping_method'] = '';
				order_data['shipping_code'] = '';
			}

			order_data['products'] = [];

			for (let product of await this.cart.getProducts()) {
				option_data = array();

				for (let option of product['option']) {
					option_data.push(array(
						'product_option_id'       : option['product_option_id'],
						'product_option_value_id' : option['product_option_value_id'],
						'option_id'               : option['option_id'],
						'option_value_id'         : option['option_value_id'],
						'name'                    : option['name'],
						'value'                   : option['value'],
						'type'                    : option['type']
					});
				}

				order_data['products'].push({
					'product_id' : product['product_id'],
					'name'       : product['name'],
					'model'      : product['model'],
					'option'     : option_data,
					'download'   : product['download'],
					'quantity'   : product['quantity'],
					'subtract'   : product['subtract'],
					'price'      : product['price'],
					'total'      : product['total'],
					'tax'        : this.tax.getTax(product['price'], product['tax_class_id']),
					'reward'     : product['reward']
				});
			}

			// Gift Voucher
			order_data['vouchers'] = [];

			if (!empty(this.session.data['vouchers'])) {
				for (this.session.data['vouchers'] of voucher) {
					order_data['vouchers'].push(array(
						'description'      : voucher['description'],
						'code'             : token(10),
						'to_name'          : voucher['to_name'],
						'to_email'         : voucher['to_email'],
						'from_name'        : voucher['from_name'],
						'from_email'       : voucher['from_email'],
						'voucher_theme_id' : voucher['voucher_theme_id'],
						'message'          : voucher['message'],
						'amount'           : voucher['amount']
					});
				}
			}

			order_data['comment'] = this.session.data['comment'];
			order_data['total'] = total_data['total'];

			if ((this.request.cookie['tracking'])) {
				order_data['tracking'] = this.request.cookie['tracking'];

				subtotal = await this.cart.getSubTotal();

				// Affiliate
				affiliate_info = await this.model_account_customer.getAffiliateByTracking(this.request.cookie['tracking']);

				if (affiliate_info) {
					order_data['affiliate_id'] = affiliate_info['customer_id'];
					order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
				} else {
					order_data['affiliate_id'] = 0;
					order_data['commission'] = 0;
				}

				// Marketing
				this.load.model('checkout/marketing');

				marketing_info = await this.model_checkout_marketing.getMarketingByCode(this.request.cookie['tracking']);

				if (marketing_info) {
					order_data['marketing_id'] = marketing_info['marketing_id'];
				} else {
					order_data['marketing_id'] = 0;
				}
			} else {
				order_data['affiliate_id'] = 0;
				order_data['commission'] = 0;
				order_data['marketing_id'] = 0;
				order_data['tracking'] = '';
			}

			order_data['language_id'] = this.config.get('config_language_id');
			order_data['currency_id'] = this.currency.getId(this.session.data['currency']);
			order_data['currency_code'] = this.session.data['currency'];
			order_data['currency_value'] = this.currency.getValue(this.session.data['currency']);
			order_data['ip'] = this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : '');

			if (!empty(this.request.server['HTTP_X_FORWARDED_FOR'])) {
				order_data['forwarded_ip'] = this.request.server['HTTP_X_FORWARDED_FOR'];
			} else if (!empty(this.request.server['HTTP_CLIENT_IP'])) {
				order_data['forwarded_ip'] = this.request.server['HTTP_CLIENT_IP'];
			} else {
				order_data['forwarded_ip'] = '';
			}

			if ((this.request.server['HTTP_USER_AGENT'])) {
				order_data['user_agent'] = this.request.server['HTTP_USER_AGENT'];
			} else {
				order_data['user_agent'] = '';
			}

			if ((this.request.server['HTTP_ACCEPT_LANGUAGE'])) {
				order_data['accept_language'] = this.request.server['HTTP_ACCEPT_LANGUAGE'];
			} else {
				order_data['accept_language'] = '';
			}

			this.load.model('checkout/order',this);

			this.session.data['order_id'] = await this.model_checkout_order.addOrder(order_data);

			this.load.model('tool/upload',this);

			data['products'] = [];

			for (let product of await this.cart.getProducts()) {
				option_data = array();

				for (let option of product['option']) {
					if (option['type'] != 'file') {
						value = option['value'];
					} else {
						upload_info = await this.model_tool_upload.getUploadByCode(option['value']);

						if (upload_info) {
							value = upload_info['name'];
						} else {
							value = '';
						}
					}

					option_data.push(array(
						'name'  : option['name'],
						'value' : (utf8_strlen(value) > 20 ? utf8_substr(value, 0, 20) + '..' : value)
					});
				}

				recurring = '';

				if (product['recurring']) {
					frequencies = array(
						'day'        : this.language.get('text_day'),
						'week'       : this.language.get('text_week'),
						'semi_month' : this.language.get('text_semi_month'),
						'month'      : this.language.get('text_month'),
						'year'       : this.language.get('text_year'),
					});

					if (product['recurring']['trial']) {
						recurring = sprintf(this.language.get('text_trial_description'), this.currency.format(this.tax.calculate(product['recurring']['trial_price'] * product['quantity'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']), product['recurring']['trial_cycle'], frequencies[product['recurring']['trial_frequency']], product['recurring']['trial_duration']) + ' ';
					}

					if (product['recurring']['duration']) {
						recurring += sprintf(this.language.get('text_payment_description'), this.currency.format(this.tax.calculate(product['recurring']['price'] * product['quantity'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']), product['recurring']['cycle'], frequencies[product['recurring']['frequency']], product['recurring']['duration']);
					} else {
						recurring += sprintf(this.language.get('text_payment_cancel'), this.currency.format(this.tax.calculate(product['recurring']['price'] * product['quantity'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']), product['recurring']['cycle'], frequencies[product['recurring']['frequency']], product['recurring']['duration']);
					}
				}

				data['products'].push({
					'cart_id'    : product['cart_id'],
					'product_id' : product['product_id'],
					'name'       : product['name'],
					'model'      : product['model'],
					'option'     : option_data,
					'recurring'  : recurring,
					'quantity'   : product['quantity'],
					'subtract'   : product['subtract'],
					'price'      : this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']),
					'total'      : this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')) * product['quantity'], this.session.data['currency']),
					'href'       : await this.url.link('product/product', 'product_id=' + product['product_id'])
				});
			}

			// Gift Voucher
			data['vouchers'] = [];

			if (!empty(this.session.data['vouchers'])) {
				for (this.session.data['vouchers'] of voucher) {
					data['vouchers'].push(array(
						'description' : voucher['description'],
						'amount'      : this.currency.format(voucher['amount'], this.session.data['currency'])
					});
				}
			}

			data['totals'] = [];

			for (order_data['totals'] of total) {
				data['totals'].push(array(
					'title' : total['title'],
					'text'  : this.currency.format(total['value'], this.session.data['currency'])
				});
			}

			data['payment'] = await this.load.controller('extension/payment/' + this.session.data['payment_method']['code']);
		} else {
			data['redirect'] = redirect;
		}

		this.response.setOutput(await this.load.view('checkout/confirm', data));
	}
}
