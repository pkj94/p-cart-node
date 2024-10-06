const sprintf = require("locutus/php/strings/sprintf");
const str_replace = require("locutus/php/strings/str_replace");
const vsprintf = require("locutus/php/strings/vsprintf");

module.exports = class CustomerActivityReportController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/report/customer_activity');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: []
		};

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=payment')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: this.url.link('extension/opencart/payment/customer_activity', 'user_token=' + this.session.data.user_token)
		});

		data['save'] = this.url.link('extension/opencart/report/customer_activity+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_customer_activity_status'] = this.config.get('report_customer_activity_status');
		data['report_customer_activity_sort_order'] = this.config.get('report_customer_activity_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_activity_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/customer_activity');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/report/customer_activity')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_customer_activity', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/customer_activity');

		const data = {
			list: await this.getReport()
		};

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/customer_activity', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/customer_activity');

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
		let filter_ip = '';

		if (this.request.get['filter_ip']) {
			filter_ip = this.request.get['filter_ip'];
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
			page = this.request.get['page'];
		}

		const data = {
			activities: []
		};

		let filter_data = {
			'filter_customer': filter_customer,
			'filter_ip': filter_ip,
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'start': (page - 1) * 20,
			'limit': 20
		};

		this.load.model('extension/opencart/report/customer', this);

		const activity_total = this.model_extension_opencart_report_customer.getTotalCustomerActivities(filter_data);

		const results = this.model_extension_opencart_report_customer.getCustomerActivities(filter_data);

		for (let result of results) {
			const comment = vsprintf(this.language.get('text_activity_' + result['key']), result['data']);

			const find = [
				'customer_id=',
				'order_id='
			];

			const replace = [
				this.url.link('customer/customer+form', 'user_token=' + this.session.data['user_token'] + '&customer_id='),
				this.url.link('sale/order+info', 'user_token=' + this.session.data['user_token'] + '&order_id=')
			];

			data['activities'].push({
				'comment': str_replace(find, replace, comment),
				'ip': result['ip'],
				'date_added': date(this.language.get('datetime_format'), strtotime(result['date_added']))
			});
		}

		let url = '';

		if (this.request.get['filter_customer']) {
			url += '&filter_customer=' + this.request.get['filter_customer'];
		}

		if (this.request.get['filter_ip']) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': activity_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': this.url.link('extension/opencart/report/customer_activity+report', 'user_token=' + this.session.data['user_token'] + '&code=customer_activity' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), activity_total ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (activity_total - this.config.get('config_pagination'))) ? activity_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), activity_total, Math.ceil(activity_total / this.config.get('config_pagination')));

		data['filter_customer'] = filter_customer;
		data['filter_ip'] = filter_ip;
		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/customer_activity_list', data);
	}
}
