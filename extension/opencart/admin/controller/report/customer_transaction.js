const sprintf = require("locutus/php/strings/sprintf");

module.exports = class CustomerTransactionReportController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		const data = {};
		this.load.language('extension/opencart/report/customer_transaction');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('extension/opencart/report/customer_transaction', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/report/customer_transaction+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_customer_transaction_status'] = this.config.get('report_customer_transaction_status');
		data['report_customer_transaction_sort_order'] = this.config.get('report_customer_transaction_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_transaction_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/customer_transaction');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/report/customer_transaction')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_customer_transaction', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/customer_transaction');

		const data = {
			list: await this.getReport()
		}

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_transaction', data));
	}

	/**
	 * @return void
	 */
	async list() {
		this.load.language('extension/opencart/report/customer_transaction');

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

		let filter_customer = '';
		if (this.request.get['filter_customer ']) {
			filter_customer = this.request.get['filter_customer '];
		}
		let page = 1;
		if (this.request.get['page']) {
			page = this.request.get['page'];
		}

		const data = {
			customers: []
		}

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_customer': filter_customer,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/customer_transaction', this);

		const customer_total = await this.model_extension_opencart_report_customer_transaction.getTotalTransactions(filter_data);

		const results = await this.model_extension_opencart_report_customer_transaction.getTransactions(filter_data);

		for (let result of results) {
			data['customers'].push({
				'customer': result['customer'],
				'email': result['email'],
				'customer_group': result['customer_group'],
				'status': (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'total': this.currency.format(result['total'], this.config.get('config_currency')),
				'edit': this.url.link('customer/customer+form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'])
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (isset(this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if (this.request.get['filter_customer']) {
			url += '&filter_customer=' + this.request.get['filter_customer'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': customer_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': this.url.link('extension/opencart/report/customer_transaction+report', 'user_token=' + this.session.data['user_token'] + '&code=customer_transaction' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (customer_total - this.config.get('config_pagination'))) ? customer_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), customer_total, Math.ceil(customer_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_customer'] = filter_customer;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/customer_transaction_list', data);
	}
}
