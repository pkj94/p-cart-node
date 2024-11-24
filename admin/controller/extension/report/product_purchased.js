module.exports = class ControllerExtensionReportProductPurchased extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/report/product_purchased');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_product_purchased', this.request.post);

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
			'href' : await this.url.link('extension/report/product_purchased', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/report/product_purchased', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_product_purchased_status'])) {
			data['report_product_purchased_status'] = this.request.post['report_product_purchased_status'];
		} else {
			data['report_product_purchased_status'] = this.config.get('report_product_purchased_status');
		}

		if ((this.request.post['report_product_purchased_sort_order'])) {
			data['report_product_purchased_sort_order'] = this.request.post['report_product_purchased_sort_order'];
		} else {
			data['report_product_purchased_sort_order'] = this.config.get('report_product_purchased_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/product_purchased_form', data));
	}
	
	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/product_purchased')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
		
	async report() {
		await this.load.language('extension/report/product_purchased');

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

		if ((this.request.get['filter_order_status_id'])) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		} else {
			filter_order_status_id = 0;
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		this.load.model('extension/report/product');

		data['products'] = {};

		filter_data = array(
			'filter_date_start'	     : filter_date_start,
			'filter_date_end'	     : filter_date_end,
			'filter_order_status_id' : filter_order_status_id,
			'start'                  : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'                  : Number(this.config.get('config_limit_admin'))
		});

		product_total = await this.model_extension_report_product.getTotalPurchased(filter_data);

		results = await this.model_extension_report_product.getPurchased(filter_data);

		for (let result of results) {
			data['products'].push({
				'name'     : result['name'],
				'model'    : result['model'],
				'quantity' : result['quantity'],
				'total'    : this.currency.format(result['total'], this.config.get('config_currency'))
			});
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/order_status');

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		url = '';

		if ((this.request.get['filter_date_start'])) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if ((this.request.get['filter_order_status_id'])) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		pagination = new Pagination();
		pagination.total = product_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=product_purchased' + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (product_total - Number(this.config.get('config_limit_admin')))) ? product_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), product_total, Math.ceil(product_total / Number(this.config.get('config_limit_admin'))));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_order_status_id'] = filter_order_status_id;

		return await this.load.view('extension/report/product_purchased_info', data);
	}
}