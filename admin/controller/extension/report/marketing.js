module.exports = class ControllerExtensionReportMarketing extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/report/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_marketing', this.request.post);

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
			'href': await this.url.link('extension/report/marketing', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/report/marketing', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_marketing_status'])) {
			data['report_marketing_status'] = this.request.post['report_marketing_status'];
		} else {
			data['report_marketing_status'] = this.config.get('report_marketing_status');
		}

		if ((this.request.post['report_marketing_sort_order'])) {
			data['report_marketing_sort_order'] = this.request.post['report_marketing_sort_order'];
		} else {
			data['report_marketing_sort_order'] = this.config.get('report_marketing_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/marketing_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/marketing')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async report() {
		const data = {};
		await this.load.language('extension/report/marketing');
		let filter_date_start = '';
		if ((this.request.get['filter_date_start'])) {
			filter_date_start = this.request.get['filter_date_start'];
		}
		let filter_date_end = '';
		if ((this.request.get['filter_date_end'])) {
			filter_date_end = this.request.get['filter_date_end'];
		}
		let filter_order_status_id = 0;
		if ((this.request.get['filter_order_status_id'])) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		this.load.model('extension/report/marketing', this);

		data['marketings'] = [];

		let filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_order_status_id': filter_order_status_id,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const marketing_total = await this.model_extension_report_marketing.getTotalMarketing(filter_data);

		const results = await this.model_extension_report_marketing.getMarketing(filter_data);

		for (let result of results) {
			data['marketings'].push({
				'campaign': result['campaign'],
				'code': result['code'],
				'clicks': result['clicks'],
				'orders': result['orders'],
				'total': this.currency.format(result['total'], this.config.get('config_currency')),
				'action': await this.url.link('marketing/marketing/edit', 'user_token=' + this.session.data['user_token'] + '&marketing_id=' + result['marketing_id'], true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		let url = '';

		if ((this.request.get['filter_date_start'])) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		const pagination = new Pagination();
		pagination.total = marketing_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=marketing' + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (marketing_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (marketing_total - Number(this.config.get('config_limit_admin')))) ? marketing_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), marketing_total, Math.ceil(marketing_total / Number(this.config.get('config_limit_admin'))));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_order_status_id'] = filter_order_status_id;

		return await this.load.view('extension/report/marketing_info', data);
	}
}