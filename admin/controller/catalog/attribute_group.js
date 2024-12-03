module.exports = class ControllerCatalogAttributeGroup extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('catalog/attribute_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute_group', this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/attribute_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute_group', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_attribute_group.addAttributeGroup(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

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
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/attribute_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute_group', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_attribute_group.editAttributeGroup(this.request.get['attribute_group_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

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
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/attribute_group');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/attribute_group', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let attribute_group_id of this.request.post['selected']) {
				await this.model_catalog_attribute_group.deleteAttributeGroup(attribute_group_id);
			}

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

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
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
				const data = {};
		let sort = 'agd.name';
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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/attribute_group/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/attribute_group/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['attribute_groups'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const attribute_group_total = await this.model_catalog_attribute_group.getTotalAttributeGroups();

		const results = await this.model_catalog_attribute_group.getAttributeGroups(filter_data);

		for (let result of results) {
			data['attribute_groups'].push({
				'attribute_group_id': result['attribute_group_id'],
				'name': result['name'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/attribute_group/edit', 'user_token=' + this.session.data['user_token'] + '&attribute_group_id=' + result['attribute_group_id'] + url, true)
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

		data['sort_name'] = await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + '&sort=agd.name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + '&sort=ag.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = attribute_group_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (attribute_group_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (attribute_group_total - Number(this.config.get('config_limit_admin')))) ? attribute_group_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), attribute_group_total, Math.ceil(attribute_group_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('catalog/attribute_group_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['attribute_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['attribute_group_id'])) {
			data['action'] = await this.url.link('catalog/attribute_group/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/attribute_group/edit', 'user_token=' + this.session.data['user_token'] + '&attribute_group_id=' + this.request.get['attribute_group_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url, true);
		let attribute_group_info;
		if ((this.request.get['attribute_group_id']) && (this.request.server['method'] != 'POST')) {
			attribute_group_info = await this.model_catalog_attribute_group.getAttributeGroup(this.request.get['attribute_group_id']);
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['attribute_group_description'])) {
			data['attribute_group_description'] = this.request.post['attribute_group_description'];
		} else if ((this.request.get['attribute_group_id'])) {
			data['attribute_group_description'] = await this.model_catalog_attribute_group.getAttributeGroupDescriptions(this.request.get['attribute_group_id']);
		} else {
			data['attribute_group_description'] = {};
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((attribute_group_info)) {
			data['sort_order'] = attribute_group_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute_group_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/attribute_group')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['attribute_group_description'])) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 64)) {
				this.error['name'] = this.error['name'] || {};
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/attribute_group')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/attribute', this);
		this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];

		for (let attribute_group_id of this.request.post['selected']) {
			const attribute_total = await this.model_catalog_attribute.getTotalAttributesByAttributeGroupId(attribute_group_id);

			if (attribute_total) {
				this.error['warning'] = sprintf(this.language.get('error_attribute'), attribute_total);
			}
		}

		return Object.keys(this.error).length ? false : true
	}
}
