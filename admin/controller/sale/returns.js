module.exports=class ReturnsController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('sale/returns');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_return_id'])) {
			filter_return_id = this.request.get['filter_return_id'];
		} else {
			filter_return_id = '';
		}

		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_product'])) {
			filter_product = this.request.get['filter_product'];
		} else {
			filter_product = '';
		}

		let filter_model = '';
if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		}

		if ((this.request.get['filter_return_status_id'])) {
			filter_return_status_id = this.request.get['filter_return_status_id'];
		} else {
			filter_return_status_id = '';
		}

		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		} else {
			filter_date_from = '';
		}

		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		} else {
			filter_date_to = '';
		}

		let url = '';

		if ((this.request.get['filter_return_id'])) {
			url += '&filter_return_id=' + this.request.get['filter_return_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_return_status_id'])) {
			url += '&filter_return_status_id=' + this.request.get['filter_return_status_id'];
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('sale/returns', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('sale/returns.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('sale/returns.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		this.load.model('localisation/return_status');

		data['return_statuses'] = await this.model_localisation_return_status.getReturnStatuses();

		data['filter_return_id'] = filter_return_id;
		data['filter_order_id'] = filter_order_id;
		data['filter_customer'] = filter_customer;
		data['filter_product'] = filter_product;
		data['filter_model'] = filter_model;
		data['filter_return_status_id'] = filter_return_status_id;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/returns', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('sale/returns');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_return_id'])) {
			filter_return_id = this.request.get['filter_return_id'];
		} else {
			filter_return_id = '';
		}

		if ((this.request.get['filter_order_id'])) {
			filter_order_id = this.request.get['filter_order_id'];
		} else {
			filter_order_id = '';
		}

		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		} else {
			filter_customer = '';
		}

		if ((this.request.get['filter_product'])) {
			filter_product = this.request.get['filter_product'];
		} else {
			filter_product = '';
		}

		let filter_model = '';
