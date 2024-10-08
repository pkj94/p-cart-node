const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
module.exports = class CategoryCatalogController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('catalog/category');

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
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['repair'] = this.url.link('catalog/category.repair', 'user_token=' + this.session.data['user_token']);
		data['add'] = this.url.link('catalog/category.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/category.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/category', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/category');

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

		data['action'] = this.url.link('catalog/category.list', 'user_token=' + this.session.data['user_token'] + url);

		data['categories'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * this.config.get('config_pagination_admin'),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('catalog/category', this);

		const category_total = await this.model_catalog_category.getTotalCategories();

		const results = await this.model_catalog_category.getCategories(filter_data);

		for (let result of results) {
			data['categories'].push({
				'category_id': result['category_id'],
				'name': result['name'],
				'status': result['status'],
				'sort_order': result['sort_order'],
				'edit': this.url.link('catalog/category.form', 'user_token=' + this.session.data['user_token'] + '&category_id=' + result['category_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('catalog/category.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_sort_order'] = this.url.link('catalog/category.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': category_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('catalog/category.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (category_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (category_total - this.config.get('config_pagination_admin'))) ? category_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), category_total, Math.ceil(category_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/category_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('catalog/category');

		this.document.setTitle(this.language.get('heading_title'));



		data['text_form'] = !(this.request.get['category_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/category.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'] + url);
		let category_info = {};
		if ((this.request.get['category_id'])) {
			this.load.model('catalog/category', this);

			category_info = await this.model_catalog_category.getCategory(this.request.get['category_id']);
		}

		if ((this.request.get['category_id'])) {
			data['category_id'] = this.request.get['category_id'];
		} else {
			data['category_id'] = '';
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['category_id'])) {
			data['category_description'] = await this.model_catalog_category.getDescriptions(this.request.get['category_id']);
		} else {
			data['category_description'] = [];
		}

		if ((category_info)) {
			data['path'] = category_info['path'];
		} else {
			data['path'] = '';
		}

		if ((category_info)) {
			data['parent_id'] = category_info['parent_id'];
		} else {
			data['parent_id'] = '';
		}

		this.load.model('catalog/filter', this);
		let filters = [];
		if ((this.request.get['category_id'])) {
			filters = await this.model_catalog_category.getFilters(this.request.get['category_id']);
		}

		data['category_filters'] = [];

		for (let filter_id of filters) {
			let filter_info = await this.model_catalog_filter.getFilter(filter_id);

			if (filter_info) {
				data['category_filters'].push({
					'filter_id': filter_info['filter_id'],
					'name': filter_info['group'] + ' &gt; ' + filter_info['name']
				});
			}
		}

		data['stores'] = [];

		data['stores'].push({
			'store_id': 0,
			'name': this.language.get('text_default')
		});

		this.load.model('setting/store', this);

		let stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id': store['store_id'],
				'name': store['name']
			});
		}

		if ((this.request.get['category_id'])) {
			data['category_store'] = await this.model_catalog_category.getStores(this.request.get['category_id']);
		} else {
			data['category_store'] = [0];
		}

		if ((category_info)) {
			data['image'] = category_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image', this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (data['image'] && fs.existsSync(DIR_IMAGE + data['image'])) {
			data['thumb'] = await this.model_tool_image.resize(data['image'], 100, 100);
		} else {
			data['thumb'] = data['placeholder'];
		}
		console.log('data.image==========', data.image, data.thumb, data['placeholder'])

		if ((category_info)) {
			data['top'] = category_info['top'];
		} else {
			data['top'] = '';
		}

		if ((category_info)) {
			data['column'] = category_info['column'];
		} else {
			data['column'] = 1;
		}

		if ((category_info)) {
			data['sort_order'] = category_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((category_info)) {
			data['status'] = category_info['status'];
		} else {
			data['status'] = true;
		}

		data['category_seo_url'] = [];

		if ((this.request.get['category_id'])) {
			const results = await this.model_catalog_category.getSeoUrls(this.request.get['category_id']);
			for (let [store_id, languages] of Object.entries(results)) {
				for (let [language_id, keyword] of Object.entries(languages)) {
					let pos = strrpos(keyword, '/');

					if (pos !== false) {
						keyword = substr(keyword, pos + 1);
					} else {
						keyword = keyword;
					}
					data['category_seo_url'][store_id] = data['category_seo_url'][store_id] || {};
					data['category_seo_url'][store_id][language_id] = keyword;
				}
			}
		}

		this.load.model('design/layout', this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((this.request.get['category_id'])) {
			data['category_layout'] = await this.model_catalog_category.getLayouts(this.request.get['category_id']);
		} else {
			data['category_layout'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/category_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/category');
		const json = { error: {} };
		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			json['error']['warning'] = this.language.get('error_permission');
		}
		for (let [language_id, value] of Object.entries(this.request.post['category_description'])) {
			language_id = language_id.split('-')[1];
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 255)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(trim(value['meta_title'])) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				json['error']['meta_title_' + language_id] = this.language.get('error_meta_title');
			}
		}

		this.load.model('catalog/category', this);

		if ((this.request.post['category_id']) && this.request.post['parent_id']) {
			const results = await this.model_catalog_category.getPaths(this.request.post['parent_id']);

			for (let result of results) {
				if (result['path_id'] == this.request.post['category_id']) {
					json['error']['parent'] = this.language.get('error_parent');

					break;
				}
			}
		}

		if (this.request.post['category_seo_url']) {
			this.load.model('design/seo_url', this);

			for (let [store_id, language] of Object.entries(this.request.post['category_seo_url'])) {
				store_id = store_id.split('-')[1];
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.split('-')[1];
					if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword');
					}

					if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u', keyword)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_character');
					}

					let seo_url_info = await this.model_design_seo_url.getSeoUrlByKeyword(keyword, store_id);
					if (seo_url_info.key && (!(this.request.post['category_id']) || seo_url_info['key'] != 'path' || seo_url_info['value'] != await this.model_catalog_category.getPath(this.request.post['category_id']))) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_exists');
					}
				}
			}
		}
		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json.error).length) {
			if (!this.request.post['category_id'] || this.request.post['category_id'] == '0') {
				json['category_id'] = await this.model_catalog_category.addCategory(this.request.post);
			} else {
				await this.model_catalog_category.editCategory(this.request.post['category_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}
		// console.log(json,this.request.post)

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async repair() {
		await this.load.language('catalog/category');

		const json = {};

		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/category', this);

			await this.model_catalog_category.repairCategories();

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('catalog/category');

		const json = {};
		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/category')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/category', this);

			for (selected of category_id) {
				await this.model_catalog_category.deleteCategory(category_id);
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
		let json = [];

		if ((this.request.get['filter_name'])) {
			this.load.model('catalog/category', this);

			let filter_data = {
				'filter_name': '%' + this.request.get['filter_name'] + '%',
				'sort': 'name',
				'order': 'ASC',
				'start': 0,
				'limit': 5
			};

			const results = await this.model_catalog_category.getCategories(filter_data);

			for (let result of results) {
				json.push({
					'category_id': result['category_id'],
					'name': result['name']
				});
			}
		}

		let sort_order = [];

		for (let [key, value] of Object.entries(json)) {
			sort_order[key] = value['name'];
		}

		json = multiSort(json, sort_order, 'ASC');

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
