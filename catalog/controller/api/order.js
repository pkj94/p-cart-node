module.exports = class ControllerApiOrder extends Controller {
	async add() {
		await this.load.language('api/order');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			// Customer
			if (!(this.session.data['customer'])) {
				json['error'] = this.language.get('error_customer');
			}

			// Payment Address
			if (!(this.session.data['payment_address'])) {
				json['error'] = this.language.get('error_payment_address');
			}

			// Payment Method
			if (!json && !empty(this.request.post['payment_method'])) {
				if (empty(this.session.data['payment_methods'])) {
					json['error'] = this.language.get('error_no_payment');
				} else if (!(this.session.data['payment_methods'][this.request.post['payment_method']])) {
					json['error'] = this.language.get('error_payment_method');
				}

				if (!json) {
					this.session.data['payment_method'] = this.session.data['payment_methods'][this.request.post['payment_method']];
				}
			}

			if (!(this.session.data['payment_method'])) {
				json['error'] = this.language.get('error_payment_method');
			}

			// Shipping
			if (await this.cart.hasShipping()) {
				// Shipping Address
				if (!(this.session.data['shipping_address'])) {
					json['error'] = this.language.get('error_shipping_address');
				}

				// Shipping Method
				if (!json && !empty(this.request.post['shipping_method'])) {
					if (empty(this.session.data['shipping_methods'])) {
						json['error'] = this.language.get('error_no_shipping');
					} else {
						shipping = explode('+', this.request.post['shipping_method']);

						if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
							json['error'] = this.language.get('error_shipping_method');
						}
					}

					if (!json) {
						this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];
					}
				}

				// Shipping Method
				if (!(this.session.data['shipping_method'])) {
					json['error'] = this.language.get('error_shipping_method');
				}
			} else {
				delete this.session.data['shipping_address']);
				delete this.session.data['shipping_method']);
				delete this.session.data['shipping_methods']);
			}

			// Cart
			if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
				json['error'] = this.language.get('error_stock');
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
					json['error'] = sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);

					break;
				}
			}

			if (!json) {
				json['success'] = this.language.get('text_success');
				
				order_data = array();

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

				// Shipping Details
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

				// Products
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

				// Order Totals
				this.load.model('setting/extension',this);

				totals = array();
				taxes = await this.cart.getTaxes();
				total = 0;

				// Because __call can not keep var references so we put them into an array+
				total_data = array(
					'totals' : &totals,
					'taxes'  : &taxes,
					'total'  : &total
				});
			
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

				for (total_data['totals'] of key : value) {
					sort_order[key] = value['sort_order'];
				}

				array_multisort(sort_order, SORT_ASC, total_data['totals']);

				order_data = array_merge(order_data, total_data);

				if ((this.request.post['comment'])) {
					order_data['comment'] = this.request.post['comment'];
				} else {
					order_data['comment'] = '';
				}

				if ((this.request.post['affiliate_id'])) {
					subtotal = await this.cart.getSubTotal();

					// Affiliate
					this.load.model('account/customer',this);

					affiliate_info = await this.model_account_customer.getAffiliate(this.request.post['affiliate_id']);

					if (affiliate_info) {
						order_data['affiliate_id'] = affiliate_info['customer_id'];
						order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
					} else {
						order_data['affiliate_id'] = 0;
						order_data['commission'] = 0;
					}

					// Marketing
					order_data['marketing_id'] = 0;
					order_data['tracking'] = '';
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

				json['order_id'] = await this.model_checkout_order.addOrder(order_data);

				// Set the order history
				if ((this.request.post['order_status_id'])) {
					order_status_id = this.request.post['order_status_id'];
				} else {
					order_status_id = this.config.get('config_order_status_id');
				}

				await this.model_checkout_order.addOrderHistory(json['order_id'], order_status_id);
				
				// clear cart since the order has already been successfully stored+
				this.cart.clear();
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async edit() {
		await this.load.language('api/order');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('checkout/order',this);

			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			} else {
				order_id = 0;
			}

			order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info) {
				// Customer
				if (!(this.session.data['customer'])) {
					json['error'] = this.language.get('error_customer');
				}

				// Payment Address
				if (!(this.session.data['payment_address'])) {
					json['error'] = this.language.get('error_payment_address');
				}

				// Payment Method
				if (!json && !empty(this.request.post['payment_method'])) {
					if (empty(this.session.data['payment_methods'])) {
						json['error'] = this.language.get('error_no_payment');
					} else if (!(this.session.data['payment_methods'][this.request.post['payment_method']])) {
						json['error'] = this.language.get('error_payment_method');
					}

					if (!json) {
						this.session.data['payment_method'] = this.session.data['payment_methods'][this.request.post['payment_method']];
					}
				}

				if (!(this.session.data['payment_method'])) {
					json['error'] = this.language.get('error_payment_method');
				}

				// Shipping
				if (await this.cart.hasShipping()) {
					// Shipping Address
					if (!(this.session.data['shipping_address'])) {
						json['error'] = this.language.get('error_shipping_address');
					}

					// Shipping Method
					if (!json && !empty(this.request.post['shipping_method'])) {
						if (empty(this.session.data['shipping_methods'])) {
							json['error'] = this.language.get('error_no_shipping');
						} else {
							shipping = explode('+', this.request.post['shipping_method']);

							if (!(shipping[0]) || !(shipping[1]) || !(this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]])) {
								json['error'] = this.language.get('error_shipping_method');
							}
						}

						if (!json) {
							this.session.data['shipping_method'] = this.session.data['shipping_methods'][shipping[0]]['quote'][shipping[1]];
						}
					}

					if (!(this.session.data['shipping_method'])) {
						json['error'] = this.language.get('error_shipping_method');
					}
				} else {
					delete this.session.data['shipping_address']);
					delete this.session.data['shipping_method']);
					delete this.session.data['shipping_methods']);
				}

				// Cart
				if ((!await this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
					json['error'] = this.language.get('error_stock');
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
						json['error'] = sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);

						break;
					}
				}

				if (!json) {
					json['success'] = this.language.get('text_success');
					
					order_data = array();

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
					order_data['payment_custom_field'] = this.session.data['payment_address']['custom_field'];

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

					// Shipping Details
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
						order_data['shipping_custom_field'] = this.session.data['shipping_address']['custom_field'];

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

					// Products
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

					// Order Totals
					this.load.model('setting/extension',this);

					totals = array();
					taxes = await this.cart.getTaxes();
					total = 0;
					
					// Because __call can not keep var references so we put them into an array+ 
					total_data = array(
						'totals' : &totals,
						'taxes'  : &taxes,
						'total'  : &total
					});
			
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

					for (total_data['totals'] of key : value) {
						sort_order[key] = value['sort_order'];
					}

					array_multisort(sort_order, SORT_ASC, total_data['totals']);

					order_data = array_merge(order_data, total_data);

					if ((this.request.post['comment'])) {
						order_data['comment'] = this.request.post['comment'];
					} else {
						order_data['comment'] = '';
					}

					if ((this.request.post['affiliate_id'])) {
						subtotal = await this.cart.getSubTotal();

						// Affiliate
						this.load.model('account/customer',this);

						affiliate_info = await this.model_account_customer.getAffiliate(this.request.post['affiliate_id']);

						if (affiliate_info) {
							order_data['affiliate_id'] = affiliate_info['customer_id'];
							order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
						} else {
							order_data['affiliate_id'] = 0;
							order_data['commission'] = 0;
						}
					} else {
						order_data['affiliate_id'] = 0;
						order_data['commission'] = 0;
					}

					await this.model_checkout_order.editOrder(order_id, order_data);

					// Set the order history
					if ((this.request.post['order_status_id'])) {
						order_status_id = this.request.post['order_status_id'];
					} else {
						order_status_id = this.config.get('config_order_status_id');
					}
					
					await this.model_checkout_order.addOrderHistory(order_id, order_status_id);

					// When order editing is completed, delete added order status for Void the order first+
					if (order_status_id) {
						await this.db.query("DELETE FROM `" + DB_PREFIX + "order_history` WHERE order_id = '" + order_id + "' AND order_status_id = '0'");
					}
				}
			} else {
				json['error'] = this.language.get('error_not_found');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async delete() {
		await this.load.language('api/order');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('checkout/order',this);

			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			} else {
				order_id = 0;
			}

			order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info) {
				await this.model_checkout_order.deleteOrder(order_id);

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_not_found');
			}
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async info() {
		await this.load.language('api/order');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('checkout/order',this);

			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			} else {
				order_id = 0;
			}

			order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info) {
				json['order'] = order_info;

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_not_found');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async history() {
		await this.load.language('api/order');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			// Add keys for missing post vars
			keys = array(
				'order_status_id',
				'notify',
				'override',
				'comment'
			});

			for (keys of key) {
				if (!(this.request.post[key])) {
					this.request.post[key] = '';
				}
			}

			this.load.model('checkout/order',this);

			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			} else {
				order_id = 0;
			}

			order_info = await this.model_checkout_order.getOrder(order_id);

			if (order_info) {
				await this.model_checkout_order.addOrderHistory(order_id, this.request.post['order_status_id'], this.request.post['comment'], this.request.post['notify'], this.request.post['override']);

				json['success'] = this.language.get('text_success');
			} else {
				json['error'] = this.language.get('error_not_found');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
