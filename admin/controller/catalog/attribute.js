const sprintf = require("locutus/php/strings/sprintf");

module.exports = class AttributeController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('catalog/attribute');

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
			'href': await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('catalog/attribute.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('catalog/attribute.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/attribute');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'ad.name';
		if (this.request.get['sort']) {
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

		data['action'] = await this.url.link('catalog/attribute.list', 'user_token=' + this.session.data['user_token'] + url);

		data['attributes'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('catalog/attribute', this);

		const attribute_total = await this.model_catalog_attribute.getTotalAttributes();

		const results = await this.model_catalog_attribute.getAttributes(filter_data);

		for (let result of results) {
			data['attributes'].push({
				'attribute_id': result['attribute_id'],
				'name': result['name'],
				'attribute_group': result['attribute_group'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/attribute.form', 'user_token=' + this.session.data['user_token'] + '&attribute_id=' + result['attribute_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('catalog/attribute.list', 'user_token=' + this.session.data['user_token'] + '&sort=ad.name' + url);
		data['sort_attribute_group'] = await this.url.link('catalog/attribute.list', 'user_token=' + this.session.data['user_token'] + '&sort=attribute_group' + url);
		data['sort_sort_order'] = await this.url.link('catalog/attribute.list', 'user_token=' + this.session.data['user_token'] + '&sort=a.sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': attribute_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('catalog/attribute.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (attribute_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (attribute_total - this.config.get('config_pagination_admin'))) ? attribute_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), attribute_total, Math.ceil(attribute_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/attribute_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('catalog/attribute');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['attribute_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('catalog/attribute.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'] + url);
		let attribute_info;
		if ((this.request.get['attribute_id'])) {
			this.load.model('catalog/attribute', this);

			attribute_info = await this.model_catalog_attribute.getAttribute(this.request.get['attribute_id']);
		}

		if ((this.request.get['attribute_id'])) {
			data['attribute_id'] = this.request.get['attribute_id'];
		} else {
			data['attribute_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['attribute_id'])) {
			data['attribute_description'] = await this.model_catalog_attribute.getDescriptions(this.request.get['attribute_id']);
		} else {
			data['attribute_description'] = [];
		}

		this.load.model('catalog/attribute_group', this);

		data['attribute_groups'] = await this.model_catalog_attribute_group.getAttributeGroups();

		if ((attribute_info)) {
			data['attribute_group_id'] = attribute_info['attribute_group_id'];
		} else {
			data['attribute_group_id'] = 0;
		}

		if ((attribute_info)) {
			data['sort_order'] = attribute_info['sort_order'];
		} else {
			data['sort_order'] = 0;
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/attribute');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'catalog/attribute')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['attribute_group_id']) {
			json['error']['attribute_group'] = this.language.get('error_attribute_group');
		}

		for (let [language_id, value] of Object.entries(this.request.post['attribute_description'])) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 64)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}
		this.request.post['attribute_id'] = Number(this.request.post['attribute_id']);
		if (!Object.keys(json.error).length) {
			this.load.model('catalog/attribute', this);

			if (!this.request.post['attribute_id']) {
				json['attribute_id'] = await this.model_catalog_attribute.addAttribute(this.request.post);
			} else {
				await this.model_catalog_attribute.editAttribute(this.request.post['attribute_id'], this.request.post);
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
		await this.load.language('catalog/attribute');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/attribute')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product', this);

		for (let attribute_id of selected) {
			const product_total = await this.model_catalog_product.getTotalProductsByAttributeId(attribute_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/attribute', this);

			for (let attribute_id of selected) {
				await this.model_catalog_attribute.deleteAttribute(attribute_id);
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
			this.load.model('catalog/attribute', this);

			let filter_data = {
				'filter_name': this.request.get['filter_name'],
				'start': 0,
				'limit': 5
			};

			const results = await this.model_catalog_attribute.getAttributes(filter_data);

			for (let result of results) {
				json.push({
					'attribute_id': result['attribute_id'],
					'name': strip_tags(html_entity_decode(result['name'])),
					'attribute_group': result['attribute_group']
				});
			}
		}

		let sort_order = [];

		for (let [key, value] of Object(json)) {
			sort_order[key] = value['name'];
		}

		// json = multiSort(json, sort_order, 'ASC');
		json = json.sort((a,b)=>a.name-b.name);


		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
