module.exports = class ControllerDesignLayout extends Controller {
	error = {};

	async index() {
		await this.load.language('design/layout');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/layout',this);

		await this.getList();
	}

	async add() {
		await this.load.language('design/layout');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/layout',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_layout.addLayout(this.request.post);

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

			this.response.setRedirect(await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('design/layout');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/layout',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_layout.editLayout(this.request.get['layout_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('design/layout');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/layout',this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of layout_id) {
				await this.model_design_layout.deleteLayout(layout_id);
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

			this.response.setRedirect(await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url, true));
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
			'href' : await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('design/layout/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('design/layout/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['layouts'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		layout_total = await this.model_design_layout.getTotalLayouts();

		results = await this.model_design_layout.getLayouts(filter_data);

		for (let result of results) {
			data['layouts'].push({
				'layout_id' : result['layout_id'],
				'name'      : result['name'],
				'edit'      : await this.url.link('design/layout/edit', 'user_token=' + this.session.data['user_token'] + '&layout_id=' + result['layout_id'] + url, true)
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

		data['sort_name'] = await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = layout_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (layout_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (layout_total - Number(this.config.get('config_limit_admin')))) ? layout_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), layout_total, Math.ceil(layout_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/layout_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['layout_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['layout_id'])) {
			data['action'] = await this.url.link('design/layout/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('design/layout/edit', 'user_token=' + this.session.data['user_token'] + '&layout_id=' + this.request.get['layout_id'] + url, true);
		}

		data['cancel'] = await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url, true);

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.get['layout_id']) && (this.request.server['method'] != 'POST')) {
			layout_info = await this.model_design_layout.getLayout(this.request.get['layout_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((layout_info)) {
			data['name'] = layout_info['name'];
		} else {
			data['name'] = '';
		}

		this.load.model('setting/store',this);

		data['stores'] = await this.model_setting_store.getStores();

		if ((this.request.post['layout_route'])) {
			data['layout_routes'] = this.request.post['layout_route'];
		} else if ((this.request.get['layout_id'])) {
			data['layout_routes'] = await this.model_design_layout.getLayoutRoutes(this.request.get['layout_id']);
		} else {
			data['layout_routes'] = {};
		}

		this.load.model('setting/extension',this);

		this.load.model('setting/module');

		data['extensions'] = {};

		// Get a list of installed modules
		extensions = await this.model_setting_extension.getInstalled('module');

		// Add all the modules which have multiple settings for each module
		for (extensions of code) {
			await this.load.language('extension/module/' + code, 'extension');

			module_data = {};

			modules = await this.model_setting_module.getModulesByCode(code);

			for (modules of module) {
				module_data.push({
					'name' : strip_tags(module['name']),
					'code' : code + '.' +  module['module_id']
				});
			}

			if (this.config.has('module_' + code + '_status') || module_data) {
				data['extensions'].push({
					'name'   : strip_tags(this.language.get('extension').get('heading_title')),
					'code'   : code,
					'module' : module_data
				});
			}
		}

		// Modules layout
		if ((this.request.post['layout_module'])) {
			layout_modules = this.request.post['layout_module'];
		} else if ((this.request.get['layout_id'])) {
			layout_modules = await this.model_design_layout.getLayoutModules(this.request.get['layout_id']);
		} else {
			layout_modules = {};
		}

		data['layout_modules'] = {};

		// Add all the modules which have multiple settings for each module
		for (layout_modules of layout_module) {
			part = explode('.', layout_module['code']);

			if (!(part[1])) {
				data['layout_modules'].push({
					'code'       : layout_module['code'],
					'edit'       : await this.url.link('extension/module/' + part[0], 'user_token=' + this.session.data['user_token'], true),
					'position'   : layout_module['position'],
					'sort_order' : layout_module['sort_order']
				});
			} else {
				module_info = await this.model_setting_module.getModule(part[1]);

				if (module_info) {
					data['layout_modules'].push({
						'code'       : layout_module['code'],
						'edit'       : await this.url.link('extension/module/' + part[0], 'user_token=' + this.session.data['user_token'] + '&module_id=' + part[1], true),
						'position'   : layout_module['position'],
						'sort_order' : layout_module['sort_order']
					});
				}
			}
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/layout_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'design/layout')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'design/layout')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);
		this.load.model('catalog/product',this);
		this.load.model('catalog/category',this);
		this.load.model('catalog/information');

		for (this.request.post['selected'] of layout_id) {
			if (this.config.get('config_layout_id') == layout_id) {
				this.error['warning'] = this.language.get('error_default');
			}

			store_total = await this.model_setting_store.getTotalStoresByLayoutId(layout_id);

			if (store_total) {
				this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
			}

			product_total = await this.model_catalog_product.getTotalProductsByLayoutId(layout_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}

			category_total = await this.model_catalog_category.getTotalCategoriesByLayoutId(layout_id);

			if (category_total) {
				this.error['warning'] = sprintf(this.language.get('error_category'), category_total);
			}

			information_total = await this.model_catalog_information.getTotalInformationsByLayoutId(layout_id);

			if (information_total) {
				this.error['warning'] = sprintf(this.language.get('error_information'), information_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}
