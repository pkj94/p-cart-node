const sprintf = require("locutus/php/strings/sprintf");

module.exports = class OrderStatusController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('localisation/order_status');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

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
			'href': await this.url.link('localisation/order_status', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('localisation/order_status.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('localisation/order_status.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/order_status', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/order_status');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'name';
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

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = await this.url.link('localisation/order_status.list', 'user_token=' + this.session.data['user_token'] + url);

		data['order_statuses'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('localisation/order_status', this);

		const order_status_total = await this.model_localisation_order_status.getTotalOrderStatuses();

		const results = await this.model_localisation_order_status.getOrderStatuses(filter_data);

		for (let result of results) {
			data['order_statuses'].push({
				'order_status_id': result['order_status_id'],
				'name': result['name'] + ((result['order_status_id'] == this.config.get('config_order_status_id')) ? this.language.get('text_default') : ''),
				'edit': await this.url.link('localisation/order_status.form', 'user_token=' + this.session.data['user_token'] + '&order_status_id=' + result['order_status_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('localisation/order_status.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': order_status_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('localisation/order_status.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (order_status_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (order_status_total - this.config.get('config_pagination_admin'))) ? order_status_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), order_status_total, Math.ceil(order_status_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/order_status_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('localisation/order_status');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['order_status_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

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
			'href': await this.url.link('localisation/order_status', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('localisation/order_status.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('localisation/order_status', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['order_status_id'])) {
			data['order_status_id'] = this.request.get['order_status_id'];
		} else {
			data['order_status_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['order_status_id'])) {
			this.load.model('localisation/order_status', this);

			data['order_status'] = await this.model_localisation_order_status.getDescriptions(this.request.get['order_status_id']);
		} else {
			data['order_status'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/order_status_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/order_status');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'localisation/order_status')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['order_status'])) {
			language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (!Object.keys(json.error).length) {
			this.load.model('localisation/order_status', this);
			this.request.post['order_status_id'] = Number(this.request.post['order_status_id']);
			if (!this.request.post['order_status_id']) {
				json['order_status_id'] = await this.model_localisation_order_status.addOrderStatus(this.request.post);
			} else {
				await this.model_localisation_order_status.editOrderStatus(this.request.post['order_status_id'], this.request.post);
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
		await this.load.language('localisation/order_status');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/order_status')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store', this);
		this.load.model('sale/order', this);

		for (let order_status_id of selected) {
			if (this.config.get('config_order_status_id') == order_status_id) {
				json['error'] = this.language.get('error_default');
			}

			let order_total = await this.model_sale_order.getTotalOrdersByOrderStatusId(order_status_id);

			if (order_total) {
				json['error'] = sprintf(this.language.get('error_order'), order_total);
			}

			order_total = await this.model_sale_order.getTotalHistoriesByOrderStatusId(order_status_id);

			if (order_total) {
				json['error'] = sprintf(this.language.get('error_order'), order_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/order_status', this);

			for (let order_status_id of selected) {
				await this.model_localisation_order_status.deleteOrderStatus(order_status_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