if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		}

		if ((this.request.get['filter_return_status_id'])) {
			filter_return_status_id = this.request.get['filter_return_status_id'];
		} else {
			filter_return_status_id = '';
		}

		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		} else {
			filter_date_from = '';
		}

		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		} else {
			filter_date_to = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'r.return_id';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'DESC';
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_return_id'])) {
			url += '&filter_return_id=' + this.request.get['filter_return_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_return_status_id'])) {
			url += '&filter_return_status_id=' + this.request.get['filter_return_status_id'];
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

		data['action'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + url);

		data['returns'] = [];

		let filter_data = {
			'filter_return_id'        : filter_return_id,
			'filter_order_id'         : filter_order_id,
			'filter_customer'         : filter_customer,
			'filter_product'          : filter_product,
			'filter_model'            : filter_model,
			'filter_return_status_id' : filter_return_status_id,
			'filter_date_from'        : filter_date_from,
			'filter_date_to'          : filter_date_to,
			'sort'                    : sort,
			'order'                   : order,
			'start'                   : (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit'                   : this.config.get('config_pagination_admin')
		});

		this.load.model('sale/returns');

		return_total await this.model_sale_returns.getTotalReturns(filter_data);

		const results = await this.model_sale_returns.getReturns(filter_data);

		for (let result of results) {
			data['returns'].push({
				'return_id'     : result['return_id'],
				'order_id'      : result['order_id'],
				'customer'      : result['customer'],
				'product'       : result['product'],
				'model'         : result['model'],
				'return_status' : result['return_status'],
				'date_added'    : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified' : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit'          : this.url.link('sale/returns.form', 'user_token=' + this.session.data['user_token'] + '&return_id=' + result['return_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['filter_return_id'])) {
			url += '&filter_return_id=' + this.request.get['filter_return_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_return_status_id'])) {
			url += '&filter_return_status_id=' + this.request.get['filter_return_status_id'];
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

		data['sort_return_id'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.return_id' + url);
		data['sort_order_id'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.order_id' + url);
		data['sort_customer'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url);
		data['sort_product'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.product' + url);
		data['sort_model'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.model' + url);
		data['sort_status'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=return_status' + url);
		data['sort_date_added'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.date_added' + url);
		data['sort_date_modified'] = this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.date_modified' + url);

		let url = '';

		if ((this.request.get['filter_return_id'])) {
			url += '&filter_return_id=' + this.request.get['filter_return_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_return_status_id'])) {
			url += '&filter_return_status_id=' + this.request.get['filter_return_status_id'];
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
			'total' : return_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('sale/returns.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (return_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (return_total - this.config.get('config_pagination_admin'))) ? return_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), return_total, Math.ceil(return_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('sale/returns_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('sale/returns');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['return_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_return_id'])) {
			url += '&filter_return_id=' + this.request.get['filter_return_id'];
		}

		if ((this.request.get['filter_order_id'])) {
			url += '&filter_order_id=' + this.request.get['filter_order_id'];
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_model'])) {
			url += '&filter_model=' + encodeURIComponent(html_entity_decode(this.request.get['filter_model']));
		}

		if ((this.request.get['filter_return_status_id'])) {
			url += '&filter_return_status_id=' + this.request.get['filter_return_status_id'];
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('sale/returns', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('sale/returns.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('sale/returns', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['return_id'])) {
			this.load.model('sale/returns');

			return_info await this.model_sale_returns.getReturn(this.request.get['return_id']);
		}

		if ((this.request.get['return_id'])) {
			data['return_id'] = this.request.get['return_id'];
		} else {
			data['return_id'] = 0;
		}

		if ((return_info)) {
			data['order_id'] = return_info['order_id'];
		} else {
			data['order_id'] = '';
		}

		if ((return_info)) {
			data['date_ordered'] = (return_info['date_ordered'] != '0000-00-00' ? return_info['date_ordered'] : '');
		} else {
			data['date_ordered'] = '';
		}

		if ((return_info)) {
			data['customer'] = return_info['customer'];
		} else {
			data['customer'] = '';
		}

		if ((return_info)) {
			data['customer_id'] = return_info['customer_id'];
		} else {
			data['customer_id'] = '';
		}

		if ((return_info)) {
			data['firstname'] = return_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((return_info)) {
			data['lastname'] = return_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((return_info)) {
			data['email'] = return_info['email'];
		} else {
			data['email'] = '';
		}

		if ((return_info)) {
			data['telephone'] = return_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((return_info)) {
			data['product'] = return_info['product'];
		} else {
			data['product'] = '';
		}

		if ((return_info)) {
			data['product_id'] = return_info['product_id'];
		} else {
			data['product_id'] = '';
		}

		if ((return_info)) {
			data['model'] = return_info['model'];
		} else {
			data['model'] = '';
		}

		if ((return_info)) {
			data['quantity'] = return_info['quantity'];
		} else {
			data['quantity'] = '';
		}

		if ((return_info)) {
			data['opened'] = return_info['opened'];
		} else {
			data['opened'] = '';
		}

		this.load.model('localisation/return_reason');

		data['return_reasons'] = await this.model_localisation_return_reason.getReturnReasons();

		if ((return_info)) {
			data['return_reason_id'] = return_info['return_reason_id'];
		} else {
			data['return_reason_id'] = 0;
		}

		this.load.model('localisation/return_action');

		data['return_actions'] = await this.model_localisation_return_action.getReturnActions();

		if ((return_info)) {
			data['return_action_id'] = return_info['return_action_id'];
		} else {
			data['return_action_id'] = 0;
		}

		if ((return_info)) {
			data['comment'] = return_info['comment'];
		} else {
			data['comment'] = '';
		}

		this.load.model('localisation/return_status');

		data['return_statuses'] = await this.model_localisation_return_status.getReturnStatuses();

		if ((return_info)) {
			data['return_status_id'] = return_info['return_status_id'];
		} else {
			data['return_status_id'] = '';
		}

		data['history'] = this.getHistory();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/returns_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('sale/returns');

		const json = {};

		if (!await this.user.hasPermission('modify', 'sale/returns')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if (!(this.request.post['order_id'])) {
			json['error']['order_id'] = this.language.get('error_order_id');
		}

		if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
			json['error']['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
			json['error']['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			json['error']['email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
			json['error']['telephone'] = this.language.get('error_telephone');
		}

		if ((oc_strlen(this.request.post['product']) < 1) || (oc_strlen(this.request.post['product']) > 255)) {
			json['error']['product'] = this.language.get('error_product');
		}

		if ((oc_strlen(this.request.post['model']) < 1) || (oc_strlen(this.request.post['model']) > 64)) {
			json['error']['model'] = this.language.get('error_model');
		}

		if (!(this.request.post['return_reason_id'])) {
			json['error']['reason'] = this.language.get('error_reason');
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			this.load.model('sale/returns');

			if (!this.request.post['return_id']) {
				json['return_id'] = await this.model_sale_returns.addReturn(this.request.post);
			} else {
				await this.model_sale_returns.editReturn(this.request.post['return_id'], this.request.post);
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
		await this.load.language('sale/returns');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'sale/returns')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('sale/returns');

			for (let return_id of selected) {
				await this.model_sale_returns.deleteReturn(return_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('sale/returns');

		this.response.setOutput(this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		if ((this.request.get['return_id'])) {
			return_id = this.request.get['return_id'];
		} else {
			return_id = 0;
		}

		if ((this.request.get['page']) && this.request.get['route'] == 'sale/returns.history') {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('sale/returns');

		const results = await this.model_sale_returns.getHistories(return_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'notify'     : result['notify'] ? this.language.get('text_yes') : this.language.get('text_no'),
				'status'     : result['status'],
				'comment'    : nl2br(result['comment']),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			];
		}

		const history_total = await this.model_sale_returns.getTotalHistories(return_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : history_total,
			'page'  : page,
			'limit' : limit,
			'url'   : this.url.link('sale/returns.history', 'user_token=' + this.session.data['user_token'] + '&return_id=' + return_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		return await this.load.view('sale/returns_history', data);
	}

	/**
	 * @return void
	 */
	async addHistory() {
		await this.load.language('sale/returns');

		const json = {};

		if ((this.request.get['return_id'])) {
			return_id = this.request.get['return_id'];
		} else {
			return_id = 0;
		}

		if (!await this.user.hasPermission('modify', 'sale/returns')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/returns');

		return_info await this.model_sale_returns.getReturn(return_id);

		if (!return_info) {
			json['error'] = this.language.get('error_return');
		}

		if (!Object.keys(json).length) {
			await this.model_sale_returns.addHistory(return_id, this.request.post['return_status_id'], this.request.post['comment'], this.request.post['notify']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
