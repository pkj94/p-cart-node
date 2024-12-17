module.exports = class ControllerCheckoutCart extends Controller {
	async index() {
		const data = {};
		await this.load.language('checkout/cart');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'href': await this.url.link('common/home'),
			'text': this.language.get('text_home')
		});

		data['breadcrumbs'].push({
			'href': await this.url.link('checkout/cart'),
			'text': this.language.get('heading_title')
		});

		if (await this.cart.hasProducts() || (this.session.data['vouchers'])) {
			if (!await this.cart.hasStock() && (!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning')))) {
				data['error_warning'] = this.language.get('error_stock');
			} else if ((this.session.data['error'])) {
				data['error_warning'] = this.session.data['error'];

				delete this.session.data['error'];
			} else {
				data['error_warning'] = '';
			}

			if (Number(this.config.get('config_customer_price')) && !await this.customer.isLogged()) {
				data['attention'] = sprintf(this.language.get('text_login'), await this.url.link('account/login'), await this.url.link('account/register'));
			} else {
				data['attention'] = '';
			}

			if ((this.session.data['success'])) {
				data['success'] = this.session.data['success'];

				delete this.session.data['success'];
			} else {
				data['success'] = '';
			}

			data['action'] = await this.url.link('checkout/cart/edit', '', true);

			if (this.config.get('config_cart_weight')) {
				data['weight'] = this.weight.format(await this.cart.getWeight(), this.config.get('config_weight_class_id'), this.language.get('decimal_point'), this.language.get('thousand_point'));
			} else {
				data['weight'] = '';
			}

			this.load.model('tool/image', this);
			this.load.model('tool/upload', this);

			data['products'] = [];

			const products = await this.cart.getProducts();
			for (let product of products) {
				let product_total = 0;
				for (let product_2 of products) {
					if (product_2['product_id'] == product['product_id']) {
						product_total += product_2['quantity'];
					}
				}

				if (product['minimum'] > product_total) {
					data['error_warning'] = sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);
				}
				let image = '';
				if (product['image']) {
					image = await this.model_tool_image.resize(product['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_cart_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_cart_height'));
				}

				const option_data = [];

				for (let option of product['option']) {
					let value = '';
					if (option['type'] != 'file') {
						value = option['value'];
					} else {
						const upload_info = await this.model_tool_upload.getUploadByCode(option['value']);

						if (upload_info.upload_id) {
							value = upload_info['name'];
						} else {
							value = '';
						}
					}

					option_data.push({
						'name': option['name'],
						'value': (utf8_strlen(value) > 20 ? utf8_substr(value, 0, 20) + '..' : value)
					});
				}

				// Display prices
				let price = false;
				let total = false;
				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					let unit_price = this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax'));

					price = this.currency.format(unit_price, this.session.data['currency']);
					total = this.currency.format(unit_price * product['quantity'], this.session.data['currency']);
				} else {

				}

				let recurring = '';

				if (product['recurring']) {
					const frequencies = {
						'day': this.language.get('text_day'),
						'week': this.language.get('text_week'),
						'semi_month': this.language.get('text_semi_month'),
						'month': this.language.get('text_month'),
						'year': this.language.get('text_year')
					};
					let recurring = '';
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
					'cart_id': product['cart_id'],
					'thumb': image,
					'name': product['name'],
					'model': product['model'],
					'option': option_data,
					'recurring': recurring,
					'quantity': product['quantity'],
					'stock': product['stock'] ? true : !(!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning'))),
					'reward': (product['reward'] ? sprintf(this.language.get('text_points'), product['reward']) : ''),
					'price': price,
					'total': total,
					'href': await this.url.link('product/product', 'product_id=' + product['product_id'])
				});
			}
			// Gift Voucher
			data['vouchers'] = [];

			if ((this.session.data['vouchers'])) {
				for (let [key, voucher] of Object.entries(this.session.data['vouchers'])) {
					data['vouchers'].push({
						'key': key,
						'description': voucher['description'],
						'amount': this.currency.format(voucher['amount'], this.session.data['currency']),
						'remove': await this.url.link('checkout/cart', 'remove=' + key)
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

			// Display prices
			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {

				let results = await this.model_setting_extension.getExtensions('total');
				results = results.sort((a, b) => Number(this.config.get('total_' + a['code'] + '_sort_order')) - Number(this.config.get('total_' + b['code'] + '_sort_order')))


				for (let result of results) {
					if (Number(this.config.get('total_' + result['code'] + '_status'))) {
						this.load.model('extension/total/' + result['code'], this);

						// We have to put the totals in an array so that they pass by reference.
						total_data = await this['model_extension_total_' + result['code']].getTotal(total_data);
						totals = total_data.totals;
						taxes = total_data.taxes;
						total = total_data.total;
					}
				}
				totals = totals.sort((a, b) => a.sort_order - b.sort_order);
			}

			data['totals'] = [];

			for (let total of totals) {
				data['totals'].push({
					'title': total['title'],
					'text': this.currency.format(total['value'], this.session.data['currency'])
				});
			}

			data['continue'] = await this.url.link('common/home');

			data['checkout'] = await this.url.link('checkout/checkout', '', true);

			this.load.model('setting/extension', this);

			data['modules'] = [];

			const files = require('glob').sync(DIR_APPLICATION + '/controller/extension/total/*.js');

			if (files.length) {
				for (let file of files) {
					const result = await this.load.controller('extension/total/' + expressPath.basename(file, '.js'));

					if (result) {
						data['modules'].push(result);
					}
				}
			}

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			await this.session.save(this.session.data);
			this.response.setOutput(await this.load.view('checkout/cart', data));
		} else {
			data['text_error'] = this.language.get('text_empty');

			data['continue'] = await this.url.link('common/home');

			delete this.session.data['success'];

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			await this.session.save(this.session.data);
			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}

	async add() {
		await this.load.language('checkout/cart');

		const json = { error: {} };
		let product_id = 0;
		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		}

		this.load.model('catalog/product', this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info.product_id) {
			let quantity = 1;
			if ((this.request.post['quantity'])) {
				quantity = this.request.post['quantity'];
			}
			let option = [];
			// console.log(this.request.post)
			if ((this.request.post['option'])) {
				option = this.request.post['option'];
			}

			const product_options = await this.model_catalog_product.getProductOptions(this.request.post['product_id']);

			for (let product_option of product_options) {
				if (product_option['required'] && !(option[product_option['product_option_id']])) {
					json['error']['option'] = json['error']['option'] || {};
					json['error']['option'][product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
				}
			}
			let recurring_id = 0;
			if ((this.request.post['recurring_id'])) {
				recurring_id = this.request.post['recurring_id'];
			}

			const recurrings = await this.model_catalog_product.getProfiles(product_info['product_id']);

			if (recurrings.length) {
				const recurring_ids = [];

				for (let recurring of recurrings) {
					recurring_ids.push(recurring['recurring_id']);
				}

				if (!recurring_ids.includes(recurring_id)) {
					json['error']['recurring'] = this.language.get('error_recurring_required');
				}
			}

			if (!Object.keys(json.error).length) {
				await this.cart.add(this.request.post['product_id'], quantity, option, recurring_id);

				json['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'product_id=' + this.request.post['product_id']), product_info['name'], await this.url.link('checkout/cart'));

				// Unset all shipping and payment methods
				delete this.session.data['shipping_method'];
				delete this.session.data['shipping_methods'];
				delete this.session.data['payment_method'];
				delete this.session.data['payment_methods'];

				// Totals
				this.load.model('setting/extension', this);

				let totals = [];
				let taxes = await this.cart.getTaxes();
				let total = 0;

				// Because __call can not keep var references so we put them into an array. 			
				const total_data = {
					'totals': totals,
					'taxes': taxes,
					'total': total
				};

				// Display prices
				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {


					let results = await this.model_setting_extension.getExtensions('total');
					results = results.sort((a, b) => Number(this.config.get('total_' + a['code'] + '_sort_order')) - Number(this.config.get('total_' + b['code'] + '_sort_order')))


					for (let result of results) {
						if (Number(this.config.get('total_' + result['code'] + '_status'))) {
							this.load.model('extension/total/' + result['code'], this);

							// We have to put the totals in an array so that they pass by reference.
							await this['model_extension_total_' + result['code']].getTotal(total_data);
						}
					}
					totals = totals.sort((a, b) => a.sort_order - b.sort_order);
				}

				json['total'] = sprintf(this.language.get('text_items'), await this.cart.countProducts() + ((this.session.data['vouchers']) ? this.session.data['vouchers'].length : 0), this.currency.format(total, this.session.data['currency']));
			} else {
				json['redirect'] = (await this.url.link('product/product', 'product_id=' + this.request.post['product_id'])).replaceAll('&amp;', '&');
			}
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async edit() {
		await this.load.language('checkout/cart');

		const json = {};
		// console.log(this.request.post);
		// Update
		if ((this.request.post['quantity'])) {
			for (let [key, value] of Object.entries(this.request.post['quantity'])) {
				await this.cart.update(key, value);
			}

			this.session.data['success'] = this.language.get('text_remove');

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('checkout/cart'));
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async remove() {
		await this.load.language('checkout/cart');

		const json = {};

		// Remove
		if ((this.request.post['key'])) {
			await this.cart.remove(this.request.post['key']);

			delete (this.session.data['vouchers'] || [])[this.request.post['key']];

			json['success'] = this.language.get('text_remove');

			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
			delete this.session.data['reward'];

			// Totals
			this.load.model('setting/extension', this);

			let totals = [];
			let taxes = await this.cart.getTaxes();
			let total = 0;

			// Because __call can not keep var references so we put them into an array. 			
			const total_data = {
				'totals': totals,
				'taxes': taxes,
				'total': total
			};

			// Display prices
			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {

				let results = await this.model_setting_extension.getExtensions('total');

				results = results.sort((a, b) => Number(this.config.get('total_' + a['code'] + '_sort_order')) - Number(this.config.get('total_' + b['code'] + '_sort_order')))


				for (let result of results) {
					if (Number(this.config.get('total_' + result['code'] + '_status'))) {
						this.load.model('extension/total/' + result['code'], this);

						// We have to put the totals in an array so that they pass by reference.
						await this['model_extension_total_' + result['code']].getTotal(total_data);
					}
				}
				totals = totals.sort((a, b) => a.sort_order - b.sort_order);
			}

			json['total'] = sprintf(this.language.get('text_items'), await this.cart.countProducts() + ((this.session.data['vouchers']) ? count(this.session.data['vouchers']) : 0), this.currency.format(total, this.session.data['currency']));
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
