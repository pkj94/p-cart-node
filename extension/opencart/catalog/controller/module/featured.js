module.exports = class FeaturedController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param array setting
	 *
	 * @return string
	 */
	async index(setting) {
		const data = {};
		await this.load.language('extension/opencart/module/featured');

		data['axis'] = setting['axis'];

		data['products'] = [];

		this.load.model('catalog/product', this);
		this.load.model('tool/image', this);
		
		if ((setting['product'])) {
			let products = [];

			for (let product_id of setting['product']) {
				const product_info = await this.model_catalog_product.getProduct(product_id);

				if (product_info.product_id) {
					products.push(product_info);
				}
			}

			for (let product of products) {
				let image = await this.model_tool_image.resize('placeholder.png', setting['width'], setting['height']);
				if (product['image']) {
					image = await this.model_tool_image.resize(html_entity_decode(product['image']), setting['width'], setting['height']);
				}
				let price = false;
				if (await this.customer.isLogged() || !this.config.get('config_customer_price')) {
					price = this.currency.format(this.tax.calculate(product['price'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				}
				let special = false;
				if (product['special']) {
					special = this.currency.format(this.tax.calculate(product['special'], product['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				}
				let tax = false;
				if (this.config.get('config_tax')) {
					tax = this.currency.format(product['special'] ? product['special'] : product['price'], this.session.data['currency']);
				}

				let product_data = {
					'product_id': product['product_id'],
					'thumb': image,
					'name': product['name'],
					'description': oc_substr(trim(strip_tags(html_entity_decode(product['description']))), 0, this.config.get('config_product_description_length')) + '..',
					'price': price,
					'special': special,
					'tax': tax,
					'minimum': product['minimum'] > 0 ? product['minimum'] : 1,
					'rating': product['rating'],
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product['product_id'])
				};

				data['products'].push(await this.load.controller('product/thumb', product_data));
			}
		}

		if (data['products'].length) {
			return await this.load.view('extension/opencart/module/featured', data);
		} else {
			return '';
		}
	}
}
