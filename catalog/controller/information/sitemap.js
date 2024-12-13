module.exports = class ControllerInformationSitemap extends Controller {
	async index() {
		const data = {};
		await this.load.language('information/sitemap');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('information/sitemap')
		});

		this.load.model('catalog/category', this);

		data['categories'] = [];

		const categories_1 = await this.model_catalog_category.getCategories(0);

		for (let category_1 of categories_1) {
			const level_2_data = [];

			const categories_2 = await this.model_catalog_category.getCategories(category_1['category_id']);

			for (let category_2 of categories_2) {
				const level_3_data = [];

				const categories_3 = await this.model_catalog_category.getCategories(category_2['category_id']);

				for (let category_3 of categories_3) {
					level_3_data.push({
						'name': category_3['name'],
						'href': await this.url.link('product/category', 'path=' + category_1['category_id'] + '_' + category_2['category_id'] + '_' + category_3['category_id'])
					});
				}

				level_2_data.push({
					'name': category_2['name'],
					'children': level_3_data,
					'href': await this.url.link('product/category', 'path=' + category_1['category_id'] + '_' + category_2['category_id'])
				});
			}

			data['categories'].push({
				'name': category_1['name'],
				'children': level_2_data,
				'href': await this.url.link('product/category', 'path=' + category_1['category_id'])
			});
		}

		data['special'] = await this.url.link('product/special');
		data['account'] = await this.url.link('account/account', '', true);
		data['edit'] = await this.url.link('account/edit', '', true);
		data['password'] = await this.url.link('account/password', '', true);
		data['address'] = await this.url.link('account/address', '', true);
		data['history'] = await this.url.link('account/order', '', true);
		data['download'] = await this.url.link('account/download', '', true);
		data['cart'] = await this.url.link('checkout/cart');
		data['checkout'] = await this.url.link('checkout/checkout', '', true);
		data['search'] = await this.url.link('product/search');
		data['contact'] = await this.url.link('information/contact');

		this.load.model('catalog/information', this);

		data['informations'] = [];

		for (let result of await this.model_catalog_information.getInformations()) {
			data['informations'].push({
				'title': result['title'],
				'href': await this.url.link('information/information', 'information_id=' + result['information_id'])
			});
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('information/sitemap', data));
	}
}