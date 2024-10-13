const sprintf = require("locutus/php/strings/sprintf");

module.exports = class AttributeGroupCatalogController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('catalog/attribute_group');

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
			'href': this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/attribute_group.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/attribute_group.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute_group', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/attribute_group');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'agd.name';
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

		data['action'] = this.url.link('catalog/attribute_group.list', 'user_token=' + this.session.data['user_token'] + url);

		data['attribute_groups'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('catalog/attribute_group', this);

		const attribute_group_total = await this.model_catalog_attribute_group.getTotalAttributeGroups();

		const results = await this.model_catalog_attribute_group.getAttributeGroups(filter_data);

		for (let result of results) {
			data['attribute_groups'].push({
				'attribute_group_id': result['attribute_group_id'],
				'name': result['name'],
				'sort_order': result['sort_order'],
				'edit': this.url.link('catalog/attribute_group.form', 'user_token=' + this.session.data['user_token'] + '&attribute_group_id=' + result['attribute_group_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('catalog/attribute_group.list', 'user_token=' + this.session.data['user_token'] + '&sort=agd.name' + url);
		data['sort_sort_order'] = this.url.link('catalog/attribute_group.list', 'user_token=' + this.session.data['user_token'] + '&sort=ag.sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': attribute_group_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('catalog/attribute_group.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (attribute_group_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (attribute_group_total - this.config.get('config_pagination_admin'))) ? attribute_group_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), attribute_group_total, Math.ceil(attribute_group_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/attribute_group_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('catalog/attribute_group');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['attribute_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/attribute_group.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'] + url);
		let attribute_group_info;
		if ((this.request.get['attribute_group_id'])) {
			this.load.model('catalog/attribute_group', this);

			attribute_group_info = await this.model_catalog_attribute_group.getAttributeGroup(this.request.get['attribute_group_id']);
		}

		if ((this.request.get['attribute_group_id'])) {
			data['attribute_group_id'] = this.request.get['attribute_group_id'];
		} else {
			data['attribute_group_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['attribute_group_id'])) {
			data['attribute_group_description'] = await this.model_catalog_attribute_group.getDescriptions(this.request.get['attribute_group_id']);
		} else {
			data['attribute_group_description'] = [];
		}

		if ((attribute_group_info)) {
			data['sort_order'] = attribute_group_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/attribute_group_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/attribute_group');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'catalog/attribute_group')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['attribute_group_description'])) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 64)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}
		this.request.post['attribute_group_id'] = Number(this.request.post['attribute_group_id']);
		if (!Object.keys(json.error).length) {
			this.load.model('catalog/attribute_group', this);

			if (!this.request.post['attribute_group_id']) {
				json['attribute_group_id'] = await this.model_catalog_attribute_group.addAttributeGroup(this.request.post);
			} else {
				await this.model_catalog_attribute_group.editAttributeGroup(this.request.post['attribute_group_id'], this.request.post);
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
		await this.load.language('catalog/attribute_group');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/attribute_group')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/attribute', this);

		for (let attribute_group_id of selected) {
			const attribute_total = await this.model_catalog_attribute.getTotalAttributesByAttributeGroupId(attribute_group_id);

			if (attribute_total) {
				json['error'] = sprintf(this.language.get('error_attribute'), attribute_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/attribute_group', this);

			for (let attribute_group_id of selected) {
				await this.model_catalog_attribute_group.deleteAttributeGroup(attribute_group_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
