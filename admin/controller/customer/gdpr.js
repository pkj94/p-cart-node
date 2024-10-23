const strtotime = require("locutus/php/datetime/strtotime");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class GdprController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('customer/gdpr');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('customer/gdpr', 'user_token=' + this.session.data['user_token'])
		});

		data['text_info'] = sprintf(this.language.get('text_info'), this.config.get('config_gdpr_limit'));

		data['approve'] = await this.url.link('customer/gdpr.approve', 'user_token=' + this.session.data['user_token'], true);
		data['deny'] = await this.url.link('customer/gdpr.deny', 'user_token=' + this.session.data['user_token'], true);
		data['delete'] = await this.url.link('customer/gdpr.delete', 'user_token=' + this.session.data['user_token'], true);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/gdpr', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('customer/gdpr');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		await this.load.language('customer/gdpr');
		let filter_email = '';
		if ((this.request.get['filter_email'])) {
			filter_email = this.request.get['filter_email'];
		}
		let filter_action = '';
		if ((this.request.get['filter_action'])) {
			filter_action = this.request.get['filter_action'];
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
		}
		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}
		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_action'])) {
			url += '&filter_action=' + this.request.get['filter_action'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		data['action'] = await this.url.link('customer/gdpr.list', 'user_token=' + this.session.data['user_token'] + url, true);

		data['gdprs'] = [];

		let filter_data = {
			'filter_email': filter_email,
			'filter_action': filter_action,
			'filter_status': filter_status,
			'filter_date_from': filter_date_from,
			'filter_date_to': filter_date_to,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('customer/gdpr', this);
		this.load.model('customer/customer', this);

		const gdpr_total = await this.model_customer_gdpr.getTotalGdprs(filter_data);

		const results = await this.model_customer_gdpr.getGdprs(filter_data);

		for (let result of results) {
			const customer_info = await this.model_customer_customer.getCustomerByEmail(result['email']);
			let edit = '';
			if (customer_info.customer_id) {
				edit = await this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_info['customer_id'], true);
			}

			data['gdprs'].push({
				'gdpr_id': result['gdpr_id'],
				'email': result['email'],
				'action': this.language.get('text_' + result['action']),
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'approve': await this.url.link('customer/gdpr.approve', 'user_token=' + this.session.data['user_token'] + '&gdpr_id=' + result['gdpr_id'], true),
				'deny': await this.url.link('customer/gdpr.deny', 'user_token=' + this.session.data['user_token'] + '&gdpr_id=' + result['gdpr_id'], true),
				'edit': edit,
				'delete': await this.url.link('customer/gdpr.delete', 'user_token=' + this.session.data['user_token'] + '&gdpr_id=' + result['gdpr_id'], true)
			});
		}

		url = '';

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_action'])) {
			url += '&filter_action=' + this.request.get['filter_action'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': gdpr_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('customer/gdpr.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (gdpr_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (gdpr_total - this.config.get('config_pagination_admin'))) ? gdpr_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), gdpr_total, Math.ceil(gdpr_total / this.config.get('config_pagination_admin')));

		return await this.load.view('customer/gdpr_list', data);
	}

	/*
	 *  Action Statuses
	 *
	 *	EXPORT
	 *
	 *  unverified = 0
	 *	pending    = 1
	 *	complete   = 3
	 *
	 *	REMOVE
	 *
	 *  unverified = 0
	 *	pending    = 1
	 *	processing = 2
	 *	delete     = 3
	 *
	 *	DENY
	 *
	 *  unverified = 0
	 *	pending    = 1
	 *	processing = 2
	 *	denied     = -1
	*/
	/**
	 * @return void
	 */
	async approve() {
		await this.load.language('customer/gdpr');

		const json = {};

		if (!await this.user.hasPermission('modify', 'customer/gdpr')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			let gdprs = [];

			if ((this.request.post['selected'])) {
				gdprs = this.request.post['selected'];
			}

			if ((this.request.get['gdpr_id'])) {
				gdprs.push(this.request.get['gdpr_id']);
			}

			this.load.model('customer/gdpr', this);
			gdprs = Array.isArray(gdprs) ? gdprs : [gdprs];
			for (let gdpr_id of gdprs) {
				const gdpr_info = await this.model_customer_gdpr.getGdpr(gdpr_id);

				if (gdpr_info.gdpr_id) {
					// If we remove we want to change the status to processing
					// to give time for store owners to process orders and refunds.
					if (gdpr_info['action'] == 'export') {
						await this.model_customer_gdpr.editStatus(gdpr_id, 3);
					} else {
						await this.model_customer_gdpr.editStatus(gdpr_id, 2);
					}
				}
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async deny() {
		await this.load.language('customer/gdpr');

		const json = {};

		if (!await this.user.hasPermission('modify', 'customer/gdpr')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			let gdprs = [];

			if ((this.request.post['selected'])) {
				gdprs = this.request.post['selected'];
			}

			if ((this.request.get['gdpr_id'])) {
				gdprs.push(this.request.get['gdpr_id']);
			}

			this.load.model('customer/gdpr', this);
			gdprs = Array.isArray(gdprs) ? gdprs : [gdprs];
			for (let gdpr_id of gdprs) {
				await this.model_customer_gdpr.editStatus(gdpr_id, -1);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('customer/gdpr');

		const json = {};

		if (!await this.user.hasPermission('modify', 'customer/gdpr')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			let gdprs = [];

			if ((this.request.post['selected'])) {
				gdprs = this.request.post['selected'];
			}

			if ((this.request.get['gdpr_id'])) {
				gdprs.push(this.request.get['gdpr_id']);
			}

			this.load.model('customer/gdpr', this);
			gdprs = Array.isArray(gdprs) ? gdprs : [gdprs];
			for (let gdpr_id of gdprs) {
				await this.model_customer_gdpr.deleteGdpr(gdpr_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}