module.exports = class ControllerCustomerCustomerGroup extends Controller {
	error = {};

	async index() {
		await this.load.language('customer/customer_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer_group',this);

		await this.getList();
	}

	async add() {
		await this.load.language('customer/customer_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer_group',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_customer_customer_group.addCustomerGroup(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('customer/customer_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer_group',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_customer_customer_group.editCustomerGroup(this.request.get['customer_group_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('customer/customer_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/customer_group',this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of customer_group_id) {
				await this.model_customer_customer_group.deleteCustomerGroup(customer_group_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'cgd.name';
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
			'href' : await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('customer/customer_group/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('customer/customer_group/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['customer_groups'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		customer_group_total = await this.model_customer_customer_group.getTotalCustomerGroups();

		results = await this.model_customer_customer_group.getCustomerGroups(filter_data);

		for (let result of results) {
			data['customer_groups'].push({
				'customer_group_id' : result['customer_group_id'],
				'name'              : result['name'] + ((result['customer_group_id'] == this.config.get('config_customer_group_id')) ? this.language.get('text_default') : null),
				'sort_order'        : result['sort_order'],
				'edit'              : await this.url.link('customer/customer_group/edit', 'user_token=' + this.session.data['user_token'] + '&customer_group_id=' + result['customer_group_id'] + url, true)
			});
		}

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

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + '&sort=cgd.name' + url, true);
		data['sort_sort_order'] = await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + '&sort=cg.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = customer_group_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (customer_group_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (customer_group_total - Number(this.config.get('config_limit_admin')))) ? customer_group_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), customer_group_total, Math.ceil(customer_group_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_group_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['customer_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = {};
		}

		url = '';

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
			'href' : await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['customer_group_id'])) {
			data['action'] = await this.url.link('customer/customer_group/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('customer/customer_group/edit', 'user_token=' + this.session.data['user_token'] + '&customer_group_id=' + this.request.get['customer_group_id'] + url, true);
		}

		data['cancel'] = await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['customer_group_id']) && (this.request.server['method'] != 'POST')) {
			customer_group_info = await this.model_customer_customer_group.getCustomerGroup(this.request.get['customer_group_id']);
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['customer_group_description'])) {
			data['customer_group_description'] = this.request.post['customer_group_description'];
		} else if ((this.request.get['customer_group_id'])) {
			data['customer_group_description'] = await this.model_customer_customer_group.getCustomerGroupDescriptions(this.request.get['customer_group_id']);
		} else {
			data['customer_group_description'] = {};
		}

		if ((this.request.post['approval'])) {
			data['approval'] = this.request.post['approval'];
		} else if ((customer_group_info)) {
			data['approval'] = customer_group_info['approval'];
		} else {
			data['approval'] = '';
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((customer_group_info)) {
			data['sort_order'] = customer_group_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/customer_group_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'customer/customer_group')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['customer_group_description'] of language_id : value) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'customer/customer_group')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);
		this.load.model('customer/customer',this);

		for (this.request.post['selected'] of customer_group_id) {
			if (this.config.get('config_customer_group_id') == customer_group_id) {
				this.error['warning'] = this.language.get('error_default');
			}

			store_total = await this.model_setting_store.getTotalStoresByCustomerGroupId(customer_group_id);

			if (store_total) {
				this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
			}

			customer_total = await this.model_customer_customer.getTotalCustomersByCustomerGroupId(customer_group_id);

			if (customer_total) {
				this.error['warning'] = sprintf(this.language.get('error_customer'), customer_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}