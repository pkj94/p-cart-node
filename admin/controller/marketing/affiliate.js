const strtotime = require("locutus/php/datetime/strtotime");
const sprintf = require("locutus/php/strings/sprintf");

module.exports = class AffiliateController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketing/affiliate');

		this.document.setTitle(this.language.get('heading_title'));
		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_tracking = '';
		if ((this.request.get['filter_tracking'])) {
			filter_tracking = this.request.get['filter_tracking'];
		}
		let filter_payment_method = '';
		if ((this.request.get['filter_payment_method'])) {
			filter_payment_method = this.request.get['filter_payment_method'];
		}
		let filter_commission = '';
		if ((this.request.get['filter_commission'])) {
			filter_commission = this.request.get['filter_commission'];
		}
		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}
		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
		}
		let limit = this.config.get('config_pagination');
		if ((this.request.get['limit'])) {
			limit = this.request.get['limit'];
		}

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_tracking'])) {
			url += '&filter_tracking=' + this.request.get['filter_tracking'];
		}

		if ((this.request.get['filter_payment_method'])) {
			url += '&filter_payment_method=' + this.request.get['filter_payment_method'];
		}

		if ((this.request.get['filter_commission'])) {
			url += '&filter_commission=' + this.request.get['filter_commission'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
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

		if ((this.request.get['limit'])) {
			url += '&limit=' + this.request.get['limit'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/affiliate', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['csv'] = await this.url.link('marketing/affiliate.csv', 'user_token=' + this.session.data['user_token']);
		data['complete'] = await this.url.link('marketing/affiliate.complete', 'user_token=' + this.session.data['user_token']);
		data['add'] = await this.url.link('marketing/affiliate.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('marketing/affiliate.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['payment_methods'] = [];

		data['payment_methods'].push({
			'text': this.language.get('text_cheque'),
			'value': 'cheque'
		});

		data['payment_methods'].push({
			'text': this.language.get('text_paypal'),
			'value': 'paypal'
		});

		data['payment_methods'].push({
			'text': this.language.get('text_bank'),
			'value': 'bank'
		});

		data['limits'] = [];

		data['limits'].push({
			'text': this.config.get('config_pagination'),
			'value': this.config.get('config_pagination')
		});

		data['limits'].push({
			'text': 100,
			'value': 100
		});

		data['limits'].push({
			'text': 200,
			'value': 200
		});

		data['limits'].push({
			'text': 400,
			'value': 400
		});

		data['limits'].push({
			'text': 800,
			'value': 800
		});

		data['user_token'] = this.session.data['user_token'];

		data['filter_customer'] = filter_customer;
		data['filter_tracking'] = filter_tracking;
		data['filter_payment_method'] = filter_payment_method;
		data['filter_commission'] = filter_commission;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;
		data['filter_status'] = filter_status;

		data['limit'] = limit;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/affiliate', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketing/affiliate');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_tracking = '';
		if ((this.request.get['filter_tracking'])) {
			filter_tracking = this.request.get['filter_tracking'];
		}
		let filter_payment_method = '';
		if ((this.request.get['filter_payment_method'])) {
			filter_payment_method = this.request.get['filter_payment_method'];
		}
		let filter_commission = '';
		if ((this.request.get['filter_commission'])) {
			filter_commission = this.request.get['filter_commission'];
		}
		let filter_date_from = '';
		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		}
		let filter_date_to = '';
		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
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
		let limit = Number(this.config.get('config_pagination'));
		if ((this.request.get['limit'])) {
			limit = Number(this.request.get['limit']);
		}

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_tracking'])) {
			url += '&filter_tracking=' + this.request.get['filter_tracking'];
		}

		if ((this.request.get['filter_payment_method'])) {
			url += '&filter_payment_method=' + this.request.get['filter_payment_method'];
		}

		if ((this.request.get['filter_commission'])) {
			url += '&filter_commission=' + this.request.get['filter_commission'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
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

		if ((this.request.get['limit'])) {
			url += '&limit=' + this.request.get['limit'];
		}

		data['action'] = await this.url.link('marketing/affiliate.list', 'user_token=' + this.session.data['user_token'] + url);

		data['affiliates'] = [];

		let filter_data = {
			'filter_name': filter_customer,
			'filter_tracking': filter_tracking,
			'filter_payment_method': filter_payment_method,
			'filter_commission': filter_commission,
			'filter_date_from': filter_date_from,
			'filter_date_to': filter_date_to,
			'filter_status': filter_status,
			'sort': sort,
			'order': order,
			'start': (page - 1) * limit,
			'limit': limit
		};

		this.load.model('marketing/affiliate', this);
		this.load.model('customer/customer', this);

		const affiliate_total = await this.model_marketing_affiliate.getTotalAffiliates(filter_data);

		const results = await this.model_marketing_affiliate.getAffiliates(filter_data);

		for (let result of results) {
			data['affiliates'].push({
				'customer_id': result['customer_id'],
				'name': result['name'],
				'tracking': result['tracking'],
				'commission': result['commission'],
				'balance': this.currency.format(result['balance'], this.config.get('config_currency')),
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'customer': await this.url.link('customer/customer.form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id']),
				'edit': await this.url.link('marketing/affiliate.form', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + url)
			});
		}

		url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_tracking'])) {
			url += '&filter_tracking=' + this.request.get['filter_tracking'];
		}

		if ((this.request.get['filter_payment_method'])) {
			url += '&filter_payment_method=' + this.request.get['filter_payment_method'];
		}

		if ((this.request.get['filter_commission'])) {
			url += '&filter_commission=' + this.request.get['filter_commission'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['limit'])) {
			url += '&limit=' + this.request.get['limit'];
		}

		data['sort_name'] = await this.url.link('marketing/affiliate.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_tracking'] = await this.url.link('marketing/affiliate.list', 'user_token=' + this.session.data['user_token'] + '&sort=ca.tracking' + url);
		data['sort_commission'] = await this.url.link('marketing/affiliate.list', 'user_token=' + this.session.data['user_token'] + '&sort=ca.commission' + url);
		data['sort_date_added'] = await this.url.link('marketing/affiliate.list', 'user_token=' + this.session.data['user_token'] + '&sort=ca.date_added' + url);

		url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_tracking'])) {
			url += '&filter_tracking=' + this.request.get['filter_tracking'];
		}

		if ((this.request.get['filter_payment_method'])) {
			url += '&filter_payment_method=' + this.request.get['filter_payment_method'];
		}

		if ((this.request.get['filter_commission'])) {
			url += '&filter_commission=' + this.request.get['filter_commission'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['limit'])) {
			url += '&limit=' + this.request.get['limit'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': affiliate_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('marketing/affiliate.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (affiliate_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (affiliate_total - limit)) ? affiliate_total : (((page - 1) * limit) + limit), affiliate_total, Math.ceil(affiliate_total / limit));

		data['sort'] = sort;
		data['order'] = order;
		data['limit'] = limit;

		return await this.load.view('marketing/affiliate_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('marketing/affiliate');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['customer_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		data['error_upload_size'] = sprintf(this.language.get('error_upload_size'), this.config.get('config_file_max_size'));

		data['config_file_max_size'] = (this.config.get('config_file_max_size') * 1024 * 1024);

		let url = '';

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_tracking'])) {
			url += '&filter_tracking=' + this.request.get['filter_tracking'];
		}

		if ((this.request.get['filter_payment_method'])) {
			url += '&filter_payment_method=' + this.request.get['filter_payment_method'];
		}

		if ((this.request.get['filter_commission'])) {
			url += '&filter_commission=' + this.request.get['filter_commission'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
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

		if ((this.request.get['limit'])) {
			url += '&limit=' + this.request.get['limit'];
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('marketing/affiliate', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('marketing/affiliate.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketing/affiliate', 'user_token=' + this.session.data['user_token'] + url);
		data['upload'] = await this.url.link('tool/upload.upload', 'user_token=' + this.session.data['user_token']);

		// Affiliate
		let affiliate_info;
		if ((this.request.get['customer_id'])) {
			this.load.model('marketing/affiliate', this);

			affiliate_info = await this.model_marketing_affiliate.getAffiliate(this.request.get['customer_id']);
		}

		if ((this.request.get['customer_id'])) {
			data['customer_id'] = this.request.get['customer_id'];
		} else {
			data['customer_id'] = 0;
		}

		if ((affiliate_info)) {
			data['customer'] = affiliate_info['customer'];
		} else {
			data['customer'] = '';
		}

		if ((affiliate_info)) {
			data['customer_group_id'] = affiliate_info['customer_group_id'];
		} else {
			data['customer_group_id'] = '';
		}

		if ((affiliate_info)) {
			data['company'] = affiliate_info['company'];
		} else {
			data['company'] = '';
		}

		if ((affiliate_info)) {
			data['website'] = affiliate_info['website'];
		} else {
			data['website'] = '';
		}

		if ((affiliate_info)) {
			data['tracking'] = affiliate_info['tracking'];
		} else {
			data['tracking'] = oc_token(10);
		}

		if ((affiliate_info)) {
			data['commission'] = affiliate_info['commission'];
		} else {
			data['commission'] = this.config.get('config_affiliate_commission');
		}

		if ((affiliate_info)) {
			data['status'] = affiliate_info['status'];
		} else {
			data['status'] = '';
		}

		if ((affiliate_info)) {
			data['tax'] = affiliate_info['tax'];
		} else {
			data['tax'] = '';
		}

		if ((affiliate_info)) {
			data['payment_method'] = affiliate_info['payment_method'];
		} else {
			data['payment_method'] = 'cheque';
		}

		if ((affiliate_info)) {
			data['cheque'] = affiliate_info['cheque'];
		} else {
			data['cheque'] = '';
		}

		if ((affiliate_info)) {
			data['paypal'] = affiliate_info['paypal'];
		} else {
			data['paypal'] = '';
		}

		if ((affiliate_info)) {
			data['bank_name'] = affiliate_info['bank_name'];
		} else {
			data['bank_name'] = '';
		}

		if ((affiliate_info)) {
			data['bank_branch_number'] = affiliate_info['bank_branch_number'];
		} else {
			data['bank_branch_number'] = '';
		}

		if ((affiliate_info)) {
			data['bank_swift_code'] = affiliate_info['bank_swift_code'];
		} else {
			data['bank_swift_code'] = '';
		}

		if ((affiliate_info)) {
			data['bank_account_name'] = affiliate_info['bank_account_name'];
		} else {
			data['bank_account_name'] = '';
		}

		if ((affiliate_info)) {
			data['bank_account_number'] = affiliate_info['bank_account_number'];
		} else {
			data['bank_account_number'] = '';
		}

		data['custom_fields'] = [];

		let filter_data = {
			'sort': 'cf.sort_order',
			'order': 'ASC'
		};

		// Custom Fields
		this.load.model('customer/custom_field', this);

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

		if ((affiliate_info)) {
			data['affiliate_custom_field'] = JSON.parse(affiliate_info['custom_field']);
		} else {
			data['affiliate_custom_field'] = [];
		}

		data['history'] = await this.load.controller('customer/customer.getHistory');
		data['transaction'] = await this.load.controller('customer/customer.getTransaction');
		data['report'] = await this.getReport();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/affiliate_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('marketing/affiliate');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'marketing/affiliate')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		this.load.model('customer/customer', this);

		const customer_info = await this.model_customer_customer.getCustomer(this.request.post['customer_id']);

		if (!customer_info.customer_id) {
			json['error']['customer'] = this.language.get('error_customer');
		}

		// Check to see if customer is already a affiliate
		this.load.model('marketing/affiliate', this);

		let affiliate_info = await this.model_marketing_affiliate.getAffiliate(this.request.post['customer_id']);

		if (affiliate_info.customer_id && (!(this.request.post['customer_id']) || (this.request.post['customer_id'] != affiliate_info['customer_id']))) {
			json['error']['warning'] = this.language.get('error_already');
		}

		if (!this.request.post['tracking']) {
			json['error']['tracking'] = this.language.get('error_tracking');
		}

		affiliate_info = await this.model_marketing_affiliate.getAffiliateByTracking(this.request.post['tracking']);

		if (affiliate_info.customer_id && (!(this.request.post['customer_id']) || (this.request.post['customer_id'] != affiliate_info['customer_id']))) {
			json['error']['tracking'] = this.language.get('error_exists');
		}

		// Payment validation
		if (!(this.request.post['payment_method'])) {
			json['error']['payment_method'] = this.language.get('error_payment_method');
		}

		if (this.request.post['payment_method'] == 'cheque' && this.request.post['cheque'] == '') {
			json['error']['cheque'] = this.language.get('error_cheque');
		} else if (this.request.post['payment_method'] == 'paypal' && ((oc_strlen(this.request.post['paypal']) > 96) || !isEmailValid(this.request.post['paypal']))) {
			json['error']['paypal'] = this.language.get('error_paypal');
		} else if (this.request.post['payment_method'] == 'bank') {
			if (this.request.post['bank_account_name'] == '') {
				json['error']['bank_account_name'] = this.language.get('error_bank_account_name');
			}

			if (this.request.post['bank_account_number'] == '') {
				json['error']['bank_account_number'] = this.language.get('error_bank_account_number');
			}
		}

		// Custom field validation
		if (customer_info.customer_id) {
			this.load.model('customer/custom_field', this);

			const custom_fields = await this.model_customer_custom_field.getCustomFields({'filter_customer_group_id' : customer_info['customer_group_id']});

			for (let custom_field of custom_fields) {
				if (custom_field['status']) {
					if ((custom_field['location'] == 'affiliate') && custom_field['required'] && !(this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_custom_field'), custom_field['name']);
					} else if ((custom_field['location'] == 'affiliate') && (custom_field['type'] == 'text') && (custom_field['validation']) && !preg_match(html_entity_decode(custom_field['validation']), this.request.post['custom_field'][custom_field['custom_field_id']])) {
						json['error']['custom_field_' + custom_field['custom_field_id']] = sprintf(this.language.get('error_regex'), custom_field['name']);
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json.error).length) {
			// Use affiliate
			if (!affiliate_info.customer_id) {
				await this.model_marketing_affiliate.addAffiliate(this.request.post);
			} else {
				await this.model_marketing_affiliate.editAffiliate(this.request.post['customer_id'], this.request.post);
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
		await this.load.language('marketing/affiliate');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'marketing/affiliate')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('marketing/affiliate', this);

			for (let affiliate_id of selected) {
				await this.model_marketing_affiliate.deleteAffiliate(affiliate_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async calculate() {
		await this.load.language('marketing/affiliate');

		const json = {};

		if (!await this.user.hasPermission('modify', 'marketing/affiliate')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('marketing/affiliate', this);
			this.load.model('customer/customer', this);

			const results = await this.model_marketing_affiliate.getAffiliates({ 'filter_status': 1 });

			for (let result of results) {
				await this.model_marketing_affiliate.editBalance(result['customer_id'], await this.model_customer_customer.getTransactionTotal(result['customer_id']));
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return Action|void
	 */
	async csv() {
		await this.load.language('marketing/affiliate');

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (await this.user.hasPermission('modify', 'marketing/affiliate')) {
			this.load.model('marketing/affiliate', this);

			let csv = '';

			for (let customer_id of selected) {
				const affiliate_info = await this.model_marketing_affiliate.getAffiliate(customer_id);

				if (affiliate_info && affiliate_info['status'] && affiliate_info['balance'] > 0) {
					let balance = this.currency.format(affiliate_info['balance'], this.config.get('config_currency'), 1.00000000, false);

					if (affiliate_info['payment_method'] == 'cheque') {
						csv += affiliate_info['cheque'] + ',' + balance + ',' + this.config.get('config_currency') + ',' + affiliate_info['customer'] + "\n";
					}

					if (affiliate_info['payment_method'] == 'paypal') {
						csv += affiliate_info['paypal'] + ',' + balance + ',' + this.config.get('config_currency') + ',' + affiliate_info['customer'] + ',Thanks for your business!' + "\n";
					}

					if (affiliate_info['payment_method'] == 'bank') {
						csv += affiliate_info['bank_name'] + ',' + affiliate_info['bank_branch_number'] + ',' + affiliate_info['bank_swift_code'] + ',' + affiliate_info['bank_account_name'] + ',' + affiliate_info['bank_account_number'] + ',' + balance + ',' + this.config.get('config_currency') + ',' + affiliate_info['customer'] + "\n";
					}
				}
			}


			this.response.addHeader('Pragma: public');
			this.response.addHeader('Expires: 0');
			this.response.addHeader('Content-Description: File Transfer');
			this.response.addHeader('Content-Type: application/octet-stream');
			this.response.addHeader('Content-Transfer-Encoding: binary');
			this.response.addHeader('Content-Disposition: attachment; filename=payout-' + new Date().toISOString().slice(0, 10).split('-').reverse().join('-') + '.csv');
			this.response.addHeader('Content-Length', Buffer.byteLength(csv));
			this.response.setEnd(csv);
		} else {
			return new Action('error/permission');
		}
	}

	/**
	 * @return void
	 */
	async complete() {
		await this.load.language('marketing/affiliate');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'marketing/affiliate')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('marketing/affiliate', this);
			this.load.model('customer/customer', this);

			for (let customer_id of selected) {
				const affiliate_info = await this.model_marketing_affiliate.getAffiliate(customer_id);

				if (affiliate_info && affiliate_info['status'] && affiliate_info['balance'] > 0) {
					await this.model_customer_customer.addTransaction(affiliate_info['customer_id'], this.language.get('text_payment_' + affiliate_info['payment_method']), -affiliate_info['balance']);

					await this.model_marketing_affiliate.editBalance(affiliate_info['customer_id'], 0);
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
	async report() {
		await this.load.language('marketing/affiliate');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		const data = {};
		let customer_id = 0;
		if ((this.request.get['customer_id'])) {
			customer_id = this.request.get['customer_id'];
		}
		let page = 1;
		if ((this.request.get['page']) && this.request.get['route'] == 'marketing/affiliate.report') {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		data['reports'] = [];

		this.load.model('marketing/affiliate', this);
		this.load.model('customer/customer', this);
		this.load.model('setting/store', this);

		const results = await this.model_marketing_affiliate.getReports(customer_id, (page - 1) * limit, limit);

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

		const report_total = await this.model_marketing_affiliate.getTotalReports(customer_id);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': report_total,
			'page': page,
			'limit': limit,
			'url': await this.url.link('marketing/affiliate.report', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + customer_id + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (report_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (report_total - limit)) ? report_total : (((page - 1) * limit) + limit), report_total, Math.ceil(report_total / limit));

		return await this.load.view('marketing/affiliate_report', data);
	}

	/**
	 * @return void
	 */
	async autocomplete() {
		let json = [];

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

		this.load.model('marketing/affiliate', this);

		const results = await this.model_marketing_affiliate.getAffiliates(filter_data);

		for (let result of results) {
			json.push({
				'customer_id': result['customer_id'],
				'name': strip_tags(html_entity_decode(result['name'])),
				'email': result['email']
			});
		}

		let sort_order = [];

		for (let [key, value] of Object.entries(json)) {
			sort_order[key] = value['name'];
		}

		// json = multiSort(json, sort_order, 'ASC');
		json = json.sort((a, b) => a.name - b.name);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
