module.exports = class ControllerExtensionReportSaleReturn extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/report/sale_return');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_sale_return', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/report/sale_return', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/report/sale_return', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_sale_return_status'])) {
			data['report_sale_return_status'] = this.request.post['report_sale_return_status'];
		} else {
			data['report_sale_return_status'] = this.config.get('report_sale_return_status');
		}

		if ((this.request.post['report_sale_return_sort_order'])) {
			data['report_sale_return_sort_order'] = this.request.post['report_sale_return_sort_order'];
		} else {
			data['report_sale_return_sort_order'] = this.config.get('report_sale_return_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/sale_return_form', data));
	}
	
	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/sale_return')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
	
	async report() {
		await this.load.language('extension/report/sale_return');

		if ((this.request.get['filter_date_start'])) {
			filter_date_start = this.request.get['filter_date_start'];
		} else {
			filter_date_start = '';
		}

		if ((this.request.get['filter_date_end'])) {
			filter_date_end = this.request.get['filter_date_end'];
		} else {
			filter_date_end = '';
		}

		if ((this.request.get['filter_group'])) {
			filter_group = this.request.get['filter_group'];
		} else {
			filter_group = 'week';
		}

		if ((this.request.get['filter_return_status_id'])) {
			filter_return_status_id = this.request.get['filter_return_status_id'];
		} else {
			filter_return_status_id = 0;
		}

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}
		
		this.load.model('extension/report/return');

		data['returns'] = {};

		filter_data = array(
			'filter_date_start'	      : filter_date_start,
			'filter_date_end'	      : filter_date_end,
			'filter_group'            : filter_group,
			'filter_return_status_id' : filter_return_status_id,
			'start'                   : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'                   : Number(this.config.get('config_limit_admin'))
		});

		return_total = await this.model_extension_report_return.getTotalReturns(filter_data);

		results = await this.model_extension_report_return.getReturns(filter_data);

		for (let result of results) {
			data['returns'].push({
				'date_start' : date(this.language.get('date_format_short'), strtotime(result['date_start'])),
				'date_end'   : date(this.language.get('date_format_short'), strtotime(result['date_end'])),
				'returns'    : result['returns']
			});
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/return_status');

		data['return_statuses'] = await this.model_localisation_return_status.getReturnStatuses();

		data['groups'] = {};

		data['groups'].push({
			'text'  : this.language.get('text_year'),
			'value' : 'year',
		});

		data['groups'].push({
			'text'  : this.language.get('text_month'),
			'value' : 'month',
		});

		data['groups'].push({
			'text'  : this.language.get('text_week'),
			'value' : 'week',
		});

		data['groups'].push({
			'text'  : this.language.get('text_day'),
			'value' : 'day',
		});

		url = '';

		if ((this.request.get['filter_date_start'])) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if ((this.request.get['filter_group'])) {
			url += '&filter_group=' + this.request.get['filter_group'];
		}

		if ((this.request.get['filter_return_status_id'])) {
			url += '&filter_return_status_id=' + this.request.get['filter_return_status_id'];
		}

		pagination = new Pagination();
		pagination.total = return_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=sale_return' + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (return_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (return_total - Number(this.config.get('config_limit_admin')))) ? return_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), return_total, Math.ceil(return_total / Number(this.config.get('config_limit_admin'))));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_group'] = filter_group;
		data['filter_return_status_id'] = filter_return_status_id;
		
		return await this.load.view('extension/report/sale_return_info', data);
	}
}