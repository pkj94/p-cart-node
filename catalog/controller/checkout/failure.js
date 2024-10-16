<?php
namespace Opencart\Catalog\Controller\Checkout;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Checkout
 */
class FailureController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('checkout/failure');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_basket'),
			'href' : await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_checkout'),
			'href' : await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'))
		];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_failure'),
			'href' : await this.url.link('checkout/failure', 'language=' + this.config.get('config_language'))
		];

		data['text_message'] = sprintf(this.language.get('text_message'), await this.url.link('information/contact', 'language=' + this.config.get('config_language')));

		data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('common/success', data));
	}
}