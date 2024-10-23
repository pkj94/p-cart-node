const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Cart extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('checkout/cart');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'))
		});
		if (await this.cart.hasProducts() || (this.session.data['vouchers'] && this.session.data['vouchers'].length)) {
			if (!await this.cart.hasStock() && (!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning')))) {
				data['error_warning'] = this.language.get('error_stock');
			} else if ((this.session.data['error'])) {
				data['error_warning'] = this.session.data['error'];

				delete this.session.data['error'];
			} else {
				data['error_warning'] = '';
			}

			if (Number(this.config.get('config_customer_price')) && !await this.customer.isLogged()) {
				data['attention'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', 'language=' + this.config.get('config_language')), await this.url.link('account/register', 'language=' + this.config.get('config_language')));
			} else {
				data['attention'] = '';
			}

			if ((this.session.data['success'])) {
				data['success'] = this.session.data['success'];

				delete this.session.data['success'];
			} else {
				data['success'] = '';
			}

			if (Number(this.config.get('config_cart_weight'))) {
				data['weight'] = this.weight.format(await this.cart.getWeight(), this.config.get('config_weight_class_id'), this.language.get('decimal_point'), this.language.get('thousand_point'));
			} else {
				data['weight'] = '';
			}

			data['list'] = await this.getList();

			data['modules'] = [];

			this.load.model('setting/extension', this);

			const extensions = await this.model_setting_extension.getExtensionsByType('total');
			for (let extension of extensions) {
				const result = await this.load.controller('extension/' + extension['extension'] + '/total/' + extension['code']);
				if (result) {
					data['modules'].push(result);
				}
			}

			data['language'] = this.config.get('config_language');

			data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));
			data['checkout'] = await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'));

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			await this.session.save(this.session.data);
			this.response.setOutput(await this.load.view('checkout/cart', data));
		} else {
			data['text_error'] = this.language.get('text_no_results');

			data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('checkout/cart');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		data['list'] = await this.url.link(' ', 'language=' + this.config.get('config_language'));
		data['product_edit'] = await this.url.link('checkout/cart.edit', 'language=' + this.config.get('config_language'));
		data['product_remove'] = await this.url.link('checkout/cart.remove', 'language=' + this.config.get('config_language'));
		data['voucher_remove'] = await this.url.link('checkout/voucher+remove', 'language=' + this.config.get('config_language'));

		// Display prices
		let price_status = false;
		if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
			price_status = true;
		}

		this.load.model('tool/image', this);
		this.load.model('tool/upload', this);

		data['products'] = [];

		this.load.model('checkout/cart', this);

		let products = await this.model_checkout_cart.getProducts();
		for (let product of products) {
			if (!product['minimum']) {
				data['error_warning'] = sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);
			}

			if (product['option']) {
				for (let [key, option] of Object.entries(product['option'])) {
					product['option'][key]['value'] = (oc_strlen(option['value']) > 20 ? oc_substr(option['value'], 0, 20) + '++' : option['value']);
				}
			}

			let description = '';
			if (product['subscription'].subscription_plan_id) {
				if (product['subscription']['trial_status']) {
					let trial_price = this.currency.format(this.tax.calculate(product['subscription']['trial_price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
					let trial_cycle = product['subscription']['trial_cycle'];
					let trial_frequency = this.language.get('text_' + product['subscription']['trial_frequency']);
					let trial_duration = product['subscription']['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), price_status ? trial_price : '', trial_cycle, trial_frequency, trial_duration);
				}

				let price = this.currency.format(this.tax.calculate(product['subscription']['price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);

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
				'thumb': product['image'],
				'name': product['name'],
				'model': product['model'],
				'option': product['option'],
				'subscription': description,
				'quantity': product['quantity'],
				'stock': product['stock'] ? true : !(!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning'))),
				'minimum': product['minimum'],
				'reward': product['reward'],
				'price': price_status ? this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']) : '',
				'total': price_status ? this.currency.format(this.tax.calculate(product['total'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']) : '',
				'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product['product_id'])
			});
		}

		// Gift Voucher
		data['vouchers'] = [];

		const vouchers = await this.model_checkout_cart.getVouchers();

		for (let [key, voucher] of Object.entries(vouchers)) {
			data['vouchers'].push({
				'key': key,
				'description': voucher['description'],
				'amount': this.currency.format(voucher['amount'], this.session.data['currency'])
			});
		}

		data['totals'] = [];

		let totals = [];
		let taxes = await this.cart.getTaxes();
		let total = 0;
		// Display prices
		if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
			let totalData = await this.model_checkout_cart.getTotals(totals, taxes, total);
			total = totalData.total;
			taxes = totalData.taxes;
			const totals = totalData.totals;
			for (let result of totals) {
				data['totals'].push({
					'title': result['title'],
					'text': price_status ? this.currency.format(result['value'], this.session.data['currency']) : ''
				});
			}
		}

		return await this.load.view('checkout/cart_list', data);
	}

	/**
	 * @return void
	 */
	async add() {
		await this.load.language('checkout/cart');

		const json = {};
		let product_id = 0;
		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		}
		let quantity = 1;
		if ((this.request.post['quantity'])) {
			quantity = this.request.post['quantity'];
		}
		let option = [];
		if ((this.request.post['option'] && this.request.post['option'].length)) {
			option = this.request.post['option'].filter(a => a);
		}
		let subscription_plan_id = 0;
		if ((this.request.post['subscription_plan_id'])) {
			subscription_plan_id = this.request.post['subscription_plan_id'];
		}

		this.load.model('catalog/product', this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info.product_id) {
			// If variant get master product
			if (product_info['master_id']) {
				product_id = product_info['master_id'];
			}

			// Only use values in the override
			let override = [];
			if ((product_info['override']['variant'])) {
				override = product_info['override']['variant'];
			}

			// Merge variant code with options
			for (let [key, value] of Object.entries(product_info['variant'])) {
				if (Object.keys(override).filter(a => a == key).length) {
					option[key] = value;
				}
			}

			// Validate options
			const product_options = await this.model_catalog_product.getOptions(product_id);

			for (let product_option of product_options) {
				if (product_option['required'] && option[product_option['product_option_id']]) {
					json['error']['option_' + product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
				}
			}

			// Validate subscription products
			const subscriptions = await this.model_catalog_product.getSubscriptions(product_id);

			if (subscriptions.length) {
				let subscription_plan_ids = [];

				for (let subscription of subscriptions) {
					subscription_plan_ids.push(subscription['subscription_plan_id']);
				}

				if (!subscription_plan_ids.includes(subscription_plan_id)) {
					json['error']['subscription'] = this.language.get('error_subscription');
				}
			}
		} else {
			json['error']['warning'] = this.language.get('error_product');
		}

		if (!Object.keys(json).length) {
			await this.cart.add(product_id, quantity, option, subscription_plan_id);

			json['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id), product_info['name'], await this.url.link('checkout/cart', 'language=' + this.config.get('config_language')));

			// Unset all shipping and payment methods
			delete this.session.data['shipping_method'];
			delete this.session.data['shipping_methods'];
			delete this.session.data['payment_method'];
			delete this.session.data['payment_methods'];
		} else {
			json['redirect'] = await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id, true);
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async edit() {
		await this.load.language('checkout/cart');

		const json = {};
		let key = 0;
		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		}
		let quantity = 1;
		if ((this.request.post['quantity'])) {
			quantity = this.request.post['quantity'];
		}

		if (!await this.cart.has(key)) {
			json['error'] = this.language.get('error_product');
		}

		if (!Object.keys(json).length) {
			// Handles single item update
			await this.cart.update(key, quantity);

			if (await this.cart.hasProducts() || (this.session.data['vouchers'] && this.session.data['vouchers'].length)) {
				json['success'] = this.language.get('text_edit');
			} else {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
			}

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

	/**
	 * @return void
	 */
	async remove() {
		await this.load.language('checkout/cart');

		const json = {};
		let key = 0;
		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		}

		if (!await this.cart.has(key)) {
			json['error'] = this.language.get('error_product');
		}

		// Remove
		if (!Object.keys(json).length) {
			await this.cart.remove(key);
			if (await this.cart.hasProducts() || (this.session.data['vouchers'] && this.session.data['vouchers'].length)) {
				json['success'] = this.language.get('text_remove');
			} else {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
			}

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
}
