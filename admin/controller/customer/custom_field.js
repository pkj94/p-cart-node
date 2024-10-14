const sprintf = require("locutus/php/strings/sprintf");

module.exports = class CustomFieldController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('customer/custom_field');

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
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('customer/custom_field.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('customer/custom_field.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/custom_field', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('customer/custom_field');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'cfd.name';
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

		data['action'] = this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + url);

		data['custom_fields'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('customer/custom_field', this);

		const custom_field_total = await this.model_customer_custom_field.getTotalCustomFields();

		const results = await this.model_customer_custom_field.getCustomFields(filter_data);

		for (let result of results) {
			let type = '';

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
				'edit': this.url.link('customer/custom_field.form', 'user_token=' + this.session.data['user_token'] + '&custom_field_id=' + result['custom_field_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + '&sort=cfd.name' + url);
		data['sort_location'] = this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + '&sort=cf.location' + url);
		data['sort_type'] = this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + '&sort=cf.type' + url);
		data['sort_status'] = this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + '&sort=cf.status' + url);
		data['sort_sort_order'] = this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + '&sort=cf.sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': custom_field_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('customer/custom_field.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (custom_field_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (custom_field_total - this.config.get('config_pagination_admin'))) ? custom_field_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), custom_field_total, Math.ceil(custom_field_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('customer/custom_field_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('customer/custom_field');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['custom_field_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('customer/custom_field.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'] + url);
		let custom_field_info;
		if ((this.request.get['custom_field_id'])) {
			this.load.model('customer/custom_field', this);

			custom_field_info = await this.model_customer_custom_field.getCustomField(this.request.get['custom_field_id']);
		}

		if ((this.request.get['custom_field_id'])) {
			data['custom_field_id'] = this.request.get['custom_field_id'];
		} else {
			data['custom_field_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['custom_field_id'])) {
			data['custom_field_description'] = await this.model_customer_custom_field.getDescriptions(this.request.get['custom_field_id']);
		} else {
			data['custom_field_description'] = [];
		}

		if ((custom_field_info)) {
			data['location'] = custom_field_info['location'];
		} else {
			data['location'] = '';
		}

		if ((custom_field_info)) {
			data['type'] = custom_field_info['type'];
		} else {
			data['type'] = '';
		}

		if ((custom_field_info)) {
			data['value'] = custom_field_info['value'];
		} else {
			data['value'] = '';
		}

		if ((custom_field_info)) {
			data['validation'] = custom_field_info['validation'];
		} else {
			data['validation'] = '';
		}

		if ((custom_field_info)) {
			data['status'] = custom_field_info['status'];
		} else {
			data['status'] = '';
		}

		if ((custom_field_info)) {
			data['sort_order'] = custom_field_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}
		let custom_field_values = [];
		if ((this.request.get['custom_field_id'])) {
			custom_field_values = await this.model_customer_custom_field.getValueDescriptions(this.request.get['custom_field_id']);
		}

		data['custom_field_values'] = [];

		for (let custom_field_value of custom_field_values) {
			data['custom_field_values'].push({
				'custom_field_value_id': custom_field_value['custom_field_value_id'],
				'custom_field_value_description': custom_field_value['custom_field_value_description'],
				'sort_order': custom_field_value['sort_order']
			});
		}
		let custom_field_customer_groups = [];
		if ((this.request.get['custom_field_id'])) {
			custom_field_customer_groups = await this.model_customer_custom_field.getCustomerGroups(this.request.get['custom_field_id']);
		}

		data['custom_field_customer_group'] = [];

		for (let custom_field_customer_group of custom_field_customer_groups) {
			if ((custom_field_customer_group['customer_group_id'])) {
				data['custom_field_customer_group'].push(custom_field_customer_group['customer_group_id']);
			}
		}

		this.load.model('customer/customer_group', this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		data['custom_field_required'] = [];

		for (let custom_field_customer_group of custom_field_customer_groups) {
			if ((custom_field_customer_group['required']) && custom_field_customer_group['required'] && (custom_field_customer_group['customer_group_id'])) {
				data['custom_field_required'].push(custom_field_customer_group['customer_group_id']);
			}
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('customer/custom_field_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('customer/custom_field');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'customer/custom_field')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['custom_field_description'])) {
			language_id = language_id.includes('language-') ? language_id.split('-')[1] : language_id
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 128)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if ((this.request.post['type'] == 'select' || this.request.post['type'] == 'radio' || this.request.post['type'] == 'checkbox')) {
			if (!(this.request.post['custom_field_value'])) {
				json['error']['warning'] = this.language.get('error_type');
			}

			if ((this.request.post['custom_field_value'])) {
				for (let [custom_field_value_id, custom_field_value] of Object.entries(this.request.post['custom_field_value'])) {
					for (let [language_id, custom_field_value_description] of Object.entries(custom_field_value['custom_field_value_description'])) {
						language_id = language_id.includes('language-') ? language_id.split('-')[1] : language_id
						if ((oc_strlen(custom_field_value_description['name']) < 1) || (oc_strlen(custom_field_value_description['name']) > 128)) {
							json['error']['custom_field_value_' + custom_field_value_id + '_' + language_id] = this.language.get('error_custom_value');
						}
					}
				}
			}
		}

		if (this.request.post['type'] == 'text' && this.request.post['validation'] && preg_match(html_entity_decode(this.request.post['validation']), null) === false) {
			json['error']['validation'] = this.language.get('error_validation');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('customer/custom_field', this);
			this.request.post['custom_field_id'] = Number(this.request.post['custom_field_id']);
			if (!this.request.post['custom_field_id']) {
				json['custom_field_id'] = await this.model_customer_custom_field.addCustomField(this.request.post);
			} else {
				await this.model_customer_custom_field.editCustomField(this.request.post['custom_field_id'], this.request.post);
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
		await this.load.language('customer/custom_field');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'customer/custom_field')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/custom_field', this);

			for (let custom_field_id of selected) {
				await this.model_customer_custom_field.deleteCustomField(custom_field_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
