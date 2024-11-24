module.exports = class ControllerSaleReturn extends Controller {
	error = {};

	async index() {
		await this.load.language('sale/return');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/return');

		await this.getList();
	}

	async add() {
		await this.load.language('sale/return');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/return');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_sale_return.addReturn(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['filter_date_modified'])) {
				url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

			this.response.setRedirect(await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('sale/return');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/return');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_sale_return.editReturn(this.request.get['return_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['filter_date_modified'])) {
				url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

			this.response.setRedirect(await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('sale/return');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/return');

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of return_id) {
				await this.model_sale_return.deleteReturn(return_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

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

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['filter_date_modified'])) {
				url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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

			this.response.setRedirect(await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

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

		if ((this.request.get['filter_model'])) {
			filter_model = this.request.get['filter_model'];
		} else {
			filter_model = '';
		}

		if ((this.request.get['filter_return_status_id'])) {
			filter_return_status_id = this.request.get['filter_return_status_id'];
		} else {
			filter_return_status_id = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
		}

		if ((this.request.get['filter_date_modified'])) {
			filter_date_modified = this.request.get['filter_date_modified'];
		} else {
			filter_date_modified = '';
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

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		url = '';

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

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('sale/return/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('sale/return/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['returns'] = {};

		filter_data = array(
			'filter_return_id'        : filter_return_id,
			'filter_order_id'         : filter_order_id,
			'filter_customer'         : filter_customer,
			'filter_product'          : filter_product,
			'filter_model'            : filter_model,
			'filter_return_status_id' : filter_return_status_id,
			'filter_date_added'       : filter_date_added,
			'filter_date_modified'    : filter_date_modified,
			'sort'                    : sort,
			'order'                   : order,
			'start'                   : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'                   : Number(this.config.get('config_limit_admin'))
		});

		return_total = await this.model_sale_return.getTotalReturns(filter_data);

		results = await this.model_sale_return.getReturns(filter_data);

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
				'edit'          : await this.url.link('sale/return/edit', 'user_token=' + this.session.data['user_token'] + '&return_id=' + result['return_id'] + url, true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.session.data['error'])) {
			data['error_warning'] = this.session.data['error'];

			delete this.session.data['error']);
		} else if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
		}

		url = '';

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

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_return_id'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=r.return_id' + url, true);
		data['sort_order_id'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=r.order_id' + url, true);
		data['sort_customer'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=customer' + url, true);
		data['sort_product'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=r.product' + url, true);
		data['sort_model'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=r.model' + url, true);
		data['sort_status'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);
		data['sort_date_added'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=r.date_added' + url, true);
		data['sort_date_modified'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + '&sort=r.date_modified' + url, true);

		url = '';

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

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = return_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (return_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (return_total - Number(this.config.get('config_limit_admin')))) ? return_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), return_total, Math.ceil(return_total / Number(this.config.get('config_limit_admin'))));

		data['filter_return_id'] = filter_return_id;
		data['filter_order_id'] = filter_order_id;
		data['filter_customer'] = filter_customer;
		data['filter_product'] = filter_product;
		data['filter_model'] = filter_model;
		data['filter_return_status_id'] = filter_return_status_id;
		data['filter_date_added'] = filter_date_added;
		data['filter_date_modified'] = filter_date_modified;

		this.load.model('localisation/return_status');

		data['return_statuses'] = await this.model_localisation_return_status.getReturnStatuses();

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/return_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['return_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['return_id'])) {
			data['return_id'] = this.request.get['return_id'];
		} else {
			data['return_id'] = 0;
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['order_id'])) {
			data['error_order_id'] = this.error['order_id'];
		} else {
			data['error_order_id'] = '';
		}

		if ((this.error['firstname'])) {
			data['error_firstname'] = this.error['firstname'];
		} else {
			data['error_firstname'] = '';
		}

		if ((this.error['lastname'])) {
			data['error_lastname'] = this.error['lastname'];
		} else {
			data['error_lastname'] = '';
		}

		if ((this.error['email'])) {
			data['error_email'] = this.error['email'];
		} else {
			data['error_email'] = '';
		}

		if ((this.error['telephone'])) {
			data['error_telephone'] = this.error['telephone'];
		} else {
			data['error_telephone'] = '';
		}

		if ((this.error['product'])) {
			data['error_product'] = this.error['product'];
		} else {
			data['error_product'] = '';
		}

		if ((this.error['model'])) {
			data['error_model'] = this.error['model'];
		} else {
			data['error_model'] = '';
		}

		url = '';

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

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['filter_date_modified'])) {
			url += '&filter_date_modified=' + this.request.get['filter_date_modified'];
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
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['return_id'])) {
			data['action'] = await this.url.link('sale/return/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('sale/return/edit', 'user_token=' + this.session.data['user_token'] + '&return_id=' + this.request.get['return_id'] + url, true);
		}

		data['cancel'] = await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['return_id']) && (this.request.server['method'] != 'POST')) {
			return_info = await this.model_sale_return.getReturn(this.request.get['return_id']);
		}

		if ((this.request.post['order_id'])) {
			data['order_id'] = this.request.post['order_id'];
		} else if ((return_info)) {
			data['order_id'] = return_info['order_id'];
		} else {
			data['order_id'] = '';
		}

		if ((this.request.post['date_ordered'])) {
			data['date_ordered'] = this.request.post['date_ordered'];
		} else if ((return_info)) {
			data['date_ordered'] = (return_info['date_ordered'] != '0000-00-00' ? return_info['date_ordered'] : '');
		} else {
			data['date_ordered'] = '';
		}

		if ((this.request.post['customer'])) {
			data['customer'] = this.request.post['customer'];
		} else if ((return_info)) {
			data['customer'] = return_info['customer'];
		} else {
			data['customer'] = '';
		}

		if ((this.request.post['customer_id'])) {
			data['customer_id'] = this.request.post['customer_id'];
		} else if ((return_info)) {
			data['customer_id'] = return_info['customer_id'];
		} else {
			data['customer_id'] = '';
		}

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((return_info)) {
			data['firstname'] = return_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((return_info)) {
			data['lastname'] = return_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else if ((return_info)) {
			data['email'] = return_info['email'];
		} else {
			data['email'] = '';
		}

		if ((this.request.post['telephone'])) {
			data['telephone'] = this.request.post['telephone'];
		} else if ((return_info)) {
			data['telephone'] = return_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((this.request.post['product'])) {
			data['product'] = this.request.post['product'];
		} else if ((return_info)) {
			data['product'] = return_info['product'];
		} else {
			data['product'] = '';
		}

		if ((this.request.post['product_id'])) {
			data['product_id'] = this.request.post['product_id'];
		} else if ((return_info)) {
			data['product_id'] = return_info['product_id'];
		} else {
			data['product_id'] = '';
		}

		if ((this.request.post['model'])) {
			data['model'] = this.request.post['model'];
		} else if ((return_info)) {
			data['model'] = return_info['model'];
		} else {
			data['model'] = '';
		}

		if ((this.request.post['quantity'])) {
			data['quantity'] = this.request.post['quantity'];
		} else if ((return_info)) {
			data['quantity'] = return_info['quantity'];
		} else {
			data['quantity'] = '';
		}

		if ((this.request.post['opened'])) {
			data['opened'] = this.request.post['opened'];
		} else if ((return_info)) {
			data['opened'] = return_info['opened'];
		} else {
			data['opened'] = '';
		}

		if ((this.request.post['return_reason_id'])) {
			data['return_reason_id'] = this.request.post['return_reason_id'];
		} else if ((return_info)) {
			data['return_reason_id'] = return_info['return_reason_id'];
		} else {
			data['return_reason_id'] = '';
		}

		this.load.model('localisation/return_reason');

		data['return_reasons'] = await this.model_localisation_return_reason.getReturnReasons();

		if ((this.request.post['return_action_id'])) {
			data['return_action_id'] = this.request.post['return_action_id'];
		} else if ((return_info)) {
			data['return_action_id'] = return_info['return_action_id'];
		} else {
			data['return_action_id'] = '';
		}

		this.load.model('localisation/return_action');

		data['return_actions'] = await this.model_localisation_return_action.getReturnActions();

		if ((this.request.post['comment'])) {
			data['comment'] = this.request.post['comment'];
		} else if ((return_info)) {
			data['comment'] = return_info['comment'];
		} else {
			data['comment'] = '';
		}

		if ((this.request.post['return_status_id'])) {
			data['return_status_id'] = this.request.post['return_status_id'];
		} else if ((return_info)) {
			data['return_status_id'] = return_info['return_status_id'];
		} else {
			data['return_status_id'] = '';
		}

		this.load.model('localisation/return_status');

		data['return_statuses'] = await this.model_localisation_return_status.getReturnStatuses();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/return_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'sale/return')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (empty(this.request.post['order_id'])) {
			this.error['order_id'] = this.language.get('error_order_id');
		}

		if ((oc_strlen(trim(this.request.post['firstname'])) < 1) || (oc_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(trim(this.request.post['lastname'])) < 1) || (oc_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			this.error['email'] = this.language.get('error_email');
		}

		if ((oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
			this.error['telephone'] = this.language.get('error_telephone');
		}

		if ((oc_strlen(this.request.post['product']) < 1) || (oc_strlen(this.request.post['product']) > 255)) {
			this.error['product'] = this.language.get('error_product');
		}

		if ((oc_strlen(this.request.post['model']) < 1) || (oc_strlen(this.request.post['model']) > 64)) {
			this.error['model'] = this.language.get('error_model');
		}

		if (empty(this.request.post['return_reason_id'])) {
			this.error['reason'] = this.language.get('error_reason');
		}

		if (Object.keys(this.error).length && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'sale/return')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async history() {
		await this.load.language('sale/return');

		this.load.model('sale/return');

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		data['histories'] = {};

		results = await this.model_sale_return.getReturnHistories(this.request.get['return_id'], (page - 1) * 10, 10);

		for (let result of results) {
			data['histories'].push({
				'notify'     : result['notify'] ? this.language.get('text_yes') : this.language.get('text_no'),
				'status'     : result['status'],
				'comment'    : nl2br(result['comment']),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			});
		}

		history_total = await this.model_sale_return.getTotalReturnHistories(this.request.get['return_id']);

		pagination = new Pagination();
		pagination.total = history_total;
		pagination.page = page;
		pagination.limit = 10;
		pagination.url = await this.url.link('sale/return/history', 'user_token=' + this.session.data['user_token'] + '&return_id=' + this.request.get['return_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * 10) + 1 : 0, (((page - 1) * 10) > (history_total - 10)) ? history_total : (((page - 1) * 10) + 10), history_total, Math.ceil(history_total / 10));

		this.response.setOutput(await this.load.view('sale/return_history', data));
	}
	
	async addHistory() {
		await this.load.language('sale/return');

		json = {};

		if (!await this.user.hasPermission('modify', 'sale/return')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('sale/return');

			await this.model_sale_return.addReturnHistory(this.request.get['return_id'], this.request.post['return_status_id'], this.request.post['comment'], this.request.post['notify']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}	
}