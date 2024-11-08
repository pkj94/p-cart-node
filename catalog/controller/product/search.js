const sprintf = require("locutus/php/strings/sprintf");
const strip_tags = require("locutus/php/strings/strip_tags");
const trim = require("locutus/php/strings/trim");

module.exports = class Search extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('product/search');

		this.load.model('catalog/category', this);
		this.load.model('catalog/product', this);
		this.load.model('tool/image', this);
		let search = '';
		if ((this.request.get['search'])) {
			search = this.request.get['search'];
		}
		let tag = '';
		if ((this.request.get['tag'])) {
			tag = this.request.get['tag'];
		} else if ((this.request.get['search'])) {
			tag = this.request.get['search'];
		}
		let description = '';
		if ((this.request.get['description'])) {
			description = this.request.get['description'];
		}
		let category_id = 0;
		if ((this.request.get['category_id'])) {
			category_id = this.request.get['category_id'];
		}
		let sub_category = 0;
		if ((this.request.get['sub_category'])) {
			sub_category = this.request.get['sub_category'];
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

		if ((this.request.get['search'])) {
			this.document.setTitle(this.language.get('heading_title') + ' - ' + this.request.get['search']);
		} else if ((this.request.get['tag'])) {
			this.document.setTitle(this.language.get('heading_title') + ' - ' + this.language.get('heading_tag') + this.request.get['tag']);
		} else {
			this.document.setTitle(this.language.get('heading_title'));
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		let url = '';

		if ((this.request.get['search'])) {
			url += '&search=' + encodeURIComponent(html_entity_decode(this.request.get['search']));
		}

		if ((this.request.get['tag'])) {
			url += '&tag=' + encodeURIComponent(html_entity_decode(this.request.get['tag']));
		}

		if ((this.request.get['description'])) {
			url += '&description=' + this.request.get['description'];
		}

		if ((this.request.get['category_id'])) {
			url += '&category_id=' + this.request.get['category_id'];
		}

		if ((this.request.get['sub_category'])) {
			url += '&sub_category=' + this.request.get['sub_category'];
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
			'text': this.language.get('heading_title'),
			'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + url)
		});

		if ((this.request.get['search'])) {
			data['heading_title'] = this.language.get('heading_title') + ' - ' + this.request.get['search'];
		} else {
			data['heading_title'] = this.language.get('heading_title');
		}

		data['text_compare'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? this.session.data['compare'].length : 0));

		data['compare'] = await this.url.link('product/compare', 'language=' + this.config.get('config_language'));

		this.load.model('catalog/category', this);

		// 3 Level Category Search
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
						'category_id': category_3['category_id'],
						'name': category_3['name'],
					});
				}

				level_2_data.push({
					'category_id': category_2['category_id'],
					'name': category_2['name'],
					'children': level_3_data
				});
			}

			data['categories'].push({
				'category_id': category_1['category_id'],
				'name': category_1['name'],
				'children': level_2_data
			});
		}

		data['products'] = [];

		if (search || tag) {
			let filter_data = {
				'filter_search': search,
				'filter_tag': tag,
				'filter_description': description,
				'filter_category_id': category_id,
				'filter_sub_category': sub_category,
				'sort': sort,
				'order': order,
				'start': (page - 1) * limit,
				'limit': limit
			};

			const product_total = await this.model_catalog_product.getTotalProducts(filter_data);

			const results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
				let image = await this.model_tool_image.resize('placeholder.png', this.config.get('config_image_product_width'), this.config.get('config_image_product_height'));
				if (result['image'] && is_file(DIR_IMAGE + html_entity_decode(result['image']))) {
					image = await this.model_tool_image.resize(html_entity_decode(result['image']), this.config.get('config_image_product_width'), this.config.get('config_image_product_height'));
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

			if ((this.request.get['search'])) {
				url += '&search=' + encodeURIComponent(html_entity_decode(this.request.get['search']));
			}

			if ((this.request.get['tag'])) {
				url += '&tag=' + encodeURIComponent(html_entity_decode(this.request.get['tag']));
			}

			if ((this.request.get['description'])) {
				url += '&description=' + this.request.get['description'];
			}

			if ((this.request.get['category_id'])) {
				url += '&category_id=' + this.request.get['category_id'];
			}

			if ((this.request.get['sub_category'])) {
				url += '&sub_category=' + this.request.get['sub_category'];
			}

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['sorts'] = [];

			data['sorts'].push({
				'text': this.language.get('text_default'),
				'value': 'p.sort_order-ASC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=p.sort_order&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_asc'),
				'value': 'pd+name-ASC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=pd+name&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_desc'),
				'value': 'pd+name-DESC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=pd+name&order=DESC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_asc'),
				'value': 'p+price-ASC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=p+price&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_desc'),
				'value': 'p+price-DESC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=p+price&order=DESC' + url)
			});

			if (Number(this.config.get('config_review_status'))) {
				data['sorts'].push({
					'text': this.language.get('text_rating_desc'),
					'value': 'rating-DESC',
					'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=rating&order=DESC' + url)
				});

				data['sorts'].push({
					'text': this.language.get('text_rating_asc'),
					'value': 'rating-ASC',
					'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=rating&order=ASC' + url)
				});
			}

			data['sorts'].push({
				'text': this.language.get('text_model_asc'),
				'value': 'p+model-ASC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=p+model&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_model_desc'),
				'value': 'p+model-DESC',
				'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&sort=p+model&order=DESC' + url)
			});

			url = '';

			if ((this.request.get['search'])) {
				url += '&search=' + encodeURIComponent(html_entity_decode(this.request.get['search']));
			}

			if ((this.request.get['tag'])) {
				url += '&tag=' + encodeURIComponent(html_entity_decode(this.request.get['tag']));
			}

			if ((this.request.get['description'])) {
				url += '&description=' + this.request.get['description'];
			}

			if ((this.request.get['category_id'])) {
				url += '&category_id=' + this.request.get['category_id'];
			}

			if ((this.request.get['sub_category'])) {
				url += '&sub_category=' + this.request.get['sub_category'];
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
					'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + url + '&limit=' + value)
				});
			}

			url = '';

			if ((this.request.get['search'])) {
				url += '&search=' + encodeURIComponent(html_entity_decode(this.request.get['search']));
			}

			if ((this.request.get['tag'])) {
				url += '&tag=' + encodeURIComponent(html_entity_decode(this.request.get['tag']));
			}

			if ((this.request.get['description'])) {
				url += '&description=' + this.request.get['description'];
			}

			if ((this.request.get['category_id'])) {
				url += '&category_id=' + this.request.get['category_id'];
			}

			if ((this.request.get['sub_category'])) {
				url += '&sub_category=' + this.request.get['sub_category'];
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
				'url': await this.url.link('product/search', 'language=' + this.config.get('config_language') + url + '&page={page}')
			});

			data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (product_total - limit)) ? product_total : (((page - 1) * limit) + limit), product_total, Math.ceil(product_total / limit));

			if ((this.request.get['search']) && this.config.get('config_customer_search')) {
				this.load.model('account/search', this);
				let customer_id = 0;
				if (await this.customer.isLogged()) {
					customer_id = await this.customer.getId();
				} 
				let ip = '';
				if (((this.request.server.headers['x-forwarded-for'] ||
					this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress))) {
					ip = (this.request.server.headers['x-forwarded-for'] ||
						this.request.server.connection.remoteAddress ||
						this.request.server.socket.remoteAddress ||
						this.request.server.connection.socket.remoteAddress);
				} 

				let search_data = {
					'keyword': search,
					'category_id': category_id,
					'sub_category': sub_category,
					'description': description,
					'products': product_total,
					'customer_id': customer_id,
					'ip': ip
				};

				await this.model_account_search.addSearch(search_data);
			}
		}

		data['search'] = search;
		data['description'] = description;
		data['category_id'] = category_id;
		data['sub_category'] = sub_category;

		data['sort'] = sort;
		data['order'] = order;
		data['limit'] = limit;

		data['language'] = this.config.get('config_language');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('product/search', data));
	}
}
