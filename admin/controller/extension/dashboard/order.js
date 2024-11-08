module.exports = class ControllerExtensionDashboardOrder extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/dashboard/order');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_order', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
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
			'href': await this.url.link('extension/dashboard/order', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/dashboard/order', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

		if ((this.request.post['dashboard_order_width'])) {
			data['dashboard_order_width'] = this.request.post['dashboard_order_width'];
		} else {
			data['dashboard_order_width'] = this.config.get('dashboard_order_width');
		}

		data['columns'] = [];

		for (i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		if ((this.request.post['dashboard_order_status'])) {
			data['dashboard_order_status'] = this.request.post['dashboard_order_status'];
		} else {
			data['dashboard_order_status'] = this.config.get('dashboard_order_status');
		}

		if ((this.request.post['dashboard_order_sort_order'])) {
			data['dashboard_order_sort_order'] = this.request.post['dashboard_order_sort_order'];
		} else {
			data['dashboard_order_sort_order'] = this.config.get('dashboard_order_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/dashboard/order_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/order')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true;
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/order');

		data['user_token'] = this.session.data['user_token'];

		// Total Orders
		this.load.model('sale/order', this);

		let today = await this.model_sale_order.getTotalOrders({ 'filter_date_added': date('Y-m-d', strtotime('-1 day')) });

		let yesterday = await this.model_sale_order.getTotalOrders({ 'filter_date_added': date('Y-m-d', strtotime('-2 day')) });

		let difference = today - yesterday;

		if (difference && today) {
			data['percentage'] = Math.round((difference / today) * 100);
		} else {
			data['percentage'] = 0;
		}

		const order_total = await this.model_sale_order.getTotalOrders();

		if (order_total > 1000000000000) {
			data['total'] = Math.round(order_total / 1000000000000, 1) + 'T';
		} else if (order_total > 1000000000) {
			data['total'] = Math.round(order_total / 1000000000, 1) + 'B';
		} else if (order_total > 1000000) {
			data['total'] = Math.round(order_total / 1000000, 1) + 'M';
		} else if (order_total > 1000) {
			data['total'] = Math.round(order_total / 1000, 1) + 'K';
		} else {
			data['total'] = order_total;
		}

		data['order'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'], true);

		return await this.load.view('extension/dashboard/order_info', data);
	}
}
