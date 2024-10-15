const sprintf = require("locutus/php/strings/sprintf");

module.exports = class MarketingReportController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/report/marketing');

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
			'href': this.url.link('extension/opencart/report/marketing', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/report/marketing.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_marketing_status'] = this.config.get('report_marketing_status');
		data['report_marketing_sort_order'] = this.config.get('report_marketing_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/marketing_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/marketing');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/marketing')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_marketing', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/marketing');

		const data = {
			list: await this.getReport()
		}

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/marketing', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/marketing');

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
		let filter_order_status_id = 0;
		if (this.request.get['filter_order_status_id']) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		}

		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		data['marketings'] = [];

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_order_status_id': filter_order_status_id,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/marketing', this);

		const marketing_total = await this.model_extension_opencart_report_marketing.getTotalMarketing(filter_data);

		const results = await this.model_extension_opencart_report_marketing.getMarketing(filter_data);

		for (let result of results) {
			data['marketings'].push({
				'campaign': result['campaign'],
				'code': result['code'],
				'clicks': result['clicks'],
				'orders': result['orders'],
				'total': this.currency.format(result['total'], this.config.get('config_currency')),
				'save': this.url.link('marketing/marketing/edit', 'user_token=' + this.session.data['user_token'] + '&marketing_id=' + result['marketing_id'])
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if (this.request.get['filter_order_status_id']) {
			url += '&filter_order_status_id='.this.request.get['filter_order_status_id'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': marketing_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': this.url.link('extension/opencart/report/marketing.report', 'user_token=' + this.session.data['user_token'] + '&code=marketing' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (marketing_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (marketing_total - this.config.get('config_pagination'))) ? marketing_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), marketing_total, Math.ceil(marketing_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_order_status_id'] = filter_order_status_id;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/marketing_list', data);
	}
}
