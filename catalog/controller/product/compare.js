module.exports = class Compare extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('product/compare');

		this.load.model('catalog/product', this);
		this.load.model('catalog/manufacturer', this);
		this.load.model('localisation/stock_status');
		this.load.model('tool/image', this);

		if (!(this.session.data['compare'])) {
			this.session.data['compare'] = [];
		}

		if ((this.request.get['remove'])) {
			key = array_search(this.request.get['remove'], this.session.data['compare']);

			if (key !== false) {
				delete (this.session.data['compare'][key]);

				this.session.data['success'] = this.language.get('text_remove');
			}

			this.response.setRedirect(await this.url.link('product/compare', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('product/compare', 'language=' + this.config.get('config_language'))
		});

		data['add_to_cart'] = await this.url.link('checkout/cart.add', 'language=' + this.config.get('config_language'));
		data['cart'] = await this.url.link('common/cart.info', 'language=' + this.config.get('config_language'));

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete (this.session.data['success']);
		} else {
			data['success'] = '';
		}

		data['products'] = [];

		data['attribute_groups'] = [];

		for (let [key, product_id] of Object.entries(this.session.data['compare'])) {
			const product_info = await this.model_catalog_product.getProduct(product_id);

			if (product_info.product_id) {
				if (is_file(DIR_IMAGE + html_entity_decode(product_info['image']))) {
					image = await this.model_tool_image.resize(html_entity_decode(product_info['image']), this.config.get('config_image_compare_width'), this.config.get('config_image_compare_height'));
				} else {
					image = false;
				}

				if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
					price = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				} else {
					price = false;
				}

				if (product_info['special']) {
					special = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.session.data['currency']);
				} else {
					special = false;
				}

				const manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(product_info['manufacturer_id']);

				if (manufacturer_info.manufacturer_id) {
					manufacturer = manufacturer_info['name'];
				} else {
					manufacturer = '';
				}

				if (product_info['quantity'] <= 0) {
					stock_status_info = await this.model_localisation_stock_status.getStockStatus(product_info['stock_status_id']);

					if (stock_status_info) {
						availability = stock_status_info['name'];
					} else {
						availability = '';
					}
				} else if (this.config.get('config_stock_display')) {
					availability = product_info['quantity'];
				} else {
					availability = this.language.get('text_instock');
				}

				attribute_data = [];

				attribute_groups = await this.model_catalog_product.getAttributes(product_id);

				for (let attribute_group of attribute_groups) {
					for (let attribute of attribute_group['attribute']) {
						attribute_data[attribute['attribute_id']] = attribute['text'];
					}
				}

				data['products'][product_id] = {
					'product_id': product_info['product_id'],
					'name': product_info['name'],
					'thumb': image,
					'price': price,
					'special': special,
					'description': oc_substr(strip_tags(html_entity_decode(product_info['description'])), 0, 200) + '++',
					'model': product_info['model'],
					'manufacturer': manufacturer,
					'availability': availability,
					'minimum': product_info['minimum'] > 0 ? product_info['minimum'] : 1,
					'rating': product_info['rating'],
					'reviews': sprintf(this.language.get('text_reviews'), product_info['reviews']),
					'weight': this.weight.format(product_info['weight'], product_info['weight_class_id'], this.language.get('decimal_point'), this.language.get('thousand_point')),
					'length': this.length.format(product_info['length'], product_info['length_class_id'], this.language.get('decimal_point'), this.language.get('thousand_point')),
					'width': this.length.format(product_info['width'], product_info['length_class_id'], this.language.get('decimal_point'), this.language.get('thousand_point')),
					'height': this.length.format(product_info['height'], product_info['length_class_id'], this.language.get('decimal_point'), this.language.get('thousand_point')),
					'attribute': attribute_data,
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id),
					'remove': await this.url.link('product/compare', 'language=' + this.config.get('config_language') + '&remove=' + product_id)
				};

				for (let attribute_group of attribute_groups) {
					data['attribute_groups'][attribute_group['attribute_group_id']]['name'] = attribute_group['name'];

					for (let attribute of attribute_group['attribute']) {
						data['attribute_groups'][attribute_group['attribute_group_id']]['attribute'][attribute['attribute_id']]['name'] = attribute['name'];
					}
				}
			} else {
				delete (this.session.data['compare'][key]);
			}
		}

		data['continue'] = await this.url.link('common/home', 'language=' + this.config.get('config_language'));

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('product/compare', data));
	}

	/**
	 * @return void
	 */
	async add() {
		await this.load.language('product/compare');

		const json = {};

		if (!(this.session.data['compare'])) {
			this.session.data['compare'] = [];
		}

		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		} else {
			product_id = 0;
		}

		this.load.model('catalog/product', this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (!product_info) {
			json['error'] = this.language.get('error_product');
		}

		if (!Object.keys(json).length) {
			// If already in remove the product_id so it will be added to the back of the array
			key = array_search(this.request.post['product_id'], this.session.data['compare']);

			if (key !== false) {
				delete (this.session.data['compare'][key]);
			}

			// If we count a numeric value that is greater than 4 products, we remove the first one
			if (count(this.session.data['compare']) >= 4) {
				array_shift(this.session.data['compare']);
			}

			this.session.data['compare'].push(this.request.post['product_id']);

			json['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + this.request.post['product_id']), product_info['name'], await this.url.link('product/compare', 'language=' + this.config.get('config_language')));

			json['total'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? count(this.session.data['compare']) : 0));
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
