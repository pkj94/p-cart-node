module.exports = class ControllerExtensionModuleSpecial extends Controller {
	async index(setting) {
		await this.load.language('extension/module/special');

		this.load.model('catalog/product',this);

		this.load.model('tool/image',this);

		data['products'] = [];

		const filter_data = {
			'sort'  : 'pd.name',
			'order' : 'ASC',
			'start' : 0,
			'limit' : setting['limit']
		});

		const results = await this.model_catalog_product.getProductSpecials(filter_data);

		if (results) {
			for (let result of results) {
				if (result['image']) {
					image = await this.model_tool_image.resize(result['image'], setting['width'], setting['height']);
				} else {
					image = await this.model_tool_image.resize('placeholder.png', setting['width'], setting['height']);
				}

				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(result['price'], result['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				} else {
					price = false;
				}

				if (!is_null(result['special']) && result['special'] >= 0) {
					special = this.currency.format(this.tax.calculate(result['special'], result['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					tax_price = result['special'];
				} else {
					special = false;
					tax_price = result['price'];
				}
	
				if (this.config.get('config_tax')) {
					tax = this.currency.format(tax_price, this.session.data['currency']);
				} else {
					tax = false;
				}

				if (Number(this.config.get('config_review_status'))) {
					rating = result['rating'];
				} else {
					rating = false;
				}

				data['products'].push({
					'product_id'  : result['product_id'],
					'thumb'       : image,
					'name'        : result['name'],
					'description' : utf8_substr(trim(strip_tags(html_entity_decode(result['description']))), 0, this.config.get('theme_' + this.config.get('config_theme') + '_product_description_length')) + '..',
					'price'       : price,
					'special'     : special,
					'tax'         : tax,
					'rating'      : rating,
					'href'        : await this.url.link('product/product', 'product_id=' + result['product_id'])
				});
			}

			return await this.load.view('extension/module/special', data);
		}
	}
}