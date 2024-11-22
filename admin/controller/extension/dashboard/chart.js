const mktime = require("locutus/php/datetime/mktime");

module.exports = class ControllerExtensionDashboardChart extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/dashboard/chart');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_chart', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/dashboard/chart', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/dashboard/chart', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

		if ((this.request.post['dashboard_chart_width'])) {
			data['dashboard_chart_width'] = this.request.post['dashboard_chart_width'];
		} else {
			data['dashboard_chart_width'] = this.config.get('dashboard_chart_width');
		}

		data['columns'] = [];

		for (let i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		if ((this.request.post['dashboard_chart_status'])) {
			data['dashboard_chart_status'] = this.request.post['dashboard_chart_status'];
		} else {
			data['dashboard_chart_status'] = this.config.get('dashboard_chart_status');
		}

		if ((this.request.post['dashboard_chart_sort_order'])) {
			data['dashboard_chart_sort_order'] = this.request.post['dashboard_chart_sort_order'];
		} else {
			data['dashboard_chart_sort_order'] = this.config.get('dashboard_chart_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/dashboard/chart_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/chart')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true;
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/chart');

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/dashboard/chart_info', data);
	}

	async chart() {
		await this.load.language('extension/dashboard/chart');

		const json = {};

		this.load.model('extension/dashboard/chart',this);

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
		} else {
			range = 'day';
		}
		let results = {};
		console.log('--------range========',range)
		switch (range) {
			default:
			case 'day':
				results = await this.model_extension_dashboard_chart.getTotalOrdersByDay();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_dashboard_chart.getTotalCustomersByDay();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}

				for (let i = 0; i < 24; i++) {
					json['xaxis'].push([i, i]);
				}
				break;
			case 'week':
				results = await this.model_extension_dashboard_chart.getTotalOrdersByWeek();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_dashboard_chart.getTotalCustomersByWeek();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}

				let date_start = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - new Date().getDay()).getTime();

				for (let i = 0; i < 7; i++) {
					const date = new Date(dateStart);
					date.setDate(dateStart.getDate() + i);

					json['xaxis'].push([date('w', new Date(date)), date('D', new Date(date))]);
				}
				break;
			case 'month':
				results = await this.model_extension_dashboard_chart.getTotalOrdersByMonth();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_dashboard_chart.getTotalCustomersByMonth();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}

				for (let i = 1; i <= date('t'); i++) {
					let date1 = date('Y') + '-' + date('m') + '-' + i;

					json['xaxis'].push([date('j', new Date(date1)), date('d', new Date(date1))]);
				}
				break;
			case 'year':
				results = await this.model_extension_dashboard_chart.getTotalOrdersByYear();

				for (let [key, value] of Object.entries(results)) {
					json['order']['data'].push([key, value['total']]);
				}

				results = await this.model_extension_dashboard_chart.getTotalCustomersByYear();

				for (let [key, value] of Object.entries(results)) {
					json['customer']['data'].push([key, value['total']]);
				}

				for (let i = 1; i <= 12; i++) {
					json['xaxis'].push([i, date('M', mktime(0, 0, 0, i))]);
				}
				break;
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}