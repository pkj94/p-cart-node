const fs = require('fs');
const sprintf = require('locutus/php/strings/sprintf');
module.exports = class ManufacturerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('catalog/manufacturer');

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
			'href': await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('catalog/manufacturer.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('catalog/manufacturer.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/manufacturer', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/manufacturer');

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

		data['action'] = await this.url.link('catalog/manufacturer.list', 'user_token=' + this.session.data['user_token'] + url);

		data['manufacturers'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('catalog/manufacturer', this);

		const manufacturer_total = await this.model_catalog_manufacturer.getTotalManufacturers();

		const results = await this.model_catalog_manufacturer.getManufacturers(filter_data);

		for (let result of results) {
			data['manufacturers'].push({
				'manufacturer_id': result['manufacturer_id'],
				'name': result['name'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/manufacturer.form', 'user_token=' + this.session.data['user_token'] + '&manufacturer_id=' + result['manufacturer_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('catalog/manufacturer.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_sort_order'] = await this.url.link('catalog/manufacturer.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': manufacturer_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('catalog/manufacturer.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (manufacturer_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (manufacturer_total - this.config.get('config_pagination_admin'))) ? manufacturer_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), manufacturer_total, Math.ceil(manufacturer_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/manufacturer_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('catalog/manufacturer');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['manufacturer_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('catalog/manufacturer.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'] + url);
		let manufacturer_info
		if ((this.request.get['manufacturer_id'])) {
			this.load.model('catalog/manufacturer', this);

			manufacturer_info = await this.model_catalog_manufacturer.getManufacturer(this.request.get['manufacturer_id']);
		}

		if ((this.request.get['manufacturer_id'])) {
			data['manufacturer_id'] = this.request.get['manufacturer_id'];
		} else {
			data['manufacturer_id'] = 0;
		}

		if ((manufacturer_info)) {
			data['name'] = manufacturer_info['name'];
		} else {
			data['name'] = '';
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

		if ((this.request.get['manufacturer_id'])) {
			data['manufacturer_store'] = await this.model_catalog_manufacturer.getStores(this.request.get['manufacturer_id']);
		} else {
			data['manufacturer_store'] = [0];
		}

		if ((manufacturer_info)) {
			data['image'] = manufacturer_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image', this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (data['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(data['image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(data['image']), 100, 100);
		} else {
			data['thumb'] = data['placeholder'];
		}

		if ((manufacturer_info)) {
			data['sort_order'] = manufacturer_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['manufacturer_id'])) {
			data['manufacturer_seo_url'] = await this.model_catalog_manufacturer.getSeoUrls(this.request.get['manufacturer_id']);
		} else {
			data['manufacturer_seo_url'] = [];
		}

		this.load.model('design/layout', this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((this.request.get['manufacturer_id'])) {
			data['manufacturer_layout'] = await this.model_catalog_manufacturer.getLayouts(this.request.get['manufacturer_id']);
		} else {
			data['manufacturer_layout'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/manufacturer_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/manufacturer');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'catalog/manufacturer')) {
			json['error']['warning'] = this.language.get('error_permission');
		}
		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 64)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (this.request.post['manufacturer_seo_url']) {
			this.load.model('design/seo_url', this);

			for (let [store_id, language] of Object.entries(this.request.post['manufacturer_seo_url'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword');
					}

					if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+\/u', keyword)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_character');
					}

					let seo_url_info = await this.model_design_seo_url.getSeoUrlByKeyword(keyword, store_id);
					if (seo_url_info && seo_url_info.seo_url_id && (seo_url_info['key'] != 'manufacturer_id' || !(this.request.post['manufacturer_id']) || seo_url_info['value'] != this.request.post['manufacturer_id'])) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_exists');
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}
		this.request.post['manufacturer_id'] = Number(this.request.post['manufacturer_id']);
		if (!Object.keys(json.error).length) {
			this.load.model('catalog/manufacturer', this);

			if (!this.request.post['manufacturer_id']) {
				json['manufacturer_id'] = await this.model_catalog_manufacturer.addManufacturer(this.request.post);
			} else {
				await this.model_catalog_manufacturer.editManufacturer(this.request.post['manufacturer_id'], this.request.post);
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
		await this.load.language('catalog/manufacturer');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/manufacturer')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product', this);

		for (let manufacturer_id of selected) {
			const product_total = await this.model_catalog_product.getTotalProductsByManufacturerId(manufacturer_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/manufacturer', this);

			for (let manufacturer_id of selected) {
				await this.model_catalog_manufacturer.deleteManufacturer(manufacturer_id);
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
			this.load.model('catalog/manufacturer', this);

			let filter_data = {
				'filter_name': this.request.get['filter_name'],
				'start': 0,
				'limit': 5
			};

			const results = await this.model_catalog_manufacturer.getManufacturers(filter_data);

			for (let result of results) {
				json.push({
					'manufacturer_id': result['manufacturer_id'],
					'name': strip_tags(html_entity_decode(result['name']))
				});
			}
		}

		let sort_order = [];

		for (let [key, value] of Object.entries(json)) {
			sort_order[key] = value['name'];
		}

		// json = multiSort(json, sort_order, 'ASC');
		json = json.sort((a, b) => a.name - b.name);

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
