module.exports = class FilterController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('catalog/filter');

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
			'href' : this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/filter.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/filter.delete', 'user_token=' + this.session.data['user_token']);

		data['user_token'] = this.session.data['user_token'];

		data['list'] = await this.getList();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/filter', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/filter');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'fgd.name';
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

		data['action'] = this.url.link('catalog/filter.list', 'user_token=' + this.session.data['user_token'] + url);

		data['filters'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('catalog/filter',this);

		filter_total await this.model_catalog_filter.getTotalGroups();

		const results = await this.model_catalog_filter.getGroups(filter_data);

		for (let result of results) {
			data['filters'].push({
				'filter_group_id' : result['filter_group_id'],
				'name'            : result['name'],
				'sort_order'      : result['sort_order'],
				'edit'            : this.url.link('catalog/filter.form', 'user_token=' + this.session.data['user_token'] + '&filter_group_id=' + result['filter_group_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = this.url.link('catalog/filter.list', 'user_token=' + this.session.data['user_token'] + '&sort=fgd.name' + url);
		data['sort_sort_order'] = this.url.link('catalog/filter.list', 'user_token=' + this.session.data['user_token'] + '&sort=fg.sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : filter_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('catalog/filter.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (filter_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (filter_total - this.config.get('config_pagination_admin'))) ? filter_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), filter_total, Math.ceil(filter_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/filter_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('catalog/filter');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['filter_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/filter.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['filter_group_id'])) {
			this.load.model('catalog/filter',this);

			filter_group_info await this.model_catalog_filter.getGroup(this.request.get['filter_group_id']);
		}

		if ((this.request.get['filter_group_id'])) {
			data['filter_group_id'] = this.request.get['filter_group_id'];
		} else {
			data['filter_group_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['filter_group_id'])) {
			data['filter_group_description'] = await this.model_catalog_filter.getGroupDescriptions(this.request.get['filter_group_id']);
		} else {
			data['filter_group_description'] = [];
		}

		if ((filter_group_info)) {
			data['sort_order'] = filter_group_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((filter_group_info)) {
			data['filters'] = await this.model_catalog_filter.getDescriptions(this.request.get['filter_group_id']);
		} else {
			data['filters'] = [];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/filter_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/filter');

		const json = {};

		if (!await this.user.hasPermission('modify', 'catalog/filter')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['filter_group_description'] of language_id : value) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 64)) {
				json['error']['group_' + language_id] = this.language.get('error_group');
			}
		}

		if ((this.request.post['filter'])) {
			for (this.request.post['filter'] of key : filter) {
				for (filter['filter_description'] of language_id : filter_description) {
					if ((oc_strlen(trim(filter_description['name'])) < 1) || (oc_strlen(filter_description['name']) > 64)) {
						json['error']['filter_' + key + '_' + language_id] = this.language.get('error_name');
					}
				}
			}
		} else {
			json['error']['warning']  = this.language.get('error_values');
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/filter',this);

			if (!this.request.post['filter_group_id']) {
				json['filter_group_id'] = await this.model_catalog_filter.addFilter(this.request.post);
			} else {
				await this.model_catalog_filter.editFilter(this.request.post['filter_group_id'], this.request.post);
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
		await this.load.language('catalog/filter');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/filter')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/filter',this);

			for (let filter_id of selected) {
				await this.model_catalog_filter.deleteFilter(filter_id);
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
			this.load.model('catalog/filter',this);

			let filter_data = {
				'filter_name' : this.request.get['filter_name'],
				'start'       : 0,
				'limit'       : 5
			];

			filters = await this.model_catalog_filter.getFilters(filter_data);

			for (filters of filter) {
				json.push({
					'filter_id' : filter['filter_id'],
					'name'      : strip_tags(html_entity_decode(filter['group'] + ' &gt; ' + filter['name']))
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
