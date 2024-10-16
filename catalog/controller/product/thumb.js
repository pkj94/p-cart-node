<?php
namespace Opencart\Catalog\Controller\Product;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Product
 */
class ThumbController extends Controller {
	/**
	 * @param array data
	 *
	 * @return string
	 */
	async index(array data) {
		await this.load.language('product/thumb');

		data['cart'] = await this.url.link('common/cart+info', 'language=' + this.config.get('config_language'));

		data['add_to_cart'] = await this.url.link('checkout/cart+add', 'language=' + this.config.get('config_language'));
		data['add_to_wishlist'] = await this.url.link('account/wishlist+add', 'language=' + this.config.get('config_language'));
		data['add_to_compare'] = await this.url.link('product/compare+add', 'language=' + this.config.get('config_language'));

		data['review_status'] = this.config.get('config_review_status');

		return await this.load.view('product/thumb', data);
	}
}
