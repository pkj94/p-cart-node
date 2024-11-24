module.exports = class ControllerCustomerCustomerApproval extends Controller {
	async index() {
		await this.load.language('customer/customer_approval');

		this.document.setTitle(this.language.get('heading_title'));

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

		if ((this.request.get['filter_type'])) {
			filter_type = this.request.get['filter_type'];
		} else {
			filter_type = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
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

		if ((this.request.get['filter_type'])) {
			url += '&filter_type=' + this.request.get['filter_type'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
			'href' : await this.url.link('customer/customer_approval', 'user_token=' + this.session.data['user_token'], true)
		});
		
		data['filter_name'] = filter_name;
		data['filter_email'] = filter_email;
		data['filter_customer_group_id'] = filter_customer_group_id;
		data['filter_type'] = filter_type;
		data['filter_date_added'] = filter_date_added;

		data['user_token'] = this.session.data['user_token'];

		this.load.model('customer/customer_group',this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_approval', data));
	}

	async customer_approval() {
		await this.load.language('customer/customer_approval');

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

		if ((this.request.get['filter_type'])) {
			filter_type = this.request.get['filter_type'];
		} else {
			filter_type = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
		}

		data['customer_approvals'] = {};

		filter_data = array(
			'filter_name'              : filter_name,
			'filter_email'             : filter_email,
			'filter_customer_group_id' : filter_customer_group_id,
			'filter_type'              : filter_type,
			'filter_date_added'        : filter_date_added,
			'start'                    : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'                    : Number(this.config.get('config_limit_admin'))
		});

		this.load.model('customer/customer_approval');

		customer_approval_total = await this.model_customer_customer_approval.getTotalCustomerApprovals(filter_data);

		results = await this.model_customer_customer_approval.getCustomerApprovals(filter_data);

		for (let result of results) {
			data['customer_approvals'].push({
				'customer_id'    : result['customer_id'],
				'name'           : result['name'],
				'email'          : result['email'],
				'customer_group' : result['customer_group'],
				'type'           : this.language.get('text_' + result['type']),
				'date_added'     : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'approve'        : await this.url.link('customer/customer_approval/approve', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + '&type=' + result['type'], true),
				'deny'           : await this.url.link('customer/customer_approval/deny', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'] + '&type=' + result['type'], true),
				'edit'           : await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id'], true)
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

		if ((this.request.get['filter_type'])) {
			url += '&filter_type=' + this.request.get['filter_type'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		pagination = new Pagination();
		pagination.total = customer_approval_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('customer/customer_approval/customer_approval', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_approval_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (customer_approval_total - Number(this.config.get('config_limit_admin')))) ? customer_approval_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), customer_approval_total, Math.ceil(customer_approval_total / Number(this.config.get('config_limit_admin'))));

		this.response.setOutput(await this.load.view('customer/customer_approval_list', data));
	}

	async approve() {
		await this.load.language('customer/customer_approval');

		json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer_approval')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('customer/customer_approval');

			if (this.request.get['type'] == 'customer') {
				await this.model_customer_customer_approval.approveCustomer(this.request.get['customer_id']);
			} else if (this.request.get['type'] == 'affiliate') {
				await this.model_customer_customer_approval.approveAffiliate(this.request.get['customer_id']);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async deny() {
		await this.load.language('customer/customer_approval');

		json = {};

		if (!await this.user.hasPermission('modify', 'customer/customer_approval')) {
			json['error'] = this.language.get('error_permission');
		} else {
			this.load.model('customer/customer_approval');

			if (this.request.get['type'] == 'customer') {
				await this.model_customer_customer_approval.denyCustomer(this.request.get['customer_id']);
			} else if (this.request.get['type'] == 'affiliate') {
				await this.model_customer_customer_approval.denyAffiliate(this.request.get['customer_id']);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
