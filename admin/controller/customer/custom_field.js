module.exports = class ControllerCustomerCustomField extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('customer/custom_field');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/custom_field', this);

		await this.getList();
	}

	async add() {
		await this.load.language('customer/custom_field');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/custom_field', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_customer_custom_field.addCustomField(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('customer/custom_field');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/custom_field', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_customer_custom_field.editCustomField(this.request.get['custom_field_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('customer/custom_field');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('customer/custom_field', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let custom_field_id of this.request.post['selected']) {
				await this.model_customer_custom_field.deleteCustomField(custom_field_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'cfd.name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}
		page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('customer/custom_field/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('customer/custom_field/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['custom_fields'] = {};

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		});

		custom_field_total = await this.model_customer_custom_field.getTotalCustomFields();

		results = await this.model_customer_custom_field.getCustomFields(filter_data);

		for (let result of results) {
			type = '';

			switch (result['type']) {
				case 'select':
					type = this.language.get('text_select');
					break;
				case 'radio':
					type = this.language.get('text_radio');
					break;
				case 'checkbox':
					type = this.language.get('text_checkbox');
					break;
				case 'input':
					type = this.language.get('text_input');
					break;
				case 'text':
					type = this.language.get('text_text');
					break;
				case 'textarea':
					type = this.language.get('text_textarea');
					break;
				case 'file':
					type = this.language.get('text_file');
					break;
				case 'date':
					type = this.language.get('text_date');
					break;
				case 'datetime':
					type = this.language.get('text_datetime');
					break;
				case 'time':
					type = this.language.get('text_time');
					break;
			}

			data['custom_fields'].push({
				'custom_field_id': result['custom_field_id'],
				'name': result['name'],
				'location': this.language.get('text_' + result['location']),
				'type': type,
				'status': result['status'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('customer/custom_field/edit', 'user_token=' + this.session.data['user_token'] + '&custom_field_id=' + result['custom_field_id'] + url, true)
			});
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
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

		data['sort_name'] = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + '&sort=cfd.name' + url, true);
		data['sort_location'] = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + '&sort=cf.location' + url, true);
		data['sort_type'] = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + '&sort=cf.type' + url, true);
		data['sort_status'] = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + '&sort=cf.status' + url, true);
		data['sort_sort_order'] = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + '&sort=cf.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = custom_field_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (custom_field_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (custom_field_total - Number(this.config.get('config_limit_admin')))) ? custom_field_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), custom_field_total, Math.ceil(custom_field_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/custom_field_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['custom_field_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['custom_field_value'])) {
			data['error_custom_field_value'] = this.error['custom_field_value'];
		} else {
			data['error_custom_field_value'] = {};
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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['custom_field_id'])) {
			data['action'] = await this.url.link('customer/custom_field/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('customer/custom_field/edit', 'user_token=' + this.session.data['user_token'] + '&custom_field_id=' + this.request.get['custom_field_id'] + url, true);
		}

		data['cancel'] = await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['custom_field_id']) && (this.request.server['method'] != 'POST')) {
			custom_field_info = await this.model_customer_custom_field.getCustomField(this.request.get['custom_field_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['custom_field_description'])) {
			data['custom_field_description'] = this.request.post['custom_field_description'];
		} else if ((this.request.get['custom_field_id'])) {
			data['custom_field_description'] = await this.model_customer_custom_field.getCustomFieldDescriptions(this.request.get['custom_field_id']);
		} else {
			data['custom_field_description'] = {};
		}

		if ((this.request.post['location'])) {
			data['location'] = this.request.post['location'];
		} else if ((custom_field_info)) {
			data['location'] = custom_field_info['location'];
		} else {
			data['location'] = '';
		}

		if ((this.request.post['type'])) {
			data['type'] = this.request.post['type'];
		} else if ((custom_field_info)) {
			data['type'] = custom_field_info['type'];
		} else {
			data['type'] = '';
		}

		if ((this.request.post['value'])) {
			data['value'] = this.request.post['value'];
		} else if ((custom_field_info)) {
			data['value'] = custom_field_info['value'];
		} else {
			data['value'] = '';
		}

		if ((this.request.post['validation'])) {
			data['validation'] = this.request.post['validation'];
		} else if ((custom_field_info)) {
			data['validation'] = custom_field_info['validation'];
		} else {
			data['validation'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((custom_field_info)) {
			data['status'] = custom_field_info['status'];
		} else {
			data['status'] = '';
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((custom_field_info)) {
			data['sort_order'] = custom_field_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((this.request.post['custom_field_value'])) {
			custom_field_values = this.request.post['custom_field_value'];
		} else if ((this.request.get['custom_field_id'])) {
			custom_field_values = await this.model_customer_custom_field.getCustomFieldValueDescriptions(this.request.get['custom_field_id']);
		} else {
			custom_field_values = {};
		}

		data['custom_field_values'] = {};

		for (custom_field_values of custom_field_value) {
			data['custom_field_values'].push({
				'custom_field_value_id': custom_field_value['custom_field_value_id'],
				'custom_field_value_description': custom_field_value['custom_field_value_description'],
				'sort_order': custom_field_value['sort_order']
			});
		}

		if ((this.request.post['custom_field_customer_group'])) {
			custom_field_customer_groups = this.request.post['custom_field_customer_group'];
		} else if ((this.request.get['custom_field_id'])) {
			custom_field_customer_groups = await this.model_customer_custom_field.getCustomFieldCustomerGroups(this.request.get['custom_field_id']);
		} else {
			custom_field_customer_groups = {};
		}

		data['custom_field_customer_group'] = {};

		for (custom_field_customer_groups of custom_field_customer_group) {
			data['custom_field_customer_group'].push(custom_field_customer_group['customer_group_id'];
		}

		data['custom_field_required'] = {};

		for (custom_field_customer_groups of custom_field_customer_group) {
			if (custom_field_customer_group['required']) {
				data['custom_field_required'].push(custom_field_customer_group['customer_group_id'];
			}
		}

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/custom_field_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'customer/custom_field')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['custom_field_description'])) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 128)) {
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		if ((this.request.post['type'] == 'select' || this.request.post['type'] == 'radio' || this.request.post['type'] == 'checkbox')) {
			if (!(this.request.post['custom_field_value'])) {
				this.error['warning'] = this.language.get('error_type');
			}

			if ((this.request.post['custom_field_value'])) {
				for (let [custom_field_value_id, custom_field_value] of Object.entries(this.request.post['custom_field_value'])) {
					for (let [language_id, custom_field_value_description] of Object.entries(custom_field_value['custom_field_value_description'])) {
						if ((oc_strlen(custom_field_value_description['name']) < 1) || (oc_strlen(custom_field_value_description['name']) > 128)) {
							this.error['custom_field_value'][custom_field_value_id][language_id] = this.language.get('error_custom_value');
						}
					}
				}
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'customer/custom_field')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}