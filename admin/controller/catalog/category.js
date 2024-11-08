module.exports = class ControllerCatalogCategory extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category');

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_category.addCategory(this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_category.editCategory(this.request.get['category_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of category_id) {
				await this.model_catalog_category.deleteCategory(category_id);
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

			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async repair() {
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/category');

		if (this.validateRepair()) {
			await this.model_catalog_category.repairCategories();

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

			this.response.setRedirect(await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
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
			'href' : await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('catalog/category/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/category/delete', 'user_token=' + this.session.data['user_token'] + url, true);
		data['repair'] = await this.url.link('catalog/category/repair', 'user_token=' + this.session.data['user_token'] + url, true);

		data['categories'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		category_total = await this.model_catalog_category.getTotalCategories();

		results = await this.model_catalog_category.getCategories(filter_data);

		for (let result of results) {
			data['categories'].push({
				'category_id' : result['category_id'],
				'name'        : result['name'],
				'sort_order'  : result['sort_order'],
				'edit'        : await this.url.link('catalog/category/edit', 'user_token=' + this.session.data['user_token'] + '&category_id=' + result['category_id'] + url, true),
				'delete'      : await this.url.link('catalog/category/delete', 'user_token=' + this.session.data['user_token'] + '&category_id=' + result['category_id'] + url, true)
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

		data['sort_name'] = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = category_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (category_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (category_total - this.config.get('config_limit_admin'))) ? category_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), category_total, ceil(category_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/category_list', data));
	}

	async getForm() {
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
			'href' : await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['category_id'])) {
			data['action'] = await this.url.link('catalog/category/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/category/edit', 'user_token=' + this.session.data['user_token'] + '&category_id=' + this.request.get['category_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['category_id']) && (this.request.server['method'] != 'POST')) {
			category_info = await this.model_catalog_category.getCategory(this.request.get['category_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language',this);

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

		this.load.model('catalog/filter');

		if ((this.request.post['category_filter'])) {
			filters = this.request.post['category_filter'];
		} else if ((this.request.get['category_id'])) {
			filters = await this.model_catalog_category.getCategoryFilters(this.request.get['category_id']);
		} else {
			filters = {};
		}

		data['category_filters'] = {};

		for (filters of filter_id) {
			filter_info = await this.model_catalog_filter.getFilter(filter_id);

			if (filter_info) {
				data['category_filters'].push({
					'filter_id' : filter_info['filter_id'],
					'name'      : filter_info['group'] + ' &gt; ' + filter_info['name']
				);
			}
		}

		this.load.model('setting/store',this);

		data['stores'] = {};

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.language.get('text_default')
		);

		stores = await this.model_setting_store.getStores();

		for (stores of store) {
			data['stores'].push({
				'store_id' : store['store_id'],
				'name'     : store['name']
			);
		}

		if ((this.request.post['category_store'])) {
			data['category_store'] = this.request.post['category_store'];
		} else if ((this.request.get['category_id'])) {
			data['category_store'] = await this.model_catalog_category.getCategoryStores(this.request.get['category_id']);
		} else {
			data['category_store'] = array(0);
		}

		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((category_info)) {
			data['image'] = category_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

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

		this.load.model('design/layout');

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

		for (this.request.post['category_description'] of language_id : value) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 255)) {
				this.error['name'][language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(value['meta_title']) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				this.error['meta_title'][language_id] = this.language.get('error_meta_title');
			}
		}

		if ((this.request.get['category_id']) && this.request.post['parent_id']) {
			results = await this.model_catalog_category.getCategoryPath(this.request.post['parent_id']);

			for (let result of results) {
				if (result['path_id'] == this.request.get['category_id']) {
					this.error['parent'] = this.language.get('error_parent');

					break;
				}
			}
		}

		if (this.request.post['category_seo_url']) {
			this.load.model('design/seo_url');

			for (this.request.post['category_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						if (count(array_keys(language, keyword)) > 1) {
							this.error['keyword'][store_id][language_id] = this.language.get('error_unique');
						}

						seo_urls = await this.model_design_seo_url.getSeoUrlsByKeyword(keyword);

						for (seo_urls of seo_url) {
							if ((seo_url['store_id'] == store_id) && (!(this.request.get['category_id']) || (seo_url['query'] != 'category_id=' + this.request.get['category_id']))) {
								this.error['keyword'][store_id][language_id] = this.language.get('error_keyword');

								break;
							}
						}
					}
				}
			}
		}

		if (this.error && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateRepair() {
		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}

	async autocomplete() {
		json = {};

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/category');

			filter_data = array(
				'filter_name' : this.request.get['filter_name'],
				'sort'        : 'name',
				'order'       : 'ASC',
				'start'       : 0,
				'limit'       : 5
			);

			results = await this.model_catalog_category.getCategories(filter_data);

			for (let result of results) {
				json.push({
					'category_id' : result['category_id'],
					'name'        : strip_tags(html_entity_decode(result['name']))
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
