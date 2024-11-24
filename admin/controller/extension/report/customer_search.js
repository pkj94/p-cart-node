module.exports = class ControllerExtensionReportCustomerSearch extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/report/customer_search');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_customer_search', this.request.post);

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
			'href' : await this.url.link('extension/report/customer_search', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/report/customer_search', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_customer_search_status'])) {
			data['report_customer_search_status'] = this.request.post['report_customer_search_status'];
		} else {
			data['report_customer_search_status'] = this.config.get('report_customer_search_status');
		}

		if ((this.request.post['report_customer_search_sort_order'])) {
			data['report_customer_search_sort_order'] = this.request.post['report_customer_search_sort_order'];
		} else {
			data['report_customer_search_sort_order'] = this.config.get('report_customer_search_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/customer_search_form', data));
	}
	
	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/customer_search')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
	
	async report() {
		await this.load.language('extension/report/customer_search');

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

		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		} else {
			filter_keyword = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
		} else {
			filter_ip = '';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		this.load.model('extension/report/customer');
		this.load.model('catalog/category',this);

		data['searches'] = {};

		filter_data = array(
			'filter_date_start' : filter_date_start,
			'filter_date_end'   : filter_date_end,
			'filter_keyword'    : filter_keyword,
			'filter_customer'   : filter_customer,
			'filter_ip'         : filter_ip,
			'start'             : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'             : Number(this.config.get('config_limit_admin'))
		});

		search_total = await this.model_extension_report_customer.getTotalCustomerSearches(filter_data);

		results = await this.model_extension_report_customer.getCustomerSearches(filter_data);

		for (let result of results) {
			category_info = await this.model_catalog_category.getCategory(result['category_id']);

			if (category_info) {
				category = (category_info['path']) ? category_info['path'] + ' &gt; ' + category_info['name'] : category_info['name'];
			} else {
				category = '';
			}

			if (result['customer_id'] > 0) {
				customer = sprintf(this.language.get('text_customer'), await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'], true), result['customer']);
			} else {
				customer = this.language.get('text_guest');
			}

			data['searches'].push({
				'keyword'     : result['keyword'],
				'products'    : result['products'],
				'category'    : category,
				'customer'    : customer,
				'ip'          : result['ip'],
				'date_added'  : date(this.language.get('datetime_format'), strtotime(result['date_added']))
			});
		}

		data['user_token'] = this.session.data['user_token'];

		url = '';

		if ((this.request.get['filter_date_start'])) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(this.request.get['filter_keyword']);
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(this.request.get['filter_customer']);
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		pagination = new Pagination();
		pagination.total = search_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=customer_search' + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (search_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (search_total - Number(this.config.get('config_limit_admin')))) ? search_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), search_total, Math.ceil(search_total / Number(this.config.get('config_limit_admin'))));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_keyword'] = filter_keyword;
		data['filter_customer'] = filter_customer;
		data['filter_ip'] = filter_ip;

		return await this.load.view('extension/report/customer_search_info', data);
	}
}
