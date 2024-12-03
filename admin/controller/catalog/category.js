module.exports = class ControllerCatalogCategory extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category', this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_category.addCategory(this.request.post);

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
			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_category.editCategory(this.request.get['category_id'], this.request.post);

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
			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let category_id of this.request.post['selected']) {
				await this.model_catalog_category.deleteCategory(category_id);
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
			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async repair() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category', this);

		if (this.validateRepair()) {
			await this.model_catalog_category.repairCategories();

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
			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
				const data = {};
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
			'href': await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/category/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/category/delete', 'user_token=' + this.session.data['user_token'] + url, true);
		data['repair'] = await this.url.link('catalog/category/repair', 'user_token=' + this.session.data['user_token'] + url, true);

		data['categories'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const category_total = await this.model_catalog_category.getTotalCategories();

		const results = await this.model_catalog_category.getCategories(filter_data);

		for (let result of results) {
			data['categories'].push({
				'category_id': result['category_id'],
				'name': result['name'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/category/edit', 'user_token=' + this.session.data['user_token'] + '&category_id=' + result['category_id'] + url, true),
				'delete': await this.url.link('catalog/category/delete', 'user_token=' + this.session.data['user_token'] + '&category_id=' + result['category_id'] + url, true)
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

		data['sort_name'] = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = category_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (category_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (category_total - Number(this.config.get('config_limit_admin')))) ? category_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), category_total, Math.ceil(category_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;
		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('catalog/category_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['category_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['meta_title'])) {
			data['error_meta_title'] = this.error['meta_title'];
		} else {
			data['error_meta_title'] = {};
		}

		if ((this.error['keyword'])) {
			data['error_keyword'] = this.error['keyword'];
		} else {
			data['error_keyword'] = '';
		}

		if ((this.error['parent'])) {
			data['error_parent'] = this.error['parent'];
		} else {
			data['error_parent'] = '';
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
			'href': await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['category_id'])) {
			data['action'] = await this.url.link('catalog/category/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/category/edit', 'user_token=' + this.session.data['user_token'] + '&category_id=' + this.request.get['category_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true);
		let category_info = {};
		if ((this.request.get['category_id']) && (this.request.server['method'] != 'POST')) {
			category_info = await this.model_catalog_category.getCategory(this.request.get['category_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['category_description'])) {
			data['category_description'] = this.request.post['category_description'];
		} else if ((this.request.get['category_id'])) {
			data['category_description'] = await this.model_catalog_category.getCategoryDescriptions(this.request.get['category_id']);
		} else {
			data['category_description'] = {};
		}

		if ((this.request.post['path'])) {
			data['path'] = this.request.post['path'];
		} else if ((category_info)) {
			data['path'] = category_info['path'];
		} else {
			data['path'] = '';
		}

		if ((this.request.post['parent_id'])) {
			data['parent_id'] = this.request.post['parent_id'];
		} else if ((category_info)) {
			data['parent_id'] = category_info['parent_id'];
		} else {
			data['parent_id'] = 0;
		}

		this.load.model('catalog/filter', this);
		let filters = [];
		if ((this.request.post['category_filter'])) {
			filters = this.request.post['category_filter'];
		} else if ((this.request.get['category_id'])) {
			filters = await this.model_catalog_category.getCategoryFilters(this.request.get['category_id']);
		} else {
			filters = [];
		}

		data['category_filters'] = {};

		for (let filter_id of filters) {
			const filter_info = await this.model_catalog_filter.getFilter(filter_id);

			if (filter_info.filter_id) {
				data['category_filters'].push({
					'filter_id': filter_info['filter_id'],
					'name': filter_info['group'] + ' &gt; ' + filter_info['name']
				});
			}
		}

		this.load.model('setting/store', this);

		data['stores'] = [];

		data['stores'].push({
			'store_id': 0,
			'name': this.language.get('text_default')
		});

		const stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id': store['store_id'],
				'name': store['name']
			});
		}

		if ((this.request.post['category_store'])) {
			data['category_store'] = this.request.post['category_store'];
		} else if ((this.request.get['category_id'])) {
			data['category_store'] = await this.model_catalog_category.getCategoryStores(this.request.get['category_id']);
		} else {
			data['category_store'] = [0];
		}

		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((category_info)) {
			data['image'] = category_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image', this);

		if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
		} else if ((category_info) && is_file(DIR_IMAGE + category_info['image'])) {
			data['thumb'] = await this.model_tool_image.resize(category_info['image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if ((this.request.post['top'])) {
			data['top'] = this.request.post['top'];
		} else if ((category_info)) {
			data['top'] = category_info['top'];
		} else {
			data['top'] = 0;
		}

		if ((this.request.post['column'])) {
			data['column'] = this.request.post['column'];
		} else if ((category_info)) {
			data['column'] = category_info['column'];
		} else {
			data['column'] = 1;
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((category_info)) {
			data['sort_order'] = category_info['sort_order'];
		} else {
			data['sort_order'] = 0;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((category_info)) {
			data['status'] = category_info['status'];
		} else {
			data['status'] = true;
		}

		if ((this.request.post['category_seo_url'])) {
			data['category_seo_url'] = this.request.post['category_seo_url'];
		} else if ((this.request.get['category_id'])) {
			data['category_seo_url'] = await this.model_catalog_category.getCategorySeoUrls(this.request.get['category_id']);
		} else {
			data['category_seo_url'] = {};
		}

		if ((this.request.post['category_layout'])) {
			data['category_layout'] = this.request.post['category_layout'];
		} else if ((this.request.get['category_id'])) {
			data['category_layout'] = await this.model_catalog_category.getCategoryLayouts(this.request.get['category_id']);
		} else {
			data['category_layout'] = {};
		}

		this.load.model('design/layout', this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/category_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['category_description'])) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 255)) {
				this.error['name'] = this.error['name'] || {};
				this.error['name'][language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(value['meta_title']) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				this.error['meta_title'] = this.error['meta_title'] || {};
				this.error['meta_title'][language_id] = this.language.get('error_meta_title');
			}
		}

		if ((this.request.get['category_id']) && this.request.post['parent_id']) {
			const results = await this.model_catalog_category.getCategoryPath(this.request.post['parent_id']);

			for (let result of results) {
				if (result['path_id'] == this.request.get['category_id']) {
					this.error['parent'] = this.language.get('error_parent');

					break;
				}
			}
		}

		if (this.request.post['category_seo_url']) {
			this.load.model('design/seo_url', this);

			for (let [store_id, language] of Object.entries(this.request.post['category_seo_url'])) {
				for (let [language_id, keyword] of Object.entries(language)) {
					if ((keyword)) {
						if (Object.keys(language).filter(key => language[key] === keyword).length > 1) {
							this.error.keyword = this.error.keyword || {};
							this.error.keyword[store_id] = this.error.keyword[store_id] || {};
							this.error.keyword[store_id][language_id] = language.get('error_unique');
						}


						const seo_urls = await this.model_design_seo_url.getSeoUrlsByKeyword(keyword);

						for (let seo_url of seo_urls) {
							if ((seo_url['store_id'] == store_id) && (!(this.request.get['category_id']) || (seo_url['query'] != 'category_id=' + this.request.get['category_id']))) {
								this.error['keyword'] = this.error['keyword'] || {};
								this.error['keyword'][store_id] = this.error['keyword'][store_id] || {};
								this.error['keyword'][store_id][language_id] = this.language.get('error_keyword');

								break;
							}
						}
					}
				}
			}
		}

		if (Object.keys(this.error).length && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateRepair() {
		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/category', this);

			let filter_data = {
				'filter_name': this.request.get['filter_name'],
				'sort': 'name',
				'order': 'ASC',
				'start': 0,
				'limit': 5
			};

			const results = await this.model_catalog_category.getCategories(filter_data);

			for (let result of results) {
				json.push({
					'category_id': result['category_id'],
					'name': strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		json = json.sort((a, b) => a.name - b.name);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
