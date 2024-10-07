const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ProductPurchasedReportController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/report/product_purchased');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this + url + link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this + url + link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this + url + link('extension/opencart/report/product_purchased', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this + url + link('extension/opencart/report/product_purchased.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this + url + link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_product_purchased_status'] = this.config.get('report_product_purchased_status');
		data['report_product_purchased_sort_order'] = this.config.get('report_product_purchased_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/product_purchased_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/product_purchased');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/product_purchased')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_product_purchased', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/product_purchased');

		const data = {
			list: await this.getReport()
		}

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/product_purchased', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/product_purchased');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		let filter_date_start = '';
		if (this.request.get['filter_date_start']) {
			filter_date_start = this.request.get['filter_date_start'];
		}

		let filter_date_end = '';
		if (this.request.get['filter_date_end']) {
			filter_date_end = this.request.get['filter_date_end'];
		}
		let filter_order_status_id = 0;
		if (this.request.get['filter_order_status_id']) {
			filter_order_status_id = this.request.get['filter_order_status_id'];
		}

		let page = 1;
		if (this.request.get['page']) {
			page = this.request.get['page'];
		}

		const data = {
			products: []
		};

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'filter_order_status_id': filter_order_status_id,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/product_purchased', this);

		const product_total = await this.model_extension_opencart_report_product_purchased.getTotalPurchased(filter_data);

		const results = await this.model_extension_opencart_report_product_purchased.getPurchased(filter_data);

		for (let result of results) {
			data['products'].push({
				'name': result['name'],
				'model': result['model'],
				'quantity': result['quantity'],
				'total': this.currency.format(result['total'], this.config.get('config_currency'))
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		if (this.request.get['filter_order_status_id']) {
			url += '&filter_order_status_id=' + this.request.get['filter_order_status_id'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': product_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': this + url + link('extension/opencart/report/product_purchased.report', 'user_token=' + this.session.data['user_token'] + '&code=product_purchased' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (product_total - this.config.get('config_pagination'))) ? product_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), product_total, Math.ceil(product_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;
		data['filter_order_status_id'] = filter_order_status_id;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/product_purchased_list', data);
	}
}
