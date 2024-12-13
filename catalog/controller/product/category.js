const array_unique = require("locutus/php/array/array_unique");
const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ControllerProductCategory extends Controller {
	async index() {
		const data = {};
		await this.load.language('product/category');

		this.load.model('catalog/category', this);

		this.load.model('catalog/product', this);

		this.load.model('tool/image', this);
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
			page = this.request.get['page'];
		}
		let limit = this.config.get('theme_' + this.config.get('config_theme') + '_product_limit');
		if ((this.request.get['limit']) && this.request.get['limit'] > 0) {
			limit = this.request.get['limit'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});
		let category_id = 0;
		if ((this.request.get['path'])) {
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

			let path = '';

			const parts = this.request.get['path'].split('_');

			category_id = parts.pop();

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
						'href': await this.url.link('product/category', 'path=' + path + url)
					});
				}
			}
		} else {
			category_id = 0;
		}

		const category_info = await this.model_catalog_category.getCategory(category_id);

		if (category_info.category_id) {
			this.document.setTitle(category_info['meta_title']);
			this.document.setDescription(category_info['meta_description']);
			this.document.setKeywords(category_info['meta_keyword']);

			data['heading_title'] = category_info['name'];

			data['text_compare'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? this.session.data['compare'].length : 0));

			// Set the last category breadcrumb
			data['breadcrumbs'].push({
				'text': category_info['name'],
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'])
			});

			if (category_info['image']) {
				data['thumb'] = await this.model_tool_image.resize(category_info['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_category_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_category_height'));
			} else {
				data['thumb'] = '';
			}

			data['description'] = html_entity_decode(category_info['description']);
			data['compare'] = await this.url.link('product/compare');

			let url = '';

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

			let results = await this.model_catalog_category.getCategories(category_id);

			for (let result of results) {
				const filter_data = {
					'filter_category_id': result['category_id'],
					'filter_sub_category': true
				};

				data['categories'].push({
					'name': result['name'] + (this.config.get('config_product_count') ? ' (' + await this.model_catalog_product.getTotalProducts(filter_data) + ')' : ''),
					'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '_' + result['category_id'] + url)
				});
			}

			data['products'] = [];

			const filter_data = {
				'filter_category_id': category_id,
				'filter_filter': filter,
				'sort': sort,
				'order': order,
				'start': (Number(page) - 1) * limit,
				'limit': limit
			};

			const product_total = await this.model_catalog_product.getTotalProducts(filter_data);

			results = await this.model_catalog_product.getProducts(filter_data);
			for (let [product_id, result] of Object.entries(results)) {
				let image = await this.model_tool_image.resize('placeholder.png', this.config.get('theme_' + this.config.get('config_theme') + '_image_product_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_product_height'));
				if (result['image']) {
					image = await this.model_tool_image.resize(result['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_product_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_product_height'));
				}
				let price = false;
				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(result['price'], result['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				}
				let special = false;
				let tax_price = result['price'];
				if (!(result['special']) && result['special'] >= 0) {
					special = this.currency.format(this.tax.calculate(result['special'], result['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					tax_price = result['special'];
				}
				let tax = false;
				if (this.config.get('config_tax')) {
					tax = this.currency.format(tax_price, this.session.data['currency']);
				}
				let rating = false;
				if (Number(this.config.get('config_review_status'))) {
					rating = result['rating'];
				}

				data['products'].push({
					'product_id': result['product_id'],
					'thumb': image,
					'name': result['name'],
					'description': utf8_substr(strip_tags(html_entity_decode(result['description'])).trim(), 0, this.config.get('theme_' + this.config.get('config_theme') + '_product_description_length')) + '..',
					'price': price,
					'special': special,
					'tax': tax,
					'minimum': result['minimum'] > 0 ? result['minimum'] : 1,
					'rating': result['rating'],
					'href': await this.url.link('product/product', 'path=' + this.request.get['path'] + '&product_id=' + result['product_id'] + url)
				});
			}

			url = '';

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
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=p.sort_order&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_asc'),
				'value': 'pd.name-ASC',
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=pd.name&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_desc'),
				'value': 'pd.name-DESC',
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=pd.name&order=DESC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_asc'),
				'value': 'p.price-ASC',
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=p.price&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_desc'),
				'value': 'p.price-DESC',
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=p.price&order=DESC' + url)
			});

			if (Number(this.config.get('config_review_status'))) {
				data['sorts'].push({
					'text': this.language.get('text_rating_desc'),
					'value': 'rating-DESC',
					'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=rating&order=DESC' + url)
				});

				data['sorts'].push({
					'text': this.language.get('text_rating_asc'),
					'value': 'rating-ASC',
					'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=rating&order=ASC' + url)
				});
			}

			data['sorts'].push({
				'text': this.language.get('text_model_asc'),
				'value': 'p.model-ASC',
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=p.model&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_model_desc'),
				'value': 'p.model-DESC',
				'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + '&sort=p.model&order=DESC' + url)
			});

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

			data['limits'] = [];

			let limits = [...new Set([Number(this.config.get('theme_' + this.config.get('config_theme') + '_product_limit')), 25, 50, 75, 100])];

			limits = limits.sort();

			for (let value of limits) {
				data['limits'].push({
					'text': value,
					'value': value,
					'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + url + '&limit=' + value)
				});
			}

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

			const pagination = new Pagination();
			pagination.total = product_total;
			pagination.page = page;
			pagination.limit = limit;
			pagination.url = await this.url.link('product/category', 'path=' + this.request.get['path'] + url + '&page={page}');

			data['pagination'] = pagination.render();

			data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (product_total - limit)) ? product_total : (((Number(page) - 1) * limit) + limit), product_total, Math.ceil(product_total / limit));

			// http://googlewebmastercentral+blogspot+com/2011/09/pagination-with-relnext-and-relprev+html
			if (page == 1) {
				this.document.addLink(await this.url.link('product/category', 'path=' + category_info['category_id']), 'canonical');
			} else {
				this.document.addLink(await this.url.link('product/category', 'path=' + category_info['category_id'] + '&page=' + page), 'canonical');
			}

			if (page > 1) {
				this.document.addLink(await this.url.link('product/category', 'path=' + category_info['category_id'] + ((page - 2) ? '&page=' + (Number(page) - 1) : '')), 'prev');
			}

			if (limit && Math.ceil(product_total / limit) > page) {
				this.document.addLink(await this.url.link('product/category', 'path=' + category_info['category_id'] + '&page=' + (page + 1)), 'next');
			}

			data['sort'] = sort;
			data['order'] = order;
			data['limit'] = limit;

			data['continue'] = await this.url.link('common/home');

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('product/category', data));
		} else {
			let url = '';

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

			data['breadcrumbs'].push({
				'text': this.language.get('text_error'),
				'href': await this.url.link('product/category', url)
			});

			this.document.setTitle(this.language.get('text_error'));

			data['continue'] = await this.url.link('common/home');

			this.response.addHeader(this.request.server.protocol + ' 404 Not Found');

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}
}
