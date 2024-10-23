global['\Opencart\Catalog\Controller\Extension\Opencart\Module\Filter'] = class Filter extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		let parts = [];
		if ((this.request.get['path'])) {
			parts = this.request.get['path'].split('_');
		}

		const category_id = parts[parts.length - 1];

		this.load.model('catalog/category', this);

		const category_info = await this.model_catalog_category.getCategory(category_id);

		if (category_info.category_id) {
			await this.load.language('extension/opencart/module/filter');

			let url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['action'] = (await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + url)).replaceAll('&amp;', '&');

			if ((this.request.get['filter'])) {
				data['filter_category'] = this.request.get['filter'].split(',');
			} else {
				data['filter_category'] = [];
			}

			this.load.model('catalog/product', this);

			data['filter_groups'] = [];

			const filter_groups = await this.model_catalog_category.getFilters(category_id);

			if (filter_groups.length) {
				for (let filter_group of filter_groups) {
					let children_data = [];

					for (let filter of filter_group['filter']) {
						const filter_data = {
							'filter_category_id': category_id,
							'filter_filter': filter['filter_id']
						};

						children_data.push({
							'filter_id': filter['filter_id'],
							'name': filter['name'] + (this.config.get('config_product_count') ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : '')
						});
					}

					data['filter_groups'].push({
						'filter_group_id': filter_group['filter_group_id'],
						'name': filter_group['name'],
						'filter': children_data
					});
				}

				return await this.load.view('extension/opencart/module/filter', data);
			}
		}

		return '';
	}
}