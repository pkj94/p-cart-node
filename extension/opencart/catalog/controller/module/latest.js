const strip_tags = require("locutus/php/strings/strip_tags");
const trim = require("locutus/php/strings/trim");

module.exports = class LatestController extends Controller {
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
		await this.load.language('extension/opencart/module/latest');

		data['axis'] = setting['axis'];

		data['products'] = [];

		this.load.model('extension/opencart/module/latest', this);
		this.load.model('tool/image', this);

		const results = await this.model_extension_opencart_module_latest.getLatest(setting['limit']);

		if (results.length) {
			for (let result of results) {
				let image = await this.model_tool_image.resize('placeholder.png', setting['width'], setting['height']);
				if (result['image']) {
					image = await this.model_tool_image.resize(html_entity_decode(result['image']), setting['width'], setting['height']);
				}
				let price = false;
				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(result['price'], result['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				}
				let special = false;
				if (result['special']) {
					special = this.currency.format(this.tax.calculate(result['special'], result['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				}
				let tax = false;
				if (Number(this.config.get('config_tax'))) {
					tax = this.currency.format(result['special'] ? result['special'] : result['price'], this.session.data['currency']);
				}

				const product_data = {
					'product_id': result['product_id'],
					'thumb': image,
					'name': result['name'],
					'description': oc_substr(trim(strip_tags(html_entity_decode(result['description']))), 0, this.config.get('config_product_description_length')) + '..',
					'price': price,
					'special': special,
					'tax': tax,
					'minimum': result['minimum'] > 0 ? result['minimum'] : 1,
					'rating': result['rating'],
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + result['product_id'])
				};

				data['products'].push(await this.load.controller('product/thumb', product_data));
			}

			return await this.load.view('extension/opencart/module/latest', data);
		} else {
			return '';
		}
	}
}
