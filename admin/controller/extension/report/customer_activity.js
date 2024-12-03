const str_replace = require("locutus/php/strings/str_replace");
const vsprintf = require("locutus/php/strings/vsprintf");

module.exports = class ControllerExtensionReportCustomerActivity extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/report/customer_activity');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_customer_activity', this.request.post);

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
			'href': await this.url.link('extension/report/customer_activity', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/report/customer_activity', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_customer_activity_status'])) {
			data['report_customer_activity_status'] = this.request.post['report_customer_activity_status'];
		} else {
			data['report_customer_activity_status'] = this.config.get('report_customer_activity_status');
		}

		if ((this.request.post['report_customer_activity_sort_order'])) {
			data['report_customer_activity_sort_order'] = this.request.post['report_customer_activity_sort_order'];
		} else {
			data['report_customer_activity_sort_order'] = this.config.get('report_customer_activity_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/customer_activity_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/customer_activity')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async report() {
		const data = {};
		await this.load.language('extension/report/customer_activity');
		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_ip = '';
		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
		}
		let filter_date_start = '';
		if ((this.request.get['filter_date_start'])) {
			filter_date_start = this.request.get['filter_date_start'];
		}
		let filter_date_end = '';
		if ((this.request.get['filter_date_end'])) {
			filter_date_end = this.request.get['filter_date_end'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		this.load.model('extension/report/customer',this);

		data['activities'] = {};

		let filter_data = {
			'filter_customer': filter_customer,
			'filter_ip': filter_ip,
			'filter_date_start': filter_date_start,
			'filter_date_end': filter_date_end,
			'start': (page - 1) * 20,
			'limit': 20
		};

		const activity_total = await this.model_extension_report_customer.getTotalCustomerActivities(filter_data);

		const results = await this.model_extension_report_customer.getCustomerActivities(filter_data);

		for (let result of results) {
			let comment = vsprintf(this.language.get('text_activity_' + result['key']), JSON.parse(result['data']));

			let find = [
				'customer_id=',
				'order_id='
			];

			let replace = [
				await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=', true),
				await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=', true)
			];

			data['activities'].push({
				'comment': str_replace(find, replace, comment),
				'ip': result['ip'],
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added']))
			});
		}

		data['user_token'] = this.session.data['user_token'];

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(this.request.get['filter_customer']);
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if ((this.request.get['filter_date_start'])) {
			url += '&filter_date_start=' + this.request.get['filter_date_start'];
		}

		if ((this.request.get['filter_date_end'])) {
			url += '&filter_date_end=' + this.request.get['filter_date_end'];
		}

		const pagination = new Pagination();
		pagination.total = activity_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=customer_activity' + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (activity_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (activity_total - Number(this.config.get('config_limit_admin')))) ? activity_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), activity_total, Math.ceil(activity_total / Number(this.config.get('config_limit_admin'))));

		data['filter_customer'] = filter_customer;
		data['filter_ip'] = filter_ip;
		data['filter_date_start'] = filter_date_start;
		data['filter_date_end'] = filter_date_end;

		return await this.load.view('extension/report/customer_activity_info', data);
	}
}