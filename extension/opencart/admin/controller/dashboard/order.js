const strtotime = require("locutus/php/datetime/strtotime");

/**
 * Class Order
 *
 * @package Opencart\Admin\Controller\Extension\Opencart\Dashboard
 */
module.exports = class OrderDashboardController extends Controller {
	constructor(params) {
		super(params)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/order');

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
			'href': this.url.link('extension/opencart/dashboard/order', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/dashboard/order+save', 'user_token=' + this.session.data['user_token']);

		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard');

		data['dashboard_order_width'] = this.config.get('dashboard_order_width');

		data['columns'] = [];

		for (let i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		data['dashboard_order_status'] = this.config.get('dashboard_order_status');
		data['dashboard_order_sort_order'] = this.config.get('dashboard_order_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/order_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/dashboard/order');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/order')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('dashboard_order', this.request.post);

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
		await this.load.language('extension/opencart/dashboard/order');

		// Total Orders
		this.load.model('sale/order', this);

		let today = await this.model_sale_order.getTotalOrders({ 'filter_date_added': date('Y-m-d', new Date('-1 day')) });

		let yesterday = await this.model_sale_order.getTotalOrders({ 'filter_date_added': date('Y-m-d', new Date('-2 day')) });

		let difference = today - yesterday;

		if (difference && today) {
			data['percentage'] = Math.round((difference / today) * 100);
		} else {
			data['percentage'] = 0;
		}

		let order_total = await this.model_sale_order.getTotalOrders();

		if (order_total > 1000000000000) {
			data['total'] = round(order_total / 1000000000000, 1) + 'T';
		} else if (order_total > 1000000000) {
			data['total'] = round(order_total / 1000000000, 1) + 'B';
		} else if (order_total > 1000000) {
			data['total'] = round(order_total / 1000000, 1) + 'M';
		} else if (order_total > 1000) {
			data['total'] = round(order_total / 1000, 1) + 'K';
		} else {
			data['total'] = order_total;
		}

		data['order'] = this.url.link('sale/order', 'user_token=' + this.session.data['user_token']);

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/dashboard/order_info', data);
	}
}
