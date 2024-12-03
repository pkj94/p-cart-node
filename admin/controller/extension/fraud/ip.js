module.exports = class ControllerExtensionFraudIp extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/fraud/ip');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('fraud_ip', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=fraud', true));
		}

		data['user_token'] = this.session.data['user_token'];

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
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=fraud', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/fraud/ip', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/fraud/ip', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=fraud', true);

		if ((this.request.post['fraud_ip_order_status_id'])) {
			data['fraud_ip_order_status_id'] = this.request.post['fraud_ip_order_status_id'];
		} else {
			data['fraud_ip_order_status_id'] = this.config.get('fraud_ip_order_status_id');
		}

		this.load.model('localisation/order_status', this);

		data['order_statuses'] = await this.model_localisation_order_status.getOrderStatuses();

		if ((this.request.post['fraud_ip_status'])) {
			data['fraud_ip_status'] = this.request.post['fraud_ip_status'];
		} else {
			data['fraud_ip_status'] = this.config.get('fraud_ip_status');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/fraud/ip', data));
	}

	async install() {
		this.load.model('extension/fraud/ip', this);

		await this.model_extension_fraud_ip.install();
	}

	async uninstall() {
		this.load.model('extension/fraud/ip', this);

		await this.model_extension_fraud_ip.uninstall();
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/fraud/ip')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async ip() {
		const data = {};
		await this.load.language('extension/fraud/ip');

		this.load.model('extension/fraud/ip', this);
		this.load.model('customer/customer', this);
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		data['ips'] = [];

		const results = await this.model_extension_fraud_ip.getIps((page - 1) * 10, 10);

		for (let result of results) {
			data['ips'].push({
				'ip': result['ip'],
				'total': await this.model_customer_customer.getTotalCustomersByIp(result['ip']),
				'date_added': date('d/m/y', new Date(result['date_added'])),
				'filter_ip': await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&filter_ip=' + result['ip'], true)
			});
		}

		const ip_total = await this.model_extension_fraud_ip.getTotalIps();

		const pagination = new Pagination();
		pagination.total = ip_total;
		pagination.page = page;
		pagination.limit = 10;
		pagination.url = await this.url.link('extension/fraud/ip/ip', 'user_token=' + this.session.data['user_token'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (ip_total) ? ((page - 1) * 10) + 1 : 0, (((page - 1) * 10) > (ip_total - 10)) ? ip_total : (((page - 1) * 10) + 10), ip_total, Math.ceil(ip_total / 10));

		this.response.setOutput(await this.load.view('extension/fraud/ip_ip', data));
	}

	async addip() {
		await this.load.language('extension/fraud/ip');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/fraud/ip')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/fraud/ip', this);

			if (!await this.model_extension_fraud_ip.getTotalIpsByIp(this.request.post['ip'])) {
				await this.model_extension_fraud_ip.addIp(this.request.post['ip']);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async removeip() {
		await this.load.language('extension/fraud/ip');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/fraud/ip')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/fraud/ip', this);

			await this.model_extension_fraud_ip.removeIp(this.request.post['ip']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
