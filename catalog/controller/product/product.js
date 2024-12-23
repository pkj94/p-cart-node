const sprintf = require("locutus/php/strings/sprintf");

module.exports = class Product extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('product/product');
		let product_id = 0;
		if ((this.request.get['product_id'])) {
			product_id = this.request.get['product_id'];
		}

		this.load.model('catalog/product', this);

		const product_info = await this.model_catalog_product.getProduct(product_id);

		if (product_info.product_id) {
			this.document.setTitle(product_info['meta_title']);
			this.document.setDescription(product_info['meta_description']);
			this.document.setKeywords(product_info['meta_keyword']);
			this.document.addLink(await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id), 'canonical');

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			});

			this.load.model('catalog/category', this);

			if ((this.request.get['path'])) {
				let path = '';

				let parts = Array.isArray(this.request.get['path']) ? this.request.get['path'][this.request.get['path'].length - 1] : this.request.get['path'].split('_');

				let category_id = parts.pop();

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
							'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + path)
						});
					}
				}

				// Set the last category breadcrumb
				const category_info = await this.model_catalog_category.getCategory(category_id);

				if (category_info.category_id) {
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
						'text': category_info['name'],
						'href': await this.url.link('product/category', 'language=' + this.config.get('config_language') + '&path=' + this.request.get['path'] + url)
					});
				}
			}

			this.load.model('catalog/manufacturer', this);

			if ((this.request.get['manufacturer_id'])) {
				data['breadcrumbs'].push({
					'text': this.language.get('text_brand'),
					'href': await this.url.link('product/manufacturer', 'language=' + this.config.get('config_language'))
				});

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

				const manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(this.request.get['manufacturer_id']);

				if (manufacturer_info.manufacturer_id) {
					data['breadcrumbs'].push({
						'text': manufacturer_info['name'],
						'href': await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + this.request.get['manufacturer_id'] + url)
					});
				}
			}

			if ((this.request.get['search']) || (this.request.get['tag'])) {
				let url = '';

				if ((this.request.get['search'])) {
					url += '&search=' + this.request.get['search'];
				}

				if ((this.request.get['tag'])) {
					url += '&tag=' + this.request.get['tag'];
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
					'text': this.language.get('text_search'),
					'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + url)
				});
			}

			let url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + Array.isArray(this.request.get['path']) ? this.request.get['path'][this.request.get['path'].length - 1] : this.request.get['path'];
			}

			if ((this.request.get['filter'])) {
				url += '&filter=' + this.request.get['filter'];
			}

			if ((this.request.get['manufacturer_id'])) {
				url += '&manufacturer_id=' + this.request.get['manufacturer_id'];
			}

			if ((this.request.get['search'])) {
				url += '&search=' + this.request.get['search'];
			}

			if ((this.request.get['tag'])) {
				url += '&tag=' + this.request.get['tag'];
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
				'text': product_info['name'],
				'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + url + '&product_id=' + product_id)
			});

			this.document.setTitle(product_info['meta_title']);
			this.document.setDescription(product_info['meta_description']);
			this.document.setKeywords(product_info['meta_keyword']);
			this.document.addLink(await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_id), 'canonical');

			this.document.addScript('catalog/view/javascript/jquery/magnific/jquery.magnific-popup.min.js');
			this.document.addStyle('catalog/view/javascript/jquery/magnific/magnific-popup.css');

			data['heading_title'] = product_info['name'];

			data['text_minimum'] = sprintf(this.language.get('text_minimum'), product_info['minimum']);
			data['text_login'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', 'language=' + this.config.get('config_language')), await this.url.link('account/register', 'language=' + this.config.get('config_language')));
			data['text_reviews'] = sprintf(this.language.get('text_reviews'), product_info['reviews']);

			data['tab_review'] = sprintf(this.language.get('tab_review'), product_info['reviews']);

			data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), Number(this.config.get('config_file_max_size')));

			data['config_file_max_size'] = (Number(this.config.get('config_file_max_size')) * 1024 * 1024);

			data['upload'] = await this.url.link('tool/upload', 'language=' + this.config.get('config_language'));

			data['product_id'] = product_id;

			const manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(product_info['manufacturer_id']);

			if (manufacturer_info.manufacturer_id) {
				data['manufacturer'] = manufacturer_info['name'];
			} else {
				data['manufacturer'] = '';
			}

			data['manufacturers'] = await this.url.link('product/manufacturer.info', 'language=' + this.config.get('config_language') + '&manufacturer_id=' + product_info['manufacturer_id']);
			data['model'] = product_info['model'];
			data['reward'] = product_info['reward'];
			data['points'] = product_info['points'];
			data['description'] = html_entity_decode(product_info['description']);

			if (product_info['quantity'] <= 0) {
				this.load.model('localisation/stock_status', this);

				const stock_status_info = await this.model_localisation_stock_status.getStockStatus(product_info['stock_status_id']);

				if (stock_status_info.stock_status_id) {
					data['stock'] = stock_status_info['name'];
				} else {
					data['stock'] = '';
				}
			} else if (Number(this.config.get('config_stock_display'))) {
				data['stock'] = product_info['quantity'];
			} else {
				data['stock'] = this.language.get('text_instock');
			}

			data['rating'] = product_info['rating'];
			data['review_status'] = Number(this.config.get('config_review_status'));

			data['review'] = await this.load.controller('product/review');

			data['add_to_wishlist'] = await this.url.link('account/wishlist.add', 'language=' + this.config.get('config_language'));
			data['add_to_compare'] = await this.url.link('product/compare.add', 'language=' + this.config.get('config_language'));

			this.load.model('tool/image', this);

			if (product_info['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(product_info['image']))) {
				data['popup'] = await this.model_tool_image.resize(html_entity_decode(product_info['image']), Number(this.config.get('config_image_popup_width')), Number(this.config.get('config_image_popup_height')));
			} else {
				data['popup'] = '';
			}

			if (product_info['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(product_info['image']))) {
				data['thumb'] = await this.model_tool_image.resize(html_entity_decode(product_info['image']), this.config.get('config_image_thumb_width'), this.config.get('config_image_thumb_height'));
			} else {
				data['thumb'] = '';
			}

			data['images'] = [];

			let results = await this.model_catalog_product.getImages(product_id);

			for (let result of results) {
				if (result['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(result['image']))) {
					data['images'].push({
						'popup': await this.model_tool_image.resize(html_entity_decode(result['image']), Number(this.config.get('config_image_popup_width')), Number(this.config.get('config_image_popup_height'))),
						'thumb': await this.model_tool_image.resize(html_entity_decode(result['image']), Number(this.config.get('config_image_additional_width')), Number(this.config.get('config_image_additional_height')))
					});
				}
			}

			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
				data['price'] = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
			} else {
				data['price'] = false;
			}

			if (product_info['special']) {
				data['special'] = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
			} else {
				data['special'] = false;
			}

			if (Number(this.config.get('config_tax'))) {
				data['tax'] = this.currency.format(product_info['special'] ? product_info['special'] : product_info['price'], this.session.data['currency']);
			} else {
				data['tax'] = false;
			}

			const discounts = await this.model_catalog_product.getDiscounts(product_id);

			data['discounts'] = [];

			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
				for (let discount of discounts) {
					data['discounts'].push({
						'quantity': discount['quantity'],
						'price': this.currency.format(this.tax.calculate(discount['price'], product_info['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency'])
					});
				}
			}

			data['options'] = [];

			// Check if product is variant
			if (product_info['master_id']) {
				product_id = product_info['master_id'];
			} else {
				product_id = this.request.get['product_id'];
			}

			const product_options = await this.model_catalog_product.getOptions(product_id);

			for (let option of product_options) {
				if (this.request.get['product_id'] && !(product_info['override'] && product_info['override']['variant'] && product_info['override']['variant'][option['product_option_id']])) {
					let product_option_value_data = [];

					for (let option_value of option['product_option_value']) {
						if (!option_value['subtract'] || (option_value['quantity'] > 0)) {
							let price = false;
							if (((Number(this.config.get('config_customer_price')) && await this.customer.isLogged()) || !Number(this.config.get('config_customer_price'))) && option_value['price']) {
								price = this.currency.format(this.tax.calculate(option_value['price'], product_info['tax_class_id'], Number(this.config.get('config_tax')) ? 'P' : false), this.session.data['currency']);
							}
							let image = '';
							if (option_value['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(option_value['image']))) {
								image = await this.model_tool_image.resize(html_entity_decode(option_value['image']), 50, 50);
							}

							product_option_value_data.push({
								'product_option_value_id': option_value['product_option_value_id'],
								'option_value_id': option_value['option_value_id'],
								'name': option_value['name'],
								'image': image,
								'price': price,
								'price_prefix': option_value['price_prefix']
							});
						}
					}

					data['options'].push({
						'product_option_id': option['product_option_id'],
						'product_option_value': product_option_value_data,
						'option_id': option['option_id'],
						'name': option['name'],
						'type': option['type'],
						'value': option['value'],
						'required': option['required']
					});
				}
			}

			// Subscriptions
			data['subscription_plans'] = [];

			results = await this.model_catalog_product.getSubscriptions(product_id);

			for (let result of results) {
				let description = '';

				if (result['trial_status']) {
					let trial_price = this.currency.format(this.tax.calculate(result['trial_price'], product_info['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
					let trial_cycle = result['trial_cycle'];
					let trial_frequency = this.language.get('text_' + result['trial_frequency']);
					let trial_duration = result['trial_duration'];

					description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
				}

				let price = this.currency.format(this.tax.calculate(result['price'], product_info['tax_class_id'], Number(this.config.get('config_tax'))), this.session.data['currency']);
				let cycle = result['cycle'];
				let frequency = this.language.get('text_' + result['frequency']);
				let duration = result['duration'];

				if (duration) {
					description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
				} else {
					description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
				}

				data['subscription_plans'].push({
					'subscription_plan_id': result['subscription_plan_id'],
					'name': result['name'],
					'description': description
				});
			}

			if (product_info['minimum']) {
				data['minimum'] = product_info['minimum'];
			} else {
				data['minimum'] = 1;
			}

			data['share'] = await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + this.request.get['product_id']);

			data['attribute_groups'] = await this.model_catalog_product.getAttributes(product_id);

			data['products'] = [];

			results = await this.model_catalog_product.getRelated(product_id);

			for (let result of results) {
				let image = await this.model_tool_image.resize('placeholder.png', Number(this.config.get('config_image_related_width')), Number(this.config.get('config_image_related_height')));
				if (result['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(result['image']))) {
					image = await this.model_tool_image.resize(html_entity_decode(result['image']), Number(this.config.get('config_image_related_width')), Number(this.config.get('config_image_related_height')));
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
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + result['product_id'])
				};

				data['products'].push(await this.load.controller('product/thumb', product_data));
			}

			data['tags'] = [];

			if (product_info['tag']) {
				let tags = product_info['tag'].split(',');

				for (let tag of tags) {
					data['tags'].push({
						'tag': tag.trim(),
						'href': await this.url.link('product/search', 'language=' + this.config.get('config_language') + '&tag=' + tag.trim())
					});
				}
			}

			if (this.config.get('config_product_report_status')) {
				await this.model_catalog_product.addReport(this.request.get['product_id'], (this.request.server.headers['x-forwarded-for'] ||
					this.request.server.connection.remoteAddress ||
					this.request.server.socket.remoteAddress ||
					this.request.server.connection.socket.remoteAddress));
			}

			data['language'] = this.config.get('config_language');

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('product/product', data));
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}

		return null;
	}
}
