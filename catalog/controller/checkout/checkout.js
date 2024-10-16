<?php
namespace Opencart\Catalog\Controller\Checkout;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Checkout
 */
class CheckoutController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		// Validate cart has products and has stock+
		if ((!this.cart.hasProducts() && empty(this.session.data['vouchers'])) || (!this.cart.hasStock() && !this.config.get('config_stock_checkout'))) {
			this.response.redirect(await this.url.link('checkout/cart', 'language=' + this.config.get('config_language')));
		}

		// Validate minimum quantity requirements+
		let products = await this.cart.getProducts();

		for (let product of products) {
			if (!product['minimum']) {
				this.response.redirect(await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'), true));

				break;
			}
		}

		await this.load.language('checkout/checkout');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_cart'),
			'href' : await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'))
		];

		if (!await this.customer.isLogged()) {
			data['register'] = await this.load.controller('checkout/register');
		} else {
			data['register'] = '';
		}

		if (await this.customer.isLogged() && this.config.get('config_checkout_payment_address')) {
			data['payment_address'] = await this.load.controller('checkout/payment_address');
		} else {
			data['payment_address'] = '';
		}

		if (await this.customer.isLogged() && this.cart.hasShipping()) {
			data['shipping_address'] = await this.load.controller('checkout/shipping_address');
		}  else {
			data['shipping_address'] = '';
		}

		if (this.cart.hasShipping()) {
			data['shipping_method'] = await this.load.controller('checkout/shipping_method');
		}  else {
			data['shipping_method'] = '';
		}

		data['payment_method'] = await this.load.controller('checkout/payment_method');
		data['confirm'] = await this.load.controller('checkout/confirm');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('checkout/checkout', data));
	}
}
