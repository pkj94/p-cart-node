const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ControllerProductProduct extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('product/product');

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		this.load.model('catalog/category', this);
		let category_id = 0;
		if ((this.request.get['path'])) {
			let path = '';

			let parts = this.request.get['path'].split('_');

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
						'href': await this.url.link('product/category', 'path=' + path)
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
					'href': await this.url.link('product/category', 'path=' + this.request.get['path'] + url)
				});
			}
		}

		this.load.model('catalog/manufacturer', this);

		if ((this.request.get['manufacturer_id'])) {
			data['breadcrumbs'].push({
				'text': this.language.get('text_brand'),
				'href': await this.url.link('product/manufacturer')
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
					'href': await this.url.link('product/manufacturer/info', 'manufacturer_id=' + this.request.get['manufacturer_id'] + url)
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
				'href': await this.url.link('product/search', url)
			});
		}
		let product_id = 0;
		if ((this.request.get['product_id'])) {
			product_id = this.request.get['product_id'];
		}

		this.load.model('catalog/product', this);

		let product_info = await this.model_catalog_product.getProduct(product_id);

		//check product page open from cateory page
		if ((this.request.get['path'])) {
			let parts = this.request.get['path'].split('_');

			if (!(await this.model_catalog_product.checkProductCategory(product_id, parts))) {
				product_info = {};
			}
		}

		//check product page open from manufacturer page
		if ((this.request.get['manufacturer_id']) && !Object.keys(product_info).length) {
			if (product_info['manufacturer_id'] != this.request.get['manufacturer_id']) {
				product_info = {};
			}
		}

		if (Object.keys(product_info).length) {
			let url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
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
				'href': await this.url.link('product/product', url + '&product_id=' + this.request.get['product_id'])
			});

			this.document.setTitle(product_info['meta_title']);
			this.document.setDescription(product_info['meta_description']);
			this.document.setKeywords(product_info['meta_keyword']);
			this.document.addLink(await this.url.link('product/product', 'product_id=' + this.request.get['product_id']), 'canonical');
			this.document.addScript('catalog/view/javascript/jquery/magnific/jquery.magnific-popup.min.js');
			this.document.addStyle('catalog/view/javascript/jquery/magnific/magnific-popup.css');
			this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment.min.js');
			this.document.addScript('catalog/view/javascript/jquery/datetimepicker/moment/moment-with-locales.min.js');
			this.document.addScript('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.js');
			this.document.addStyle('catalog/view/javascript/jquery/datetimepicker/bootstrap-datetimepicker.min.css');

			data['heading_title'] = product_info['name'];

			data['text_minimum'] = sprintf(this.language.get('text_minimum'), product_info['minimum']);
			data['text_login'] = sprintf(this.language.get('text_login'), await this.url.link('account/login', '', true), await this.url.link('account/register', '', true));

			this.load.model('catalog/review', this);

			data['tab_review'] = sprintf(this.language.get('tab_review'), product_info['reviews']);

			data['product_id'] = this.request.get['product_id'];
			data['manufacturer'] = product_info['manufacturer'];
			data['manufacturers'] = await this.url.link('product/manufacturer/info', 'manufacturer_id=' + product_info['manufacturer_id']);
			data['model'] = product_info['model'];
			data['reward'] = product_info['reward'];
			data['points'] = product_info['points'];
			data['description'] = html_entity_decode(product_info['description']);

			if (product_info['quantity'] <= 0) {
				data['stock'] = product_info['stock_status'];
			} else if (this.config.get('config_stock_display')) {
				data['stock'] = product_info['quantity'];
			} else {
				data['stock'] = this.language.get('text_instock');
			}

			this.load.model('tool/image', this);

			if (product_info['image']) {
				data['popup'] = await this.model_tool_image.resize(product_info['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_popup_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_popup_height'));
			} else {
				data['popup'] = '';
			}

			if (product_info['image']) {
				data['thumb'] = await this.model_tool_image.resize(product_info['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_thumb_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_thumb_height'));
			} else {
				data['thumb'] = '';
			}

			data['images'] = [];

			let results = await this.model_catalog_product.getProductImages(this.request.get['product_id']);

			for (let result of results) {
				data['images'].push({
					'popup': await this.model_tool_image.resize(result['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_popup_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_popup_height')),
					'thumb': await this.model_tool_image.resize(result['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_additional_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_additional_height'))
				});
			}

			if (await this.customer.isLogged() || !Number(this.config.get('config_customer_price'))) {
				data['price'] = this.currency.format(this.tax.calculate(product_info['price'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
			} else {
				data['price'] = false;
			}
			let tax_price = product_info['price'];
			if ((product_info['special']) && product_info['special'] >= 0) {
				data['special'] = this.currency.format(this.tax.calculate(product_info['special'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				tax_price = product_info['special'];
			} else {
				data['special'] = false;
			}

			if (this.config.get('config_tax')) {
				data['tax'] = this.currency.format(tax_price, this.session.data['currency']);
			} else {
				data['tax'] = false;
			}

			const discounts = await this.model_catalog_product.getProductDiscounts(this.request.get['product_id']);

			data['discounts'] = [];

			for (let discount of discounts) {
				data['discounts'].push({
					'quantity': discount['quantity'],
					'price': this.currency.format(this.tax.calculate(discount['price'], product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency'])
				});
			}

			data['options'] = [];

			for (let option of await this.model_catalog_product.getProductOptions(this.request.get['product_id'])) {
				const product_option_value_data = [];

				for (let option_value of option['product_option_value']) {

					if (!option_value['subtract'] || (option_value['quantity'] > 0)) {
						let price = false;
						if (((Number(this.config.get('config_customer_price')) && await this.customer.isLogged()) || !Number(this.config.get('config_customer_price'))) && option_value['price']) {
							price = this.currency.format(this.tax.calculate(option_value['price'], product_info['tax_class_id'], this.config.get('config_tax') ? 'P' : false), this.session.data['currency']);
						} else {
							price = false;
						}

						product_option_value_data.push({
							'product_option_value_id': option_value['product_option_value_id'],
							'option_value_id': option_value['option_value_id'],
							'name': option_value['name'],
							'image': await this.model_tool_image.resize(option_value['image'], 50, 50),
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

			if (product_info['minimum']) {
				data['minimum'] = product_info['minimum'];
			} else {
				data['minimum'] = 1;
			}

			data['review_status'] = Number(this.config.get('config_review_status'));

			if (this.config.get('config_review_guest') || await this.customer.isLogged()) {
				data['review_guest'] = true;
			} else {
				data['review_guest'] = false;
			}

			if (await this.customer.isLogged()) {
				data['customer_name'] = await this.customer.getFirstName() + '&nbsp;' + await this.customer.getLastName();
			} else {
				data['customer_name'] = '';
			}

			data['reviews'] = sprintf(this.language.get('text_reviews'), product_info['reviews']);
			data['rating'] = product_info['rating'];

			// Captcha
			if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('review')) {
				data['captcha'] = await this.load.controller('extension/captcha/' + this.config.get('config_captcha'));
			} else {
				data['captcha'] = '';
			}

			data['share'] = await this.url.link('product/product', 'product_id=' + this.request.get['product_id']);

			data['attribute_groups'] = await this.model_catalog_product.getProductAttributes(this.request.get['product_id']);

			data['products'] = [];

			results = await this.model_catalog_product.getProductRelated(this.request.get['product_id']);

			for (let [related_id, result] of Object.entries(results)) {
				let image = '';
				if (result['image']) {
					image = await this.model_tool_image.resize(result['image'], this.config.get('theme_' + this.config.get('config_theme') + '_image_related_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_related_height'));
				} else {
					image = await this.model_tool_image.resize('placeholder.png', this.config.get('theme_' + this.config.get('config_theme') + '_image_related_width'), this.config.get('theme_' + this.config.get('config_theme') + '_image_related_height'));
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
					'description': utf8_substr(strip_tags(html_entity_decode(result['description']).trim()), 0, this.config.get('theme_' + this.config.get('config_theme') + '_product_description_length')) + '..',
					'price': price,
					'special': special,
					'tax': tax,
					'minimum': result['minimum'] > 0 ? result['minimum'] : 1,
					'rating': rating,
					'href': await this.url.link('product/product', 'product_id=' + result['product_id'])
				});
			}

			data['tags'] = [];

			if (product_info['tag']) {
				let tags = product_info['tag'].split(',');

				for (let tag of tags) {
					data['tags'].push({
						'tag': tag.trim(),
						'href': await this.url.link('product/search', 'tag=' + tag.trim())
					});
				}
			}

			data['recurrings'] = await this.model_catalog_product.getProfiles(this.request.get['product_id']);

			await this.model_catalog_product.updateViewed(this.request.get['product_id']);

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('product/product', data));
		} else {
			let url = '';

			if ((this.request.get['path'])) {
				url += '&path=' + this.request.get['path'];
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
				'text': this.language.get('text_error'),
				'href': await this.url.link('product/product', url + '&product_id=' + product_id)
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

	async review() {
		const data = {};
		await this.load.language('product/product');

		this.load.model('catalog/review', this);
		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		data['reviews'] = [];

		const review_total = await this.model_catalog_review.getTotalReviewsByProductId(this.request.get['product_id']);

		const results = await this.model_catalog_review.getReviewsByProductId(this.request.get['product_id'], (Number(page) - 1) * 5, 5);

		for (let result of results) {
			data['reviews'].push({
				'author': result['author'],
				'text': nl2br(result['text']),
				'rating': result['rating'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		const pagination = new Pagination();
		pagination.total = review_total;
		pagination.page = page;
		pagination.limit = 5;
		pagination.url = await this.url.link('product/product/review', 'product_id=' + this.request.get['product_id'] + '&page={page}');

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (review_total) ? ((Number(page) - 1) * 5) + 1 : 0, (((Number(page) - 1) * 5) > (review_total - 5)) ? review_total : (((Number(page) - 1) * 5) + 5), review_total, Math.ceil(review_total / 5));

		this.response.setOutput(await this.load.view('product/review', data));
	}

	async write() {
		await this.load.language('product/product');

		const json = {};

		if ((this.request.get['product_id']) && this.request.get['product_id']) {
			if (this.request.server['method'] == 'POST') {
				if ((utf8_strlen(this.request.post['name']) < 3) || (utf8_strlen(this.request.post['name']) > 25)) {
					json['error'] = this.language.get('error_name');
				}

				if ((utf8_strlen(this.request.post['text']) < 25) || (utf8_strlen(this.request.post['text']) > 1000)) {
					json['error'] = this.language.get('error_text');
				}

				if (!(this.request.post['rating']) || this.request.post['rating'] < 0 || this.request.post['rating'] > 5) {
					json['error'] = this.language.get('error_rating');
				}

				// Captcha
				if (Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && this.config.get('config_captcha_page').includes('review')) {
					const captcha = await this.load.controller('extension/captcha/' + this.config.get('config_captcha') + '/validate');

					if (captcha) {
						json['error'] = captcha;
					}
				}

				if (!(json['error'])) {
					this.load.model('catalog/review', this);

					await this.model_catalog_review.addReview(this.request.get['product_id'], this.request.post);

					json['success'] = this.language.get('text_success');
				}
			}
		} else {
			json['error'] = this.language.get('error_product');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async getRecurringDescription() {
		await this.load.language('product/product');
		this.load.model('catalog/product', this);
		let product_id = 0;
		if ((this.request.post['product_id'])) {
			product_id = this.request.post['product_id'];
		}
		let recurring_id = 0;
		if ((this.request.post['recurring_id'])) {
			recurring_id = this.request.post['recurring_id'];
		}
		let quantity = 1;
		if ((this.request.post['quantity'])) {
			quantity = this.request.post['quantity'];
		}

		const product_info = await this.model_catalog_product.getProduct(product_id);

		const recurring_info = await this.model_catalog_product.getProfile(product_id, recurring_id);

		const json = {};

		if (product_info && recurring_info) {
			if (!Object.keys(json).length) {
				const frequencies = {
					'day': this.language.get('text_day'),
					'week': this.language.get('text_week'),
					'semi_month': this.language.get('text_semi_month'),
					'month': this.language.get('text_month'),
					'year': this.language.get('text_year'),
				};
				let price = 0, trial_text = '';
				if (recurring_info['trial_status'] == 1) {
					price = this.currency.format(this.tax.calculate(recurring_info['trial_price'] * quantity, product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
					trial_text = sprintf(this.language.get('text_trial_description'), price, recurring_info['trial_cycle'], frequencies[recurring_info['trial_frequency']], recurring_info['trial_duration']) + ' ';
				} else {
					trial_text = '';
				}

				price = this.currency.format(this.tax.calculate(recurring_info['price'] * quantity, product_info['tax_class_id'], this.config.get('config_tax')), this.session.data['currency']);
				let text = '';
				if (recurring_info['duration']) {
					text = trial_text + sprintf(this.language.get('text_payment_description'), price, recurring_info['cycle'], frequencies[recurring_info['frequency']], recurring_info['duration']);
				} else {
					text = trial_text + sprintf(this.language.get('text_payment_cancel'), price, recurring_info['cycle'], frequencies[recurring_info['frequency']], recurring_info['duration']);
				}

				json['success'] = text;
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
