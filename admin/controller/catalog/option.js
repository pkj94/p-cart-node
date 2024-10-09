module.exports = class OptionController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('catalog/option');

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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/option.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/option.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/option', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/option');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'od.name';
		}

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page '])) {
			page = this.request.get['page '];
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

		data['action'] = this.url.link('catalog/option.list', 'user_token=' + this.session.data['user_token'] + url);

		data['options'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('catalog/option',this);

		option_total await this.model_catalog_option.getTotalOptions();

		const results = await this.model_catalog_option.getOptions(filter_data);

		for (let result of results) {
			data['options'].push({
				'option_id'  : result['option_id'],
				'name'       : result['name'],
				'sort_order' : result['sort_order'],
				'edit'       : this.url.link('catalog/option.form', 'user_token=' + this.session.data['user_token'] + '&option_id=' + result['option_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('catalog/option.list', 'user_token=' + this.session.data['user_token'] + '&sort=od.name' + url);
		data['sort_sort_order'] = this.url.link('catalog/option.list', 'user_token=' + this.session.data['user_token'] + '&sort=o.sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : option_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('catalog/option.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (option_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (option_total - this.config.get('config_pagination_admin'))) ? option_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), option_total, Math.ceil(option_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/option_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('catalog/option');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['option_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/option.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['option_id'])) {
			this.load.model('catalog/option',this);

			option_info await this.model_catalog_option.getOption(this.request.get['option_id']);
		}

		if ((this.request.get['option_id'])) {
			data['option_id'] = this.request.get['option_id'];
		} else {
			data['option_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['option_id'])) {
			data['option_description'] = await this.model_catalog_option.getDescriptions(this.request.get['option_id']);
		} else {
			data['option_description'] = [];
		}

		if ((option_info)) {
			data['type'] = option_info['type'];
		} else {
			data['type'] = '';
		}

		if ((option_info)) {
			data['sort_order'] = option_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((this.request.get['option_id'])) {
			option_values await this.model_catalog_option.getValueDescriptions(this.request.get['option_id']);
		} else {
			option_values = [];
		}

		this.load.model('tool/image',this);

		data['option_values'] = [];

		for (option_values of option_value) {
			if (is_file(DIR_IMAGE + html_entity_decode(option_value['image']))) {
				image = option_value['image'];
				thumb = option_value['image'];
			} else {
				image = '';
				thumb = 'no_image.png';
			}

			data['option_values'].push({
				'option_value_id'          : option_value['option_value_id'],
				'option_value_description' : option_value['option_value_description'],
				'image'                    : image,
				'thumb'                    : this.model_tool_image.resize(html_entity_decode(thumb), 100, 100),
				'sort_order'               : option_value['sort_order']
			];
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/option_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/option');

		const json = {};

		if (!await this.user.hasPermission('modify', 'catalog/option')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['option_description'] of language_id : value) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 128)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if ((this.request.post['type'] == 'select' || this.request.post['type'] == 'radio' || this.request.post['type'] == 'checkbox') && !(this.request.post['option_value'])) {
			json['error']['warning'] = this.language.get('error_type');
		}

		if ((this.request.post['option_value'])) {
			if ((this.request.post['option_id'])) {
				this.load.model('catalog/product',this);

				option_value_data = [];

				for (this.request.post['option_value'] of option_value) {
					if (option_value['option_value_id']) {
						option_value_data[] = option_value['option_value_id'];
					}
				}

				product_option_values await this.model_catalog_product.getOptionValuesByOptionId(this.request.post['option_id']);

				for (product_option_values of product_option_value) {
					if (!in_array(product_option_value['option_value_id'], option_value_data)) {
						json['error']['warning'] = sprintf(this.language.get('error_value'), this.model_catalog_product.getTotalProductsByOptionValueId(product_option_value['option_value_id']));
					}
				}
			}
		}

		if ((this.request.post['option_value'])) {
			for (this.request.post['option_value'] of option_value_id : option_value) {
				for (option_value['option_value_description'] of language_id : option_value_description) {
					if ((oc_strlen(trim(option_value_description['name'])) < 1) || (oc_strlen(option_value_description['name']) > 128)) {
						json['error']['option_value_' + option_value_id + '_' + language_id] = this.language.get('error_option_value');
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/option',this);

			if (!this.request.post['option_id']) {
				json['option_id'] = await this.model_catalog_option.addOption(this.request.post);
			} else {
				await this.model_catalog_option.editOption(this.request.post['option_id'], this.request.post);
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
		await this.load.language('catalog/option');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/option')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product',this);

		for (let option_id of selected) {
			const product_total = await this.model_catalog_product.getTotalProductsByOptionId(option_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/option',this);

			for (let option_id of selected) {
				await this.model_catalog_option.deleteOption(option_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async autocomplete() {
		const json = {};

		if ((this.request.get['filter_name'])) {
			await this.load.language('catalog/option');

			this.load.model('catalog/option',this);

			this.load.model('tool/image',this);

			let filter_data = {
				'filter_name' : this.request.get['filter_name'],
				'start'       : 0,
				'limit'       : 5
			];

			options await this.model_catalog_option.getOptions(filter_data);

			for (options of option) {
				option_value_data = [];

				if (option['type'] == 'select' || option['type'] == 'radio' || option['type'] == 'checkbox' || option['type'] == 'image') {
					option_values await this.model_catalog_option.getValues(option['option_id']);

					for (option_values of option_value) {
						if (is_file(DIR_IMAGE + html_entity_decode(option_value['image']))) {
							image await this.model_tool_image.resize(html_entity_decode(option_value['image']), 50, 50);
						} else {
							image await this.model_tool_image.resize('no_image.png', 50, 50);
						}

						option_value_data.push({
							'option_value_id' : option_value['option_value_id'],
							'name'            : strip_tags(html_entity_decode(option_value['name'])),
							'image'           : image
						];
					}

					sort_order = [];

					for (option_value_data of key : value) {
						sort_order[key] = value['name'];
					}

					option_value_data= multiSort(option_value_data,sort_order,'ASC');
				}

				type = '';

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
					'option_id'    : option['option_id'],
					'name'         : strip_tags(html_entity_decode(option['name'])),
					'category'     : type,
					'type'         : option['type'],
					'option_value' : option_value_data
				];
			}
		}

		sort_order = [];

		for (let [key , value] of json) {
			sort_order[key] = value['name'];
		}

		json= multiSort(json,sort_order,'ASC');

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
