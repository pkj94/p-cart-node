module.exports = class ControllerExtensionDashboardRecent extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/dashboard/recent');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_recent', this.request.post);

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
			'href': await this.url.link('extension/dashboard/recent', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/dashboard/recent', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

		if ((this.request.post['dashboard_recent_width'])) {
			data['dashboard_recent_width'] = this.request.post['dashboard_recent_width'];
		} else {
			data['dashboard_recent_width'] = this.config.get('dashboard_recent_width');
		}

		data['columns'] = [];

		for (i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		if ((this.request.post['dashboard_recent_status'])) {
			data['dashboard_recent_status'] = this.request.post['dashboard_recent_status'];
		} else {
			data['dashboard_recent_status'] = this.config.get('dashboard_recent_status');
		}

		if ((this.request.post['dashboard_recent_sort_order'])) {
			data['dashboard_recent_sort_order'] = this.request.post['dashboard_recent_sort_order'];
		} else {
			data['dashboard_recent_sort_order'] = this.config.get('dashboard_recent_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/dashboard/recent_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/recent')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true;
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/recent');

		data['user_token'] = this.session.data['user_token'];

		// Last 5 Orders
		data['orders'] = [];

		let filter_data = {
			'sort': 'o.date_added',
			'order': 'DESC',
			'start': 0,
			'limit': 5
		};

		this.load.model('sale/order', this);

		const results = await this.model_sale_order.getOrders(filter_data);

		for (let result of results) {
			data['orders'].push({
				'order_id': result['order_id'],
				'customer': result['customer'],
				'status': result['order_status'],
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'total': this.currency.format(result['total'], result['currency_code'], result['currency_value']),
				'view': await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=' + result['order_id'], true),
			});
		}

		return await this.load.view('extension/dashboard/recent_info', data);
	}
}
