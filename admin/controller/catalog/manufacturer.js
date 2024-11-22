module.exports = class ControllerCatalogManufacturer extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/manufacturer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/manufacturer',this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/manufacturer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/manufacturer',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_manufacturer.addManufacturer(this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/manufacturer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/manufacturer',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_manufacturer.editManufacturer(this.request.get['manufacturer_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/manufacturer');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/manufacturer',this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (let manufacturer_id of this.request.post['selected']) {
				await this.model_catalog_manufacturer.deleteManufacturer(manufacturer_id);
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

			this.response.setRedirect(await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url, true));
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/manufacturer/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/manufacturer/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['manufacturers'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		manufacturer_total = await this.model_catalog_manufacturer.getTotalManufacturers();

		results = await this.model_catalog_manufacturer.getManufacturers(filter_data);

		for (let result of results) {
			data['manufacturers'].push({
				'manufacturer_id' : result['manufacturer_id'],
				'name'            : result['name'],
				'sort_order'      : result['sort_order'],
				'edit'            : await this.url.link('catalog/manufacturer/edit', 'user_token=' + this.session.data['user_token'] + '&manufacturer_id=' + result['manufacturer_id'] + url, true)
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

		data['sort_name'] = await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = manufacturer_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (manufacturer_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (manufacturer_total - Number(this.config.get('config_limit_admin')))) ? manufacturer_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), manufacturer_total, Math.ceil(manufacturer_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/manufacturer_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['manufacturer_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['manufacturer_id'])) {
			data['action'] = await this.url.link('catalog/manufacturer/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/manufacturer/edit', 'user_token=' + this.session.data['user_token'] + '&manufacturer_id=' + this.request.get['manufacturer_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['manufacturer_id']) && (this.request.server['method'] != 'POST')) {
			manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(this.request.get['manufacturer_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((manufacturer_info)) {
			data['name'] = manufacturer_info['name'];
		} else {
			data['name'] = '';
		}

		this.load.model('setting/store',this);

		data['stores'] = {};

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.language.get('text_default')
		});

		stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id' : store['store_id'],
				'name'     : store['name']
			});
		}

		if ((this.request.post['manufacturer_store'])) {
			data['manufacturer_store'] = this.request.post['manufacturer_store'];
		} else if ((this.request.get['manufacturer_id'])) {
			data['manufacturer_store'] = await this.model_catalog_manufacturer.getManufacturerStores(this.request.get['manufacturer_id']);
		} else {
			data['manufacturer_store'] = array(0);
		}

		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((manufacturer_info)) {
			data['image'] = manufacturer_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

		if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
		} else if ((manufacturer_info) && is_file(DIR_IMAGE + manufacturer_info['image'])) {
			data['thumb'] = await this.model_tool_image.resize(manufacturer_info['image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((manufacturer_info)) {
			data['sort_order'] = manufacturer_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['manufacturer_seo_url'])) {
			data['manufacturer_seo_url'] = this.request.post['manufacturer_seo_url'];
		} else if ((this.request.get['manufacturer_id'])) {
			data['manufacturer_seo_url'] = await this.model_catalog_manufacturer.getManufacturerSeoUrls(this.request.get['manufacturer_id']);
		} else {
			data['manufacturer_seo_url'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/manufacturer_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/manufacturer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		if (this.request.post['manufacturer_seo_url']) {
			this.load.model('design/seo_url',this);
			
			for (let [store_id , language] of Object.entries(this.request.post['manufacturer_seo_url'])) {
				for (let [language_id , keyword] of Object.entries(language)) {
					if ((keyword)) {
						if (count(array_keys(language, keyword)) > 1) {
							this.error['keyword'][store_id][language_id] = this.language.get('error_unique');
						}

						seo_urls = await this.model_design_seo_url.getSeoUrlsByKeyword(keyword);

						for (seo_urls of seo_url) {
							if ((seo_url['store_id'] == store_id) && (!(this.request.get['manufacturer_id']) || ((seo_url['query'] != 'manufacturer_id=' + this.request.get['manufacturer_id'])))) {
								this.error['keyword'][store_id][language_id] = this.language.get('error_keyword');
							}
						}
					}
				}
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/manufacturer')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product',this);

		for (let manufacturer_id of this.request.post['selected']) {
			product_total = await this.model_catalog_product.getTotalProductsByManufacturerId(manufacturer_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async autocomplete() {
		json = {};

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/manufacturer',this);

			filter_data = array(
				'filter_name' : this.request.get['filter_name'],
				'start'       : 0,
				'limit'       : 5
			});

			results = await this.model_catalog_manufacturer.getManufacturers(filter_data);

			for (let result of results) {
				json.push({
					'manufacturer_id' : result['manufacturer_id'],
					'name'            : strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		sort_order = {};

		for (json of key : value) {
			sort_order[key] = value['name'];
		}

		array_multisort(sort_order, SORT_ASC, json);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
