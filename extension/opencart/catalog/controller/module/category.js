global['\Opencart\Catalog\Controller\Extension\Opencart\Module\Category'] = class Category extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/module/category');
		let parts = [];
		if ((this.request.get['path'])) {
			parts = (this.request.get['path']||'').split('_');
		}
		if ((parts[0])) {
			data['category_id'] = parts[0];
		} else {
			data['category_id'] = 0;
		}

		if ((parts[1])) {
			data['child_id'] = parts[1];
		} else {
			data['child_id'] = 0;
		}

		this.load.model('catalog/category', this);

		this.load.model('catalog/product', this);

		data['categories'] = [];

		const categories = await this.model_catalog_category.getCategories(0);

		for (let category of categories) {
			let children_data = [];

			if (category['category_id'] == data['category_id']) {
				const children = await this.model_catalog_category.getCategories(category['category_id']);

				for (let child of children) {
					const filter_data = {
						'filter_category_id': child['category_id'],
						'filter_sub_category': true
					};

					children_data.push({
						'category_id': child['category_id'],
						'name': child['name'] + (this.config.get('config_product_count') ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : ''),
						'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category['category_id'] + '_' + child['category_id'])
					});
				}
			}

			const filter_data = {
				'filter_category_id': category['category_id'],
				'filter_sub_category': true
			};

			data['categories'].push({
				'category_id': category['category_id'],
				'name': category['name'] + (this.config.get('config_product_count') ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : ''),
				'children': children_data,
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category['category_id'])
			});
		}
		return await this.load.view('extension/opencart/module/category', data);
	}
}
