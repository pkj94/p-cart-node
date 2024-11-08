const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Admin\Controller\Extension\Opencart\Report\Customer'] = class Customer extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/report/customer');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/opencart/report/customer', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/report/customer.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_customer_status'] = this.config.get('report_customer_status');
		data['report_customer_sort_order'] = this.config.get('report_customer_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/customer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_customer', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/customer');

		const data = {
			list: await this.getReport()
		}

		data['groups'] = [];

		data['groups'].push({
			'text': this.language.get('text_year'),
			'value': 'year',
		});

		data['groups'].push({
			'text': this.language.get('text_month'),
			'value': 'month',
		});

		data['groups'].push({
			'text': this.language.get('text_week'),
			'value': 'week',
		});

		data['groups'].push({
			'text': this.language.get('text_day'),
			'value': 'day',
		});

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/customer', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/customer');

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

		let filter_group = 'week';
		if (this.request.get['filter_group']) {
			filter_group = this.request.get['filter_group'];
		}

		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		const data = {
			customers: []
		}

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_group': filter_group,
			'start': (page - 1) * 20,
			'limit': 20
		};

		this.load.model('extension/opencart/report/customer', this);

		const customer_total = await this.model_extension_opencart_report_customer.getTotalCustomers(filter_data);

		const results = await this.model_extension_opencart_report_customer.getCustomers(filter_data);

		for (let result of results) {
			data['customers'].push({
				'date_start': date(this.language.get('date_format_short'), new Date(result['date_start'])),
				'date_end': date(this.language.get('date_format_short'), new Date(result['date_end'])),
				'total': result['total'],
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if ((this.request.get['filter_group'])) {
			url += '&filter_group=' + this.request.get['filter_group'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': customer_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': await this.url.link('extension/opencart/report/customer.report', 'user_token=' + this.session.data['user_token'] + '&code=customer' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (customer_total - this.config.get('config_pagination'))) ? customer_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), customer_total, Math.ceil(customer_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_group'] = filter_group;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/customer_list', data);
	}
}
