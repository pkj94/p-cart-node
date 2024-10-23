const strtotime = require("locutus/php/datetime/strtotime");
const uniqid = require("locutus/php/misc/uniqid");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class MarketingController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketing/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}
		let filter_code = '';
		if ((this.request.get['filter_code'])) {
			filter_code = this.request.get['filter_code'];
		}

		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}

		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('marketing/marketing.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('marketing/marketing.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['filter_name'] = filter_name;
		data['filter_code'] = filter_code;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/marketing', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketing/marketing');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}
		let filter_code = '';
		if ((this.request.get['filter_code'])) {
			filter_code = this.request.get['filter_code'];
		}

		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}

		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}
		let sort = 'm.name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = await this.url.link('marketing/marketing.list', 'user_token=' + this.session.data['user_token'] + url);

		data['marketings'] = [];

		let filter_data = {
			'filter_name': filter_name,
			'filter_code': filter_code,
			'filter_date_from': filter_date_from,
			'filter_date_to': filter_date_to,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('marketing/marketing', this);

		const marketing_total = await this.model_marketing_marketing.getTotalMarketings(filter_data);

		const results = await this.model_marketing_marketing.getMarketings(filter_data);

		for (let result of results) {
			data['marketings'].push({
				'marketing_id': result['marketing_id'],
				'name': result['name'],
				'code': result['code'],
				'clicks': result['clicks'],
				'orders': result['orders'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'edit': await this.url.link('marketing/marketing.form', 'user_token=' + this.session.data['user_token'] + '&marketing_id=' + result['marketing_id'] + url)
			});
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('marketing/marketing.list', 'user_token=' + this.session.data['user_token'] + '&sort=m.name' + url);
		data['sort_code'] = await this.url.link('marketing/marketing.list', 'user_token=' + this.session.data['user_token'] + '&sort=m.code' + url);
		data['sort_date_added'] = await this.url.link('marketing/marketing.list', 'user_token=' + this.session.data['user_token'] + '&sort=m.date_added' + url);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': marketing_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('marketing/marketing.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (marketing_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (marketing_total - this.config.get('config_pagination_admin'))) ? marketing_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), marketing_total, Math.ceil(marketing_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketing/marketing_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('marketing/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['marketing_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('marketing/marketing.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url);
		let marketing_info;
		if ((this.request.get['marketing_id'])) {
			this.load.model('marketing/marketing', this);

			marketing_info = await this.model_marketing_marketing.getMarketing(this.request.get['marketing_id']);
		}

		if ((this.request.get['marketing_id'])) {
			data['marketing_id'] = this.request.get['marketing_id'];
		} else {
			data['marketing_id'] = 0;
		}

		data['store'] = HTTP_CATALOG;

		if ((marketing_info)) {
			data['name'] = marketing_info['name'];
		} else {
			data['name'] = '';
		}

		if ((marketing_info)) {
			data['description'] = marketing_info['description'];
		} else {
			data['description'] = '';
		}

		if ((marketing_info)) {
			data['code'] = marketing_info['code'];
		} else {
			data['code'] = uniqid();
		}

		data['report'] = await this.getReport();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/marketing_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('marketing/marketing');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'marketing/marketing')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 32)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!this.request.post['code']) {
			json['error']['code'] = this.language.get('error_code');
		}

		this.load.model('marketing/marketing', this);

		const marketing_info = await this.model_marketing_marketing.getMarketingByCode(this.request.post['code']);

		if (marketing_info.marketing_id && (!(this.request.post['marketing_id']) || (this.request.post['marketing_id'] != marketing_info['marketing_id']))) {
			json['error']['code'] = this.language.get('error_exists');
		}

		if (!Object.keys(json.error).length) {
			this.request.post['marketing_id'] = Number(this.request.post['marketing_id']);
			if (!this.request.post['marketing_id']) {
				json['marketing_id'] = await this.model_marketing_marketing.addMarketing(this.request.post);
			} else {
				await this.model_marketing_marketing.editMarketing(this.request.post['marketing_id'], this.request.post);
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
		await this.load.language('marketing/marketing');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'marketing/marketing')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('marketing/marketing', this);

			for (let marketing_id of selected) {
				await this.model_marketing_marketing.deleteMarketing(marketing_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('marketing/marketing');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		const data = {};
		let marketing_id = 0;
		if ((this.request.get['marketing_id'])) {
			marketing_id = this.request.get['marketing_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'marketing/marketing.report') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['reports'] = [];

		this.load.model('marketing/marketing', this);
		this.load.model('customer/customer', this);
		this.load.model('setting/store', this);

		const results = await this.model_marketing_marketing.getReports(marketing_id, (page - 1) * limit, limit);

		for (let result of results) {
			const store_info = await this.model_setting_store.getStore(result['store_id']);
			let store = '';
			if (store_info && store_info.store_id) {
				store = store_info['name'];
			} else if (!result['store_id']) {
				store = this.config.get('config_name');
			}

			data['reports'].push({
				'ip': result['ip'],
				'account': this.model_customer_customer.getTotalCustomersByIp(result['ip']),
				'store': store,
				'country': result['country'],
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added'])),
				'filter_ip': await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&filter_ip=' + result['ip'])
			});
		}

		const report_total = await this.model_marketing_marketing.getTotalReports(marketing_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': report_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('marketing/marketing.report', 'user_token=' + this.session.data['user_token'] + '&marketing_id=' + marketing_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (report_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (report_total - limit)) ? report_total : (((page - 1) * limit) + limit), report_total, Math.ceil(report_total / limit));

		return await this.load.view('marketing/marketing_report', data);
	}
}
