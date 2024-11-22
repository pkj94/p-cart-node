const strip_tags = require("locutus/php/strings/strip_tags");

module.exports = class ControllerCatalogFilter extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/filter');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/filter', this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/filter');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/filter', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_filter.addFilter(this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/filter');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/filter', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_filter.editFilter(this.request.get['filter_group_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/filter');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/filter', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (let filter_group_id of this.request.post['selected']) {
				await this.model_catalog_filter.deleteFilter(filter_group_id);
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

			this.response.setRedirect(await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		let sort = 'fgd.name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}
		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
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
			'href': await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/filter/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/filter/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['filters'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const filter_total = await this.model_catalog_filter.getTotalFilterGroups();

		const results = await this.model_catalog_filter.getFilterGroups(filter_data);

		for (let result of results) {
			data['filters'].push({
				'filter_group_id': result['filter_group_id'],
				'name': result['name'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/filter/edit', 'user_token=' + this.session.data['user_token'] + '&filter_group_id=' + result['filter_group_id'] + url, true)
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

		data['sort_name'] = await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + '&sort=fgd.name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + '&sort=fg.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = filter_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (filter_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (filter_total - Number(this.config.get('config_limit_admin')))) ? filter_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), filter_total, Math.ceil(filter_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/filter_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['filter_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['group'])) {
			data['error_group'] = this.error['group'];
		} else {
			data['error_group'] = {};
		}

		if ((this.error['filter'])) {
			data['error_filter'] = this.error['filter'];
		} else {
			data['error_filter'] = {};
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
			'href': await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['filter_group_id'])) {
			data['action'] = await this.url.link('catalog/filter/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/filter/edit', 'user_token=' + this.session.data['user_token'] + '&filter_group_id=' + this.request.get['filter_group_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['filter_group_id']) && (this.request.server['method'] != 'POST')) {
			filter_group_info = await this.model_catalog_filter.getFilterGroup(this.request.get['filter_group_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['filter_group_description'])) {
			data['filter_group_description'] = this.request.post['filter_group_description'];
		} else if ((this.request.get['filter_group_id'])) {
			data['filter_group_description'] = await this.model_catalog_filter.getFilterGroupDescriptions(this.request.get['filter_group_id']);
		} else {
			data['filter_group_description'] = {};
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((filter_group_info)) {
			data['sort_order'] = filter_group_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((this.request.post['filter'])) {
			data['filters'] = this.request.post['filter'];
		} else if ((this.request.get['filter_group_id'])) {
			data['filters'] = await this.model_catalog_filter.getFilterDescriptions(this.request.get['filter_group_id']);
		} else {
			data['filters'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/filter_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/filter')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['filter_group_description'])) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 64)) {
				this.error['group'][language_id] = this.language.get('error_group');
			}
		}

		if ((this.request.post['filter'])) {
			for (let [filter_id, filter] of Object.entries(this.request.post['filter'])) {
				for (let [language_id, filter_description] of Object.entries(filter['filter_description'])) {
					if ((oc_strlen(filter_description['name']) < 1) || (oc_strlen(filter_description['name']) > 64)) {
						this.error['filter'][filter_id][language_id] = this.language.get('error_name');
					}
				}
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/filter')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/filter', this);

			let filter_data = {
				'filter_name': this.request.get['filter_name'],
				'start': 0,
				'limit': 5
			};

			const filters = await this.model_catalog_filter.getFilters(filter_data);

			for (let filter of filters) {
				json.push({
					'filter_id': filter['filter_id'],
					'name': strip_tags(html_entity_decode(filter['group'] + ' &gt; ' + filter['name']))
				});
			}
		}

		json = json.sort((a, b) => a.name - b.name);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}