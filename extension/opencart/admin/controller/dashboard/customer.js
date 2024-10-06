const strtotime = require("locutus/php/datetime/strtotime");


module.exports = class CustomerDashboardController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/customer');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('extension/opencart/dashboard/customer', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/dashboard/customer+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard');

		data['dashboard_customer_width'] = this.config.get('dashboard_customer_width');

		data['columns'] = [];

		for (i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		data['dashboard_customer_status'] = this.config.get('dashboard_customer_status');
		data['dashboard_customer_sort_order'] = this.config.get('dashboard_customer_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/customer_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/dashboard/customer');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/dashboard/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('dashboard_customer', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return string
	 */
	async dashboard() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/customer');

		data['user_token'] = this.session.data['user_token'];

		// Total Orders
		this.load.model('customer/customer', this);

		let today = await this.model_customer_customer.getTotalCustomers({ 'filter_date_added': date('Y-m-d', strtotime('-1 day')) });

		let yesterday = await this.model_customer_customer.getTotalCustomers({ 'filter_date_added': date('Y-m-d', strtotime('-2 day')) });

		let difference = today - yesterday;

		if (difference && today) {
			data['percentage'] = Math.round((difference / today) * 100);
		} else {
			data['percentage'] = 0;
		}

		let customer_total = await this.model_customer_customer.getTotalCustomers();

		if (customer_total > 1000000000000) {
			data['total'] = round(customer_total / 1000000000000, 1) + 'T';
		} else if (customer_total > 1000000000) {
			data['total'] = round(customer_total / 1000000000, 1) + 'B';
		} else if (customer_total > 1000000) {
			data['total'] = round(customer_total / 1000000, 1) + 'M';
		} else if (customer_total > 1000) {
			data['total'] = round(customer_total / 1000, 1) + 'K';
		} else {
			data['total'] = customer_total;
		}

		data['customer'] = this.url.link('customer/customer', 'user_token=' + this.session.data['user_token']);

		return await this.load.view('extension/opencart/dashboard/customer_info', data);
	}
}
