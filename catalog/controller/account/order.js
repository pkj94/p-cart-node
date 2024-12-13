const nl2br = require("locutus/php/strings/nl2br");

module.exports = class ControllerAccountOrder extends Controller {
	async index() {
		const data = {};
		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/order', '', true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		await this.load.language('account/order');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', '', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/order', url, true)
		});
		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		const limit = 10;

		data['orders'] = [];

		this.load.model('account/order', this);

		const order_total = await this.model_account_order.getTotalOrders();

		const results = await this.model_account_order.getOrders((Number(page) - 1) * limit, limit);

		for (let result of results) {
			const product_total = await this.model_account_order.getTotalOrderProductsByOrderId(result['order_id']);
			const voucher_total = await this.model_account_order.getTotalOrderVouchersByOrderId(result['order_id']);

			data['orders'].push({
				'order_id': result['order_id'],
				'name': result['firstname'] + ' ' + result['lastname'],
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'products': (product_total + voucher_total),
				'total': this.currency.format(result['total'], result['currency_code'], result['currency_value']),
				'view': await this.url.link('account/order/info', 'order_id=' + result['order_id'], true),
			});
		}

		const pagination = new Pagination();
		pagination.total = order_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('account/order', 'page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((Number(page) - 1) * limit) + 1 : 0, (((Number(page) - 1) * limit) > (order_total - limit)) ? order_total : (((Number(page) - 1) * limit) + limit), order_total, Math.ceil(order_total / limit));

		data['continue'] = await this.url.link('account/account', '', true);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/order_list', data));
	}

	async info() {
		const data = {};
		await this.load.language('account/order');
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		}

		if (!await this.customer.isLogged()) {
			this.session.data['redirect'] = await this.url.link('account/order/info', 'order_id=' + order_id, true);
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('account/login', '', true));
		}

		this.load.model('account/order', this);

		const order_info = await this.model_account_order.getOrder(order_id);

		if (order_info.order_id) {
			this.document.setTitle(this.language.get('text_order'));

			let url = '';

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home')
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_account'),
				'href': await this.url.link('account/account', '', true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('account/order', url, true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_order'),
				'href': await this.url.link('account/order/info', 'order_id=' + this.request.get['order_id'] + url, true)
			});

			if ((this.session.data['error'])) {
				data['error_warning'] = this.session.data['error'];

				delete this.session.data['error'];
			} else {
				data['error_warning'] = '';
			}

			if ((this.session.data['success'])) {
				data['success'] = this.session.data['success'];

				delete this.session.data['success'];
			} else {
				data['success'] = '';
			}

			if (order_info['invoice_no']) {
				data['invoice_no'] = order_info['invoice_prefix'] + order_info['invoice_no'];
			} else {
				data['invoice_no'] = '';
			}

			data['order_id'] = this.request.get['order_id'];
			data['date_added'] = date(this.language.get('date_format_short'), strtotime(order_info['date_added']));
			let format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
			if (order_info['payment_address_format']) {
				format = order_info['payment_address_format'];
			}

			let find = [
				'{firstname}',
				'{lastname}',
				'{company}',
				'{address_1}',
				'{address_2}',
				'{city}',
				'{postcode}',
				'{zone}',
				'{zone_code}',
				'{country}'
			];

			let replace = {
				'firstname': order_info['payment_firstname'],
				'lastname': order_info['payment_lastname'],
				'company': order_info['payment_company'],
				'address_1': order_info['payment_address_1'],
				'address_2': order_info['payment_address_2'],
				'city': order_info['payment_city'],
				'postcode': order_info['payment_postcode'],
				'zone': order_info['payment_zone'],
				'zone_code': order_info['payment_zone_code'],
				'country': order_info['payment_country'],
				"\r\n": '<br />',
				"\r": '<br />',
				"\n": '<br />',
				"/\s\s+/": '<br />',
				"/\r\r+/": '<br />',
				"/\n\n+/": '<br />'
			};
			for (let [k, v] of Object.entries(replace)) {
				format = format.replaceAll('{' + k + '}', v);
			}
			data['payment_address'] = format;

			data['payment_method'] = order_info['payment_method'];

			if (order_info['shipping_address_format']) {
				format = order_info['shipping_address_format'];
			} else {
				format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
			}

			find = [
				'{firstname}',
				'{lastname}',
				'{company}',
				'{address_1}',
				'{address_2}',
				'{city}',
				'{postcode}',
				'{zone}',
				'{zone_code}',
				'{country}'
			];

			replace = {
				'firstname': order_info['shipping_firstname'],
				'lastname': order_info['shipping_lastname'],
				'company': order_info['shipping_company'],
				'address_1': order_info['shipping_address_1'],
				'address_2': order_info['shipping_address_2'],
				'city': order_info['shipping_city'],
				'postcode': order_info['shipping_postcode'],
				'zone': order_info['shipping_zone'],
				'zone_code': order_info['shipping_zone_code'],
				'country': order_info['shipping_country'],
				"\r\n": '<br />',
				"\r": '<br />',
				"\n": '<br />',
				"/\s\s+/": '<br />',
				"/\r\r+/": '<br />',
				"/\n\n+/": '<br />'
			};
			for (let [k, v] of Object.entries(replace)) {
				format = format.replaceAll('{' + k + '}', v);
			}

			data['shipping_address'] = format;

			data['shipping_method'] = order_info['shipping_method'];

			this.load.model('catalog/product', this);
			this.load.model('tool/upload', this);

			// Products
			data['products'] = [];

			const products = await this.model_account_order.getOrderProducts(this.request.get['order_id']);

			for (let product of products) {
				const option_data = [];

				const options = await this.model_account_order.getOrderOptions(this.request.get['order_id'], product['order_product_id']);

				for (let option of options) {
					let value = '';
					if (option['type'] != 'file') {
						value = option['value'];
					} else {
						const upload_info = await this.model_tool_upload.getUploadByCode(option['value']);

						if (upload_info.upload_id) {
							value = upload_info['name'];
						} else {
							value = '';
						}
					}

					option_data.push({
						'name': option['name'],
						'value': (utf8_strlen(value) > 20 ? utf8_substr(value, 0, 20) + '..' : value)
					});
				}

				const product_info = await this.model_catalog_product.getProduct(product['product_id']);
				let reorder = '';
				if (product_info.product_id) {
					reorder = await this.url.link('account/order/reorder', 'order_id=' + order_id + '&order_product_id=' + product['order_product_id'], true);
				}

				data['products'].push({
					'name': product['name'],
					'model': product['model'],
					'option': option_data,
					'quantity': product['quantity'],
					'price': this.currency.format(product['price'] + (this.config.get('config_tax') ? product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
					'total': this.currency.format(product['total'] + (this.config.get('config_tax') ? (product['tax'] * product['quantity']) : 0), order_info['currency_code'], order_info['currency_value']),
					'reorder': reorder,
					'return': await this.url.link('account/return/add', 'order_id=' + order_info['order_id'] + '&product_id=' + product['product_id'], true)
				});
			}

			// Voucher
			data['vouchers'] = [];

			const vouchers = await this.model_account_order.getOrderVouchers(this.request.get['order_id']);

			for (let voucher of vouchers) {
				data['vouchers'].push({
					'description': voucher['description'],
					'amount': this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value'])
				});
			}

			// Totals
			data['totals'] = [];

			const totals = await this.model_account_order.getOrderTotals(this.request.get['order_id']);

			for (let total of totals) {
				data['totals'].push({
					'title': total['title'],
					'text': this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value']),
				});
			}

			data['comment'] = nl2br(order_info['comment']);

			// History
			data['histories'] = [];

			const results = await this.model_account_order.getOrderHistories(this.request.get['order_id']);

			for (let result of results) {
				data['histories'].push({
					'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
					'status': result['status'],
					'comment': result['notify'] ? nl2br(result['comment']) : ''
				});
			}

			data['continue'] = await this.url.link('account/order', '', true);

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');
			await this.session.save(this.session.data);
			this.response.setOutput(await this.load.view('account/order_info', data));
		} else {
			return new Action('error/not_found');
		}
	}

	async reorder() {
		await this.load.language('account/order');
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		}

		this.load.model('account/order', this);

		const order_info = await this.model_account_order.getOrder(order_id);

		if (order_info.order_id) {
			let order_product_id = 0;
			if ((this.request.get['order_product_id'])) {
				order_product_id = this.request.get['order_product_id'];
			}

			const order_product_info = await this.model_account_order.getOrderProduct(order_id, order_product_id);

			if (order_product_info.product_id) {
				this.load.model('catalog/product', this);

				const product_info = await this.model_catalog_product.getProduct(order_product_info['product_id']);

				if (product_info.product_id) {
					const option_data = {};

					const order_options = await this.model_account_order.getOrderOptions(order_product_info['order_id'], order_product_id);

					for (let order_option of order_options) {
						if (order_option['type'] == 'select' || order_option['type'] == 'radio' || order_option['type'] == 'image') {
							option_data[order_option['product_option_id']] = order_option['product_option_value_id'];
						} else if (order_option['type'] == 'checkbox') {
							(option_data[order_option['product_option_id']] || []).push(order_option['product_option_value_id']);
						} else if (order_option['type'] == 'text' || order_option['type'] == 'textarea' || order_option['type'] == 'date' || order_option['type'] == 'datetime' || order_option['type'] == 'time') {
							option_data[order_option['product_option_id']] = order_option['value'];
						} else if (order_option['type'] == 'file') {
							option_data[order_option['product_option_id']] = order_option['value'];
						}
					}

					await this.cart.add(order_product_info['product_id'], order_product_info['quantity'], option_data);

					this.session.data['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'product_id=' + product_info['product_id']), product_info['name'], await this.url.link('checkout/cart'));

					delete this.session.data['shipping_method'];
					delete this.session.data['shipping_methods'];
					delete this.session.data['payment_method'];
					delete this.session.data['payment_methods'];
				} else {
					this.session.data['error'] = sprintf(this.language.get('error_reorder'), order_product_info['name']);
				}
			}
		}
		await this.session.save(this.session.data);
		this.response.setRedirect(await this.url.link('account/order/info', 'order_id=' + order_id));
	}
}
