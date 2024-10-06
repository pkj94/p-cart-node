<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Module;
/**
 * Class Special
 *
 * @package
 */
class SpecialController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param array $setting
	 *
	 * @return string
	 */
	async index(array $setting) {
		this.load.language('extension/opencart/module/special');

		data['axis'] = $setting['axis'];

		data['products'] = [];

		const filter_data = {
			'sort'  : 'pd.name',
			'order' : 'ASC',
			'start' : 0,
			'limit' : $setting['limit']
		];

		this.load.model('catalog/product',this);
		this.load.model('tool/image');

		const results = await this.model_catalog_product.getSpecials($filter_data);

		if (results) {
			for(let result of results) {
				if (result['image']) {
					$image = this.model_tool_image.resize(html_entity_decode(result['image'], ENT_QUOTES, 'UTF-8'), $setting['width'], $setting['height']);
				} else {
					$image = this.model_tool_image.resize('placeholder.png', $setting['width'], $setting['height']);
				}

				if (this.customer.isLogged() || !this.config.get('config_customer_price')) {
					$price = this.currency.format(this.tax.calculate(result['price'], result['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				} else {
					$price = false;
				}

				if (result['special']) {
					$special = this.currency.format(this.tax.calculate(result['special'], result['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				} else {
					$special = false;
				}

				if (this.config.get('config_tax')) {
					$tax = this.currency.format(result['special'] ? result['special'] : result['price'], this.session.data['currency']);
				} else {
					$tax = false;
				}

				$product_data = [
					'product_id'  : result['product_id'],
					'thumb'       : $image,
					'name'        : result['name'],
					'description' : oc_substr(trim(strip_tags(html_entity_decode(result['description'], ENT_QUOTES, 'UTF-8'))), 0, this.config.get('config_product_description_length')) . '..',
					'price'       : $price,
					'special'     : $special,
					'tax'         : $tax,
					'minimum'     : result['minimum'] > 0 ? result['minimum'] : 1,
					'rating'      : result['rating'],
					'href'        : this.url.link('product/product', 'language=' . this.config.get('config_language') . '&product_id=' . result['product_id'])
				];

				data['products'][] = await this.load.controller('product/thumb', $product_data);
			}

			return await this.load.view('extension/opencart/module/special', data);
		} else {
			return '';
		}
	}
}
