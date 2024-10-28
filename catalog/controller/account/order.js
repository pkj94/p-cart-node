const nl2br = require("locutus/php/strings/nl2br");
const sprintf = require("locutus/php/strings/sprintf");
const str_replace = require("locutus/php/strings/str_replace");

module.exports = class Order extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('account/order');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/order', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_account'),
			'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('account/order', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + url)
		});

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let limit = 10

		data['orders'] = [];

		this.load.model('account/order', this);
		this.load.model('localisation/order_status', this);

		const order_total = await this.model_account_order.getTotalOrders();

		const results = await this.model_account_order.getOrders((page - 1) * limit, limit);

		for (let result of results) {
			const order_status_info = await this.model_localisation_order_status.getOrderStatus(result['order_status_id']);

			let order_status = '';
			if (order_status_info.order_status_id) {
				order_status = order_status_info['name'];
			}

			const product_total = await this.model_account_order.getTotalProductsByOrderId(result['order_id']);
			const voucher_total = await this.model_account_order.getTotalVouchersByOrderId(result['order_id']);

			data['orders'].push({
				'order_id': result['order_id'],
				'name': result['firstname'] + ' ' + result['lastname'],
				'status': order_status,
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'products': (product_total + voucher_total),
				'total': this.currency.format(result['total'], result['currency_code'], result['currency_value']),
				'view': await this.url.link('account/order.info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&order_id=' + result['order_id']),
			});
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': order_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('account/order', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (order_total - limit)) ? order_total : (((page - 1) * limit) + limit), order_total, Math.ceil(order_total / limit));

		data['continue'] = await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('account/order_list', data));
	}

	/**
	 * @return object|Action|null
	 */
	async info() {
		const data = {};
		await this.load.language('account/order');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/order', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		}
		this.load.model('account/order', this);

		const order_info = await this.model_account_order.getOrder(order_id);

		if (order_info.order_id) {
			const heading_title = sprintf(this.language.get('text_order'), order_info['order_id']);

			this.document.setTitle(heading_title);

			data['heading_title'] = heading_title;

			let url = '';

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			});

			data['breadcrumbs'].push({
				'text': this.language.get('text_account'),
				'href': await this.url.link('account/account', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'])
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('account/order', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + url)
			});

			data['breadcrumbs'].push({
				'text': heading_title,
				'href': await this.url.link('account/order.info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&order_id=' + order_id + url)
			});

			if (order_info['invoice_no']) {
				data['invoice_no'] = order_info['invoice_prefix'] + order_info['invoice_no'];
			} else {
				data['invoice_no'] = '';
			}

			data['order_id'] = order_id;

			this.load.model('localisation/order_status', this);

			const order_status_info = await this.model_localisation_order_status.getOrderStatus(order_info['order_status_id']);

			if (order_status_info.order_status_id) {
				data['order_status'] = order_status_info['name'];
			} else {
				data['order_status'] = '';
			}

			data['date_added'] = date(this.language.get('date_format_short'), new Date(order_info['date_added']));

			// Payment Address
			let format;
			if (order_info['payment_address_format']) {
				format = order_info['payment_address_format'];
			} else {
				format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
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
				'country': order_info['payment_country']
			};
			find.forEach((item, index) => {
				format = format.replace(new RegExp(item, 'g'), replace[Object.keys(replace)[index]]);
			});
			data['payment_address'] = format;

			data['payment_method'] = order_info['payment_method']['name'];

			// Shipping Address
			if (order_info['shipping_method']) {
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
					'country': order_info['shipping_country']
				};
				find.forEach((item, index) => {
					format = format.replace(new RegExp(item, 'g'), replace[Object.keys(replace)[index]]);
				});
				data['shipping_address'] = format;

				data['shipping_method'] = order_info['shipping_method']['name'];
			} else {
				data['shipping_address'] = '';
				data['shipping_method'] = '';
			}

			this.load.model('account/subscription', this);
			this.load.model('catalog/product', this);
			this.load.model('tool/upload', this);

			// Products
			data['products'] = [];

			let products = await this.model_account_order.getProducts(order_id);

			for (let product of products) {
				let option_data = [];

				const options = await this.model_account_order.getOptions(order_id, product['order_product_id']);

				for (let option of options) {
					let value = '';
					if (option['type'] != 'file') {
						value = option['value'];
					} else {
						upload_info = await this.model_tool_upload.getUploadByCode(option['value']);

						if (upload_info) {
							value = upload_info['name'];
						} else {
							value = '';
						}
					}

					option_data.push({
						'name': option['name'],
						'value': (oc_strlen(value) > 20 ? oc_substr(value, 0, 20) + '++' : value)
					});
				}

				let description = '';

				let subscription_info = await this.model_account_order.getSubscription(order_id, product['order_product_id']);

				if (subscription_info.subscription_plan_id) {
					if (subscription_info['trial_status']) {
						let trial_price = this.currency.format(subscription_info['trial_price'] + (Number(this.config.get('config_tax')) ? subscription_info['trial_tax'] : 0), order_info['currency_code'], order_info['currency_value']);
						let trial_cycle = subscription_info['trial_cycle'];
						let trial_frequency = this.language.get('text_' + subscription_info['trial_frequency']);
						let trial_duration = subscription_info['trial_duration'];

						description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
					}

					let price = this.currency.format(subscription_info['price'] + (Number(this.config.get('config_tax')) ? subscription_info['tax'] : 0), order_info['currency_code'], order_info['currency_value']);
					let cycle = subscription_info['cycle'];
					let frequency = this.language.get('text_' + subscription_info['frequency']);
					let duration = subscription_info['duration'];

					if (subscription_info['duration']) {
						description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
					} else {
						description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
					}
				}

				subscription_info = await this.model_account_subscription.getSubscriptionByOrderProductId(order_id, product['order_product_id']);
				let subscription = '';
				if (subscription_info.subscription_id) {
					subscription = await this.url.link('account/subscription+info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&subscription_id=' + subscription_info['subscription_id']);
				}

				const product_info = await this.model_catalog_product.getProduct(product['product_id']);
				let reorder = '';
				if (product_info.product_id) {
					reorder = await this.url.link('account/order+reorder', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&order_id=' + order_id + '&order_product_id=' + product['order_product_id']);
				}

				data['products'].push({
					'name': product['name'],
					'model': product['model'],
					'option': option_data,
					'subscription': subscription,
					'subscription_description': description,
					'quantity': product['quantity'],
					'price': this.currency.format(product['price'] + (Number(this.config.get('config_tax')) ? product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
					'total': this.currency.format(product['total'] + (Number(this.config.get('config_tax')) ? (product['tax'] * product['quantity']) : 0), order_info['currency_code'], order_info['currency_value']),
					'href': await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product['product_id']),
					'reorder': reorder,
					'return': await this.url.link('account/returns.add', 'language=' + this.config.get('config_language') + '&order_id=' + order_info['order_id'] + '&product_id=' + product['product_id'])
				});
			}

			// Voucher
			data['vouchers'] = [];

			const vouchers = await this.model_account_order.getVouchers(order_id);

			for (let voucher of vouchers) {
				data['vouchers'].push({
					'description': voucher['description'],
					'amount': this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value'])
				});
			}

			// Totals
			data['totals'] = [];

			const totals = await this.model_account_order.getTotals(order_id);

			for (let total of totals) {
				data['totals'].push({
					'title': total['title'],
					'text': this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value']),
				});
			}

			data['comment'] = nl2br(order_info['comment']);

			// History
			data['history'] = await this.getHistory(order_info['order_id']);

			data['continue'] = await this.url.link('account/order', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token']);

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('account/order_info', data));
		} else {
			return new global['\Opencart\System\Engine\Action']('error/not_found');
		}
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('account/order');

		this.response.setOutput(await this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		const data = {};
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'account/order.history') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('account/order', this);

		const results = await this.model_account_order.getHistories(order_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'status': result['status'],
				'comment': nl2br(result['comment']),
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		const order_total = await this.model_account_order.getTotalHistories(order_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': order_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('account/order.history', 'customer_token=' + this.session.data['customer_token'] + '&order_id=' + order_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (order_total - limit)) ? order_total : (((page - 1) * limit) + limit), order_total, Math.ceil(order_total / limit));

		return await this.load.view('account/order_history', data);
	}

	/**
	 * @return void
	 */
	async reorder() {
		await this.load.language('account/order');

		if (!await this.customer.isLogged() || (!(this.request.get['customer_token']) || !(this.session.data['customer_token']) || (this.request.get['customer_token'] != this.session.data['customer_token']))) {
			this.session.data['redirect'] = await this.url.link('account/order', 'language=' + this.config.get('config_language'));

			this.response.setRedirect(await this.url.link('account/login', 'language=' + this.config.get('config_language')));
		}
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		} else {
			order_id = 0;
		}

		this.load.model('account/order', this);

		const order_info = await this.model_account_order.getOrder(order_id);

		if (order_info.order_id) {
			let order_product_id = 0;
			if ((this.request.get['order_product_id'])) {
				order_product_id = this.request.get['order_product_id'];
			}

			const order_product_info = await this.model_account_order.getProduct(order_id, order_product_id);

			if (order_product_info.order_product_id) {
				this.load.model('catalog/product', this);

				const product_info = await this.model_catalog_product.getProduct(order_product_info['product_id']);

				if (product_info.product_id) {
					let option_data = {};

					const order_options = await this.model_account_order.getOptions(order_product_info['order_id'], order_product_id);

					for (let order_option of order_options) {
						if (order_option['type'] == 'select' || order_option['type'] == 'radio' || order_option['type'] == 'image') {
							option_data[order_option['product_option_id']] = order_option['product_option_value_id'];
						} else if (order_option['type'] == 'checkbox') {
							option_data[order_option['product_option_id']] = option_data[order_option['product_option_id']] || [];
							option_data[order_option['product_option_id']].push(order_option['product_option_value_id']);
						} else if (order_option['type'] == 'text' || order_option['type'] == 'textarea' || order_option['type'] == 'date' || order_option['type'] == 'datetime' || order_option['type'] == 'time') {
							option_data[order_option['product_option_id']] = order_option['value'];
						} else if (order_option['type'] == 'file') {
							option_data[order_option['product_option_id']] = order_option['value'];
						}
					}

					const subscription_info = await this.model_account_order.getSubscription(order_product_info['order_id'], order_product_id);
					let subscription_id = 0;
					if (subscription_info.subscription_id) {
						subscription_id = subscription_info['subscription_id'];
					}

					await this.cart.add(order_product_info['product_id'], order_product_info['quantity'], option_data, subscription_id);

					this.session.data['success'] = sprintf(this.language.get('text_success'), await this.url.link('product/product', 'language=' + this.config.get('config_language') + '&product_id=' + product_info['product_id']), product_info['name'], await this.url.link('checkout/cart', 'language=' + this.config.get('config_language')));

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
		this.response.setRedirect(await this.url.link('account/order.info', 'language=' + this.config.get('config_language') + '&customer_token=' + this.session.data['customer_token'] + '&order_id=' + order_id));
	}
}
