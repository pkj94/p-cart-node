const strtotime = require("locutus/php/datetime/strtotime");
const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Admin\Controller\Extension\Opencart\Report\SaleShipping'] = class SaleShipping extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/report/sale_shipping');

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
			'href': await this.url.link('extension/opencart/report/sale_shipping', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/report/sale_shipping.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_sale_shipping_status'] = this.config.get('report_sale_shipping_status');
		data['report_sale_shipping_sort_order'] = this.config.get('report_sale_shipping_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/sale_shipping_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/sale_shipping');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/sale_shipping')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_sale_shipping', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/sale_shipping');

		const data = {
			list: await this.getReport()
		}

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

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

		this.response.setOutput(await this.load.view('extension/opencart/report/sale_shipping', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/sale_shipping');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		const data = {};
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
		let filter_order_status_id = 0;
		if (this.request.get['filter_order_status_id']) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		}

		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		data['orders'] = [];

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_group': filter_group,
			'filter_order_status_id': filter_order_status_id,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/sale', this);

		const order_total = await this.model_extension_opencart_report_sale.getTotalShipping(filter_data);

		const results = await this.model_extension_opencart_report_sale.getShipping(filter_data);

		for (let result of results) {
			data['orders'].push({
				'date_start': date(this.language.get('date_format_short'), new Date(result['date_start'])),
				'date_end': date(this.language.get('date_format_short'), new Date(result['date_end'])),
				'title': result['title'],
				'orders': result['orders'],
				'total': this.currency.format(result['total'], this.config.get('config_currency'))
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if (this.request.get['filter_group']) {
			url += '&filter_group=' + this.request.get['filter_group'];
		}

		if (this.request.get['filter_order_status_id']) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': order_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': await this.url.link('extension/opencart/report/sale_shipping.list', 'user_token=' + this.session.data['user_token'] + '&code=sale_shipping' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (order_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (order_total - this.config.get('config_pagination'))) ? order_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), order_total, Math.ceil(order_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_group'] = filter_group;
		data['filter_order_status_id'] = filter_order_status_id;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/sale_shipping_list', data);
	}
}
