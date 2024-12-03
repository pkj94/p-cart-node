module.exports = class ControllerExtensionReportCustomerReward extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/report/customer_reward');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_customer_reward', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true));
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
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/report/customer_reward', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/report/customer_reward', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_customer_reward_status'])) {
			data['report_customer_reward_status'] = this.request.post['report_customer_reward_status'];
		} else {
			data['report_customer_reward_status'] = this.config.get('report_customer_reward_status');
		}

		if ((this.request.post['report_customer_reward_sort_order'])) {
			data['report_customer_reward_sort_order'] = this.request.post['report_customer_reward_sort_order'];
		} else {
			data['report_customer_reward_sort_order'] = this.config.get('report_customer_reward_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/customer_reward_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/customer_reward')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async report() {
		const data = {};
		await this.load.language('extension/report/customer_reward');

		let filter_date_start = '';
		if ((this.request.get['filter_date_start'])) {
			filter_date_start = this.request.get['filter_date_start'];
		}

		let filter_date_end = '';
		if ((this.request.get['filter_date_end'])) {
			filter_date_end = this.request.get['filter_date_end'];
		}

		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		this.load.model('extension/report/customer', this);

		data['customers'] = [];

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_customer': filter_customer,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const customer_total = await this.model_extension_report_customer.getTotalRewardPoints(filter_data);

		const results = await this.model_extension_report_customer.getRewardPoints(filter_data);

		for (let result of results) {
			data['customers'].push({
				'customer': result['customer'],
				'email': result['email'],
				'customer_group': result['customer_group'],
				'status': (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'points': result['points'],
				'orders': result['orders'],
				'total': this.currency.format(result['total'], this.config.get('config_currency')),
				'edit': await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'], true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		let url = '';

		if ((this.request.get['filter_date_start'])) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(this.request.get['filter_customer']);
		}

		const pagination = new Pagination();
		pagination.total = customer_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=customer_reward' + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (customer_total - Number(this.config.get('config_limit_admin')))) ? customer_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), customer_total, Math.ceil(customer_total / Number(this.config.get('config_limit_admin'))));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_customer'] = filter_customer;

		return await this.load.view('extension/report/customer_reward_info', data);
	}
}