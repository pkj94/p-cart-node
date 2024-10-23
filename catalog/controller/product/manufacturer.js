module.exports = class Manufacturer extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('product/manufacturer');

		this.load.model('catalog/manufacturer', this);

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_brand'),
			'href': await this.url.link('product/manufacturer', 'language=' + this.config.get('config_language'))
		});

		data['categories'] = [];

		const results = await this.model_catalog_manufacturer.getManufacturers();

		for (let result of results) {
			if (is_numeric(oc_substr(result['name'], 0, 1))) {
				key = '0 - 9';
			} else {
				key = oc_substr(oc_strtoupper(result['name']), 0, 1);
			}

			if (!(data['categories'][key])) {
				data['categories'][key]['name'] = key;
				data['categories'][key]['href'] = await this.url.link('product/manufacturer', 'language=' + this.config.get('config_language'));
			}

			data['categories'][key]['manufacturer'].push({
				'name': result['name'],
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + result['manufacturer_id'])
			});
		}

		data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('product/manufacturer_list', data));
	}

	/**
	 * @return void
	 */
	async info() {
		await this.load.language('product/manufacturer');

		if ((this.request.get['manufacturer_id'])) {
			manufacturer_id = this.request.get['manufacturer_id'];
		} else {
			manufacturer_id = 0;
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'p.sort_order';
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

		this.load.model('catalog/manufacturer', this);

		const manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(manufacturer_id);

		if (manufacturer_info.manufacturer_id) {
			this.document.setTitle(manufacturer_info['name']);

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_brand'),
				'href': await this.url.link('product/manufacturer', 'language=' + this.config.get('config_language'))
			});

			url = '';

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
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + url)
			});

			data['heading_title'] = manufacturer_info['name'];

			data['text_compare'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? count(this.session.data['compare']) : 0));

			data['compare'] = await this.url.link('product/compare', 'language=' + this.config.get('config_language'));

			data['products'] = [];

			filter_data = {
				'filter_manufacturer_id': manufacturer_id,
				'sort': sort,
				'order': order,
				'start': (page - 1) * limit,
				'limit': limit
			};

			this.load.model('catalog/product', this);
			this.load.model('tool/image', this);

			const product_total = await this.model_catalog_product.getTotalProducts(filter_data);

			const results = await this.model_catalog_product.getProducts(filter_data);

			for (let result of results) {
				if (is_file(DIR_IMAGE + html_entity_decode(result['image']))) {
					image = await this.model_tool_image.resize(html_entity_decode(result['image']), this.config.get('config_image_product_width'), this.config.get('config_image_product_height'));
				} else {
					image = await this.model_tool_image.resize('placeholder.png', this.config.get('config_image_product_width'), this.config.get('config_image_product_height'));
				}

				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(result['price'], result['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				} else {
					price = false;
				}

				if (result['special']) {
					special = this.currency.format(this.tax.calculate(result['special'], result['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				} else {
					special = false;
				}

				if (Number(Number(this.config.get('config_tax')))) {
					tax = this.currency.format(result['special'] ? result['special'] : result['price'], this.session.data['currency']);
				} else {
					tax = false;
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
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + result['manufacturer_id'] + '&product_id=' + result['product_id'] + url)
				};

				data['products'].push(await this.load.controller('product/thumb', product_data));
			}

			url = '';

			if ((this.request.get['limit'])) {
				url += '&limit=' + this.request.get['limit'];
			}

			data['sorts'] = [];

			data['sorts'].push({
				'text': this.language.get('text_default'),
				'value': 'p.sort_order-ASC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p.sort_order&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_asc'),
				'value': 'pd+name-ASC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=pd+name&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_name_desc'),
				'value': 'pd+name-DESC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=pd+name&order=DESC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_asc'),
				'value': 'p+price-ASC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p+price&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_price_desc'),
				'value': 'p+price-DESC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p+price&order=DESC' + url)
			});

			if (Number(this.config.get('config_review_status'))) {
				data['sorts'].push({
					'text': this.language.get('text_rating_desc'),
					'value': 'rating-DESC',
					'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=rating&order=DESC' + url)
				});

				data['sorts'].push({
					'text': this.language.get('text_rating_asc'),
					'value': 'rating-ASC',
					'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=rating&order=ASC' + url)
				});
			}

			data['sorts'].push({
				'text': this.language.get('text_model_asc'),
				'value': 'p+model-ASC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p+model&order=ASC' + url)
			});

			data['sorts'].push({
				'text': this.language.get('text_model_desc'),
				'value': 'p+model-DESC',
				'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&sort=p+model&order=DESC' + url)
			});

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			data['limits'] = [];

			limits = array_unique([this.config.get('config_pagination'), 25, 50, 75, 100]);

			sort(limits);

			for (let value of limits) {
				data['limits'].push({
					'text': value,
					'value': value,
					'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + url + '&limit=' + value)
				});
			}

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

			data['pagination'] = await this.load.controller('common/pagination', {
				'total': product_total,
				'page': page,
				'limit': limit,
				'url': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + url + '&page={page}')
			});

			data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (product_total - limit)) ? product_total : (((page - 1) * limit) + limit), product_total, Math.ceil(product_total / limit));

			// http://googlewebmastercentral+blogspot+com/2011/09/pagination-with-relnext-and-relprev+html
			if (page == 1) {
				this.document.addLink(await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id']), 'canonical');
			} else {
				this.document.addLink(await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&page=' + page), 'canonical');
			}

			if (page > 1) {
				this.document.addLink(await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + ((page - 2) ? '&page=' + (page - 1) : '')), 'prev');
			}

			if (limit && Math.ceil(product_total / limit) > page) {
				this.document.addLink(await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + '&page=' + (page + 1)), 'next');
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

			this.response.setOutput(await this.load.view('product/manufacturer_info', data));
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}

		return null;
	}
}
