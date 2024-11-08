module.exports = class ControllerCatalogInformation extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/information');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/information');

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/information');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/information');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_information.addInformation(this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/information');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/information');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_information.editInformation(this.request.get['information_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/information');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/information');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of information_id) {
				await this.model_catalog_information.deleteInformation(information_id);
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

			this.response.setRedirect(await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'id.title';
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
			'href' : await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('catalog/information/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/information/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['informations'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		information_total = await this.model_catalog_information.getTotalInformations();

		results = await this.model_catalog_information.getInformations(filter_data);

		for (let result of results) {
			data['informations'].push({
				'information_id' : result['information_id'],
				'title'          : result['title'],
				'sort_order'     : result['sort_order'],
				'edit'           : await this.url.link('catalog/information/edit', 'user_token=' + this.session.data['user_token'] + '&information_id=' + result['information_id'] + url, true)
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

		data['sort_title'] = await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + '&sort=id.title' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + '&sort=i.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = information_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (information_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (information_total - this.config.get('config_limit_admin'))) ? information_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), information_total, ceil(information_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/information_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['information_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['title'])) {
			data['error_title'] = this.error['title'];
		} else {
			data['error_title'] = {};
		}

		if ((this.error['description'])) {
			data['error_description'] = this.error['description'];
		} else {
			data['error_description'] = {};
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
			'href' : await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['information_id'])) {
			data['action'] = await this.url.link('catalog/information/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/information/edit', 'user_token=' + this.session.data['user_token'] + '&information_id=' + this.request.get['information_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['information_id']) && (this.request.server['method'] != 'POST')) {
			information_info = await this.model_catalog_information.getInformation(this.request.get['information_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['information_description'])) {
			data['information_description'] = this.request.post['information_description'];
		} else if ((this.request.get['information_id'])) {
			data['information_description'] = await this.model_catalog_information.getInformationDescriptions(this.request.get['information_id']);
		} else {
			data['information_description'] = {};
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

		if ((this.request.post['information_store'])) {
			data['information_store'] = this.request.post['information_store'];
		} else if ((this.request.get['information_id'])) {
			data['information_store'] = await this.model_catalog_information.getInformationStores(this.request.get['information_id']);
		} else {
			data['information_store'] = array(0);
		}

		if ((this.request.post['bottom'])) {
			data['bottom'] = this.request.post['bottom'];
		} else if ((information_info)) {
			data['bottom'] = information_info['bottom'];
		} else {
			data['bottom'] = 0;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((information_info)) {
			data['status'] = information_info['status'];
		} else {
			data['status'] = true;
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((information_info)) {
			data['sort_order'] = information_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((this.request.post['information_seo_url'])) {
			data['information_seo_url'] = this.request.post['information_seo_url'];
		} else if ((this.request.get['information_id'])) {
			data['information_seo_url'] = await this.model_catalog_information.getInformationSeoUrls(this.request.get['information_id']);
		} else {
			data['information_seo_url'] = {};
		}

		if ((this.request.post['information_layout'])) {
			data['information_layout'] = this.request.post['information_layout'];
		} else if ((this.request.get['information_id'])) {
			data['information_layout'] = await this.model_catalog_information.getInformationLayouts(this.request.get['information_id']);
		} else {
			data['information_layout'] = {};
		}

		this.load.model('design/layout');

		data['layouts'] = await this.model_design_layout.getLayouts();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/information_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/information')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['information_description'] of language_id : value) {
			if ((oc_strlen(value['title']) < 1) || (oc_strlen(value['title']) > 64)) {
				this.error['title'][language_id] = this.language.get('error_title');
			}

			if (oc_strlen(value['description']) < 3) {
				this.error['description'][language_id] = this.language.get('error_description');
			}

			if ((oc_strlen(value['meta_title']) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				this.error['meta_title'][language_id] = this.language.get('error_meta_title');
			}
		}

		if (this.request.post['information_seo_url']) {
			this.load.model('design/seo_url');

			for (this.request.post['information_seo_url'] of store_id : language) {
				for (language of language_id : keyword) {
					if ((keyword)) {
						if (count(array_keys(language, keyword)) > 1) {
							this.error['keyword'][store_id][language_id] = this.language.get('error_unique');
						}

						seo_urls = await this.model_design_seo_url.getSeoUrlsByKeyword(keyword);

						for (seo_urls of seo_url) {
							if ((seo_url['store_id'] == store_id) && (!(this.request.get['information_id']) || (seo_url['query'] != 'information_id=' + this.request.get['information_id']))) {
								this.error['keyword'][store_id][language_id] = this.language.get('error_keyword');
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
		if (!await this.user.hasPermission('modify', 'catalog/information')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);

		for (this.request.post['selected'] of information_id) {
			if (this.config.get('config_account_id') == information_id) {
				this.error['warning'] = this.language.get('error_account');
			}

			if (this.config.get('config_checkout_id') == information_id) {
				this.error['warning'] = this.language.get('error_checkout');
			}

			if (this.config.get('config_affiliate_id') == information_id) {
				this.error['warning'] = this.language.get('error_affiliate');
			}

			if (this.config.get('config_return_id') == information_id) {
				this.error['warning'] = this.language.get('error_return');
			}

			store_total = await this.model_setting_store.getTotalStoresByInformationId(information_id);

			if (store_total) {
				this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}
