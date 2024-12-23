const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Admin\Controller\Extension\Opencart\Report\CustomerSearch'] = class CustomerSearch extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/report/customer_search');

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
			href: await this.url.link('extension/opencart/payment/customer_search', 'user_token=' + this.session.data.user_token)
		});


		data['save'] = await this.url.link('extension/opencart/report/customer_search+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_customer_search_status'] = this.config.get('report_customer_search_status');
		data['report_customer_search_sort_order'] = this.config.get('report_customer_search_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_search_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/customer_search');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/customer_search')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_customer_search', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/customer_search');

		const data = {
			list: await this.getReport()
		};

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_search', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/customer_search');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		let filter_date_start = '';
		if (this.request.get['filter_date_start']) {
			filter_date_start = this.request.get['filter_date_start'];
		}
		let filter_date_end = '';
		if (this.request.get['filter_date_end']) {
			filter_date_end = this.request.get['filter_date_end'];
		}
		let filter_keyword = '';
		if (this.request.get['filter_keyword']) {
			filter_keyword = this.request.get['filter_keyword'];
		}
		let filter_customer = '';
		if (this.request.get['filter_customer']) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_ip = '';
		if (this.request.get['filter_ip']) {
			filter_ip = this.request.get['filter_ip'];
		}
		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		const data = {
			searches: []
		};

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_keyword': filter_keyword,
			'filter_customer': filter_customer,
			'filter_ip': filter_ip,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/customer', this);
		this.load.model('catalog/category', this);

		const search_total = await this.model_extension_opencart_report_customer.getTotalCustomerSearches(filter_data);

		const results = await this.model_extension_opencart_report_customer.getCustomerSearches(filter_data);

		for (let result of results) {
			const category_info = await this.model_catalog_category.getCategory(result['category_id']);
			let category = '';
			if (category_info) {
				category = (category_info['path']) ? category_info['path'] + ' &gt; ' + category_info['name'] : category_info['name'];
			}
			let customer = this.language.get('text_guest');
			if (result['customer_id'] > 0) {
				customer = sprintf(this.language.get('text_customer'), await this.url.link('customer/customer+form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id']), result['customer']);
			}

			data['searches'].push({
				'keyword': result['keyword'],
				'products': result['products'],
				'category': category,
				'customer': customer,
				'ip': result['ip'],
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added']))
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if (this.request.get['filter_keyword']) {
			url += '&filter_keyword=' + encodeURIComponent(this.request.get['filter_keyword']);
		}

		if (this.request.get['filter_customer']) {
			url += '&filter_customer=' + this.request.get['filter_customer'];
		}

		if (this.request.get['filter_ip']) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': search_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': await this.url.link('extension/opencart/report/customer_search+report', 'user_token=' + this.session.data['user_token'] + '&code=customer_search' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (search_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (search_total - this.config.get('config_pagination'))) ? search_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), search_total, Math.ceil(search_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_keyword'] = filter_keyword;
		data['filter_customer'] = filter_customer;
		data['filter_ip'] = filter_ip;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/customer_search_list', data);
	}
}
