<?php
namespace Opencart\Catalog\Controller\Api\Sale;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Api\Sale
 */
class CartController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('api/sale/cart');

		const json = {};

		// Stock
		if (!await this.cart.hasStock() && (!Number(this.config.get('config_stock_checkout')) || Number(this.config.get('config_stock_warning')))) {
			json['error']['stock'] = this.language.get('error_stock');
		}

		totals = [];
		taxes = await this.cart.getTaxes();
		total = 0;

		this.load.model('checkout/cart',this);

		(this.model_checkout_cart.getTotals)(totals, taxes, total);

		json['products'] = [];

		let products = await this.model_checkout_cart.getProducts();

		for (let product of products) {
			description = '';

			if (product['subscription']) {
				if (product['subscription']['trial_status']) {
					trial_price = this.currency.format(this.tax.calculate(product['subscription']['trial_price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
					trial_cycle = product['subscription']['trial_cycle'];
					trial_frequency = this.language.get('text_' + product['subscription']['trial_frequency']);
					trial_duration = product['subscription']['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
				}

				price = this.currency.format(this.tax.calculate(product['subscription']['price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				cycle = product['subscription']['cycle'];
				frequency = this.language.get('text_' + product['subscription']['frequency']);
				duration = product['subscription']['duration'];

				if (duration) {
					description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
				}
			}

			json['products'].push({
				'cart_id'      : product['cart_id'],
				'product_id'   : product['product_id'],
				'name'         : product['name'],
				'model'        : product['model'],
				'option'       : product['option'],
				'subscription' : description,
				'quantity'     : product['quantity'],
				'stock'        : product['stock'],
				'minimum'      : product['minimum'],
				'reward'       : product['reward'],
				'price'        : this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']),
				'total'        : this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))) * product['quantity'], this.session.data['currency']),
			];
		}

		json['vouchers'] = [];

		vouchers = await this.model_checkout_cart.getVouchers();

		for (let [key , voucher] of Object.entries(vouchers)) {
			json['vouchers'].push({
				'key'         : key,
				'description' : sprintf(this.language.get('text_for'), this.currency.format(voucher['amount'], this.session.data['currency']), voucher['to_name']),
				'amount'      : this.currency.format(voucher['amount'], this.session.data['currency'])
			];
		}

		json['totals'] = [];

		for (let total of totals) {
			json['totals'].push({
				'title' : total['title'],
				'text'  : this.currency.format(total['value'], this.session.data['currency'])
			];
		}

		json['shipping_required'] = await this.cart.hasShipping();

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async add() {
		await this.load.language('api/sale/cart');

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

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info.product_id) {
			// If variant get master product
			if (product_info['master_id']) {
				product_id = product_info['master_id'];
			}

			// Merge variant code with options
			for (let [key , value] of 
 Object.entries(product_info['variant'])) {
				option[key] = value;
			}

			// Validate options
			const product_options = await this.model_catalog_product.getOptions(product_id);

			for (let product_option of product_options) {
				if (product_option['required'] && option[product_option['product_option_id']]) {
					json['error']['option_' + product_option['product_option_id']] = sprintf(this.language.get('error_required'), product_option['name']);
				}
			}

			// Validate Subscription plan
			subscriptions = await this.model_catalog_product.getSubscriptions(product_id);

			if (subscriptions) {
				subscription_plan_ids = [];

				for (let subscription of subscriptions) {
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

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async edit() {
		await this.load.language('api/sale/cart');

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

		this.cart.update(key, quantity);

		json['success'] = this.language.get('text_success');

		delete (this.session.data['reward']);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async remove() {
		await this.load.language('api/sale/cart');

		const json = {};

		if ((this.request.post['key'])) {
			key = this.request.post['key'];
		} else {
			key = 0;
		}

		// Remove
		this.cart.remove(key);

		json['success'] = this.language.get('text_success');

		delete (this.session.data['reward']);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
