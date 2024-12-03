const nl2br = require("locutus/php/strings/nl2br");
const rtrim = require("locutus/php/strings/rtrim");

module.exports = class ControllerSaleOrder extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('sale/order');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/order', this);

		await this.getList();
	}

	async add() {
		await this.load.language('sale/order');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/order', this);

		await this.getForm();
	}

	async edit() {
		await this.load.language('sale/order');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/order', this);

		await this.getForm();
	}

	async delete() {
		await this.load.language('sale/order');

		this.document.setTitle(this.language.get('heading_title'));

		this.session.data['success'] = this.language.get('text_success');
		await this.session.save(this.session.data);

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

		this.response.setRedirect(await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url, true));
	}

	async getList() {
		const data = {};
		let filter_order_id = '';
		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		}
		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_order_status = '';
		if ((this.request.get['filter_order_status'])) {
			filter_order_status = this.request.get['filter_order_status'];
		}
		let filter_order_status_id = '';
		if ((this.request.get['filter_order_status_id'])) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		}
		let filter_total = '';
		if ((this.request.get['filter_total'])) {
			filter_total = this.request.get['filter_total'];
		}
		let filter_date_added = '';
		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		}
		let filter_date_modified = '';
		if ((this.request.get['filter_date_modified'])) {
			filter_date_modified = this.request.get['filter_date_modified'];
		}
		let sort = 'o.order_id';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'DESC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['invoice'] = await this.url.link('sale/order/invoice', 'user_token=' + this.session.data['user_token'], true);
		data['shipping'] = await this.url.link('sale/order/shipping', 'user_token=' + this.session.data['user_token'], true);
		data['add'] = await this.url.link('sale/order/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = str_replace('&amp;', '&', await this.url.link('sale/order/delete', 'user_token=' + this.session.data['user_token'] + url, true));

		data['orders'] = [];

		const filter_data = {
			'filter_order_id': filter_order_id,
			'filter_customer': filter_customer,
			'filter_order_status': filter_order_status,
			'filter_order_status_id': filter_order_status_id,
			'filter_total': filter_total,
			'filter_date_added': filter_date_added,
			'filter_date_modified': filter_date_modified,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const order_total = await this.model_sale_order.getTotalOrders(filter_data);

		const results = await this.model_sale_order.getOrders(filter_data);

		for (let result of results) {
			data['orders'].push({
				'order_id': result['order_id'],
				'customer': result['customer'],
				'order_status': result['order_status'] ? result['order_status'] : this.language.get('text_missing'),
				'total': this.currency.format(result['total'], result['currency_code'], result['currency_value']),
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified': date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'shipping_code': result['shipping_code'],
				'view': await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'] + url, true),
				'edit': await this.url.link('sale/order/edit', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'] + url, true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_order'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&sort=o.order_id' + url, true);
		data['sort_customer'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url, true);
		data['sort_status'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&sort=order_status' + url, true);
		data['sort_total'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&sort=o.total' + url, true);
		data['sort_date_added'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&sort=o.date_added' + url, true);
		data['sort_date_modified'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&sort=o.date_modified' + url, true);

		url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = order_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (order_total - Number(this.config.get('config_limit_admin')))) ? order_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), order_total, Math.ceil(order_total / Number(this.config.get('config_limit_admin'))));

		data['filter_order_id'] = filter_order_id;
		data['filter_customer'] = filter_customer;
		data['filter_order_status'] = filter_order_status;
		data['filter_order_status_id'] = filter_order_status_id;
		data['filter_total'] = filter_total;
		data['filter_date_added'] = filter_date_added;
		data['filter_date_modified'] = filter_date_modified;

		data['sort'] = sort;
		data['order'] = order;

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		// API login
		data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

		// API login
		this.load.model('user/api', this);

		const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

		if (api_info.api_id && await this.user.hasPermission('modify', 'sale/order')) {
			const session = new Session(this.request.server.session);
			console.log(session)
			await session.start();

			await this.model_user_api.deleteApiSessionBySessionId(session.getId());

			await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

			session.data['api_id'] = api_info['api_id'];
			await session.save(session.data);
			data['api_token'] = session.getId();
		} else {
			data['api_token'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/order_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['order_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_order_status'])) {
			url += '&filter_order_status=' + this.request.get['filter_order_status'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		if ((this.request.get['filter_total'])) {
			url += '&filter_total=' + this.request.get['filter_total'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['cancel'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url, true);

		data['user_token'] = this.session.data['user_token'];
		let order_info;
		if ((this.request.get['order_id'])) {
			order_info = await this.model_sale_order.getOrder(this.request.get['order_id']);
		}

		if ((order_info)) {
			data['order_id'] = this.request.get['order_id'];
			data['store_id'] = order_info['store_id'];
			data['store_url'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

			data['customer'] = order_info['customer'];
			data['customer_id'] = order_info['customer_id'];
			data['customer_group_id'] = order_info['customer_group_id'];
			data['firstname'] = order_info['firstname'];
			data['lastname'] = order_info['lastname'];
			data['email'] = order_info['email'];
			data['telephone'] = order_info['telephone'];
			data['account_custom_field'] = order_info['custom_field'];

			this.load.model('customer/customer', this);

			data['addresses'] = await this.model_customer_customer.getAddresses(order_info['customer_id']);

			data['payment_firstname'] = order_info['payment_firstname'];
			data['payment_lastname'] = order_info['payment_lastname'];
			data['payment_company'] = order_info['payment_company'];
			data['payment_address_1'] = order_info['payment_address_1'];
			data['payment_address_2'] = order_info['payment_address_2'];
			data['payment_city'] = order_info['payment_city'];
			data['payment_postcode'] = order_info['payment_postcode'];
			data['payment_country_id'] = order_info['payment_country_id'];
			data['payment_zone_id'] = order_info['payment_zone_id'];
			data['payment_custom_field'] = order_info['payment_custom_field'];
			data['payment_method'] = order_info['payment_method'];
			data['payment_code'] = order_info['payment_code'];

			data['shipping_firstname'] = order_info['shipping_firstname'];
			data['shipping_lastname'] = order_info['shipping_lastname'];
			data['shipping_company'] = order_info['shipping_company'];
			data['shipping_address_1'] = order_info['shipping_address_1'];
			data['shipping_address_2'] = order_info['shipping_address_2'];
			data['shipping_city'] = order_info['shipping_city'];
			data['shipping_postcode'] = order_info['shipping_postcode'];
			data['shipping_country_id'] = order_info['shipping_country_id'];
			data['shipping_zone_id'] = order_info['shipping_zone_id'];
			data['shipping_custom_field'] = order_info['shipping_custom_field'];
			data['shipping_method'] = order_info['shipping_method'];
			data['shipping_code'] = order_info['shipping_code'];

			// Products
			data['order_products'] = [];

			const products = await this.model_sale_order.getOrderProducts(this.request.get['order_id']);

			for (let product of products) {
				data['order_products'].push({
					'product_id': product['product_id'],
					'name': product['name'],
					'model': product['model'],
					'option': await this.model_sale_order.getOrderOptions(this.request.get['order_id'], product['order_product_id']),
					'quantity': product['quantity'],
					'price': product['price'],
					'total': product['total'],
					'reward': product['reward']
				});
			}

			// Vouchers
			data['order_vouchers'] = await this.model_sale_order.getOrderVouchers(this.request.get['order_id']);

			data['coupon'] = '';
			data['voucher'] = '';
			data['reward'] = '';

			data['order_totals'] = {};

			const order_totals = await this.model_sale_order.getOrderTotals(this.request.get['order_id']);

			for (let order_total of order_totals) {
				// If coupon, voucher or reward points
				let start = order_total['title'].indexOf('(') + 1;
				let end = order_total['title'].indexOf(')');

				if (start && end) {
					data[order_total['code']] = order_total['title'].substr(start, end - start);
				}
			}

			data['order_status_id'] = order_info['order_status_id'];
			data['comment'] = order_info['comment'];
			data['affiliate_id'] = order_info['affiliate_id'];
			data['affiliate'] = order_info['affiliate_firstname'] + ' ' + order_info['affiliate_lastname'];
			data['currency_code'] = order_info['currency_code'];
		} else {
			data['order_id'] = 0;
			data['store_id'] = 0;
			data['store_url'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

			data['customer'] = '';
			data['customer_id'] = '';
			data['customer_group_id'] = this.config.get('config_customer_group_id');
			data['firstname'] = '';
			data['lastname'] = '';
			data['email'] = '';
			data['telephone'] = '';
			data['customer_custom_field'] = [];

			data['addresses'] = [];

			data['payment_firstname'] = '';
			data['payment_lastname'] = '';
			data['payment_company'] = '';
			data['payment_address_1'] = '';
			data['payment_address_2'] = '';
			data['payment_city'] = '';
			data['payment_postcode'] = '';
			data['payment_country_id'] = '';
			data['payment_zone_id'] = '';
			data['payment_custom_field'] = [];
			data['payment_method'] = '';
			data['payment_code'] = '';

			data['shipping_firstname'] = '';
			data['shipping_lastname'] = '';
			data['shipping_company'] = '';
			data['shipping_address_1'] = '';
			data['shipping_address_2'] = '';
			data['shipping_city'] = '';
			data['shipping_postcode'] = '';
			data['shipping_country_id'] = '';
			data['shipping_zone_id'] = '';
			data['shipping_custom_field'] = [];
			data['shipping_method'] = '';
			data['shipping_code'] = '';

			data['order_products'] = [];
			data['order_vouchers'] = [];
			data['order_totals'] = [];

			data['order_status_id'] = this.config.get('config_order_status_id');
			data['comment'] = '';
			data['affiliate_id'] = '';
			data['affiliate'] = '';
			data['currency_code'] = this.config.get('config_currency');

			data['coupon'] = '';
			data['voucher'] = '';
			data['reward'] = '';
		}

		// Stores
		this.load.model('setting/store', this);

		data['stores'] = [];

		data['stores'].push({
			'store_id': 0,
			'name': this.language.get('text_default')
		});

		const results = await this.model_setting_store.getStores();

		for (let result of results) {
			data['stores'].push({
				'store_id': result['store_id'],
				'name': result['name']
			});
		}

		// Customer Groups
		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		// Custom Fields
		this.load.model('customer/custom_field', this);
		this.load.model('tool/upload', this);

		data['custom_fields'] = [];

		let custom_field_locations = [
			'account_custom_field',
			'payment_custom_field',
			'shipping_custom_field'
		];

		const filter_data = {
			'sort': 'cf.sort_order',
			'order': 'ASC'
		};

		const custom_fields = await this.model_customer_custom_field.getCustomFields(filter_data);

		for (let custom_field of custom_fields) {
			data['custom_fields'].push({
				'custom_field_id': custom_field['custom_field_id'],
				'custom_field_value': await this.model_customer_custom_field.getCustomFieldValues(custom_field['custom_field_id']),
				'name': custom_field['name'],
				'value': custom_field['value'],
				'type': custom_field['type'],
				'location': custom_field['location'],
				'sort_order': custom_field['sort_order']
			});

			if (custom_field['type'] == 'file') {
				for (let location of custom_field_locations) {
					if ((data[location][custom_field['custom_field_id']])) {
						let code = data[location][custom_field['custom_field_id']];

						const upload_result = await this.model_tool_upload.getUploadByCode(code);

						data[location][custom_field['custom_field_id']] = {};
						if (upload_result.upload_id) {
							data[location][custom_field['custom_field_id']]['name'] = upload_result['name'];
							data[location][custom_field['custom_field_id']]['code'] = upload_result['code'];
						} else {
							data[location][custom_field['custom_field_id']]['name'] = "";
							data[location][custom_field['custom_field_id']]['code'] = code;
						}
					}
				}
			}
		}

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		this.load.model('localisation/currency', this);

		data['currencies'] = await this.model_localisation_currency.getCurrencies();

		data['voucher_min'] = this.config.get('config_voucher_min');

		this.load.model('sale/voucher_theme', this);

		data['voucher_themes'] = await this.model_sale_voucher_theme.getVoucherThemes();

		// API login
		data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

		// API login
		this.load.model('user/api', this);

		const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

		if (api_info && await this.user.hasPermission('modify', 'sale/order')) {
			const session = new Session(this.request.server.session);

			await session.start();

			await this.model_user_api.deleteApiSessionBySessionId(session.getId());

			await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

			session.data['api_id'] = api_info['api_id'];

			data['api_token'] = session.getId();
			await session.save(session.data);
		} else {
			data['api_token'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/order_form', data));
	}

	async info() {
		const data = {};
		this.load.model('sale/order', this);
		let order_id = 0;
		if ((this.request.get['order_id'])) {
			order_id = this.request.get['order_id'];
		}

		const order_info = await this.model_sale_order.getOrder(order_id);

		if (order_info.order_id) {
			await this.load.language('sale/order');

			this.document.setTitle(this.language.get('heading_title'));

			data['text_ip_add'] = sprintf(this.language.get('text_ip_add'), this.request.server['REMOTE_ADDR']);
			data['text_order'] = sprintf(this.language.get('text_order'), this.request.get['order_id']);

			let url = '';

			if ((this.request.get['filter_order_id'])) {
				url += '&filter_order_id=' + this.request.get['filter_order_id'];
			}

			if ((this.request.get['filter_customer'])) {
				url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
			}

			if ((this.request.get['filter_order_status'])) {
				url += '&filter_order_status=' + this.request.get['filter_order_status'];
			}

			if ((this.request.get['filter_order_status_id'])) {
				url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
			}

			if ((this.request.get['filter_total'])) {
				url += '&filter_total=' + this.request.get['filter_total'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['filter_date_modified'])) {
				url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text': this.language.get('text_home'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
			});

			data['breadcrumbs'].push({
				'text': this.language.get('heading_title'),
				'href': await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url, true)
			});

			data['shipping'] = await this.url.link('sale/order/shipping', 'user_token=' + this.session.data['user_token'] + '&order_id=' + this.request.get['order_id'], true);
			data['invoice'] = await this.url.link('sale/order/invoice', 'user_token=' + this.session.data['user_token'] + '&order_id=' + this.request.get['order_id'], true);
			data['edit'] = await this.url.link('sale/order/edit', 'user_token=' + this.session.data['user_token'] + '&order_id=' + this.request.get['order_id'], true);
			data['cancel'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + url, true);

			data['user_token'] = this.session.data['user_token'];

			data['order_id'] = this.request.get['order_id'];

			data['store_id'] = order_info['store_id'];
			data['store_name'] = order_info['store_name'];

			if (order_info['store_id'] == 0) {
				data['store_url'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;
			} else {
				data['store_url'] = order_info['store_url'];
			}

			if (order_info['invoice_no']) {
				data['invoice_no'] = order_info['invoice_prefix'] + order_info['invoice_no'];
			} else {
				data['invoice_no'] = '';
			}

			data['date_added'] = date(this.language.get('date_format_short'), new Date(order_info['date_added']));

			data['firstname'] = order_info['firstname'];
			data['lastname'] = order_info['lastname'];

			if (order_info['customer_id']) {
				data['customer'] = await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + order_info['customer_id'], true);
			} else {
				data['customer'] = '';
			}

			this.load.model('customer/customer_group', this);

			const customer_group_info = await this.model_customer_customer_group.getCustomerGroup(order_info['customer_group_id']);

			if (customer_group_info.customer_group_id) {
				data['customer_group'] = customer_group_info['name'];
			} else {
				data['customer_group'] = '';
			}

			data['email'] = order_info['email'];
			data['telephone'] = order_info['telephone'];

			data['shipping_method'] = order_info['shipping_method'];
			data['payment_method'] = order_info['payment_method'];

			// Payment Address
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
				'country': order_info['payment_country']
			};
			for (let [key, value] of Object.entries(replace)) {
				format = format.replace('{' + key + '}', value);
			}
			format = format.replaceAll('\r\n"', '<br />').replaceAll('\r"', '<br />').replaceAll('\n"', '<br />').replace(new RegExp("/\s\s+/"), '<br />').replace(new RegExp("/\r\r+/"), '<br />').replace(new RegExp("/\n\n+/"), '<br />')
			data['payment_address'] = format;

			// Shipping Address
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
			for (let [key, value] of Object.entries(replace)) {
				format = format.replace('{' + key + '}', value);
			}
			format = format.replaceAll('\r\n"', '<br />').replaceAll('\r"', '<br />').replaceAll('\n"', '<br />').replace(new RegExp("/\s\s+/"), '<br />').replace(new RegExp("/\r\r+/"), '<br />').replace(new RegExp("/\n\n+/"), '<br />')
			data['shipping_address'] = format;


			// Uploaded files
			this.load.model('tool/upload', this);

			data['products'] = [];

			const products = await this.model_sale_order.getOrderProducts(this.request.get['order_id']);

			for (let product of products) {
				let option_data = [];

				const options = await this.model_sale_order.getOrderOptions(this.request.get['order_id'], product['order_product_id']);

				for (let option of options) {
					if (option['type'] != 'file') {
						option_data.push({
							'name': option['name'],
							'value': option['value'],
							'type': option['type']
						});
					} else {
						const upload_info = await this.model_tool_upload.getUploadByCode(option['value']);

						if (upload_info.upload_id) {
							option_data.push({
								'name': option['name'],
								'value': upload_info['name'],
								'type': option['type'],
								'href': await this.url.link('tool/upload/download', 'user_token=' + this.session.data['user_token'] + '&code=' + upload_info['code'], true)
							});
						}
					}
				}

				data['products'].push({
					'order_product_id': product['order_product_id'],
					'product_id': product['product_id'],
					'name': product['name'],
					'model': product['model'],
					'option': option_data,
					'quantity': product['quantity'],
					'price': this.currency.format(product['price'] + (this.config.get('config_tax') ? product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
					'total': this.currency.format(product['total'] + (this.config.get('config_tax') ? (product['tax'] * product['quantity']) : 0), order_info['currency_code'], order_info['currency_value']),
					'href': await this.url.link('catalog/product/edit', 'user_token=' + this.session.data['user_token'] + '&product_id=' + product['product_id'], true)
				});
			}

			data['vouchers'] = [];

			const vouchers = await this.model_sale_order.getOrderVouchers(this.request.get['order_id']);

			for (let voucher of vouchers) {
				data['vouchers'].push({
					'description': voucher['description'],
					'amount': this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value']),
					'href': await this.url.link('sale/voucher/edit', 'user_token=' + this.session.data['user_token'] + '&voucher_id=' + voucher['voucher_id'], true)
				});
			}

			data['totals'] = [];

			const totals = await this.model_sale_order.getOrderTotals(this.request.get['order_id']);

			for (let total of totals) {
				data['totals'].push({
					'title': total['title'],
					'text': this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value'])
				});
			}

			data['comment'] = nl2br(order_info['comment']);

			this.load.model('customer/customer', this);

			data['reward'] = order_info['reward'];

			data['reward_total'] = await this.model_customer_customer.getTotalCustomerRewardsByOrderId(this.request.get['order_id']);

			data['affiliate_firstname'] = order_info['affiliate_firstname'];
			data['affiliate_lastname'] = order_info['affiliate_lastname'];

			if (order_info['affiliate_id']) {
				data['affiliate'] = await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + order_info['affiliate_id'], true);
			} else {
				data['affiliate'] = '';
			}

			data['commission'] = this.currency.format(order_info['commission'], order_info['currency_code'], order_info['currency_value']);

			data['commission_total'] = await this.model_customer_customer.getTotalTransactionsByOrderId(this.request.get['order_id']);

			this.load.model('localisation/order_status', this);

			const order_status_info = await this.model_localisation_order_status.getOrderStatus(order_info['order_status_id']);

			if (order_status_info.order_status_id) {
				data['order_status'] = order_status_info['name'];
			} else {
				data['order_status'] = '';
			}

			data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

			data['order_status_id'] = order_info['order_status_id'];

			data['account_custom_field'] = order_info['custom_field'];

			// Custom Fields
			this.load.model('customer/custom_field', this);

			data['account_custom_fields'] = [];

			const filter_data = {
				'sort': 'cf.sort_order',
				'order': 'ASC'
			};

			const custom_fields = await this.model_customer_custom_field.getCustomFields(filter_data);

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'account' && (order_info['custom_field'][custom_field['custom_field_id']])) {
					if (custom_field['type'] == 'select' || custom_field['type'] == 'radio') {
						const custom_field_value_info = await this.model_customer_custom_field.getCustomFieldValue(order_info['custom_field'][custom_field['custom_field_id']]);

						if (custom_field_value_info.custom_field_value_id) {
							data['account_custom_fields'].push({
								'name': custom_field['name'],
								'value': custom_field_value_info['name']
							});
						}
					}

					if (custom_field['type'] == 'checkbox' && Array.isArray(order_info['custom_field'][custom_field['custom_field_id']])) {
						for (let custom_field_value_id of order_info['custom_field'][custom_field['custom_field_id']]) {
							const custom_field_value_info = await this.model_customer_custom_field.getCustomFieldValue(custom_field_value_id);

							if (custom_field_value_info.custom_field_value_id) {
								data['account_custom_fields'].push({
									'name': custom_field['name'],
									'value': custom_field_value_info['name']
								});
							}
						}
					}

					if (custom_field['type'] == 'text' || custom_field['type'] == 'textarea' || custom_field['type'] == 'file' || custom_field['type'] == 'date' || custom_field['type'] == 'datetime' || custom_field['type'] == 'time') {
						data['account_custom_fields'].push({
							'name': custom_field['name'],
							'value': order_info['custom_field'][custom_field['custom_field_id']]
						});
					}

					if (custom_field['type'] == 'file') {
						const upload_info = await this.model_tool_upload.getUploadByCode(order_info['custom_field'][custom_field['custom_field_id']]);

						if (upload_info.upload_id) {
							data['account_custom_fields'].push({
								'name': custom_field['name'],
								'value': upload_info['name']
							});
						}
					}
				}
			}

			// Custom fields
			data['payment_custom_fields'] = [];

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'address' && (order_info['payment_custom_field'][custom_field['custom_field_id']])) {
					if (custom_field['type'] == 'select' || custom_field['type'] == 'radio') {
						const custom_field_value_info = await this.model_customer_custom_field.getCustomFieldValue(order_info['payment_custom_field'][custom_field['custom_field_id']]);

						if (custom_field_value_info.custom_field_value_id) {
							data['payment_custom_fields'].push({
								'name': custom_field['name'],
								'value': custom_field_value_info['name'],
								'sort_order': custom_field['sort_order']
							});
						}
					}

					if (custom_field['type'] == 'checkbox' && Array.isArray(order_info['payment_custom_field'][custom_field['custom_field_id']])) {
						for (let custom_field_value_id of order_info['payment_custom_field'][custom_field['custom_field_id']]) {
							const custom_field_value_info = await this.model_customer_custom_field.getCustomFieldValue(custom_field_value_id);

							if (custom_field_value_info.custom_field_value_id) {
								data['payment_custom_fields'].push({
									'name': custom_field['name'],
									'value': custom_field_value_info['name'],
									'sort_order': custom_field['sort_order']
								});
							}
						}
					}

					if (custom_field['type'] == 'text' || custom_field['type'] == 'textarea' || custom_field['type'] == 'file' || custom_field['type'] == 'date' || custom_field['type'] == 'datetime' || custom_field['type'] == 'time') {
						data['payment_custom_fields'].push({
							'name': custom_field['name'],
							'value': order_info['payment_custom_field'][custom_field['custom_field_id']],
							'sort_order': custom_field['sort_order']
						});
					}

					if (custom_field['type'] == 'file') {
						const upload_info = await this.model_tool_upload.getUploadByCode(order_info['payment_custom_field'][custom_field['custom_field_id']]);

						if (upload_info.upload_id) {
							data['payment_custom_fields'].push({
								'name': custom_field['name'],
								'value': upload_info['name'],
								'sort_order': custom_field['sort_order']
							});
						}
					}
				}
			}

			// Shipping
			data['shipping_custom_fields'] = [];

			for (let custom_field of custom_fields) {
				if (custom_field['location'] == 'address' && (order_info['shipping_custom_field'][custom_field['custom_field_id']])) {
					if (custom_field['type'] == 'select' || custom_field['type'] == 'radio') {
						const custom_field_value_info = await this.model_customer_custom_field.getCustomFieldValue(order_info['shipping_custom_field'][custom_field['custom_field_id']]);

						if (custom_field_value_info.custom_field_value_id) {
							data['shipping_custom_fields'].push({
								'name': custom_field['name'],
								'value': custom_field_value_info['name'],
								'sort_order': custom_field['sort_order']
							});
						}
					}

					if (custom_field['type'] == 'checkbox' && Array.isArray(order_info['shipping_custom_field'][custom_field['custom_field_id']])) {
						for (let custom_field_value_id of order_info['shipping_custom_field'][custom_field['custom_field_id']]) {
							const custom_field_value_info = await this.model_customer_custom_field.getCustomFieldValue(custom_field_value_id);

							if (custom_field_value_info.custom_field_value_id) {
								data['shipping_custom_fields'].push({
									'name': custom_field['name'],
									'value': custom_field_value_info['name'],
									'sort_order': custom_field['sort_order']
								});
							}
						}
					}

					if (custom_field['type'] == 'text' || custom_field['type'] == 'textarea' || custom_field['type'] == 'file' || custom_field['type'] == 'date' || custom_field['type'] == 'datetime' || custom_field['type'] == 'time') {
						data['shipping_custom_fields'].push({
							'name': custom_field['name'],
							'value': order_info['shipping_custom_field'][custom_field['custom_field_id']],
							'sort_order': custom_field['sort_order']
						});
					}

					if (custom_field['type'] == 'file') {
						const upload_info = await this.model_tool_upload.getUploadByCode(order_info['shipping_custom_field'][custom_field['custom_field_id']]);

						if (upload_info.upload_id) {
							data['shipping_custom_fields'].push({
								'name': custom_field['name'],
								'value': upload_info['name'],
								'sort_order': custom_field['sort_order']
							});
						}
					}
				}
			}

			data['ip'] = order_info['ip'];
			data['forwarded_ip'] = order_info['forwarded_ip'];
			data['user_agent'] = order_info['user_agent'];
			data['accept_language'] = order_info['accept_language'];

			// Additional Tabs
			data['tabs'] = [];

			if (await this.user.hasPermission('access', 'extension/payment/' + order_info['payment_code'])) {
				let content = '';
				if (is_file(DIR_CATALOG + 'controller/extension/payment/' + order_info['payment_code'] + '.js')) {
					content = await this.load.controller('extension/payment/' + order_info['payment_code'] + '/order');
				}

				if (content) {
					await this.load.language('extension/payment/' + order_info['payment_code']);

					data['tabs'].push({
						'code': order_info['payment_code'],
						'title': this.language.get('heading_title'),
						'content': content
					});
				}
			}

			this.load.model('setting/extension', this);

			const extensions = await this.model_setting_extension.getInstalled('fraud');

			for (let extension of extensions) {
				if (Number(this.config.get('fraud_' + extension + '_status'))) {
					await this.load.language('extension/fraud/' + extension, 'extension');

					let content = await this.load.controller('extension/fraud/' + extension + '/order');

					if (content) {
						data['tabs'].push({
							'code': extension,
							'title': this.language.get('extension').get('heading_title'),
							'content': content
						});
					}
				}
			}

			// The URL we send API requests to
			data['catalog'] = this.request.server['HTTPS'] ? HTTPS_CATALOG : HTTP_CATALOG;

			// API login
			this.load.model('user/api', this);

			const api_info = await this.model_user_api.getApi(this.config.get('config_api_id'));

			if (api_info.api_id && await this.user.hasPermission('modify', 'sale/order')) {
				const session = new Session(this.request.server.session);

				await session.start();

				await this.model_user_api.deleteApiSessionBySessionId(session.getId());

				await this.model_user_api.addApiSession(api_info['api_id'], session.getId(), this.request.server['REMOTE_ADDR']);

				session.data['api_id'] = api_info['api_id'];

				data['api_token'] = session.getId();
				await session.save(session.data);
			} else {
				data['api_token'] = '';
			}

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('sale/order_info', data));
		} else {
			return new Action('error/not_found');
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'sale/order')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async createInvoiceNo() {
		await this.load.language('sale/order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		} else if ((this.request.get['order_id'])) {
			let order_id = 0;
			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			}

			this.load.model('sale/order', this);

			const invoice_no = await this.model_sale_order.createInvoiceNo(order_id);

			if (invoice_no) {
				json['invoice_no'] = invoice_no;
			} else {
				json['error'] = this.language.get('error_action');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async addReward() {
		await this.load.language('sale/order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		} else {
			let order_id = 0;
			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			}

			this.load.model('sale/order', this);

			const order_info = await this.model_sale_order.getOrder(order_id);

			if (order_info && order_info['customer_id'] && (order_info['reward'] > 0)) {
				this.load.model('customer/customer', this);

				const reward_total = await this.model_customer_customer.getTotalCustomerRewardsByOrderId(order_id);

				if (!reward_total) {
					await this.model_customer_customer.addReward(order_info['customer_id'], this.language.get('text_order_id') + ' #' + order_id, order_info['reward'], order_id);
				}
			}

			json['success'] = this.language.get('text_reward_added');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async removeReward() {
		await this.load.language('sale/order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		} else {
			let order_id = 0;
			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			}

			this.load.model('sale/order', this);

			const order_info = await this.model_sale_order.getOrder(order_id);

			if (order_info.order_id) {
				this.load.model('customer/customer', this);

				await this.model_customer_customer.deleteReward(order_id);
			}

			json['success'] = this.language.get('text_reward_removed');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async addCommission() {
		await this.load.language('sale/order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		} else {
			let order_id = 0;
			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			}

			this.load.model('sale/order', this);

			const order_info = await this.model_sale_order.getOrder(order_id);

			if (order_info.order_id) {
				this.load.model('customer/customer', this);

				const affiliate_total = await this.model_customer_customer.getTotalTransactionsByOrderId(order_id);

				if (!affiliate_total) {
					await this.model_customer_customer.addTransaction(order_info['affiliate_id'], this.language.get('text_order_id') + ' #' + order_id, order_info['commission'], order_id);
				}
			}

			json['success'] = this.language.get('text_commission_added');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async removeCommission() {
		await this.load.language('sale/order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/order')) {
			json['error'] = this.language.get('error_permission');
		} else {
			let order_id = 0;
			if ((this.request.get['order_id'])) {
				order_id = this.request.get['order_id'];
			}

			this.load.model('sale/order', this);

			const order_info = await this.model_sale_order.getOrder(order_id);

			if (order_info.order_id) {
				this.load.model('customer/customer', this);

				await this.model_customer_customer.deleteTransactionByOrderId(order_id);
			}

			json['success'] = this.language.get('text_commission_removed');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async history() {
		const data = {};
		await this.load.language('sale/order');
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['histories'] = [];

		this.load.model('sale/order', this);

		const results = await this.model_sale_order.getOrderHistories(this.request.get['order_id'], (page - 1) * 10, 10);

		for (let result of results) {
			data['histories'].push({
				'notify': result['notify'] ? this.language.get('text_yes') : this.language.get('text_no'),
				'status': result['status'],
				'comment': nl2br(result['comment']),
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added']))
			});
		}

		const history_total = await this.model_sale_order.getTotalOrderHistories(this.request.get['order_id']);

		const pagination = new Pagination();
		pagination.total = history_total;
		pagination.page = page;
		pagination.limit = 10;
		pagination.url = await this.url.link('sale/order/history', 'user_token=' + this.session.data['user_token'] + '&order_id=' + this.request.get['order_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * 10) + 1 : 0, (((page - 1) * 10) > (history_total - 10)) ? history_total : (((page - 1) * 10) + 10), history_total, Math.ceil(history_total / 10));

		this.response.setOutput(await this.load.view('sale/order_history', data));
	}

	async invoice() {
		const data = {};
		await this.load.language('sale/order');

		data['title'] = this.language.get('text_invoice');

		if (this.request.server['HTTPS']) {
			data['base'] = HTTPS_SERVER;
		} else {
			data['base'] = HTTP_SERVER;
		}

		data['direction'] = this.language.get('direction');

		data['lang'] = this.language.get('code');

		this.load.model('sale/order', this);

		this.load.model('setting/setting', this);

		data['orders'] = [];

		let orders = [];

		if ((this.request.post['selected'])) {
			orders = this.request.post['selected'];
		} else if ((this.request.get['order_id'])) {
			orders.push(this.request.get['order_id']);
		}

		for (let order_id of orders) {
			const order_info = await this.model_sale_order.getOrder(order_id);

			const text_order = sprintf(this.language.get('text_order'), order_id);

			if (order_info.order_id) {
				const store_info = await this.model_setting_setting.getSetting('config', order_info['store_id']);
				let store_address = this.config.get('config_address');
				let store_email = this.config.get('config_email');
				let store_telephone = this.config.get('config_telephone');
				let store_fax = this.config.get('config_fax');
				if (store_info.config_email) {
					store_address = store_info['config_address'];
					store_email = store_info['config_email'];
					store_telephone = store_info['config_telephone'];
					store_fax = store_info['config_fax'];
				}
				let invoice_no = '';
				if (order_info['invoice_no']) {
					invoice_no = order_info['invoice_prefix'] + order_info['invoice_no'];
				}
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
					'country': order_info['payment_country']
				};
				for (let [key, value] of Object.entries(replace)) {
					format = format.replace('{' + key + '}', value);
				}
				const payment_address = format.replaceAll('\r\n"', '<br />').replaceAll('\r"', '<br />').replaceAll('\n"', '<br />').replace(new RegExp("/\s\s+/"), '<br />').replace(new RegExp("/\r\r+/"), '<br />').replace(new RegExp("/\n\n+/"), '<br />')


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
				for (let [key, value] of Object.entries(replace)) {
					format = format.replace('{' + key + '}', value);
				}
				const shipping_address = format.replaceAll('\r\n"', '<br />').replaceAll('\r"', '<br />').replaceAll('\n"', '<br />').replace(new RegExp("/\s\s+/"), '<br />').replace(new RegExp("/\r\r+/"), '<br />').replace(new RegExp("/\n\n+/"), '<br />')


				this.load.model('tool/upload', this);

				const product_data = [];

				const products = await this.model_sale_order.getOrderProducts(order_id);

				for (let product of products) {
					const option_data = [];

					const options = await this.model_sale_order.getOrderOptions(order_id, product['order_product_id']);

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
							'value': value
						});
					}

					product_data.push({
						'name': product['name'],
						'model': product['model'],
						'option': option_data,
						'quantity': product['quantity'],
						'price': this.currency.format(product['price'] + (this.config.get('config_tax') ? product['tax'] : 0), order_info['currency_code'], order_info['currency_value']),
						'total': this.currency.format(product['total'] + (this.config.get('config_tax') ? (product['tax'] * product['quantity']) : 0), order_info['currency_code'], order_info['currency_value'])
					});
				}

				const voucher_data = [];

				const vouchers = await this.model_sale_order.getOrderVouchers(order_id);

				for (let voucher of vouchers) {
					voucher_data.push({
						'description': voucher['description'],
						'amount': this.currency.format(voucher['amount'], order_info['currency_code'], order_info['currency_value'])
					});
				}

				const total_data = [];

				const totals = await this.model_sale_order.getOrderTotals(order_id);

				for (let total of totals) {
					total_data.push({
						'title': total['title'],
						'text': this.currency.format(total['value'], order_info['currency_code'], order_info['currency_value'])
					});
				}

				data['orders'].push({
					'order_id': order_id,
					'invoice_no': invoice_no,
					'text_order': text_order,
					'date_added': date(this.language.get('date_format_short'), new Date(order_info['date_added'])),
					'store_name': order_info['store_name'],
					'store_url': rtrim(order_info['store_url'], '/'),
					'store_address': nl2br(store_address),
					'store_email': store_email,
					'store_telephone': store_telephone,
					'store_fax': store_fax,
					'email': order_info['email'],
					'telephone': order_info['telephone'],
					'shipping_address': shipping_address,
					'shipping_method': order_info['shipping_method'],
					'payment_address': payment_address,
					'payment_method': order_info['payment_method'],
					'product': product_data,
					'voucher': voucher_data,
					'total': total_data,
					'comment': nl2br(order_info['comment'])
				});
			}
		}

		this.response.setOutput(await this.load.view('sale/order_invoice', data));
	}

	async shipping() {
		const data = {};
		await this.load.language('sale/order');

		data['title'] = this.language.get('text_shipping');

		if (this.request.server['HTTPS']) {
			data['base'] = HTTPS_SERVER;
		} else {
			data['base'] = HTTP_SERVER;
		}

		data['direction'] = this.language.get('direction');
		data['lang'] = this.language.get('code');

		this.load.model('sale/order', this);

		this.load.model('catalog/product', this);

		this.load.model('setting/setting', this);

		data['orders'] = [];

		let orders = [];

		if ((this.request.post['selected'])) {
			orders = this.request.post['selected'];
		} else if ((this.request.get['order_id'])) {
			orders.push(this.request.get['order_id']);
		}

		for (let order_id of orders) {
			const order_info = await this.model_sale_order.getOrder(order_id);

			// Make sure there is a shipping method
			if (order_info && order_info['shipping_code']) {
				const store_info = await this.model_setting_setting.getSetting('config', order_info['store_id']);
				let store_address = this.config.get('config_address');
				let store_email = this.config.get('config_email');
				let store_telephone = this.config.get('config_telephone');

				if (store_info.config_email) {
					store_address = store_info['config_address'];
					store_email = store_info['config_email'];
					store_telephone = store_info['config_telephone'];
				}
				let invoice_no = '';
				if (order_info['invoice_no']) {
					invoice_no = order_info['invoice_prefix'] + order_info['invoice_no'];
				}
				let format = '{firstname} {lastname}' + "\n" + '{company}' + "\n" + '{address_1}' + "\n" + '{address_2}' + "\n" + '{city} {postcode}' + "\n" + '{zone}' + "\n" + '{country}';
				if (order_info['shipping_address_format']) {
					format = order_info['shipping_address_format'];
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
				for (let [key, value] of Object.entries(replace)) {
					format = format.replace('{' + key + '}', value);
				}
				const shipping_address = format.replaceAll('\r\n"', '<br />').replaceAll('\r"', '<br />').replaceAll('\n"', '<br />').replace(new RegExp("/\s\s+/"), '<br />').replace(new RegExp("/\r\r+/"), '<br />').replace(new RegExp("/\n\n+/"), '<br />')


				this.load.model('tool/upload', this);

				const product_data = [];

				const products = await this.model_sale_order.getOrderProducts(order_id);

				for (let product of products) {
					let option_weight = 0;

					const product_info = await this.model_catalog_product.getProduct(product['product_id']);

					if (product_info.product_id) {
						const option_data = [];

						const options = await this.model_sale_order.getOrderOptions(order_id, product['order_product_id']);

						for (options of option) {
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
								'value': value
							});

							const product_option_value_info = await this.model_catalog_product.getProductOptionValue(product['product_id'], option['product_option_value_id']);

							if ((product_option_value_info['weight'])) {
								if (product_option_value_info['weight_prefix'] == '+') {
									option_weight += product_option_value_info['weight'];
								} else if (product_option_value_info['weight_prefix'] == '-') {
									option_weight -= product_option_value_info['weight'];
								}
							}
						}

						product_data.push({
							'name': product_info['name'],
							'model': product_info['model'],
							'option': option_data,
							'quantity': product['quantity'],
							'location': product_info['location'],
							'sku': product_info['sku'],
							'upc': product_info['upc'],
							'ean': product_info['ean'],
							'jan': product_info['jan'],
							'isbn': product_info['isbn'],
							'mpn': product_info['mpn'],
							'weight': this.weight.format((product_info['weight'] + option_weight) * product['quantity'], product_info['weight_class_id'], this.language.get('decimal_point'), this.language.get('thousand_point'))
						});
					}
				}

				data['orders'].push({
					'order_id': order_id,
					'invoice_no': invoice_no,
					'date_added': date(this.language.get('date_format_short'), new Date(order_info['date_added'])),
					'store_name': order_info['store_name'],
					'store_url': rtrim(order_info['store_url'], '/'),
					'store_address': nl2br(store_address),
					'store_email': store_email,
					'store_telephone': store_telephone,
					'email': order_info['email'],
					'telephone': order_info['telephone'],
					'shipping_address': shipping_address,
					'shipping_method': order_info['shipping_method'],
					'product': product_data,
					'comment': nl2br(order_info['comment'])
				});
			}
		}

		this.response.setOutput(await this.load.view('sale/order_shipping', data));
	}
}
