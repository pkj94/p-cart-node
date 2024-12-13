const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ControllerExtensionModuleFeatured extends Controller {
	async index(setting) {
		const data = {};
		await this.load.language('extension/module/featured');

		this.load.model('catalog/product', this);

		this.load.model('tool/image', this);

		data['products'] = [];

		if (!setting['limit']) {
			setting['limit'] = 4;
		}

		if (setting['product'].length) {
			const products = setting['product'].splice(0, setting['limit']);

			for (const product_id of products) {
				const product_info = await this.model_catalog_product.getProduct(product_id);

				if (product_info.product_id) {
					let image = await this.model_tool_image.resize('placeholder.png', setting['width'], setting['height']);
					if (product_info['image']) {
						image = await this.model_tool_image.resize(product_info['image'], setting['width'], setting['height']);
					}
					let price = false;
					if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
						price = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					}
					let special = false;
					let tax_price = product_info['price'];
					if ((product_info['special']) && product_info['special'] >= 0) {
						special = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
						tax_price = product_info['special'];
					}
					let tax = false;
					if (this.config.get('config_tax')) {
						tax = this.currency.format(tax_price, this.session.data['currency']);
					}
					let rating = false;
					if (Number(this.config.get('config_review_status'))) {
						rating = product_info['rating'];
					}

					data['products'].push({
						'product_id': product_info['product_id'],
						'thumb': image,
						'name': product_info['name'],
						'description': utf8_substr(strip_tags(html_entity_decode(product_info['description'])), 0, this.config.get('theme_' + this.config.get('config_theme') + '_product_description_length')) + '..',
						'price': price,
						'special': special,
						'tax': tax,
						'rating': rating,
						'href': await this.url.link('product/product', 'product_id=' + product_info['product_id'])
					});
				}
			}
		}

		if (data['products'].length) {
			return await this.load.view('extension/module/featured', data);
		}
	}
}