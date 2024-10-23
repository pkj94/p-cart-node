const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Admin\Controller\Extension\Opencart\Report\CustomerOrder'] = class CustomerOrder extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/report/customer_order');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: await this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: await this.url.link('extension/opencart/payment/customer_order', 'user_token=' + this.session.data.user_token)
		});


		data['save'] = await this.url.link('extension/opencart/report/customer_order+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_customer_order_status'] = this.config.get('report_customer_order_status');
		data['report_customer_order_sort_order'] = this.config.get('report_customer_order_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_order_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/customer_order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/customer_order')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_customer_order', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/customer_order');

		const data = {
			list: await this.getReport()
		};

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_order', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/customer_order');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		let filter_customer = '';
		if (this.request.get['filter_customer']) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_order_status_id = 0;

		if (this.request.get['filter_order_status_id']) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		}
		let filter_date_start = '';
		if (this.request.get['filter_date_start']) {
			filter_date_start = this.request.get['filter_date_start'];
		}
		let filter_date_end = '';
		if (this.request.get['filter_date_end']) {
			filter_date_end = this.request.get['filter_date_end'];
		}
		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		const data = {
			customers: []
		};

		let filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_customer': filter_customer,
			'filter_order_status_id': filter_order_status_id,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/customer', this);

		const customer_total = await this.model_extension_opencart_report_customer.getTotalOrders(filter_data);

		const results = await this.model_extension_opencart_report_customer.getOrders(filter_data);

		for (let result of results) {
			data['customers'].push({
				'customer': result['customer'],
				'email': result['email'],
				'customer_group': result['customer_group'],
				'status': (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'orders': result['orders'],
				'products': result['products'],
				'total': this.currency.format(result['total'], this.config.get('config_currency')),
				'edit': await this.url.link('customer/customer+form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'])
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if (this.request.get['filter_customer']) {
			url += '&filter_customer=' + this.request.get['filter_customer'];
		}

		if (this.request.get['filter_order_status_id']) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': customer_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': await this.url.link('extension/opencart/report/customer_order+report', 'user_token=' + this.session.data['user_token'] + '&code=customer_order' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (customer_total - this.config.get('config_pagination'))) ? customer_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), customer_total, Math.ceil(customer_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_customer'] = filter_customer;
		data['filter_order_status_id'] = filter_order_status_id;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/customer_order_list', data);
	}
}
