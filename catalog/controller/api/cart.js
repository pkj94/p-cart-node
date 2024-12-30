module.exports = class ControllerApiCart extends Controller {
	async add() {
		await this.load.language('api/cart');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error']['warning'] = this.language.get('error_permission');
		} else {
			if ((this.request.post['product'])) {
				await this.cart.clear();

				for (let product of this.request.post['product']) {
					let option = [];
					if ((product['option'])) {
						option = product['option'];
					} else {
						option = [];
					}

					await this.cart.add(product['product_id'], product['quantity'], option);
				}

				json['success'] = this.language.get('text_success');

				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
			} else if ((this.request.post['product_id'])) {
				this.load.model('catalog/product', this);

				const product_info = await this.model_catalog_product.getProduct(this.request.post['product_id']);

				if (product_info.product_id) {
					let quantity = 1;
					if ((this.request.post['quantity'])) {
						quantity = this.request.post['quantity'];
					}
					let option = [];
					if ((this.request.post['option'])) {
						option = array_filter(this.request.post['option']);
					} else {
						option = [];
					}

					const product_options = await this.model_catalog_product.getProductOptions(this.request.post['product_id']);

					for (let product_option of product_options) {
						if (product_option['required'] && !(option[product_option['product_option_id']])) {
							json['error']['option'][product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
						}
					}

					if (!(json['error']['option'])) {
						await this.cart.add(this.request.post['product_id'], quantity, option);

						json['success'] = this.language.get('text_success');

						delete this.session.data['shipping_method'];
						delete this.session.data['shipping_methods'];
						delete this.session.data['payment_method'];
						delete this.session.data['payment_methods'];
					}
				} else {
					json['error']['store'] = this.language.get('error_store');
				}
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async edit() {
		await this.load.language('api/cart');

		const json = {};

		if (!(this.session.data['api_id'])) {
			json['error'] = this.language.get('error_permission');
		} else {
			await this.cart.update(this.request.post['key'], this.request.post['quantity']);

			json['success'] = this.language.get('text_success');

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];
		}
		await this.session.save(this.session.data);
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
				await this.cart.remove(this.request.post['key']);

				delete this.session.data['vouchers'][this.request.post['key']];

				json['success'] = this.language.get('text_success');

				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];
				delete this.session.data['reward'];
			}
		}
		await this.session.save(this.session.data);
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
			json['products'] = [];

			const products = await this.cart.getProducts();

			for (let product of products) {
				let product_total = 0;

				for (let product_2 of products) {
					if (product_2['product_id'] == product['product_id']) {
						product_total += product_2['quantity'];
					}
				}

				if (product['minimum'] > product_total) {
					json['error']['minimum'].push(sprintf(this.language.get('error_minimum'), product['name'], product['minimum']));
				}

				const option_data = [];

				for (let option of product['option']) {
					option_data.push({
						'product_option_id': option['product_option_id'],
						'product_option_value_id': option['product_option_value_id'],
						'name': option['name'],
						'value': option['value'],
						'type': option['type']
					});
				}

				json['products'].push({
					'cart_id': product['cart_id'],
					'product_id': product['product_id'],
					'name': product['name'],
					'model': product['model'],
					'option': option_data,
					'quantity': product['quantity'],
					'stock': product['stock'] ? true : !(!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning'))),
					'shipping': product['shipping'],
					'price': this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']),
					'total': this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')) * product['quantity'], this.session.data['currency']),
					'reward': product['reward']
				});
			}

			// Voucher
			json['vouchers'] = [];

			if ((this.session.data['vouchers'])) {
				for (let [key, voucher] of Object.entries(this.session.data['vouchers'])) {
					json['vouchers'].push({
						'code': voucher['code'],
						'description': voucher['description'],
						'from_name': voucher['from_name'],
						'from_email': voucher['from_email'],
						'to_name': voucher['to_name'],
						'to_email': voucher['to_email'],
						'voucher_theme_id': voucher['voucher_theme_id'],
						'message': voucher['message'],
						'price': this.currency.format(voucher['amount'], this.session.data['currency']),
						'amount': voucher['amount']
					});
				}
			}

			// Totals
			this.load.model('setting/extension', this);

			let totals = [];
			let taxes = await this.cart.getTaxes();
			let total = 0;

			// Because __call can not keep var references so we put them into an array.
			let total_data = {
				'totals': totals,
				'taxes': taxes,
				'total': total
			};
			let results = await this.model_setting_extension.getExtensions('total');
			results = results.sort((a, b) => Number(this.config.get('total_' + a['code'] + '_sort_order')) - Number(this.config.get('total_' + b['code'] + '_sort_order')));


			for (let result of results) {
				if (Number(this.config.get('total_' + result['code'] + '_status'))) {
					this.load.model('extension/total/' + result['code'], this);

					// We have to put the totals in an array so that they pass by reference.
					total_data =await this['model_extension_total_' + result['code']].getTotal(total_data);
					totals = total_data.totals;
					taxes = total_data.taxes;
					total = total_data.total;
				}
			}
			totals = totals.sort((a, b) => a.sort_order - b.sort_order);

			json['totals'] = [];

			for (let total of totals) {
				json['totals'].push({
					'title': total['title'],
					'text': this.currency.format(total['value'], this.session.data['currency'])
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
