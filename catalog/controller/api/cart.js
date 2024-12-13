module.exports = class ControllerApiCart extends Controller {
	async add() {
		await this.load.language('api/cart');

		const json = {};
			
		if (!(this.session.data['api_id'])) {
			json['error']['warning'] = this.language.get('error_permission');
		} else {
			if ((this.request.post['product'])) {
				this.cart.clear();

				for (this.request.post['product'] of product) {
					if ((product['option'])) {
						option = product['option'];
					} else {
						option = array();
					}

					this.cart.add(product['product_id'], product['quantity'], option);
				}

				json['success'] = this.language.get('text_success');

				delete this.session.data['shipping_method']);
				delete this.session.data['shipping_methods']);
				delete this.session.data['payment_method']);
				delete this.session.data['payment_methods']);
			} else if ((this.request.post['product_id'])) {
				this.load.model('catalog/product',this);

				product_info = await this.model_catalog_product.getProduct(this.request.post['product_id']);

				if (product_info.product_id) {
					if ((this.request.post['quantity'])) {
						quantity = this.request.post['quantity'];
					} else {
						quantity = 1;
					}

					if ((this.request.post['option'])) {
						option = array_filter(this.request.post['option']);
					} else {
						option = array();
					}

					product_options = await this.model_catalog_product.getProductOptions(this.request.post['product_id']);

					for (product_options of product_option) {
						if (product_option['required'] && empty(option[product_option['product_option_id']])) {
							json['error']['option'][product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
						}
					}

					if (!(json['error']['option'])) {
						this.cart.add(this.request.post['product_id'], quantity, option);

						json['success'] = this.language.get('text_success');

						delete this.session.data['shipping_method']);
						delete this.session.data['shipping_methods']);
						delete this.session.data['payment_method']);
						delete this.session.data['payment_methods']);
					}
				} else {
					json['error']['store'] = this.language.get('error_store');
				}
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async edit() {
		await this.load.language('api/cart');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.cart.update(this.request.post['key'], this.request.post['quantity']);

			json['success'] = this.language.get('text_success');

			delete this.session.data['shipping_method']);
			delete this.session.data['shipping_methods']);
			delete this.session.data['payment_method']);
			delete this.session.data['payment_methods']);
			delete this.session.data['reward']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async remove() {
		await this.load.language('api/cart');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			// Remove
			if ((this.request.post['key'])) {
				this.cart.remove(this.request.post['key']);

				delete this.session.data['vouchers'][this.request.post['key']]);

				json['success'] = this.language.get('text_success');

				delete this.session.data['shipping_method']);
				delete this.session.data['shipping_methods']);
				delete this.session.data['payment_method']);
				delete this.session.data['payment_methods']);
				delete this.session.data['reward']);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async products() {
		await this.load.language('api/cart');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error']['warning'] = this.language.get('error_permission');
		} else {
			// Stock
			if (!await this.cart.hasStock() && (!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning')))) {
				json['error']['stock'] = this.language.get('error_stock');
			}

			// Products
			json['products'] = array();

			products = await this.cart.getProducts();

			for (let product of products) {
				product_total = 0;

				for (let product of products_2) {
					if (product_2['product_id'] == product['product_id']) {
						product_total += product_2['quantity'];
					}
				}

				if (product['minimum'] > product_total) {
					json['error']['minimum'].push(sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);
				}

				option_data = array();

				for (let option of product['option']) {
					option_data.push(array(
						'product_option_id'       : option['product_option_id'],
						'product_option_value_id' : option['product_option_value_id'],
						'name'                    : option['name'],
						'value'                   : option['value'],
						'type'                    : option['type']
					});
				}

				json['products'].push(array(
					'cart_id'    : product['cart_id'],
					'product_id' : product['product_id'],
					'name'       : product['name'],
					'model'      : product['model'],
					'option'     : option_data,
					'quantity'   : product['quantity'],
					'stock'      : product['stock'] ? true : !(!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning'))),
					'shipping'   : product['shipping'],
					'price'      : this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']),
					'total'      : this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')) * product['quantity'], this.session.data['currency']),
					'reward'     : product['reward']
				});
			}

			// Voucher
			json['vouchers'] = array();

			if (!empty(this.session.data['vouchers'])) {
				for (let [key , voucher] of Object.entries(this.session.data['vouchers'])) {
					json['vouchers'].push(array(
						'code'             : voucher['code'],
						'description'      : voucher['description'],
						'from_name'        : voucher['from_name'],
						'from_email'       : voucher['from_email'],
						'to_name'          : voucher['to_name'],
						'to_email'         : voucher['to_email'],
						'voucher_theme_id' : voucher['voucher_theme_id'],
						'message'          : voucher['message'],
						'price'            : this.currency.format(voucher['amount'], this.session.data['currency']),			
						'amount'           : voucher['amount']
					});
				}
			}

			// Totals
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

			for (totals of key : value) {
				sort_order[key] = value['sort_order'];
			}

			array_multisort(sort_order, SORT_ASC, totals);

			json['totals'] = array();

			for (let total of totals) {
				json['totals'].push(array(
					'title' : total['title'],
					'text'  : this.currency.format(total['value'], this.session.data['currency'])
				});
			}
		}
		
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
