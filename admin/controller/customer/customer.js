module.exports = class ControllerCustomerCustomer extends Controller {
	error = {};

	async index() {
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer',this);

		await this.getList();
	}

	async add() {
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer',this);

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_customer_customer.addCustomer(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_email'])) {
				url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
			}

			if ((this.request.get['filter_customer_group_id'])) {
				url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_ip'])) {
				url += '&filter_ip=' + this.request.get['filter_ip'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer',this);

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_customer_customer.editCustomer(this.request.get['customer_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_email'])) {
				url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
			}

			if ((this.request.get['filter_customer_group_id'])) {
				url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_ip'])) {
				url += '&filter_ip=' + this.request.get['filter_ip'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer',this);

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of customer_id) {
				await this.model_customer_customer.deleteCustomer(customer_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_email'])) {
				url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
			}

			if ((this.request.get['filter_customer_group_id'])) {
				url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_ip'])) {
				url += '&filter_ip=' + this.request.get['filter_ip'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async unlock() {
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer',this);

		if ((this.request.get['email']) && this.validateUnlock()) {
			await this.model_customer_customer.deleteLoginAttempts(this.request.get['email']);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_email'])) {
				url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
			}

			if ((this.request.get['filter_customer_group_id'])) {
				url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_ip'])) {
				url += '&filter_ip=' + this.request.get['filter_ip'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		} else {
			filter_name = '';
		}

		if ((this.request.get['filter_email'])) {
			filter_email = this.request.get['filter_email'];
		} else {
			filter_email = '';
		}

		if ((this.request.get['filter_customer_group_id'])) {
			filter_customer_group_id = this.request.get['filter_customer_group_id'];
		} else {
			filter_customer_group_id = '';
		}

		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		} else {
			filter_status = '';
		}

		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
		} else {
			filter_ip = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_customer_group_id'])) {
			url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('customer/customer/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('customer/customer/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		this.load.model('setting/store',this);

		stores = await this.model_setting_store.getStores();

		data['customers'] = {};

		filter_data = array(
			'filter_name'              : filter_name,
			'filter_email'             : filter_email,
			'filter_customer_group_id' : filter_customer_group_id,
			'filter_status'            : filter_status,
			'filter_date_added'        : filter_date_added,
			'filter_ip'                : filter_ip,
			'sort'                     : sort,
			'order'                    : order,
			'start'                    : (page - 1) * this.config.get('config_limit_admin'),
			'limit'                    : this.config.get('config_limit_admin')
		);

		customer_total = await this.model_customer_customer.getTotalCustomers(filter_data);

		results = await this.model_customer_customer.getCustomers(filter_data);

		for (let result of results) {
			login_info = await this.model_customer_customer.getTotalLoginAttempts(result['email']);

			if (login_info && login_info['total'] >= this.config.get('config_login_attempts')) {
				unlock = await this.url.link('customer/customer/unlock', 'user_token=' + this.session.data['user_token'] + '&email=' + result['email'] + url, true);
			} else {
				unlock = '';
			}

			store_data = {};

			store_data.push({
				'name' : this.config.get('config_name'),
				'href' : await this.url.link('customer/customer/login', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + '&store_id=0', true)
			);

			for (stores of store) {
				store_data.push({
					'name' : store['name'],
					'href' : await this.url.link('customer/customer/login', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + '&store_id=' + store['store_id'], true)
				);
			}

			data['customers'].push({
				'customer_id'    : result['customer_id'],
				'name'           : result['name'],
				'email'          : result['email'],
				'customer_group' : result['customer_group'],
				'status'         : (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'ip'             : result['ip'],
				'date_added'     : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'unlock'         : unlock,
				'store'          : store_data,
				'edit'           : await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + url, true)
			);
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.error['warning'])) {
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
			data['selected'] = {};
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_customer_group_id'])) {
			url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_email'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&sort=c.email' + url, true);
		data['sort_customer_group'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&sort=customer_group' + url, true);
		data['sort_status'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&sort=c.status' + url, true);
		data['sort_ip'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&sort=c.ip' + url, true);
		data['sort_date_added'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&sort=c.date_added' + url, true);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_customer_group_id'])) {
			url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = customer_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (customer_total - this.config.get('config_limit_admin'))) ? customer_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), customer_total, ceil(customer_total / this.config.get('config_limit_admin')));

		data['filter_name'] = filter_name;
		data['filter_email'] = filter_email;
		data['filter_customer_group_id'] = filter_customer_group_id;
		data['filter_status'] = filter_status;
		data['filter_ip'] = filter_ip;
		data['filter_date_added'] = filter_date_added;

		this.load.model('customer/customer_group');

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['customer_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['customer_id'])) {
			data['customer_id'] = this.request.get['customer_id'];
		} else {
			data['customer_id'] = 0;
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
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

		if ((this.error['tracking'])) {
			data['error_tracking'] = this.error['tracking'];
		} else {
			data['error_tracking'] = '';
		}

		if ((this.error['cheque'])) {
			data['error_cheque'] = this.error['cheque'];
		} else {
			data['error_cheque'] = '';
		}

		if ((this.error['paypal'])) {
			data['error_paypal'] = this.error['paypal'];
		} else {
			data['error_paypal'] = '';
		}

		if ((this.error['bank_account_name'])) {
			data['error_bank_account_name'] = this.error['bank_account_name'];
		} else {
			data['error_bank_account_name'] = '';
		}

		if ((this.error['bank_account_number'])) {
			data['error_bank_account_number'] = this.error['bank_account_number'];
		} else {
			data['error_bank_account_number'] = '';
		}

		if ((this.error['password'])) {
			data['error_password'] = this.error['password'];
		} else {
			data['error_password'] = '';
		}

		if ((this.error['confirm'])) {
			data['error_confirm'] = this.error['confirm'];
		} else {
			data['error_confirm'] = '';
		}

		if ((this.error['custom_field'])) {
			data['error_custom_field'] = this.error['custom_field'];
		} else {
			data['error_custom_field'] = {};
		}

		if ((this.error['address'])) {
			data['error_address'] = this.error['address'];
		} else {
			data['error_address'] = {};
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + urlencode(html_entity_decode(this.request.get['filter_email']));
		}

		if ((this.request.get['filter_customer_group_id'])) {
			url += '&filter_customer_group_id=' + this.request.get['filter_customer_group_id'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_ip'])) {
			url += '&filter_ip=' + this.request.get['filter_ip'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['customer_id'])) {
			data['action'] = await this.url.link('customer/customer/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + this.request.get['customer_id'] + url, true);
		}

		data['cancel'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['customer_id']) && (this.request.server['method'] != 'POST')) {
			customer_info = await this.model_customer_customer.getCustomer(this.request.get['customer_id']);
		}

		this.load.model('customer/customer_group');

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((this.request.post['customer_group_id'])) {
			data['customer_group_id'] = this.request.post['customer_group_id'];
		} else if ((customer_info)) {
			data['customer_group_id'] = customer_info['customer_group_id'];
		} else {
			data['customer_group_id'] = this.config.get('config_customer_group_id');
		}

		if ((this.request.post['firstname'])) {
			data['firstname'] = this.request.post['firstname'];
		} else if ((customer_info)) {
			data['firstname'] = customer_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((this.request.post['lastname'])) {
			data['lastname'] = this.request.post['lastname'];
		} else if ((customer_info)) {
			data['lastname'] = customer_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((this.request.post['email'])) {
			data['email'] = this.request.post['email'];
		} else if ((customer_info)) {
			data['email'] = customer_info['email'];
		} else {
			data['email'] = '';
		}

		if ((this.request.post['telephone'])) {
			data['telephone'] = this.request.post['telephone'];
		} else if ((customer_info)) {
			data['telephone'] = customer_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((this.request.post['custom_field'])) {
			data['account_custom_field'] = this.request.post['custom_field'];
		} else if ((customer_info)) {
			data['account_custom_field'] = JSON.parse(customer_info['custom_field'], true);
		} else {
			data['account_custom_field'] = {};
		}

		if ((this.request.post['address'])) {
			data['addresses'] = this.request.post['address'];
		} else if ((this.request.get['customer_id'])) {
			data['addresses'] = await this.model_customer_customer.getAddresses(this.request.get['customer_id']);
		} else {
			data['addresses'] = {};
		}

		// Custom Fields
		this.load.model('customer/custom_field');
		this.load.model('tool/upload');

		data['custom_fields'] = {};

		filter_data = array(
			'sort'  : 'cf.sort_order',
			'order' : 'ASC'
		);

		custom_fields = await this.model_customer_custom_field.getCustomFields(filter_data);

		for (custom_fields of custom_field) {
			data['custom_fields'].push({
				'custom_field_id'    : custom_field['custom_field_id'],
				'custom_field_value' : await this.model_customer_custom_field.getCustomFieldValues(custom_field['custom_field_id']),
				'name'               : custom_field['name'],
				'value'              : custom_field['value'],
				'type'               : custom_field['type'],
				'location'           : custom_field['location'],
				'sort_order'         : custom_field['sort_order']
			);

			if(custom_field['type'] == 'file') {
				if((data['account_custom_field'][custom_field['custom_field_id']])) {
					code = data['account_custom_field'][custom_field['custom_field_id']];

					upload_result = await this.model_tool_upload.getUploadByCode(code);

					data['account_custom_field'][custom_field['custom_field_id']] = {};
					if(upload_result) {
						data['account_custom_field'][custom_field['custom_field_id']]['name'] = upload_result['name'];
						data['account_custom_field'][custom_field['custom_field_id']]['code'] = upload_result['code'];
					} else {
						data['account_custom_field'][custom_field['custom_field_id']]['name'] = "";
						data['account_custom_field'][custom_field['custom_field_id']]['code'] = code;
					}
				}

				for(data['addresses'] of address_id : address) {
					if((address['custom_field'][custom_field['custom_field_id']])) {
						code = address['custom_field'][custom_field['custom_field_id']];

						upload_result = await this.model_tool_upload.getUploadByCode(code);
						
						data['addresses'][address_id]['custom_field'][custom_field['custom_field_id']] = {};
						if(upload_result) {
							data['addresses'][address_id]['custom_field'][custom_field['custom_field_id']]['name'] = upload_result['name'];
							data['addresses'][address_id]['custom_field'][custom_field['custom_field_id']]['code'] = upload_result['code'];
						} else {
							data['addresses'][address_id]['custom_field'][custom_field['custom_field_id']]['name'] = "";
							data['addresses'][address_id]['custom_field'][custom_field['custom_field_id']]['code'] = code;
						}
					}
				}
			}
		}

		if ((this.request.post['newsletter'])) {
			data['newsletter'] = this.request.post['newsletter'];
		} else if ((customer_info)) {
			data['newsletter'] = customer_info['newsletter'];
		} else {
			data['newsletter'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((customer_info)) {
			data['status'] = customer_info['status'];
		} else {
			data['status'] = true;
		}

		if ((this.request.post['safe'])) {
			data['safe'] = this.request.post['safe'];
		} else if ((customer_info)) {
			data['safe'] = customer_info['safe'];
		} else {
			data['safe'] = 0;
		}

		if ((this.request.post['password'])) {
			data['password'] = this.request.post['password'];
		} else {
			data['password'] = '';
		}

		if ((this.request.post['confirm'])) {
			data['confirm'] = this.request.post['confirm'];
		} else {
			data['confirm'] = '';
		}

		this.load.model('localisation/country');

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((this.request.post['address_id'])) {
			data['address_id'] = this.request.post['address_id'];
		} else if ((customer_info)) {
			data['address_id'] = customer_info['address_id'];
		} else {
			data['address_id'] = '';
		}

		// Affliate
		if ((this.request.get['customer_id']) && (this.request.server['method'] != 'POST')) {
			affiliate_info = await this.model_customer_customer.getAffiliate(this.request.get['customer_id']);
		}

		if ((this.request.post['affiliate'])) {
			data['affiliate'] = this.request.post['affiliate'];
		} else if ((affiliate_info)) {
			data['affiliate'] = affiliate_info['status'];
		} else {
			data['affiliate'] = '';
		}

		if ((this.request.post['company'])) {
			data['company'] = this.request.post['company'];
		} else if ((affiliate_info)) {
			data['company'] = affiliate_info['company'];
		} else {
			data['company'] = '';
		}

		if ((this.request.post['website'])) {
			data['website'] = this.request.post['website'];
		} else if ((affiliate_info)) {
			data['website'] = affiliate_info['website'];
		} else {
			data['website'] = '';
		}

		if ((this.request.post['tracking'])) {
			data['tracking'] = this.request.post['tracking'];
		} else if ((affiliate_info)) {
			data['tracking'] = affiliate_info['tracking'];
		} else {
			data['tracking'] = token(10);
		}

		if ((this.request.post['commission'])) {
			data['commission'] = this.request.post['commission'];
		} else if ((affiliate_info)) {
			data['commission'] = affiliate_info['commission'];
		} else {
			data['commission'] = this.config.get('config_affiliate_commission');
		}

		if ((this.request.post['tax'])) {
			data['tax'] = this.request.post['tax'];
		} else if ((affiliate_info)) {
			data['tax'] = affiliate_info['tax'];
		} else {
			data['tax'] = '';
		}

		if ((this.request.post['payment'])) {
			data['payment'] = this.request.post['payment'];
		} else if ((affiliate_info)) {
			data['payment'] = affiliate_info['payment'];
		} else {
			data['payment'] = 'cheque';
		}

		if ((this.request.post['cheque'])) {
			data['cheque'] = this.request.post['cheque'];
		} else if ((affiliate_info)) {
			data['cheque'] = affiliate_info['cheque'];
		} else {
			data['cheque'] = '';
		}

		if ((this.request.post['paypal'])) {
			data['paypal'] = this.request.post['paypal'];
		} else if ((affiliate_info)) {
			data['paypal'] = affiliate_info['paypal'];
		} else {
			data['paypal'] = '';
		}

		if ((this.request.post['bank_name'])) {
			data['bank_name'] = this.request.post['bank_name'];
		} else if ((affiliate_info)) {
			data['bank_name'] = affiliate_info['bank_name'];
		} else {
			data['bank_name'] = '';
		}

		if ((this.request.post['bank_branch_number'])) {
			data['bank_branch_number'] = this.request.post['bank_branch_number'];
		} else if ((affiliate_info)) {
			data['bank_branch_number'] = affiliate_info['bank_branch_number'];
		} else {
			data['bank_branch_number'] = '';
		}

		if ((this.request.post['bank_swift_code'])) {
			data['bank_swift_code'] = this.request.post['bank_swift_code'];
		} else if ((affiliate_info)) {
			data['bank_swift_code'] = affiliate_info['bank_swift_code'];
		} else {
			data['bank_swift_code'] = '';
		}

		if ((this.request.post['bank_account_name'])) {
			data['bank_account_name'] = this.request.post['bank_account_name'];
		} else if ((affiliate_info)) {
			data['bank_account_name'] = affiliate_info['bank_account_name'];
		} else {
			data['bank_account_name'] = '';
		}

		if ((this.request.post['bank_account_number'])) {
			data['bank_account_number'] = this.request.post['bank_account_number'];
		} else if ((affiliate_info)) {
			data['bank_account_number'] = affiliate_info['bank_account_number'];
		} else {
			data['bank_account_number'] = '';
		}

		if ((this.request.post['custom_field'])) {
			data['affiliate_custom_field'] = this.request.post['custom_field'];
		} else if ((affiliate_info)) {
			data['affiliate_custom_field'] = JSON.parse(affiliate_info['custom_field'], true);
		} else {
			data['affiliate_custom_field'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(trim(this.request.post['firstname'])) > 32)) {
			this.error['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(trim(this.request.post['lastname'])) > 32)) {
			this.error['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !filter_var(this.request.post['email'], FILTER_VALIDATE_EMAIL)) {
			this.error['email'] = this.language.get('error_email');
		}

		customer_info = await this.model_customer_customer.getCustomerByEmail(this.request.post['email']);

		if (!(this.request.get['customer_id'])) {
			if (customer_info) {
				this.error['warning'] = this.language.get('error_exists');
			}
		} else {
			if (customer_info && (this.request.get['customer_id'] != customer_info['customer_id'])) {
				this.error['warning'] = this.language.get('error_exists');
			}
		}

		if ((oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
			this.error['telephone'] = this.language.get('error_telephone');
		}

		// Custom field validation
		this.load.model('customer/custom_field');

		custom_fields = await this.model_customer_custom_field.getCustomFields(array('filter_customer_group_id' : this.request.post['customer_group_id']));

		for (custom_fields of custom_field) {
			if ((custom_field['location'] == 'account') && custom_field['required'] && empty(this.request.post['custom_field'][custom_field['custom_field_id']])) {
				this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
			} else if ((custom_field['location'] == 'account') && (custom_field['type'] == 'text') && (custom_field['validation']) && !filter_var(this.request.post['custom_field'][custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' : array('regexp' : custom_field['validation'])))) {
				this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
			}
		}

		if (this.request.post['password'] || (!(this.request.get['customer_id']))) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				this.error['password'] = this.language.get('error_password');
			}

			if (this.request.post['password'] != this.request.post['confirm']) {
				this.error['confirm'] = this.language.get('error_confirm');
			}
		}

		if ((this.request.post['address'])) {
			for (this.request.post['address'] of key : value) {
				if ((oc_strlen(value['firstname']) < 1) || (oc_strlen(value['firstname']) > 32)) {
					this.error['address'][key]['firstname'] = this.language.get('error_firstname');
				}

				if ((oc_strlen(value['lastname']) < 1) || (oc_strlen(value['lastname']) > 32)) {
					this.error['address'][key]['lastname'] = this.language.get('error_lastname');
				}

				if ((oc_strlen(value['address_1']) < 3) || (oc_strlen(value['address_1']) > 128)) {
					this.error['address'][key]['address_1'] = this.language.get('error_address_1');
				}

				if ((oc_strlen(value['city']) < 2) || (oc_strlen(value['city']) > 128)) {
					this.error['address'][key]['city'] = this.language.get('error_city');
				}

				this.load.model('localisation/country');

				country_info = await this.model_localisation_country.getCountry(value['country_id']);

				if (country_info && country_info['postcode_required'] && (oc_strlen(value['postcode']) < 2 || oc_strlen(value['postcode']) > 10)) {
					this.error['address'][key]['postcode'] = this.language.get('error_postcode');
				}

				if (value['country_id'] == '') {
					this.error['address'][key]['country'] = this.language.get('error_country');
				}

				if (!(value['zone_id']) || value['zone_id'] == '') {
					this.error['address'][key]['zone'] = this.language.get('error_zone');
				}

				for (custom_fields of custom_field) {
					if ((custom_field['location'] == 'address') && custom_field['required'] && empty(value['custom_field'][custom_field['custom_field_id']])) {
						this.error['address'][key]['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['location'] == 'address') && (custom_field['type'] == 'text') && (custom_field['validation']) && !filter_var(value['custom_field'][custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' : array('regexp' : custom_field['validation'])))) {
						this.error['address'][key]['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
                    }
				}
			}
		}

		if (this.request.post['affiliate']) {
			if (this.request.post['payment'] == 'cheque') {
				if (this.request.post['cheque'] == '') {
					this.error['cheque'] = this.language.get('error_cheque');
				}
			} else if (this.request.post['payment'] == 'paypal') {
				if ((oc_strlen(this.request.post['paypal']) > 96) || !filter_var(this.request.post['paypal'], FILTER_VALIDATE_EMAIL)) {
					this.error['paypal'] = this.language.get('error_paypal');
				}
			} else if (this.request.post['payment'] == 'bank') {
				if (this.request.post['bank_account_name'] == '') {
					this.error['bank_account_name'] = this.language.get('error_bank_account_name');
				}

				if (this.request.post['bank_account_number'] == '') {
					this.error['bank_account_number'] = this.language.get('error_bank_account_number');
				}
			}

			if (!this.request.post['tracking']) {
				this.error['tracking'] = this.language.get('error_tracking');
			}

			affiliate_info = await this.model_customer_customer.getAffiliateByTracking(this.request.post['tracking']);

			if (!(this.request.get['customer_id'])) {
				if (affiliate_info) {
					this.error['tracking'] = this.language.get('error_tracking_exists');
				}
			} else {
				if (affiliate_info && (this.request.get['customer_id'] != affiliate_info['customer_id'])) {
					this.error['tracking'] = this.language.get('error_tracking_exists');
				}
			}

			for (custom_fields of custom_field) {
				if ((custom_field['location'] == 'affiliate') && custom_field['required'] && empty(this.request.post['custom_field']['affiliate'][custom_field['custom_field_id']])) {
					this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if ((custom_field['location'] == 'affiliate') && (custom_field['type'] == 'text') && (custom_field['validation']) && !filter_var(this.request.post['custom_field']['affiliate'][custom_field['custom_field_id']], FILTER_VALIDATE_REGEXP, array('options' : array('regexp' : custom_field['validation'])))) {
					this.error['custom_field'][custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				}
			}
		}

		if (this.error && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateUnlock() {
		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async login() {
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		} else {
			customer_id = 0;
		}

		this.load.model('customer/customer',this);

		customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info) {
			// Create token to login with
			token = token(64);

			await this.model_customer_customer.editToken(customer_id, token);

			if ((this.request.get['store_id'])) {
				store_id = this.request.get['store_id'];
			} else {
				store_id = 0;
			}

			this.load.model('setting/store',this);

			store_info = await this.model_setting_store.getStore(store_id);

			if (store_info) {
				this.response.setRedirect(store_info['url'] + 'index.php?route=account/login&token=' + token);
			} else {
				this.response.setRedirect(HTTP_CATALOG + 'index.php?route=account/login&token=' + token);
			}
		} else {
			await this.load.language('error/not_found');

			this.document.setTitle(this.language.get('heading_title'));

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_home'),
				'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
			);

			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('error/not_found', 'user_token=' + this.session.data['user_token'], true)
			);

			data['header'] = await this.load.controller('common/header');
			data['column_left'] = await this.load.controller('common/column_left');
			data['footer'] = await this.load.controller('common/footer');

			this.response.setOutput(await this.load.view('error/not_found', data));
		}
	}

	async history() {
		await this.load.language('customer/customer');

		this.load.model('customer/customer',this);

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		limit = this.config.get('config_limit_admin');

		data['histories'] = {};

		results = await this.model_customer_customer.getHistories(this.request.get['customer_id'], (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'comment'    : result['comment'],
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			);
		}

		history_total = await this.model_customer_customer.getTotalHistories(this.request.get['customer_id']);

		pagination = new Pagination();
		pagination.total = history_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('customer/customer/history', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + this.request.get['customer_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, ceil(history_total / limit));

		this.response.setOutput(await this.load.view('customer/customer_history', data));
	}

	async addHistory() {
		await this.load.language('customer/customer');

		json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('customer/customer',this);

			await this.model_customer_customer.addHistory(this.request.get['customer_id'], this.request.post['comment']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async transaction() {
		await this.load.language('customer/customer');

		this.load.model('customer/customer',this);

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		limit = this.config.get('config_limit_admin');

		data['transactions'] = {};

		results = await this.model_customer_customer.getTransactions(this.request.get['customer_id'], (page - 1) * limit, limit);

		for (let result of results) {
			data['transactions'].push({
				'amount'      : this.currency.format(result['amount'], this.config.get('config_currency')),
				'description' : result['description'],
				'date_added'  : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			);
		}

		data['balance'] = this.currency.format(await this.model_customer_customer.getTransactionTotal(this.request.get['customer_id']), this.config.get('config_currency'));

		transaction_total = await this.model_customer_customer.getTotalTransactions(this.request.get['customer_id']);

		pagination = new Pagination();
		pagination.total = transaction_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('customer/customer/transaction', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + this.request.get['customer_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (transaction_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (transaction_total - limit)) ? transaction_total : (((page - 1) * limit) + limit), transaction_total, ceil(transaction_total / limit));

		this.response.setOutput(await this.load.view('customer/customer_transaction', data));
	}

	async addTransaction() {
		await this.load.language('customer/customer');

		json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('customer/customer',this);

			await this.model_customer_customer.addTransaction(this.request.get['customer_id'], this.request.post['description'], this.request.post['amount']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async reward() {
		await this.load.language('customer/customer');

		this.load.model('customer/customer',this);

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		limit = this.config.get('config_limit_admin');

		data['rewards'] = {};

		results = await this.model_customer_customer.getRewards(this.request.get['customer_id'], (page - 1) * limit, limit);

		for (let result of results) {
			data['rewards'].push({
				'points'      : result['points'],
				'description' : result['description'],
				'date_added'  : date(this.language.get('date_format_short'), strtotime(result['date_added']))
			);
		}

		data['balance'] = await this.model_customer_customer.getRewardTotal(this.request.get['customer_id']);

		reward_total = await this.model_customer_customer.getTotalRewards(this.request.get['customer_id']);

		pagination = new Pagination();
		pagination.total = reward_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('customer/customer/reward', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + this.request.get['customer_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (reward_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (reward_total - limit)) ? reward_total : (((page - 1) * limit) + limit), reward_total, ceil(reward_total / limit));

		this.response.setOutput(await this.load.view('customer/customer_reward', data));
	}

	async addReward() {
		await this.load.language('customer/customer');

		json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('customer/customer',this);

			await this.model_customer_customer.addReward(this.request.get['customer_id'], this.request.post['description'], this.request.post['points']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async ip() {
		await this.load.language('customer/customer');

		this.load.model('customer/customer',this);

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		limit = this.config.get('config_limit_admin');

		data['ips'] = {};

		results = await this.model_customer_customer.getIps(this.request.get['customer_id'], (page - 1) * limit, limit);

		for (let result of results) {
			data['ips'].push({
				'ip'         : result['ip'],
				'total'      : await this.model_customer_customer.getTotalCustomersByIp(result['ip']),
				'date_added' : date('d/m/y', strtotime(result['date_added'])),
				'filter_ip'  : await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&filter_ip=' + result['ip'], true)
			);
		}

		ip_total = await this.model_customer_customer.getTotalIps(this.request.get['customer_id']);

		pagination = new Pagination();
		pagination.total = ip_total;
		pagination.page = page;
		pagination.limit = limit;
		pagination.url = await this.url.link('customer/customer/ip', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + this.request.get['customer_id'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (ip_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (ip_total - limit)) ? ip_total : (((page - 1) * limit) + limit), ip_total, ceil(ip_total / limit));

		this.response.setOutput(await this.load.view('customer/customer_ip', data));
	}

	async autocomplete() {
		json = {};

		if ((this.request.get['filter_name']) || (this.request.get['filter_email'])) {
			if ((this.request.get['filter_name'])) {
				filter_name = this.request.get['filter_name'];
			} else {
				filter_name = '';
			}

			if ((this.request.get['filter_email'])) {
				filter_email = this.request.get['filter_email'];
			} else {
				filter_email = '';
			}

			if ((this.request.get['filter_affiliate'])) {
				filter_affiliate = this.request.get['filter_affiliate'];
			} else {
				filter_affiliate = '';
			}

			this.load.model('customer/customer',this);

			filter_data = array(
				'filter_name'      : filter_name,
				'filter_email'     : filter_email,
				'filter_affiliate' : filter_affiliate,
				'start'            : 0,
				'limit'            : 5
			);

			results = await this.model_customer_customer.getCustomers(filter_data);

			for (let result of results) {
				json.push({
					'customer_id'       : result['customer_id'],
					'customer_group_id' : result['customer_group_id'],
					'name'              : strip_tags(html_entity_decode(result['name'])),
					'customer_group'    : result['customer_group'],
					'firstname'         : result['firstname'],
					'lastname'          : result['lastname'],
					'email'             : result['email'],
					'telephone'         : result['telephone'],
					'custom_field'      : JSON.parse(result['custom_field'], true),
					'address'           : await this.model_customer_customer.getAddresses(result['customer_id'])
				);
			}
		}

		sort_order = {};

		for (json of key : value) {
			sort_order[key] = value['name'];
		}

		array_multisort(sort_order, SORT_ASC, json);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async customfield() {
		json = {};

		this.load.model('customer/custom_field');

		// Customer Group
		if ((this.request.get['customer_group_id'])) {
			customer_group_id = this.request.get['customer_group_id'];
		} else {
			customer_group_id = this.config.get('config_customer_group_id');
		}

		custom_fields = await this.model_customer_custom_field.getCustomFields(array('filter_customer_group_id' : customer_group_id));

		for (custom_fields of custom_field) {
			json.push({
				'custom_field_id' : custom_field['custom_field_id'],
				'required'        : empty(custom_field['required']) || custom_field['required'] == 0 ? false : true
			);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async address() {
		json = {};

		if ((this.request.get['address_id'])) {
			this.load.model('customer/customer',this);

			json = await this.model_customer_customer.getAddress(this.request.get['address_id']);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}
}
