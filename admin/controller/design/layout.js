const sprintf = require("locutus/php/strings/sprintf");

module.exports = class LayoutDesignController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('design/layout');

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
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('design/layout.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('design/layout.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/layout', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('design/layout');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
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

		data['action'] = await this.url.link('design/layout.list', 'user_token=' + this.session.data['user_token'] + url);

		data['layouts'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('design/layout', this);

		const layout_total = await this.model_design_layout.getTotalLayouts();

		const results = await this.model_design_layout.getLayouts(filter_data);

		for (let result of results) {
			data['layouts'].push({
				'layout_id': result['layout_id'],
				'name': result['name'],
				'edit': await this.url.link('design/layout.form', 'user_token=' + this.session.data['user_token'] + '&layout_id=' + result['layout_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('design/layout.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': layout_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('design/layout.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (layout_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (layout_total - this.config.get('config_pagination_admin'))) ? layout_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), layout_total, Math.ceil(layout_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('design/layout_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('design/layout');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['layout_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('design/layout.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'] + url);
		let layout_info;
		if ((this.request.get['layout_id'])) {
			this.load.model('design/layout', this);

			layout_info = await this.model_design_layout.getLayout(this.request.get['layout_id']);
		}

		if ((this.request.get['layout_id'])) {
			data['layout_id'] = this.request.get['layout_id'];
		} else {
			data['layout_id'] = 0;
		}

		if ((layout_info)) {
			data['name'] = layout_info['name'];
		} else {
			data['name'] = '';
		}

		this.load.model('setting/store', this);

		data['stores'] = await this.model_setting_store.getStores();

		if ((this.request.get['layout_id'])) {
			data['layout_routes'] = await this.model_design_layout.getRoutes(this.request.get['layout_id']);
		} else {
			data['layout_routes'] = [];
		}

		this.load.model('setting/extension', this);

		this.load.model('setting/module', this);

		data['extensions'] = [];

		// Get a list of installed modules
		const extensions = await this.model_setting_extension.getExtensionsByType('module');

		// Add all the modules which have multiple settings for each module
		for (let extension of extensions) {
			await this.load.language('extension/' + extension['extension'] + '/module/' + extension['code'], extension['code']);

			let module_data = [];

			const modules = await this.model_setting_module.getModulesByCode(extension['extension'] + '.' + extension['code']);

			for (let module of modules) {
				module_data.push({
					'name': strip_tags(module['name']),
					'code': extension['extension'] + '.' + extension['code'] + '.' + module['module_id']
				});
			}

			if (this.config.has('module_' + extension['code'] + '_status') || module_data) {
				data['extensions'].push({
					'name': strip_tags(this.language.get(extension['code'] + '_heading_title')),
					'code': extension['extension'] + '.' + extension['code'],
					'module': module_data
				});
			}
		}

		// Modules layout
		let layout_modules = [];
		if ((layout_info)) {
			layout_modules = await this.model_design_layout.getModules(this.request.get['layout_id']);
		}

		data['layout_modules'] = [];

		// Add all the modules which have multiple settings for each module
		for (let layout_module of layout_modules) {
			let part = layout_module['code'].split('.');

			if (!(part[2])) {
				data['layout_modules'].push({
					'code': layout_module['code'],
					'position': layout_module['position'],
					'sort_order': layout_module['sort_order'],
					'edit': await this.url.link('extension/' + part[0] + '/module/' + part[1], 'user_token=' + this.session.data['user_token'])
				});
			} else {
				const module_info = await this.model_setting_module.getModule(part[2]);

				if (module_info && module_info.module_id) {
					data['layout_modules'].push({
						'code': layout_module['code'],
						'position': layout_module['position'],
						'sort_order': layout_module['sort_order'],
						'edit': await this.url.link('extension/' + part[0] + '/module/' + part[1], 'user_token=' + this.session.data['user_token'] + '&module_id=' + part[2])
					});
				}
			}
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/layout_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('design/layout');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'design/layout')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('design/layout', this);
			this.request.post['layout_id'] = Number(this.request.post['layout_id']);
			if (!this.request.post['layout_id']) {
				json['layout_id'] = await this.model_design_layout.addLayout(this.request.post);
			} else {
				await this.model_design_layout.editLayout(this.request.post['layout_id'], this.request.post);
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
		await this.load.language('design/layout');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'design/layout')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store', this);
		this.load.model('catalog/product', this);
		this.load.model('catalog/category', this);
		this.load.model('catalog/manufacturer', this);
		this.load.model('catalog/information', this);

		for (let layout_id of selected) {
			if (this.config.get('config_layout_id') == layout_id) {
				json['error'] = this.language.get('error_default');
			}

			const store_total = await this.model_setting_store.getTotalStoresByLayoutId(layout_id);

			if (store_total) {
				json['error'] = sprintf(this.language.get('error_store'), store_total);
			}

			const product_total = await this.model_catalog_product.getTotalProductsByLayoutId(layout_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}

			const category_total = await this.model_catalog_category.getTotalCategoriesByLayoutId(layout_id);

			if (category_total) {
				json['error'] = sprintf(this.language.get('error_category'), category_total);
			}

			const manufacturer_total = await this.model_catalog_manufacturer.getTotalManufacturersByLayoutId(layout_id);

			if (manufacturer_total) {
				json['error'] = sprintf(this.language.get('error_manufacturer'), manufacturer_total);
			}

			const information_total = await this.model_catalog_information.getTotalInformationsByLayoutId(layout_id);

			if (information_total) {
				json['error'] = sprintf(this.language.get('error_information'), information_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('design/layout', this);

			for (let layout_id of selected) {
				await this.model_design_layout.deleteLayout(layout_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
