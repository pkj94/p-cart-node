const sprintf = require("locutus/php/strings/sprintf");

module.exports = class SaleCouponReportController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/report/sale_coupon');

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
			'href': this + url + link('extension/opencart/report/sale_coupon', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this + url + link('extension/opencart/report/sale_coupon.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this + url + link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_sale_coupon_status'] = this.config.get('report_sale_coupon_status');
		data['report_sale_coupon_sort_order'] = this.config.get('report_sale_coupon_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/sale_coupon_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/sale_coupon');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/report/sale_coupon')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_sale_coupon', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/sale_coupon');

		const data = {
			list: await this.getReport()
		}

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/sale_coupon', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/sale_coupon');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		const data = {};
		let filter_date_start = '';
		if (this.request.get['filter_date_start']) {
			filter_date_start = this.request.get['filter_date_start'];
		}

		let filter_date_end = '';
		if (this.request.get['filter_date_end']) {
			filter_date_end = this.request.get['filter_date_end'];
		}

		let page = 1;
		if (this.request.get['page']) {
			page = this.request.get['page'];
		}

		data['coupons'] = [];

		const filter_data = {
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'start': (page - 1) * this.config.get('config_pagination'),
			'limit': this.config.get('config_pagination')
		};

		this.load.model('extension/opencart/report/coupon', this);

		const coupon_total = await this.model_extension_opencart_report_coupon.getTotalCoupons(filter_data);

		const results = await this.model_extension_opencart_report_coupon.getCoupons(filter_data);

		for (let result of results) {
			data['coupons'].push({
				'name': result['name'],
				'code': result['code'],
				'orders': result['orders'],
				'total': this.currency.format(result['total'], this.config.get('config_currency')),
				'edit': this + url + link('marketing/coupon.edit', 'user_token=' + this.session.data['user_token'] + '&coupon_id=' + result['coupon_id'])
			});
		}

		let url = '';

		if (this.request.get['filter_date_start']) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if (this.request.get['filter_date_end']) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': coupon_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': this + url + link('extension/opencart/report/sale_coupon.report', 'user_token=' + this.session.data['user_token'] + '&code=sale_coupon' + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (coupon_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (coupon_total - this.config.get('config_pagination'))) ? coupon_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), coupon_total, Math.ceil(coupon_total / this.config.get('config_pagination')));

		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('extension/opencart/report/sale_coupon_list', data);
	}
}
