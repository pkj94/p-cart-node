module.exports = class ControllerExtensionModuleFilter extends Controller {
	async index() {
const data = {};
		if ((this.request.get['path'])) {
			parts = explode('_', this.request.get['path']);
		} else {
			parts = array();
		}

		category_id = end(parts);

		this.load.model('catalog/category',this);

		category_info = await this.model_catalog_category.getCategory(category_id);

		if (category_info) {
			await this.load.language('extension/module/filter');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['action'] = str_replace('&amp;', '&', await this.url.link('product/category', 'path=' + this.request.get['path'] + url));

			if ((this.request.get['filter'])) {
				data['filter_category'] = explode(',', this.request.get['filter']);
			} else {
				data['filter_category'] = array();
			}

			this.load.model('catalog/product',this);

			data['filter_groups'] = array();

			filter_groups = await this.model_catalog_category.getCategoryFilters(category_id);

			if (filter_groups) {
				for (filter_groups of filter_group) {
					childen_data = array();

					for (filter_group['filter'] of filter) {
						const filter_data = {
							'filter_category_id' : category_id,
							'filter_filter'      : filter['filter_id']
						});

						childen_data.push(array(
							'filter_id' : filter['filter_id'],
							'name'      : filter['name'] + (this.config.get('config_product_count') ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : '')
						});
					}

					data['filter_groups'].push(array(
						'filter_group_id' : filter_group['filter_group_id'],
						'name'            : filter_group['name'],
						'filter'          : childen_data
					});
				}

				return await this.load.view('extension/module/filter', data);
			}
		}
	}
}