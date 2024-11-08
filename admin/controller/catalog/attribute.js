module.exports = class ControllerCatalogAttribute extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/attribute');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute');

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/attribute');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_attribute.addAttribute(this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/attribute');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_attribute.editAttribute(this.request.get['attribute_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/attribute');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of attribute_id) {
				await this.model_catalog_attribute.deleteAttribute(attribute_id);
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

			this.response.setRedirect(await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'ad.name';
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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('catalog/attribute/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/attribute/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['attributes'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		attribute_total = await this.model_catalog_attribute.getTotalAttributes();

		results = await this.model_catalog_attribute.getAttributes(filter_data);

		for (let result of results) {
			data['attributes'].push({
				'attribute_id'    : result['attribute_id'],
				'name'            : result['name'],
				'attribute_group' : result['attribute_group'],
				'sort_order'      : result['sort_order'],
				'edit'            : await this.url.link('catalog/attribute/edit', 'user_token=' + this.session.data['user_token'] + '&attribute_id=' + result['attribute_id'] + url, true)
			);
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

		data['sort_name'] = await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + '&sort=ad.name' + url, true);
		data['sort_attribute_group'] = await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + '&sort=attribute_group' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + '&sort=a.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = attribute_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (attribute_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (attribute_total - this.config.get('config_limit_admin'))) ? attribute_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), attribute_total, ceil(attribute_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['attribute_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['attribute_group'])) {
			data['error_attribute_group'] = this.error['attribute_group'];
		} else {
			data['error_attribute_group'] = '';
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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['attribute_id'])) {
			data['action'] = await this.url.link('catalog/attribute/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/attribute/edit', 'user_token=' + this.session.data['user_token'] + '&attribute_id=' + this.request.get['attribute_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['attribute_id']) && (this.request.server['method'] != 'POST')) {
			attribute_info = await this.model_catalog_attribute.getAttribute(this.request.get['attribute_id']);
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['attribute_description'])) {
			data['attribute_description'] = this.request.post['attribute_description'];
		} else if ((this.request.get['attribute_id'])) {
			data['attribute_description'] = await this.model_catalog_attribute.getAttributeDescriptions(this.request.get['attribute_id']);
		} else {
			data['attribute_description'] = {};
		}

		if ((this.request.post['attribute_group_id'])) {
			data['attribute_group_id'] = this.request.post['attribute_group_id'];
		} else if ((attribute_info)) {
			data['attribute_group_id'] = attribute_info['attribute_group_id'];
		} else {
			data['attribute_group_id'] = '';
		}

		this.load.model('catalog/attribute_group',this);

		data['attribute_groups'] = await this.model_catalog_attribute_group.getAttributeGroups();

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((attribute_info)) {
			data['sort_order'] = attribute_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/attribute')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['attribute_group_id']) {
			this.error['attribute_group'] = this.language.get('error_attribute_group');
		}

		for (this.request.post['attribute_description'] of language_id : value) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 64)) {
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/attribute')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product');

		for (this.request.post['selected'] of attribute_id) {
			product_total = await this.model_catalog_product.getTotalProductsByAttributeId(attribute_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async autocomplete() {
		json = {};

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/attribute');

			filter_data = array(
				'filter_name' : this.request.get['filter_name'],
				'start'       : 0,
				'limit'       : 5
			);

			results = await this.model_catalog_attribute.getAttributes(filter_data);

			for (let result of results) {
				json.push({
					'attribute_id'    : result['attribute_id'],
					'name'            : strip_tags(html_entity_decode(result['name'])),
					'attribute_group' : result['attribute_group']
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
}
