module.exports = class ControllerCatalogOption extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('catalog/option');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/option', this);

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/option');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/option', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_option.addOption(this.request.post);

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
			this.response.setRedirect(await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/option');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/option', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_option.editOption(this.request.get['option_id'], this.request.post);

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
			this.response.setRedirect(await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/option');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/option', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let option_id of this.request.post['selected']) {
				await this.model_catalog_option.deleteOption(option_id);
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
			this.response.setRedirect(await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getList();
	}

	async getList() {
		const data = {};
		let sort = 'od.name';
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
			'href': await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/option/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/option/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['options'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const option_total = await this.model_catalog_option.getTotalOptions();

		const results = await this.model_catalog_option.getOptions(filter_data);

		for (let result of results) {
			data['options'].push({
				'option_id': result['option_id'],
				'name': result['name'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/option/edit', 'user_token=' + this.session.data['user_token'] + '&option_id=' + result['option_id'] + url, true)
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

		data['sort_name'] = await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + '&sort=od.name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + '&sort=o.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = option_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (option_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (option_total - Number(this.config.get('config_limit_admin')))) ? option_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), option_total, Math.ceil(option_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data);
		this.response.setOutput(await this.load.view('catalog/option_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['option_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['option_value'])) {
			data['error_option_value'] = this.error['option_value'];
		} else {
			data['error_option_value'] = {};
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
			'href': await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['option_id'])) {
			data['action'] = await this.url.link('catalog/option/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/option/edit', 'user_token=' + this.session.data['user_token'] + '&option_id=' + this.request.get['option_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url, true);
		let option_info;
		if ((this.request.get['option_id']) && (this.request.server['method'] != 'POST')) {
			option_info = await this.model_catalog_option.getOption(this.request.get['option_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['option_description'])) {
			data['option_description'] = this.request.post['option_description'];
		} else if ((this.request.get['option_id'])) {
			data['option_description'] = await this.model_catalog_option.getOptionDescriptions(this.request.get['option_id']);
		} else {
			data['option_description'] = {};
		}

		if ((this.request.post['type'])) {
			data['type'] = this.request.post['type'];
		} else if ((option_info)) {
			data['type'] = option_info['type'];
		} else {
			data['type'] = '';
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((option_info)) {
			data['sort_order'] = option_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}
		let option_values = [];
		if ((this.request.post['option_value'])) {
			this.request.post['option_value'] = Array.isArray(this.request.post['option_value']) ? this.request.post['option_value'] : Object.values(this.request.post['option_value']);
			option_values = this.request.post['option_value'];
		} else if ((this.request.get['option_id'])) {
			option_values = await this.model_catalog_option.getOptionValueDescriptions(this.request.get['option_id']);
		} else {
			option_values = [];
		}

		this.load.model('tool/image', this);

		data['option_values'] = [];

		for (let option_value of option_values) {
			let image = '';
			let thumb = 'no_image.png';
			if (is_file(DIR_IMAGE + option_value['image'])) {
				image = option_value['image'];
				thumb = option_value['image'];
			}

			data['option_values'].push({
				'option_value_id': option_value['option_value_id'],
				'option_value_description': option_value['option_value_description'],
				'image': image,
				'thumb': await this.model_tool_image.resize(thumb, 100, 100),
				'sort_order': option_value['sort_order']
			});
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/option_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/option')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['option_description'])) {
			if ((oc_strlen(value['name']) < 1) || (oc_strlen(value['name']) > 128)) {
				this.error['name'] = this.error['name'] || {};
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		if ((this.request.post['type'] == 'select' || this.request.post['type'] == 'radio' || this.request.post['type'] == 'checkbox') && !(this.request.post['option_value'])) {
			this.error['warning'] = this.language.get('error_type');
		}

		if ((this.request.post['option_value'])) {
			for (let [option_value_id, option_value] of Object.entries(this.request.post['option_value'])) {
				for (let [language_id, option_value_description] of Object.entries(option_value['option_value_description'])) {
					if ((oc_strlen(option_value_description['name']) < 1) || (oc_strlen(option_value_description['name']) > 128)) {
						this.error['option_value'] = this.error['option_value'] || {};
						this.error['option_value'][option_value_id] = this.error['option_value'][option_value_id] || {};
						this.error['option_value'][option_value_id][language_id] = this.language.get('error_option_value');
					}
				}
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/option')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product', this);
		this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];

		for (let option_id of this.request.post['selected']) {
			const product_total = await this.model_catalog_product.getTotalProductsByOptionId(option_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async autocomplete() {
		let json = [];

		if ((this.request.get['filter_name'])) {
			await this.load.language('catalog/option');

			this.load.model('catalog/option', this);

			this.load.model('tool/image', this);

			let filter_data = {
				'filter_name': this.request.get['filter_name'],
				'start': 0,
				'limit': 5
			};

			const options = await this.model_catalog_option.getOptions(filter_data);

			for (let option of options) {
				let option_value_data = [];

				if (option['type'] == 'select' || option['type'] == 'radio' || option['type'] == 'checkbox' || option['type'] == 'image') {
					const option_values = await this.model_catalog_option.getOptionValues(option['option_id']);

					for (let option_value of option_values) {
						let image = await this.model_tool_image.resize('no_image.png', 50, 50);
						if (is_file(DIR_IMAGE + option_value['image'])) {
							image = await this.model_tool_image.resize(option_value['image'], 50, 50);
						}

						option_value_data.push({
							'option_value_id': option_value['option_value_id'],
							'name': strip_tags(html_entity_decode(option_value['name'])),
							'image': image
						});
					}
					option_value_data = option_value_data.sort((a, b) => a.name - b.name);
				}

				let type = '';

				if (option['type'] == 'select' || option['type'] == 'radio' || option['type'] == 'checkbox') {
					type = this.language.get('text_choose');
				}

				if (option['type'] == 'text' || option['type'] == 'textarea') {
					type = this.language.get('text_input');
				}

				if (option['type'] == 'file') {
					type = this.language.get('text_file');
				}

				if (option['type'] == 'date' || option['type'] == 'datetime' || option['type'] == 'time') {
					type = this.language.get('text_date');
				}

				json.push({
					'option_id': option['option_id'],
					'name': strip_tags(html_entity_decode(option['name'])),
					'category': type,
					'type': option['type'],
					'option_value': option_value_data
				});
			}
		}
		json = json.sort((a, b) => a.name - b.name);
		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}