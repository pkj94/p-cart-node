<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Module;
/**
 * Class Featured
 *
 * @package
 */
class FeaturedController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param array $setting
	 *
	 * @return string
	 */
	async index(array $setting) {
		this.load.language('extension/opencart/module/featured');

		data['axis'] = $setting['axis'];

		data['products'] = [];

		this.load.model('catalog/product',this);
		this.load.model('tool/image');

		if (!empty($setting['product'])) {
			$products = [];

			foreach ($setting['product'] as $product_id) {
				$product_info = this.model_catalog_product.getProduct($product_id);

				if ($product_info) {
					$products[] = $product_info;
				}
			}

			for(let product of products) {
				if ($product['image']) {
					$image = this.model_tool_image.resize(html_entity_decode($product['image']), $setting['width'], $setting['height']);
				} else {
					$image = this.model_tool_image.resize('placeholder.png', $setting['width'], $setting['height']);
				}

				if (this.customer.isLogged() || !this.config.get('config_customer_price')) {
					$price = this.currency.format(this.tax.calculate($product['price'], $product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				} else {
					$price = false;
				}

				if ($product['special']) {
					$special = this.currency.format(this.tax.calculate($product['special'], $product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				} else {
					$special = false;
				}

				if (this.config.get('config_tax')) {
					$tax = this.currency.format($product['special'] ? $product['special'] : $product['price'], this.session.data['currency']);
				} else {
					$tax = false;
				}

				$product_data = [
					'product_id'  : $product['product_id'],
					'thumb'       : $image,
					'name'        : $product['name'],
					'description' : oc_substr(trim(strip_tags(html_entity_decode($product['description']))), 0, this.config.get('config_product_description_length')) . '..',
					'price'       : $price,
					'special'     : $special,
					'tax'         : $tax,
					'minimum'     : $product['minimum'] > 0 ? $product['minimum'] : 1,
					'rating'      : $product['rating'],
					'href'        : this.url.link('product/product', 'language=' . this.config.get('config_language') . '&product_id=' . $product['product_id'])
				];

				data['products'][] = await this.load.controller('product/thumb', $product_data);
			}
		}

		if (data['products']) {
			return await this.load.view('extension/opencart/module/featured', data);
		} else {
			return '';
		}
	}
}
