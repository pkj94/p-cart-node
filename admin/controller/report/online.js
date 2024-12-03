module.exports = class ControllerReportOnline extends Controller {
	async index() {
const data = {};
		await this.load.language('report/online');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
		} else {
			filter_ip = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}
page = 1;
if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}
		
		url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}
			
		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('report/online', 'user_token=' + this.session.data['user_token'], true)
		});
		
		data['refresh'] = await this.url.link('report/online', 'user_token=' + this.session.data['user_token'] + url, true);

		this.load.model('report/online');
		this.load.model('customer/customer',this);		

		data['customers'] = [];

		const filter_data = {
			'filter_ip'       : filter_ip,
			'filter_customer' : filter_customer,
			'start'           : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'           : Number(this.config.get('config_limit_admin'))
		});

		const customer_total = await this.model_report_online.getTotalOnline(filter_data);

		results = await this.model_report_online.getOnline(filter_data);

		for (let result of results) {
			customer_info = await this.model_customer_customer.getCustomer(result['customer_id']);

			if (customer_info) {
				customer = customer_info['firstname'] + ' ' + customer_info['lastname'];
			} else {
				customer = this.language.get('text_guest');
			}

			data['customers'].push({
				'customer_id' : result['customer_id'],
				'ip'          : result['ip'],
				'customer'    : customer,
				'url'         : result['url'],
				'referer'     : result['referer'],
				'date_added'  : date(this.language.get('datetime_format'), strtotime(result['date_added'])),
				'edit'        : await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'], true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(this.request.get['filter_customer']);
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		const pagination = new Pagination();
		pagination.total = customer_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('report/online', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (customer_total - Number(this.config.get('config_limit_admin')))) ? customer_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), customer_total, Math.ceil(customer_total / Number(this.config.get('config_limit_admin'))));

		data['filter_customer'] = filter_customer;
		data['filter_ip'] = filter_ip;
		
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		
		this.response.setOutput(await this.load.view('report/online', data));
	}
}