module.exports = class Sitemap extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('information/sitemap');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('information/sitemap', 'language=' + this.config.get('config_language'))
		});

		this.load.model('catalog/category', this);

		data['categories'] = [];

		const categories_1 = await this.model_catalog_category.getCategories(0);

		for (let category_1 of categories_1) {
			let level_2_data = [];

			const categories_2 = await this.model_catalog_category.getCategories(category_1['category_id']);

			for (let category_2 of categories_2) {
				let level_3_data = [];

				const categories_3 = await this.model_catalog_category.getCategories(category_2['category_id']);

				for (let category_3 of categories_3) {
					level_3_data.push({
						'name': category_3['name'],
						'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category_1['category_id'] + '_' + category_2['category_id'] + '_' + category_3['category_id'])
					});
				}

				level_2_data.push({
					'name': category_2['name'],
					'children': level_3_data,
					'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category_1['category_id'] + '_' + category_2['category_id'])
				});
			}

			data['categories'].push({
				'name': category_1['name'],
				'children': level_2_data,
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + category_1['category_id'])
			});
		}

		data['special'] = await this.url.link('product/special', 'language=' + this.config.get('config_language'));
		data['account'] = await this.url.link('account/account', 'language=' + this.config.get('config_language'));
		data['edit'] = await this.url.link('account/edit', 'language=' + this.config.get('config_language'));
		data['password'] = await this.url.link('account/password', 'language=' + this.config.get('config_language'));
		data['address'] = await this.url.link('account/address', 'language=' + this.config.get('config_language'));
		data['history'] = await this.url.link('account/order', 'language=' + this.config.get('config_language'));
		data['download'] = await this.url.link('account/download', 'language=' + this.config.get('config_language'));
		data['cart'] = await this.url.link('checkout/cart', 'language=' + this.config.get('config_language'));
		data['checkout'] = await this.url.link('checkout/checkout', 'language=' + this.config.get('config_language'));
		data['search'] = await this.url.link('product/search', 'language=' + this.config.get('config_language'));
		data['contact'] = await this.url.link('information/contact', 'language=' + this.config.get('config_language'));

		this.load.model('catalog/information', this);

		data['informations'] = [];

		for (let result of await this.model_catalog_information.getInformations()) {
			data['informations'].push({
				'title': result['title'],
				'href': await this.url.link('information/information', 'language=' + this.config.get('config_language') + '&information_id=' + result['information_id'])
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
