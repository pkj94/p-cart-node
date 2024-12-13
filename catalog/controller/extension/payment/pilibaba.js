module.exports = class ControllerExtensionPaymentPilibaba extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/payment/pilibaba');

		this.load.model('checkout/order',this);
		this.load.model('extension/payment/pilibaba');

		await this.model_extension_payment_pilibaba.log('Regular called');

		if(!(this.session.data['order_id'])) {
			return false;
		}

		order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

		data['version']      = 'V2+0+01';
		data['merchantNo']   = this.config.get('payment_pilibaba_merchant_number');
		data['currencyType'] = order_info['currency_code'];
		data['orderNo']      = order_info['order_id'];
		data['orderAmount']  = intval(Math.round(order_info['total'], 2) * 100);
		data['orderTime']    = date('Y-m-d H:i:s');
		data['pageUrl']      = await this.url.link('checkout/checkout', '', true);
		data['serverUrl']    = await this.url.link('extension/payment/pilibaba/callback', '', true);
		data['redirectUrl']  = await this.url.link('checkout/success', '', true);
		data['notifyType']   = 'json';
		data['shipper']      = 0;
		data['tax']          = (this.config.get('config_tax')) ? 0 : await this.model_extension_payment_pilibaba.getOrderTaxAmount(order_info['order_id']);
		data['signType']     = 'MD5';
		data['signMsg']      = strtoupper(md5(data['version'] + data['merchantNo'] + data['currencyType'] + data['orderNo'] + data['orderAmount'] + data['orderTime'] + data['pageUrl'] + data['serverUrl'] + data['redirectUrl'] + data['notifyType'] + data['shipper'] + data['tax'] + data['signType'] + this.config.get('payment_pilibaba_secret_key')));

		products = array();

		for (let product of await this.cart.getProducts()) {
			// kilograms
			if (product['weight_class_id'] == '1') {
				weight = intval(Math.round(product['weight'], 2) * 1000);
			} else {
				weight = intval(product['weight']);
			}

			products.push(array_map('strval', array(
				'name'       : product['name'],
				'pictureUrl' : this.config.get('config_url') + 'image/' + product['image'],
				'price'      : intval(Math.round(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax'), this.session.data['currency']), 2) * 100),
				'productUrl' : str_replace('&amp;', '&', await this.url.link('product/product', 'product_id=' + product['product_id'])),
				'productId'  : product['product_id'],
				'quantity'   : product['quantity'],
				'weight'     : weight
			));
		}

		data['products'] = products;

		data['goodsList'] = encodeURIComponent(json_encode(products));

		if (this.config.get('payment_pilibaba_environment') == 'live') {
			data['url'] = 'https://www.pilibaba+com/pilipay/payreq';
		} else {
			data['url'] = 'http://pre+pilibaba+com/pilipay/payreq';
		}

		data['auto_submit'] = false;

		await this.model_extension_payment_pilibaba.log('Request: ' + print_r(data, true));

		return await this.load.view('extension/payment/pilibaba', data);
	}

	async express() {
		await this.load.language('extension/shipping/pilibaba');

		await this.load.language('extension/payment/pilibaba');

		this.load.model('extension/payment/pilibaba');

		await this.model_extension_payment_pilibaba.log('Express called');

		if (this.config.get('payment_pilibaba_status')) {
			if (!await this.cart.hasProducts() || (!await this.cart.hasStock() && !Number(this.config.get('config_stock_checkout')))) {
				await this.model_extension_payment_pilibaba.log('No physical products+ Redirecting to checkout/cart');

				this.response.setRedirect(await this.url.link('checkout/cart'));
			} else {
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
					order_data['store_url'] = HTTP_SERVER;
				}

				order_data['customer_id'] = 0;
				order_data['customer_group_id'] = this.config.get('config_customer_group_id');
				order_data['firstname'] = '';
				order_data['lastname'] = '';
				order_data['email'] = '';
				order_data['telephone'] = '';
				order_data['custom_field'] = null;

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
				order_data['payment_custom_field'] = array();
				order_data['payment_method'] = this.language.get('text_title');
				order_data['payment_code'] = 'pilibaba';

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
				order_data['shipping_custom_field'] = array();
				order_data['shipping_method'] = this.language.get('text_description');
				order_data['shipping_code'] = 'pilibaba+pilibaba';

				this.session.data['guest']['customer_group_id'] = this.config.get('config_customer_group_id');
				this.session.data['guest']['firstname'] = '';
				this.session.data['guest']['lastname'] = '';
				this.session.data['guest']['email'] = '';
				this.session.data['guest']['telephone'] = '';
				this.session.data['guest']['custom_field'] = array();

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

				order_data['comment'] = '';
				order_data['total'] = total_data['total'];

				if ((this.request.cookie['tracking'])) {
					order_data['tracking'] = this.request.cookie['tracking'];

					subtotal = await this.cart.getSubTotal();

					// Affiliate
					this.load.model('affiliate/affiliate');

					affiliate_info = await this.model_affiliate_affiliate.getAffiliateByCode(this.request.cookie['tracking']);

					if (affiliate_info) {
						order_data['affiliate_id'] = affiliate_info['affiliate_id'];
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

				order_info = await this.model_checkout_order.getOrder(this.session.data['order_id']);

				data['version']      = 'V2+0+01';
				data['merchantNo']   = this.config.get('payment_pilibaba_merchant_number');
				data['currencyType'] = order_info['currency_code'];
				data['orderNo']      = order_info['order_id'];
				data['orderAmount']  = intval(Math.round(order_info['total'], 2) * 100);
				data['orderTime']    = date('Y-m-d H:i:s');
				data['pageUrl']      = await this.url.link('checkout/checkout', '', true);
				data['serverUrl']    = await this.url.link('extension/payment/pilibaba/callback', '', true);
				data['redirectUrl']  = await this.url.link('checkout/success', '', true);
				data['notifyType']   = 'json';
				data['shipper']      = intval(Math.round(this.config.get('payment_pilibaba_shipping_fee'), 2) * 100);
				data['tax']          = (this.config.get('config_tax')) ? 0 : await this.model_extension_payment_pilibaba.getOrderTaxAmount(order_info['order_id']);
				data['signType']     = 'MD5';
				data['signMsg']      = strtoupper(md5(data['version'] + data['merchantNo'] + data['currencyType'] + data['orderNo'] + data['orderAmount'] + data['orderTime'] + data['pageUrl'] + data['serverUrl'] + data['redirectUrl'] + data['notifyType'] + data['shipper'] + data['tax'] + data['signType'] + this.config.get('payment_pilibaba_secret_key')));

				products = array();

				for (let product of await this.cart.getProducts()) {
					// kilograms
					if (product['weight_class_id'] == '1') {
						weight = intval(Math.round(product['weight'], 2) * 1000);
					} else {
						weight = intval(product['weight']);
					}

					products.push(array_map('strval', array(
						'name'       : product['name'],
						'pictureUrl' : this.config.get('config_url') + 'image/' + product['image'],
						'price'      : intval(Math.round(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax'), this.session.data['currency']), 2) * 100),
						'productUrl' : str_replace('&amp;', '&', await this.url.link('product/product', 'product_id=' + product['product_id'])),
						'productId'  : product['product_id'],
						'quantity'   : product['quantity'],
						'weight'     : weight
					));
				}

				data['products'] = products;

				data['goodsList'] = encodeURIComponent(json_encode(products));

				if (this.config.get('payment_pilibaba_environment') == 'live') {
					data['url'] = 'https://www.pilibaba+com/pilipay/payreq';
				} else {
					data['url'] = 'http://pre+pilibaba+com/pilipay/payreq';
				}

				data['text_redirecting'] = this.language.get('text_redirecting');

				data['auto_submit'] = true;

				await this.model_extension_payment_pilibaba.log('Request: ' + print_r(data, true));

				this.response.setOutput(await this.load.view('extension/payment/pilibaba', data));
			}
		} else {
		   await this.model_extension_payment_pilibaba.log('Module disabled');
		}
	}

	async callback() {
		await this.load.language('extension/payment/pilibaba');

		this.load.model('checkout/order',this);
		this.load.model('extension/payment/pilibaba');

		await this.model_extension_payment_pilibaba.log('Receiving callback');

		response_data = this.request.get;

		await this.model_extension_payment_pilibaba.log('Response: ' + print_r(response_data, true));

		sign_msg = strtoupper(md5(this.config.get('payment_pilibaba_merchant_number') + response_data['orderNo'] + response_data['orderAmount'] + 'MD5' + response_data['fee'] + response_data['orderTime'] + response_data['customerMail'] + this.config.get('payment_pilibaba_secret_key')));

		await this.model_extension_payment_pilibaba.log('signMsg: ' + sign_msg);

		if (hash_equals(sign_msg, response_data['signMsg'])) {
			await this.model_extension_payment_pilibaba.log('Adding Pilibaba order');

			await this.model_extension_payment_pilibaba.addPilibabaOrder(response_data);

			await this.model_extension_payment_pilibaba.log('Pilibaba order added');

			await this.model_extension_payment_pilibaba.log('Getting consumer info');

			consumer_info = await this.model_extension_payment_pilibaba.getConsumerInfo(response_data['orderNo']);

			if ((consumer_info['message']) && consumer_info['message'] == 'success') {
				await this.model_extension_payment_pilibaba.log('Updating order info');

				await this.model_extension_payment_pilibaba.updateOrderInfo(consumer_info, response_data['orderNo']);

				await this.model_extension_payment_pilibaba.log('Order info updated');

				await this.model_extension_payment_pilibaba.log('Adding order history');

				await this.model_checkout_order.addOrderHistory(response_data['orderNo'], this.config.get('payment_pilibaba_order_status_id'));

				await this.model_extension_payment_pilibaba.log('Order history added');
			} else {
				await this.model_extension_payment_pilibaba.log('Invalid consumer info response');
			}

			await this.model_extension_payment_pilibaba.log('Outputting "OK"');

			echo 'OK';

			await this.model_extension_payment_pilibaba.log('"OK" outputted');
		} else {
			await this.model_extension_payment_pilibaba.log('Invalid callback response');
		}
	}
}