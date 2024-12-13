const strip_tags = require("locutus/php/strings/strip_tags");
const trim = require("locutus/php/strings/trim");
const is_numeric = require("locutus/php/var/is_numeric");

module.exports = class ControllerProductManufacturer extends Controller {
	async index() {
		const data = {};
		await this.load.language('product/manufacturer');

		this.load.model('catalog/manufacturer', this);

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_brand'),
			'href': await this.url.link('product/manufacturer')
		});

		data['categories'] = {};

		const results = await this.model_catalog_manufacturer.getManufacturers();

		for (let result of results) {
			let key = utf8_substr(utf8_strtoupper(result['name']), 0, 1);
			if (is_numeric(utf8_substr(result['name'], 0, 1))) {
				key = '0 - 9';
			}

			if (!(data['categories'][key])) {
				data['categories'][key] = data['categories'][key] || {};
				data['categories'][key]['name'] = key;
			}

			(data['categories'][key]['manufacturer']||[]).push({
				'name': result['name'],
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + result['manufacturer_id'])
			});
		}

		data['continue'] = await this.url.link('common/home');

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('product/manufacturer_list', data));
	}

	async info() {
		await this.load.language('product/manufacturer');

		this.load.model('catalog/manufacturer', this);

		this.load.model('catalog/product', this);

		this.load.model('tool/image', this);
		let manufacturer_id = 0;
		if ((this.request.get['manufacturer_id'])) {
			manufacturer_id = this.request.get['manufacturer_id'];
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

		data['breadcrumbs'].push({
			'text': this.language.get('text_brand'),
			'href': await this.url.link('product/manufacturer')
		});

		const manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(manufacturer_id);

		if (manufacturer_info.manufacturer_id) {
			this.document.setTitle(manufacturer_info['name']);

			let url = '';

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
				'text': manufacturer_info['name'],
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + url)
			});

			data['heading_title'] = manufacturer_info['name'];

			data['text_compare'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? count(this.session.data['compare']) : 0));

			data['compare'] = await this.url.link('product/compare');

			data['products'] = [];

			const filter_data = {
				'filter_manufacturer_id': manufacturer_id,
				'sort': sort,
				'order': order,
				'start': (Number(page) - 1) * limit,
				'limit': limit
			};

			const product_total = await this.model_catalog_product.getTotalProducts(filter_data);

			const results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
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
				if ((result['special']) && result['special'] >= 0) {
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
					'description': utf8_substr(trim(strip_tags(html_entity_decode(result['description']))), 0, this.config.get('theme_' + this.config.get('config_theme') + '_product_description_length')) + '..',
					'price': price,
					'special': special,
					'tax': tax,
					'minimum': result['minimum'] > 0 ? result['minimum'] : 1,
					'rating': result['rating'],
					'href': await this.url.link('product/product', 'manufacturer_id=' + result['manufacturer_id'] + '&product_id=' + result['product_id'] + url)
				});
			}

			url = '';

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['sorts'] = [];

			data['sorts'].push({
				'text': this.language.get('text_default'),
				'value': 'p.sort_order-ASC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p.sort_order&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_asc'),
				'value': 'pd.name-ASC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=pd.name&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_desc'),
				'value': 'pd.name-DESC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=pd.name&order=DESC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_asc'),
				'value': 'p.price-ASC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p.price&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_desc'),
				'value': 'p.price-DESC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p.price&order=DESC' + url)
			});

			if (Number(this.config.get('config_review_status'))) {
				data['sorts'].push({
					'text': this.language.get('text_rating_desc'),
					'value': 'rating-DESC',
					'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=rating&order=DESC' + url)
				});

				data['sorts'].push({
					'text': this.language.get('text_rating_asc'),
					'value': 'rating-ASC',
					'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=rating&order=ASC' + url)
				});
			}

			data['sorts'].push({
				'text': this.language.get('text_model_asc'),
				'value': 'p.model-ASC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p.model&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_model_desc'),
				'value': 'p.model-DESC',
				'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p.model&order=DESC' + url)
			});

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			data['limits'] = [];

			let limits = [...new Set([Number(this.config.get('theme_' + this.config.get('config_theme') + '_product_limit')), 25, 50, 75, 100])];;

			limits = limits.sort();

			for (let value of limits) {
				data['limits'].push({
					'text': value,
					'value': value,
					'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + url + '&limit=' + value)
				});
			}

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

			const pagination = new Pagination();
			pagination.total = product_total;
			pagination.page = page;
			pagination.limit = limit;
			pagination.url = await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + url + '&page={page}');

			data['pagination'] = pagination.render();

			data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (product_total - limit)) ? product_total : (((Number(page) - 1) * limit) + limit), product_total, Math.ceil(product_total / limit));

			// http://googlewebmastercentral+blogspot+com/2011/09/pagination-with-relnext-and-relprev+html
			if (page == 1) {
				this.document.addLink(await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id']), 'canonical');
			} else {
				this.document.addLink(await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&page=' + page), 'canonical');
			}

			if (page > 1) {
				this.document.addLink(await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + ((page - 2) ? '&page=' + (Number(page) - 1) : '')), 'prev');
			}

			if (limit && Math.ceil(product_total / limit) > page) {
				this.document.addLink(await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + '&page=' + (page + 1)), 'next');
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

			this.response.setOutput(await this.load.view('product/manufacturer_info', data));
		} else {
			let url = '';

			if ((this.request.get['manufacturer_id'])) {
				url += '&manufacturer_id=' + this.request.get['manufacturer_id'];
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
				'href': await this.url.link('product/manufacturer/info', url)
			});

			this.document.setTitle(this.language.get('text_error'));

			data['heading_title'] = this.language.get('text_error');

			data['text_error'] = this.language.get('text_error');

			data['continue'] = await this.url.link('common/home');

			this.response.addHeader(this.request.server.protocol + ' 404 Not Found');

			data['header'] = await this.load.controller('common/header');
			data['footer'] = await this.load.controller('common/footer');
			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');

			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}
}
