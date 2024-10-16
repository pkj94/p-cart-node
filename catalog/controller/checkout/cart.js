<?php
namespace Opencart\Catalog\Controller\Checkout;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Checkout
 */
class CartController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('checkout/cart');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'))
		];

		if (this.cart.hasProducts() || (this.session.data['vouchers'])) {
			if (!this.cart.hasStock() && (!this.config.get('config_stock_checkout') || this.config.get('config_stock_warning'))) {
				data['error_warning'] = this.language.get('error_stock');
			} else if ((this.session.data['error'])) {
				data['error_warning'] = this.session.data['error'];

				delete (this.session.data['error']);
			} else {
				data['error_warning'] = '';
			}

			if (this.config.get('config_customer_price') && !await this.customer.isLogged()) {
				data['attention'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', 'language=' + this.config.get('config_language')), await this.url.link('account/register', 'language=' + this.config.get('config_language')));
			} else {
				data['attention'] = '';
			}

			if ((this.session.data['success'])) {
				data['success'] = this.session.data['success'];

				delete (this.session.data['success']);
			} else {
				data['success'] = '';
			}

			if (this.config.get('config_cart_weight')) {
				data['weight'] = this.weight.format(this.cart.getWeight(), this.config.get('config_weight_class_id'), this.language.get('decimal_point'), this.language.get('thousand_point'));
			} else {
				data['weight'] = '';
			}

			data['list'] = await this.load.controller('checkout/cart+getList');

			data['modules'] = [];

			this.load.model('setting/extension',this);

			extensions = await this.model_setting_extension.getExtensionsByType('total');

			for (extensions as extension) {
				 result = await this.load.controller('extension/' + extension['extension'] + '/total/' + extension['code']);

				if (!result instanceof \Exception) {
					data['modules'].push(result;
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

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		data['list'] = await this.url.link(' ', 'language=' + this.config.get('config_language'));
		data['product_edit'] = await this.url.link('checkout/cart+edit', 'language=' + this.config.get('config_language'));
		data['product_remove'] = await this.url.link('checkout/cart+remove', 'language=' + this.config.get('config_language'));
		data['voucher_remove'] = await this.url.link('checkout/voucher+remove', 'language=' + this.config.get('config_language'));

		// Display prices
		if (await this.customer.isLogged() || !this.config.get('config_customer_price')) {
			price_status = true;
		} else {
			price_status = false;
		}

		this.load.model('tool/image',this);
		this.load.model('tool/upload',this);

		data['products'] = [];

		this.load.model('checkout/cart',this);

		let products = await this.model_checkout_cart.getProducts();

		for (let product of products) {
			if (!product['minimum']) {
				data['error_warning'] = sprintf(this.language.get('error_minimum'), product['name'], product['minimum']);
			}

			if (product['option']) {
				for (let [key , option] of Object.entries(product['option'])) {
					product['option'][key]['value'] = (oc_strlen(option['value']) > 20 ? oc_substr(option['value'], 0, 20) + '++' : option['value']);
				}
			}

			description = '';

			if (product['subscription']) {
				if (product['subscription']['trial_status']) {
					trial_price = this.currency.format(this.tax.calculate(product['subscription']['trial_price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					trial_cycle = product['subscription']['trial_cycle'];
					trial_frequency = this.language.get('text_' + product['subscription']['trial_frequency']);
					trial_duration = product['subscription']['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), price_status ? trial_price : '', trial_cycle, trial_frequency, trial_duration);
				}

				price = this.currency.format(this.tax.calculate(product['subscription']['price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);

				cycle = product['subscription']['cycle'];
				frequency = this.language.get('text_' + product['subscription']['frequency']);
				duration = product['subscription']['duration'];

				if (duration) {
					description += sprintf(this.language.get('text_subscription_duration'), price_status ? price : '', cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price_status ? price : '', cycle, frequency);
				}
			}

			data['products'].push({
				'cart_id'      : product['cart_id'],
				'thumb'        : product['image'],
				'name'         : product['name'],
				'model'        : product['model'],
				'option'       : product['option'],
				'subscription' : description,
				'quantity'     : product['quantity'],
				'stock'        : product['stock'] ? true : !(!this.config.get('config_stock_checkout') || this.config.get('config_stock_warning')),
				'minimum'      : product['minimum'],
				'reward'       : product['reward'],
				'price'        : price_status ? this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']) : '',
				'total'        : price_status ? this.currency.format(this.tax.calculate(product['total'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']) : '',
				'href'         : await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product['product_id'])
			];
		}

		// Gift Voucher
		data['vouchers'] = [];

		vouchers = await this.model_checkout_cart.getVouchers();

		for (let [key , voucher] of Object.entries(vouchers)) {
			data['vouchers'].push({
				'key'         : key,
				'description' : voucher['description'],
				'amount'      : this.currency.format(voucher['amount'], this.session.data['currency'])
			];
		}

		data['totals'] = [];

		totals = [];
		taxes = await this.cart.getTaxes();
		total = 0;

		// Display prices
		if (await this.customer.isLogged() || !this.config.get('config_customer_price')) {
			(this.model_checkout_cart.getTotals)(totals, taxes, total);

			for (totals as result) {
				data['totals'].push({
					'title' : result['title'],
					'text'  : price_status ? this.currency.format(result['value'], this.session.data['currency']) : ''
				];
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

		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		} else {
			product_id = 0;
		}

		if ((this.request.post['quantity'])) {
			quantity = this.request.post['quantity'];
		} else {
			quantity = 1;
		}

		if ((this.request.post['option'])) {
			option = array_filter(this.request.post['option']);
		} else {
			option = [];
		}

		if ((this.request.post['subscription_plan_id'])) {
			subscription_plan_id = this.request.post['subscription_plan_id'];
		} else {
			subscription_plan_id = 0;
		}

		this.load.model('catalog/product',this);

		product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info) {
			// If variant get master product
			if (product_info['master_id']) {
				product_id = product_info['master_id'];
			}

			// Only use values in the override
			if ((product_info['override']['variant'])) {
				override = product_info['override']['variant'];
			} else {
				override = [];
			}

			// Merge variant code with options
			for (product_info['variant'] as key : value) {
				if (array_key_exists(key, override)) {
					option[key] = value;
				}
			}

			// Validate options
			product_options = await this.model_catalog_product.getOptions(product_id);

			for (product_options as product_option) {
				if (product_option['required'] && empty(option[product_option['product_option_id']])) {
					json['error']['option_' + product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
				}
			}

			// Validate subscription products
			subscriptions = await this.model_catalog_product.getSubscriptions(product_id);

			if (subscriptions) {
				subscription_plan_ids = [];

				for (subscriptions as subscription) {
					subscription_plan_ids.push(subscription['subscription_plan_id'];
				}

				if (!in_array(subscription_plan_id, subscription_plan_ids)) {
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
			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);
		} else {
			json['redirect'] = await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async edit() {
		await this.load.language('checkout/cart');

		const json = {};

		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		} else {
			key = 0;
		}

		if ((this.request.post['quantity'])) {
			quantity = this.request.post['quantity'];
		} else {
			quantity = 1;
		}

		if (!this.cart.has(key)) {
			json['error'] = this.language.get('error_product');
		}

		if (!Object.keys(json).length) {
			// Handles single item update
			await this.cart.update(key, quantity);

			if (this.cart.hasProducts() || (this.session.data['vouchers'])) {
				json['success'] = this.language.get('text_edit');
			} else {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
			}

			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);
			delete (this.session.data['reward']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async remove() {
		await this.load.language('checkout/cart');

		const json = {};

		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		} else {
			key = 0;
		}

		if (!this.cart.has(key)) {
			json['error'] = this.language.get('error_product');
		}

		// Remove
		if (!Object.keys(json).length) {
			await this.cart.remove(key);

			if (this.cart.hasProducts() || (this.session.data['vouchers'])) {
				json['success'] = this.language.get('text_remove');
			} else {
				json['redirect'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true);
			}

			delete (this.session.data['shipping_method']);
			delete (this.session.data['shipping_methods']);
			delete (this.session.data['payment_method']);
			delete (this.session.data['payment_methods']);
			delete (this.session.data['reward']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
