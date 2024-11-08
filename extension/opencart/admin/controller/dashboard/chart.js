const mktime = require("locutus/php/datetime/mktime");
const strtotime = require("locutus/php/datetime/strtotime");

global['\Opencart\Admin\Controller\Extension\Opencart\Dashboard\Chart'] = class Chart extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.language.load('extension/opencart/dashboard/chart');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: [
				{
					text: this.language.get('text_home'),
					href: await this.url.link('common/dashboard', `user_token=${this.session.data['user_token']}`)
				},
				{
					text: this.language.get('text_extension'),
					href: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=dashboard`)
				},
				{
					text: this.language.get('heading_title'),
					href: await this.url.link('extension/opencart/dashboard/chart', `user_token=${this.session.data['user_token']}`)
				}
			],
			save: await this.url.link('extension/opencart/dashboard/chart.save', `user_token=${this.session.data['user_token']}`),
			back: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=dashboard`),
			dashboard_chart_width: this.config.get('dashboard_chart_width'),
			columns: [],
			dashboard_chart_status: this.config.get('dashboard_chart_status'),
			dashboard_chart_sort_order: this.config.get('dashboard_chart_sort_order'),
			header: await this.load.controller('common/header'),
			column_left: await this.load.controller('common/column_left'),
			footer: await this.load.controller('common/footer')
		};

		for (let i = 3; i <= 12; i++) {
			data.columns.push(i);
		}

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/chart_form', data));
	}

	async save() {
		await this.language.load('extension/opencart/dashboard/chart');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/chart')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);
			await this.model_setting_setting.editSetting('dashboard_chart', this.request.post);
			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async dashboard() {
		await this.language.load('extension/opencart/dashboard/chart');

		const data = {
			user_token: this.session.data['user_token']
		};

		return await this.load.view('extension/opencart/dashboard/chart_info', data);
	}

	async chart() {
		await this.load.language('extension/opencart/dashboard/chart');

		const json = {};

		this.load.model('extension/opencart/report/customer', this);
		this.load.model('extension/opencart/report/sale', this);

		json['order'] = {};
		json['customer'] = {};
		json['xaxis'] = [];

		json['order']['label'] = this.language.get('text_order');
		json['customer']['label'] = this.language.get('text_customer');
		json['order']['data'] = [];
		json['customer']['data'] = [];
		let range = 'day';
		if ((this.request.get['range'])) {
			range = this.request.get['range'];
		}
		let results = {};
		// console.log('hi-----------',range);
		switch (range) {
			default:
			case 'day':
				results = await this.model_extension_opencart_report_sale.getTotalOrdersByDay();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_opencart_report_customer.getTotalCustomersByDay();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}


				for (let i = 0; i < 24; i++) {
					json['xaxis'].push([i, i]);
				}
				break;
			case 'week':
				results = await this.model_extension_opencart_report_sale.getTotalOrdersByWeek();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}


				results = await this.model_extension_opencart_report_customer.getTotalCustomersByWeek();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}


				date_start = new Date('-' + date('w') + ' days');

				for (let i = 0; i < 7; i++) {
					let dt = date('Y-m-d', date_start + (i * 86400));

					json['xaxis'].push([date('w', new Date(dt)), date('D', new Date(dt))]);
				}
				break;
			case 'month':
				results = await this.model_extension_opencart_report_sale.getTotalOrdersByMonth();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_opencart_report_customer.getTotalCustomersByMonth();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}

				for (let i = 1; i <= date('t'); i++) {
					let dt = date('Y') + '-' + date('m') + '-' + i;

					json['xaxis'].push([date('j', new Date(dt)), date('d', new Date(dt))]);
				}
				break;
			case 'year':
				results = await this.model_extension_opencart_report_sale.getTotalOrdersByYear();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_opencart_report_customer.getTotalCustomersByYear();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}

				for (let i = 1; i <= 12; i++) {
					json['xaxis'].push([i, date('M', mktime(0, 0, 0, i, 1))]);
				}
				break;
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}


