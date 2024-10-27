const sprintf = require("locutus/php/strings/sprintf");

const strip_tags = require("locutus/php/strings/strip_tags");
module.exports = class Category extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('product/category');
		let path = '';
		if ((this.request.get['path'])) {
			path = Array.isArray(this.request.get['path']) ? this.request.get['path'][this.request.get['path'].length - 1] : this.request.get['path'];
		}
		let filter = '';
		if ((this.request.get['filter'])) {
			filter = this.request.get['filter'];
		}
		let sort = 'p.sort_order';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}

		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let limit = this.config.get('config_pagination');
		if ((this.request.get['limit']) && this.request.get['limit']) {
			limit = this.request.get['limit'];
		}
		let parts = path.split('_');

		let category_id = parts.pop();

		this.load.model('catalog/category', this);

		const category_info = await this.model_catalog_category.getCategory(category_id);

		if (category_info.category_id) {
			this.document.setTitle(category_info['meta_title']);
			this.document.setDescription(category_info['meta_description']);
			this.document.setKeywords(category_info['meta_keyword']);

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			});

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

			path = '';

			for (let path_id of parts) {
				if (!path) {
					path = path_id;
				} else {
					path += '_' + path_id;
				}

				const category_info = await this.model_catalog_category.getCategory(path_id);

				if (category_info.category_id) {
					data['breadcrumbs'].push({
						'text': category_info['name'],
						'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + path + url)
					});
				}
			}

			url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
			}

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			// Set the last category breadcrumb
			data['breadcrumbs'].push({
				'text': category_info['name'],
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + url)
			});

			data['heading_title'] = category_info['name'];

			data['text_compare'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? this.session.data['compare'].length : 0));

			this.load.model('tool/image', this);

			if (category_info['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(category_info['image']))) {
				data['thumb'] = await this.model_tool_image.resize(html_entity_decode(category_info['image']), this.config.get('config_image_category_width'), this.config.get('config_image_category_height'));
			} else {
				data['thumb'] = '';
			}

			data['description'] = html_entity_decode(category_info['description']);
			data['compare'] = await this.url.link('product/compare', 'language=' + this.config.get('config_language'));

			url = '';

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['categories'] = [];

			this.load.model('catalog/product', this);

			let results = await this.model_catalog_category.getCategories(category_id);

			for (let result of results) {
				let filter_data = {
					'filter_category_id': result['category_id'],
					'filter_sub_category': false
				};

				data['categories'].push({
					'name': result['name'] + (Number(this.config.get('config_product_count')) ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : ''),
					'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + '_' + result['category_id'] + url)
				});
			}

			url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
			}

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['products'] = [];

			let filter_data = {
				'filter_category_id': category_id,
				'filter_sub_category': false,
				'filter_filter': filter,
				'sort': sort,
				'order': order,
				'start': (page - 1) * limit,
				'limit': limit
			};

			const product_total = await this.model_catalog_product.getTotalProducts(filter_data);

			results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
				let image = await this.model_tool_image.resize('placeholder.png', this.config.get('config_image_product_width'), this.config.get('config_image_product_height'));
				if (result['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(result['image']))) {
					image = await this.model_tool_image.resize(html_entity_decode(result['image']), this.config.get('config_image_product_width'), this.config.get('config_image_product_height'));
				}
				let price = false;
				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(result['price'], result['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				} else {
					price = false;
				}
				let special = false;
				if (result['special']) {
					special = this.currency.format(this.tax.calculate(result['special'], result['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				}
				let tax = false;
				if (Number(this.config.get('config_tax'))) {
					tax = this.currency.format(result['special'] ? result['special'] : result['price'], this.session.data['currency']);
				}

				let product_data = {
					'product_id': result['product_id'],
					'thumb': image,
					'name': result['name'],
					'description': oc_substr(trim(strip_tags(html_entity_decode(result['description']))), 0, Number(this.config.get('config_product_description_length'))) + '++',
					'price': price,
					'special': special,
					'tax': tax,
					'minimum': result['minimum'] > 0 ? result['minimum'] : 1,
					'rating': result['rating'],
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + result['product_id'] + url)
				};

				data['products'].push(await this.load.controller('product/thumb', product_data));
			}

			url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
			}

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['sorts'] = [];

			data['sorts'].push({
				'text': this.language.get('text_default'),
				'value': 'p.sort_order-ASC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=p.sort_order&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_asc'),
				'value': 'pd+name-ASC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=pd+name&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_desc'),
				'value': 'pd+name-DESC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=pd+name&order=DESC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_asc'),
				'value': 'p+price-ASC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=p+price&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_desc'),
				'value': 'p+price-DESC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=p+price&order=DESC' + url)
			});

			if (Number(this.config.get('config_review_status'))) {
				data['sorts'].push({
					'text': this.language.get('text_rating_desc'),
					'value': 'rating-DESC',
					'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=rating&order=DESC' + url)
				});

				data['sorts'].push({
					'text': this.language.get('text_rating_asc'),
					'value': 'rating-ASC',
					'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=rating&order=ASC' + url)
				});
			}

			data['sorts'].push({
				'text': this.language.get('text_model_asc'),
				'value': 'p+model-ASC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=p+model&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_model_desc'),
				'value': 'p+model-DESC',
				'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&sort=p+model&order=DESC' + url)
			});

			url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
			}

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			data['limits'] = [];

			const limits = [...new Set([this.config.get('config_pagination'), 25, 50, 75, 100])];

			limits.sort();

			for (let value of limits) {
				data['limits'].push({
					'text': value,
					'value': value,
					'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + url + '&limit=' + value)
				});
			}

			url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
			}

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['pagination'] = await this.load.controller('common/pagination', {
				'total': product_total,
				'page': page,
				'limit': limit,
				'url': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + url + '&page={page}')
			});

			data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (product_total - limit)) ? product_total : (((page - 1) * limit) + limit), product_total, Math.ceil(product_total / limit));

			// http://googlewebmastercentral+blogspot+com/2011/09/pagination-with-relnext-and-relprev+html
			if (page == 1) {
				this.document.addLink(await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path']), 'canonical');
			} else {
				this.document.addLink(await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + '&page=' + page), 'canonical');
			}

			if (page > 1) {
				this.document.addLink(await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + ((page - 2) ? '&page=' + (page - 1) : '')), 'prev');
			}

			if (limit && Math.ceil(product_total / limit) > page) {
				this.document.addLink(await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + '&page=' + (page + 1)), 'next');
			}

			data['sort'] = sort;
			data['order'] = order;
			data['limit'] = limit;

			data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('product/category', data));
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}

		return null;
	}
}
