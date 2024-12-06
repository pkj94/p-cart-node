module.exports = class ControllerExtensionDashboardCustomer extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/dashboard/customer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_customer', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true));
		} else {

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
				'href': await this.url.link('extension/dashboard/customer', 'user_token=' + this.session.data['user_token'], true)
			});

			data['action'] = await this.url.link('extension/dashboard/customer', 'user_token=' + this.session.data['user_token'], true);

			data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

			if ((this.request.post['dashboard_customer_width'])) {
				data['dashboard_customer_width'] = this.request.post['dashboard_customer_width'];
			} else {
				data['dashboard_customer_width'] = this.config.get('dashboard_customer_width');
			}

			data['columns'] = [];

			for (let i = 3; i <= 12; i++) {
				data['columns'].push(i);
			}

			if ((this.request.post['dashboard_customer_status'])) {
				data['dashboard_customer_status'] = this.request.post['dashboard_customer_status'];
			} else {
				data['dashboard_customer_status'] = this.config.get('dashboard_customer_status');
			}

			if ((this.request.post['dashboard_customer_sort_order'])) {
				data['dashboard_customer_sort_order'] = this.request.post['dashboard_customer_sort_order'];
			} else {
				data['dashboard_customer_sort_order'] = this.config.get('dashboard_customer_sort_order');
			}

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('extension/dashboard/customer_form', data));
		}
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/customer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true;
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/customer');

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
			data['total'] = Math.round(customer_total / 1000000000000, 1) + 'T';
		} else if (customer_total > 1000000000) {
			data['total'] = Math.round(customer_total / 1000000000, 1) + 'B';
		} else if (customer_total > 1000000) {
			data['total'] = Math.round(customer_total / 1000000, 1) + 'M';
		} else if (customer_total > 1000) {
			data['total'] = Math.round(customer_total / 1000, 1) + 'K';
		} else {
			data['total'] = customer_total;
		}

		data['customer'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'], true);

		return await this.load.view('extension/dashboard/customer_info', data);
	}
}
