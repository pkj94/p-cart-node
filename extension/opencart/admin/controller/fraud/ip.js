const strtotime = require("locutus/php/datetime/strtotime");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class IpFaudController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/fraud/ip');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=fraud')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('extension/opencart/fraud/ip', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/fraud/ip+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=fraud');

		data['fraud_ip_order_status_id'] = this.config.get('fraud_ip_order_status_id');

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		data['fraud_ip_status'] = this.config.get('fraud_ip_status');

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/fraud/ip', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/fraud/ip');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/fraud/ip')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('fraud_ip', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async install() {
		if (await this.user.hasPermission('modify', 'extension/fraud')) {
			this.load.model('extension/opencart/fraud/ip', this);

			await this.model_extension_opencart_fraud_ip.install();
		}
	}

	/**
	 * @return void
	 */
	async uninstall() {
		if (await this.user.hasPermission('modify', 'extension/fraud')) {
			this.load.model('extension/opencart/fraud/ip', this);

			await this.model_extension_opencart_fraud_ip.uninstall();
		}
	}

	/**
	 * @return void
	 */
	async ip() {
		const data = {};
		await this.load.language('extension/opencart/fraud/ip');
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		limit = 10;

		data['ips'] = [];

		this.load.model('extension/opencart/fraud/ip', this);
		this.load.model('customer/customer', this);

		const results = await this.model_extension_opencart_fraud_ip.getIps((page - 1) * limit, limit);

		for (let result of results) {
			data['ips'].push({
				'ip': result['ip'],
				'total': await this.model_customer_customer.getTotalCustomersByIp(result['ip']),
				'date_added': date('d/m/y', new Date(result['date_added'])),
				'filter_ip': this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&filter_ip=' + result['ip'])
			});
		}

		const ip_total = await this.model_extension_opencart_fraud_ip.getTotalIps();

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': ip_total,
			'page': page,
			'limit': limit,
			'url': this.url.link('extension/opencart/fraud/ip+ip', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (ip_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (ip_total - limit)) ? ip_total : (((page - 1) * limit) + limit), ip_total, Math.ceil(ip_total / limit));

		this.response.setOutput(await this.load.view('extension/opencart/fraud/ip_ip', data));
	}

	/**
	 * @return void
	 */
	async addIp() {
		await this.load.language('extension/opencart/fraud/ip');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/fraud/ip')) {
			json['error'] = this.language.get('error_permission');
		}

		if (this.request.post['ip']) {
			json['error'] = this.language.get('error_required');
		} else if (!isValidIP(this.request.post['ip'])) {
			json['error'] = this.language.get('error_invalid');
		}

		if (!json) {
			this.load.model('extension/opencart/fraud/ip', this);

			if (!await this.model_extension_opencart_fraud_ip.getTotalIpsByIp(this.request.post['ip'])) {
				await this.model_extension_opencart_fraud_ip.addIp(this.request.post['ip']);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async removeIp() {
		await this.load.language('extension/opencart/fraud/ip');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/fraud/ip')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('extension/opencart/fraud/ip', this);

			await this.model_extension_opencart_fraud_ip.removeIp(this.request.post['ip']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
