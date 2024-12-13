const array_search = require("locutus/php/array/array_search");
const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ControllerProductCompare extends Controller {
	async index() {
		const data = {};
		await this.load.language('product/compare');

		this.load.model('catalog/product', this);

		this.load.model('tool/image', this);

		if (!(this.session.data['compare'])) {
			this.session.data['compare'] = [];
		}

		if ((this.request.get['remove'])) {
			let key = array_search(this.request.get['remove'], this.session.data['compare']);

			if (key !== false) {
				delete this.session.data['compare'][key];

				this.session.data['success'] = this.language.get('text_remove');
			}
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('product/compare'));
		} else {

			this.document.setTitle(this.language.get('heading_title'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home')
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('product/compare')
			});

			if ((this.session.data['success'])) {
				data['success'] = this.session.data['success'];

				delete this.session.data['success'];
			} else {
				data['success'] = '';
			}

			data['review_status'] = Number(this.config.get('config_review_status'));

			data['products'] = [];

			data['attribute_groups'] = [];

			for (let [key, product_id] of Object.entries(this.session.data['compare'])) {
				const product_info = await this.model_catalog_product.getProduct(product_id);

				if (product_info.product_id) {
					let image = false;
					if (product_info['image']) {
						image = await this.model_tool_image.resize(product_info['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_compare_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_compare_height'));
					}
					let price = false;
					if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
						price = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					}
					let special = false;
					if ((product_info['special']) && product_info['special'] >= 0) {
						special = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					}
					let availability = this.language.get('text_instock');
					if (product_info['quantity'] <= 0) {
						availability = product_info['stock_status'];
					} else if (this.config.get('config_stock_display')) {
						availability = product_info['quantity'];
					}

					const attribute_data = {};

					const attribute_groups = await this.model_catalog_product.getProductAttributes(product_id);

					for (let attribute_group of attribute_groups) {
						for (let attribute of attribute_group['attribute']) {
							attribute_data[attribute['attribute_id']] = attribute['text'];
						}
					}

					data['products'].push({
						'product_id': product_info['product_id'],
						'name': product_info['name'],
						'thumb': image,
						'price': price,
						'special': special,
						'description': utf8_substr(strip_tags(html_entity_decode(product_info['description'])), 0, 200) + '..',
						'model': product_info['model'],
						'manufacturer': product_info['manufacturer'],
						'availability': availability,
						'minimum': product_info['minimum'] > 0 ? product_info['minimum'] : 1,
						'rating': product_info['rating'],
						'reviews': sprintf(this.language.get('text_reviews'), product_info['reviews']),
						'weight': this.weight.format(product_info['weight'], product_info['weight_class_id']),
						'length': this.length.format(product_info['length'], product_info['length_class_id']),
						'width': this.length.format(product_info['width'], product_info['length_class_id']),
						'height': this.length.format(product_info['height'], product_info['length_class_id']),
						'attribute': attribute_data,
						'href': await this.url.link('product/product', 'product_id=' + product_id),
						'remove': await this.url.link('product/compare', 'remove=' + product_id)
					});

					for (let attribute_group of attribute_groups) {
						data['attribute_groups'][attribute_group['attribute_group_id']]['name'] = attribute_group['name'];

						for (let attribute of attribute_group['attribute']) {
							data['attribute_groups'][attribute_group['attribute_group_id']]['attribute'][attribute['attribute_id']]['name'] = attribute['name'];
						}
					}
				} else {
					delete this.session.data['compare'][key];
				}
			}

			data['continue'] = await this.url.link('common/home');

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			await this.session.save(this.session.data);
			this.response.setOutput(await this.load.view('product/compare', data));
		}
	}

	async add() {
		await this.load.language('product/compare');

		const json = {};

		if (!(this.session.data['compare'])) {
			this.session.data['compare'] = [];
		}
		let product_id = 0;
		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		}

		this.load.model('catalog/product', this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info.product_id) {
			if (!this.session.data['compare'].includes(this.request.post['product_id'])) {
				if (this.session.data['compare'].length >= 4) {
					this.session.data['compare'] = this.session.data['compare'].shift();
				}

				this.session.data['compare'].push(this.request.post['product_id']);
			}

			json['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'product_id=' + this.request.post['product_id']), product_info['name'], await this.url.link('product/compare'));

			json['total'] = sprintf(this.language.get('text_compare'), ((this.session.data['compare']) ? this.session.data['compare'].length : 0));
		}
		await this.session.save(this.session.data);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
