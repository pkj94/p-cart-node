const strtotime = require("locutus/php/datetime/strtotime");
const nl2br = require("locutus/php/strings/nl2br");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class CustomerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		let filter_name = '';
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}
		let filter_email = '';
		if ((this.request.get['filter_email'])) {
			filter_email = this.request.get['filter_email'];
		}
		let filter_customer_group_id = '';
		if ((this.request.get['filter_customer_group_id'])) {
			filter_customer_group_id = this.request.get['filter_customer_group_id'];
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
		}
		let filter_ip = '';
		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
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

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
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
			'href': await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('customer/customer.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['filter_name'] = filter_name;
		data['filter_email'] = filter_email;
		data['filter_customer_group_id'] = filter_customer_group_id;
		data['filter_status'] = filter_status;
		data['filter_ip'] = filter_ip;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('customer/customer');

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
		let filter_email = '';
		if ((this.request.get['filter_email'])) {
			filter_email = this.request.get['filter_email'];
		}
		let filter_customer_group_id = '';
		if ((this.request.get['filter_customer_group_id'])) {
			filter_customer_group_id = this.request.get['filter_customer_group_id'];
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
		}
		let filter_ip = '';
		if ((this.request.get['filter_ip'])) {
			filter_ip = this.request.get['filter_ip'];
		}
		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}
		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}
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

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
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

		data['action'] = await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + url);

		this.load.model('setting/store', this);

		let stores = await this.model_setting_store.getStores();

		data['customers'] = [];

		let filter_data = {
			'filter_name': filter_name,
			'filter_email': filter_email,
			'filter_customer_group_id': filter_customer_group_id,
			'filter_status': filter_status,
			'filter_ip': filter_ip,
			'filter_date_from': filter_date_from,
			'filter_date_to': filter_date_to,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('customer/customer', this);

		const customer_total = await this.model_customer_customer.getTotalCustomers(filter_data);

		const results = await this.model_customer_customer.getCustomers(filter_data);

		for (let result of results) {
			const login_info = await this.model_customer_customer.getTotalLoginAttempts(result['email']);
			let unlock = '';
			if (login_info && login_info['total'] >= this.config.get('config_login_attempts')) {
				unlock = await this.url.link('customer/customer.unlock', 'user_token=' + this.session.data['user_token'] + '&email=' + result['email'] + url);
			}

			let store_data = [];

			store_data.push({
				'store_id': 0,
				'name': this.config.get('config_name'),
				'href': await this.url.link('customer/customer.login', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + '&store_id=0')
			});

			for (let store of stores) {
				store_data.push({
					'store_id': store['store_id'],
					'name': store['name'],
					'href': await this.url.link('customer/customer.login', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + '&store_id=' + store['store_id'])
				});
			}

			data['customers'].push({
				'customer_id': result['customer_id'],
				'name': result['name'],
				'email': result['email'],
				'store_id': result['store_id'],
				'customer_group': result['customer_group'],
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'unlock': unlock,
				'store': store_data,
				'edit': await this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + url)
			});
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
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

		data['sort_name'] = await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_email'] = await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + '&sort=c.email' + url);
		data['sort_customer_group'] = await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + '&sort=customer_group' + url);
		data['sort_status'] = await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + '&sort=c.status' + url);
		data['sort_date_added'] = await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + '&sort=c.date_added' + url);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
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
			'total': customer_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('customer/customer.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (customer_total - this.config.get('config_pagination_admin'))) ? customer_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), customer_total, Math.ceil(customer_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('customer/customer_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('customer/customer');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['customer_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), this.config.get('config_file_max_size'));

		data['config_file_max_size'] = (this.config.get('config_file_max_size') * 1024 * 1024);
		data['config_telephone_required'] = this.config.get('config_telephone_required');

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_email'])) {
			url += '&filter_email=' + encodeURIComponent(html_entity_decode(this.request.get['filter_email']));
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
			'href': await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('customer/customer.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + url);
		data['upload'] = await this.url.link('tool/upload.upload', 'user_token=' + this.session.data['user_token']);

		if ((this.request.get['customer_id'])) {
			data['orders'] = await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'] + '&filter_customer_id=' + this.request.get['customer_id']);
		} else {
			data['orders'] = '';
		}
		let customer_info;
		if ((this.request.get['customer_id'])) {
			this.load.model('customer/customer', this);

			customer_info = await this.model_customer_customer.getCustomer(this.request.get['customer_id']);
		}

		if ((this.request.get['customer_id'])) {
			data['customer_id'] = this.request.get['customer_id'];
		} else {
			data['customer_id'] = 0;
		}

		data['stores'] = [];

		data['stores'].push({
			'store_id': 0,
			'name': this.language.get('text_default')
		});

		this.load.model('setting/store', this);

		let stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id': store['store_id'],
				'name': store['name']
			});
		}

		if ((customer_info)) {
			data['store_id'] = customer_info['store_id'];
		} else {
			data['store_id'] = [0];
		}

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((customer_info)) {
			data['customer_group_id'] = customer_info['customer_group_id'];
		} else {
			data['customer_group_id'] = this.config.get('config_customer_group_id');
		}

		if ((customer_info)) {
			data['firstname'] = customer_info['firstname'];
		} else {
			data['firstname'] = '';
		}

		if ((customer_info)) {
			data['lastname'] = customer_info['lastname'];
		} else {
			data['lastname'] = '';
		}

		if ((customer_info)) {
			data['email'] = customer_info['email'];
		} else {
			data['email'] = '';
		}

		if ((customer_info)) {
			data['telephone'] = customer_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		// Custom Fields
		this.load.model('customer/custom_field', this);

		data['custom_fields'] = [];

		let filter_data = {
			'sort': 'cf.sort_order',
			'order': 'ASC'
		};

		const custom_fields = await this.model_customer_custom_field.getCustomFields(filter_data);

		for (let custom_field of custom_fields) {
			if (custom_field['status']) {
				data['custom_fields'].push({
					'custom_field_id': custom_field['custom_field_id'],
					'custom_field_value': this.model_customer_custom_field.getValues(custom_field['custom_field_id']),
					'name': custom_field['name'],
					'value': custom_field['value'],
					'type': custom_field['type'],
					'location': custom_field['location'],
					'sort_order': custom_field['sort_order']
				});
			}
		}

		if ((customer_info)) {
			data['account_custom_field'] = JSON.parse(customer_info['custom_field'], true);
		} else {
			data['account_custom_field'] = [];
		}

		data['password'] = '';
		data['confirm'] = '';

		if ((customer_info)) {
			data['newsletter'] = customer_info['newsletter'];
		} else {
			data['newsletter'] = 0;
		}

		if ((customer_info)) {
			data['status'] = customer_info['status'];
		} else {
			data['status'] = 1;
		}

		if ((customer_info)) {
			data['safe'] = customer_info['safe'];
		} else {
			data['safe'] = 0;
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((this.request.get['customer_id'])) {
			data['addresses'] = await this.model_customer_customer.getAddresses(this.request.get['customer_id']);
		} else {
			data['addresses'] = [];
		}

		data['history'] = await this.getHistory();
		data['transaction'] = await this.getTransaction();
		data['reward'] = await this.getReward();
		data['ip'] = await this.getIp();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('customer/customer');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['firstname']) < 1) || (oc_strlen(this.request.post['firstname']) > 32)) {
			json['error']['firstname'] = this.language.get('error_firstname');
		}

		if ((oc_strlen(this.request.post['lastname']) < 1) || (oc_strlen(this.request.post['lastname']) > 32)) {
			json['error']['lastname'] = this.language.get('error_lastname');
		}

		if ((oc_strlen(this.request.post['email']) > 96) || !isEmailValid(this.request.post['email'])) {
			json['error']['email'] = this.language.get('error_email');
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomerByEmail(this.request.post['email']);

		if (!this.request.post['customer_id']) {
			if (customer_info.customer_id) {
				json['error']['warning'] = this.language.get('error_exists');
			}
		} else {
			if (customer_info.customer_id && (this.request.post['customer_id'] != customer_info['customer_id'])) {
				json['error']['warning'] = this.language.get('error_exists');
			}
		}

		if (this.config.get('config_telephone_required') && (oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
			json['error']['telephone'] = this.language.get('error_telephone');
		}

		// Custom field validation
		this.load.model('customer/custom_field', this);

		const custom_fields = await this.model_customer_custom_field.getCustomFields({ 'filter_customer_group_id': this.request.post['customer_group_id'] });

		for (let custom_field of custom_fields) {
			if (custom_field['status']) {
				if ((custom_field['location'] == 'account') && custom_field['required'] && !(this.request.post['custom_field'][custom_field['custom_field_id']])) {
					json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
				} else if ((custom_field['location'] == 'account') && (custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
					json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
				}
			}
		}

		if (this.request.post['password'] || (!(this.request.post['customer_id']))) {
			if ((oc_strlen(html_entity_decode(this.request.post['password'])) < 4) || (oc_strlen(html_entity_decode(this.request.post['password'])) > 40)) {
				json['error']['password'] = this.language.get('error_password');
			}

			if (this.request.post['password'] != this.request.post['confirm']) {
				json['error']['confirm'] = this.language.get('error_confirm');
			}
		}
		if ((this.request.post['address'].length)) {
			for (let [key, value] of Object.entries(this.request.post['address'])) {
				if ((oc_strlen(value['firstname']) < 1) || (oc_strlen(value['firstname']) > 32)) {
					json['error']['address_' + key + '_firstname'] = this.language.get('error_firstname');
				}

				if ((oc_strlen(value['lastname']) < 1) || (oc_strlen(value['lastname']) > 32)) {
					json['error']['address_' + key + '_lastname'] = this.language.get('error_lastname');
				}

				if ((oc_strlen(value['address_1']) < 3) || (oc_strlen(value['address_1']) > 128)) {
					json['error']['address_' + key + '_address_1'] = this.language.get('error_address_1');
				}

				if ((oc_strlen(value['city']) < 2) || (oc_strlen(value['city']) > 128)) {
					json['error']['address_' + key + '_city'] = this.language.get('error_city');
				}

				if (!(value['country_id']) || value['country_id'] == '') {
					json['error']['address_' + key + '_country'] = this.language.get('error_country');
				} else {

					this.load.model('localisation/country', this);

					const country_info = await this.model_localisation_country.getCountry(value['country_id']);

					if (country_info && country_info['postcode_required'] && (oc_strlen(value['postcode']) < 2 || oc_strlen(value['postcode']) > 10)) {
						json['error']['address_' + key + '_postcode'] = this.language.get('error_postcode');
					}
				}

				if (!(value['zone_id']) || value['zone_id'] == '') {
					json['error']['address_' + key + '_zone'] = this.language.get('error_zone');
				}

				for (let custom_field of custom_fields) {
					if (custom_field['status']) {
						if ((custom_field['location'] == 'address') && custom_field['required'] && !(value['custom_field'][custom_field['custom_field_id']])) {
							json['error']['address_' + key + '_custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
						} else if ((custom_field['location'] == 'address') && (custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), value['custom_field'][custom_field['custom_field_id']])) {
							json['error']['address_' + key + '_custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
						}
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json.error).length) {
			this.request.post['customer_id'] = Number(this.request.post['customer_id']);
			if (!this.request.post['customer_id']) {
				json['customer_id'] = await this.model_customer_customer.addCustomer(this.request.post);
			} else {
				await this.model_customer_customer.editCustomer(this.request.post['customer_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async unlock() {
		await this.load.language('customer/customer');

		const json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!(this.request.get['email'])) {
			json['error'] = this.language.get('error_email');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			await this.model_customer_customer.deleteAuthorizeAttempts(this.request.get['email']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('customer/customer');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			for (let customer_id of selected) {
				await this.model_customer_customer.deleteCustomer(customer_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return object|Action|null
	 */
	async login() {
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (customer_info.customer_id) {
			// Create token to login with
			let token = oc_token(64);

			await this.model_customer_customer.editToken(customer_id, token);
			let store_id = 0;
			if ((this.request.get['store_id'])) {
				store_id = this.request.get['store_id'];
			}

			this.load.model('setting/store', this);

			const store_info = await this.model_setting_store.getStore(store_id);

			if (store_info && store_info.store_id) {
				this.response.setRedirect(store_info['url'] + 'account/login.token&email=' + encodeURIComponent(customer_info['email']) + '&login_token=' + token);
			} else {
				this.response.setRedirect(HTTP_CATALOG + 'account/login.token&email=' + encodeURIComponent(customer_info['email']) + '&login_token=' + token);
			}

			return null;
		} else {
			return new Action('error/not_found');
		}
	}

	/**
	 * @return void
	 */
	async payment() {
		await this.load.language('customer/customer');

		// this.response.setOutput(await this.getPayment());
	}

	/**
	 * @return string
	 */
	async getPayment() {
		const data = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'customer/customer.payment') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['payment_methods'] = [];

		this.load.model('customer/customer', this);

		const results = await this.model_customer_customer.getPaymentMethods(customer_id, (page - 1) * limit, limit);

		for (let result of results) {
			let image = '';
			if ((result['image'])) {
				image = DIR_IMAGE + 'payment/' + result['image'];
			}

			data['payment_methods'].push({
				'customer_payment_id': result['customer_payment_id'],
				'name': result['name'],
				'image': image,
				'type': result['type'],
				'status': result['status'],
				'date_expire': date(this.language.get('date_format_short'), new Date(result['date_expire'])),
				'delete': await this.url.link('customer/customer.deletePayment', 'user_token=' + this.session.data['user_token'] + '&customer_payment_id=' + result['customer_payment_id'])
			});
		}

		const payment_total = await this.model_customer_customer.getTotalPaymentMethods(customer_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': payment_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('customer/customer.payment', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (payment_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (payment_total - limit)) ? payment_total : (((page - 1) * limit) + limit), payment_total, Math.ceil(payment_total / limit));

		return await this.load.view('customer/customer_payment', data);
	}

	/**
	 * @return void
	 */
	async deletePayment() {
		await this.load.language('customer/customer');

		const json = {};
		let customer_payment_id = 0;
		if ((this.request.get['customer_payment_id'])) {
			customer_payment_id = this.request.get['customer_payment_id'];
		}

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			await this.model_customer_customer.deletePaymentMethod(customer_payment_id);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async history() {
		await this.load.language('customer/customer');

		this.response.setOutput(await this.getHistory());
	}

	/**
	 * @return string
	 */
	async getHistory() {
		const data = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'customer/customer.history') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['histories'] = [];

		this.load.model('customer/customer', this);

		const results = await this.model_customer_customer.getHistories(customer_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['histories'].push({
				'comment': nl2br(result['comment']),
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		const history_total = await this.model_customer_customer.getTotalHistories(customer_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': history_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('customer/customer.history', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (history_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (history_total - limit)) ? history_total : (((page - 1) * limit) + limit), history_total, Math.ceil(history_total / limit));

		return await this.load.view('customer/customer_history', data);
	}

	/**
	 * @return void
	 */
	async addHistory() {
		await this.load.language('customer/customer');

		const json = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			await this.model_customer_customer.addHistory(customer_id, this.request.post['comment']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async transaction() {
		await this.load.language('customer/customer');

		this.response.setOutput(await this.getTransaction());
	}

	/**
	 * @return string
	 */
	async getTransaction() {
		const data = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'customer/customer.transaction') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['transactions'] = [];

		this.load.model('customer/customer', this);

		const results = await this.model_customer_customer.getTransactions(customer_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['transactions'].push({
				'amount': this.currency.format(result['amount'], this.config.get('config_currency')),
				'description': result['description'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		data['balance'] = this.currency.format(await this.model_customer_customer.getTransactionTotal(customer_id), this.config.get('config_currency'));

		const transaction_total = await this.model_customer_customer.getTotalTransactions(customer_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': transaction_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('customer/customer.transaction', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (transaction_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (transaction_total - limit)) ? transaction_total : (((page - 1) * limit) + limit), transaction_total, Math.ceil(transaction_total / limit));

		return await this.load.view('customer/customer_transaction', data);
	}

	/**
	 * @return void
	 */
	async addTransaction() {
		await this.load.language('customer/customer');

		const json = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (!customer_info) {
			json['error'] = this.language.get('error_customer');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			await this.model_customer_customer.addTransaction(customer_id, this.request.post['description'], this.request.post['amount']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async reward() {
		await this.load.language('customer/customer');

		this.response.setOutput(await this.getReward());
	}

	/**
	 * @return string
	 */
	async getReward() {
		const data = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'customer/customer.reward') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['rewards'] = [];

		this.load.model('customer/customer', this);

		const results = await this.model_customer_customer.getRewards(customer_id, (page - 1) * limit, limit);

		for (let result of results) {
			data['rewards'].push({
				'points': result['points'],
				'description': result['description'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added']))
			});
		}

		data['balance'] = await this.model_customer_customer.getRewardTotal(customer_id);

		const reward_total = await this.model_customer_customer.getTotalRewards(customer_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': reward_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('customer/customer.reward', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (reward_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (reward_total - limit)) ? reward_total : (((page - 1) * limit) + limit), reward_total, Math.ceil(reward_total / limit));

		return await this.load.view('customer/customer_reward', data);
	}

	/**
	 * @return void
	 */
	async addReward() {
		await this.load.language('customer/customer');

		const json = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}

		if (!await this.user.hasPermission('modify', 'customer/customer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(customer_id);

		if (!customer_info) {
			json['error'] = this.language.get('error_customer');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			await this.model_customer_customer.addReward(customer_id, this.request.post['description'], this.request.post['points']);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async ip() {
		await this.load.language('customer/customer');

		this.response.setOutput(await this.getIp());
	}

	/**
	 * @return string
	 */
	async getIp() {
		const data = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'customer/customer.ip') {
			page = Number(this.request.get['page']);
		}
		let limit = 10;

		data['ips'] = [];

		this.load.model('customer/customer', this);
		this.load.model('setting/store', this);

		const results = await this.model_customer_customer.getIps(customer_id, (page - 1) * limit, limit);

		for (let result of results) {
			const store_info = await this.model_setting_store.getStore(result['store_id']);
			let store = '';
			if (store_info && store_info.store_id) {
				store = store_info['name'];
			} else if (!result['store_id']) {
				store = this.config.get('config_name');
			} else {
				store = '';
			}

			data['ips'].push({
				'ip': result['ip'],
				'account': this.model_customer_customer.getTotalCustomersByIp(result['ip']),
				'store': store,
				'country': result['country'],
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added'])),
				'filter_ip': await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'] + '&filter_ip=' + result['ip'])
			});
		}

		const ip_total = await this.model_customer_customer.getTotalIps(customer_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': ip_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('customer/customer.ip', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (ip_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (ip_total - limit)) ? ip_total : (((page - 1) * limit) + limit), ip_total, Math.ceil(ip_total / limit));

		return await this.load.view('customer/customer_ip', data);
	}

	/**
	 * @return void
	 */
	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name']) || (this.request.get['filter_email'])) {
			let filter_name = '';
			if ((this.request.get['filter_name'])) {
				filter_name = this.request.get['filter_name'];
			}
			let filter_email = '';
			if ((this.request.get['filter_email'])) {
				filter_email = this.request.get['filter_email'];
			}

			let filter_data = {
				'filter_name': filter_name,
				'filter_email': filter_email,
				'start': 0,
				'limit': 5
			};

			this.load.model('customer/customer', this);

			const results = await this.model_customer_customer.getCustomers(filter_data);

			for (let result of results) {
				json.push({
					'customer_id': result['customer_id'],
					'customer_group_id': result['customer_group_id'],
					'name': strip_tags(html_entity_decode(result['name'])),
					'customer_group': result['customer_group'],
					'firstname': result['firstname'],
					'lastname': result['lastname'],
					'email': result['email'],
					'telephone': result['telephone'],
					'custom_field': JSON.parse(result['custom_field'], true),
					'address': this.model_customer_customer.getAddresses(result['customer_id'])
				});
			}
		}

		let sort_order = [];

		for (let [key, value] of Object.entries(json)) {
			sort_order[key] = value['name'];
		}

		// json = multiSort(json, sort_order, 'ASC');
		json = json.sort((a, b) => a.name - b.name)

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async address() {
		await this.load.language('customer/customer');

		const json = {};
		let address_id = 0;
		if ((this.request.get['address_id'])) {
			address_id = this.request.get['address_id'];
		}

		this.load.model('customer/customer', this);

		const address_info = await this.model_customer_customer.getAddress(address_id);

		if (!address_info.address_id) {
			json['error'] = this.language.get('error_address');
		}

		if (!Object.keys(json).length) {
			json = address_info;
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async customfield() {
		const json = [];

		// Customer Group
		let customer_group_id = this.config.get('config_customer_group_id');
		if ((this.request.get['customer_group_id'])) {
			customer_group_id = this.request.get['customer_group_id'];
		}
		this.load.model('customer/custom_field', this);

		const custom_fields = await this.model_customer_custom_field.getCustomFields({ 'filter_customer_group_id': customer_group_id });

		for (let custom_field of custom_fields) {
			json.push({
				'custom_field_id': custom_field['custom_field_id'],
				'required': !(custom_field['required']) || custom_field['required'] == 0 ? false : true
			});
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
