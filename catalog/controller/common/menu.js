module.exports = class Menu extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('common/menu');

		// Menu
		this.load.model('catalog/category', this);

		this.load.model('catalog/product', this);

		data['categories'] = [];

		const categories = await this.model_catalog_category.getCategories(0);

		for (let category of categories) {
			if (category['top']) {
				// Level 2
				let children_data = [];

				const children = await this.model_catalog_category.getCategories(category['category_id']);

				for (let child of children) {
					let filter_data = {
						'filter_category_id': child['category_id'],
						'filter_sub_category': true
					};

					children_data.push({
						'name': child['name'] + (this.config.get('config_product_count') ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : ''),
						'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category['category_id'] + '_' + child['category_id'])
					});
				}

				// Level 1
				data['categories'].push({
					'name': category['name'],
					'children': children_data,
					'column': category['column'] ? category['column'] : 1,
					'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category['category_id'])
				});
			}
		}

		return await this.load.view('common/menu', data);
	}
}
