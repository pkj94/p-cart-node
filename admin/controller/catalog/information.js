const sprintf = require("locutus/php/strings/sprintf");

module.exports = class InformationController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('catalog/information');

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
			'href': await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('catalog/information.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('catalog/information.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/information', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/information');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'id.title';
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

		data['action'] = await this.url.link('catalog/information.list', 'user_token=' + this.session.data['user_token'] + url);

		data['informations'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('catalog/information', this);

		const information_total = await this.model_catalog_information.getTotalInformations();

		const results = await this.model_catalog_information.getInformations(filter_data);

		for (let result of results) {
			data['informations'].push({
				'information_id': result['information_id'],
				'title': result['title'],
				'status': result['status'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('catalog/information.form', 'user_token=' + this.session.data['user_token'] + '&information_id=' + result['information_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_title'] = await this.url.link('catalog/information.list', 'user_token=' + this.session.data['user_token'] + '&sort=id.title' + url);
		data['sort_sort_order'] = await this.url.link('catalog/information.list', 'user_token=' + this.session.data['user_token'] + '&sort=i.sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': information_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('catalog/information.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (information_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (information_total - this.config.get('config_pagination_admin'))) ? information_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), information_total, Math.ceil(information_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/information_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('catalog/information');

		this.document.setTitle(this.language.get('heading_title'));



		data['text_form'] = !(this.request.get['information_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('catalog/information.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'] + url);
		let information_info;
		if ((this.request.get['information_id'])) {
			this.load.model('catalog/information', this);

			information_info = await this.model_catalog_information.getInformation(this.request.get['information_id']);
		}

		if ((this.request.get['information_id'])) {
			data['information_id'] = this.request.get['information_id'];
		} else {
			data['information_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['information_id'])) {
			data['information_description'] = await this.model_catalog_information.getDescriptions(this.request.get['information_id']);
		} else {
			data['information_description'] = [];
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

		if ((this.request.get['information_id'])) {
			data['information_store'] = await this.model_catalog_information.getStores(this.request.get['information_id']);
		} else {
			data['information_store'] = [0];
		}

		if ((information_info)) {
			data['bottom'] = information_info['bottom'];
		} else {
			data['bottom'] = 0;
		}

		if ((information_info)) {
			data['status'] = information_info['status'];
		} else {
			data['status'] = true;
		}

		if ((information_info)) {
			data['sort_order'] = information_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		if ((this.request.get['information_id'])) {
			data['information_seo_url'] = await this.model_catalog_information.getSeoUrls(this.request.get['information_id']);
		} else {
			data['information_seo_url'] = [];
		}

		this.load.model('design/layout', this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((this.request.get['information_id'])) {
			data['information_layout'] = await this.model_catalog_information.getLayouts(this.request.get['information_id']);
		} else {
			data['information_layout'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/information_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/information');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'catalog/information')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['information_description'])) {
			language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
			if ((oc_strlen(trim(value['title'])) < 1) || (oc_strlen(value['title']) > 64)) {
				json['error']['title_' + language_id] = this.language.get('error_title');
			}

			if ((oc_strlen(trim(value['meta_title'])) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				json['error']['meta_title_' + language_id] = this.language.get('error_meta_title');
			}
		}

		if (this.request.post['information_seo_url']) {
			this.load.model('design/seo_url', this);

			for (let [store_id, language] of Object.entries(this.request.post['information_seo_url'])) {
				store_id = store_id.indexOf('store') >= 0 ? store_id.split('-')[1] : store_id;
				for (let [language_id, keyword] of Object.entries(language)) {
					language_id = language_id.indexOf('language') >= 0 ? language_id.split('-')[1] : language_id;
					if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword');
					}

					if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u', keyword)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_character');
					}

					let seo_url_info = await this.model_design_seo_url.getSeoUrlByKeyword(keyword, store_id);

					if (seo_url_info.key && (!(this.request.post['information_id']) || seo_url_info['key'] != 'information_id' || seo_url_info['value'] != this.request.post['information_id'])) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_exists');
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}
		this.request.post['information_id'] = Number(this.request.post['information_id']);
		if (!Object.keys(json.error).length) {
			this.load.model('catalog/information', this);

			if (!this.request.post['information_id']) {
				json['information_id'] = await this.model_catalog_information.addInformation(this.request.post);
			} else {
				await this.model_catalog_information.editInformation(this.request.post['information_id'], this.request.post);
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
		await this.load.language('catalog/information');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/information')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store', this);

		for (let information_id of selected) {
			if (this.config.get('config_account_id') == information_id) {
				json['error'] = this.language.get('error_account');
			}

			if (this.config.get('config_checkout_id') == information_id) {
				json['error'] = this.language.get('error_checkout');
			}

			if (this.config.get('config_affiliate_id') == information_id) {
				json['error'] = this.language.get('error_affiliate');
			}

			if (this.config.get('config_return_id') == information_id) {
				json['error'] = this.language.get('error_return');
			}

			const store_total = await this.model_setting_store.getTotalStoresByInformationId(information_id);

			if (store_total) {
				json['error'] = sprintf(this.language.get('error_store'), store_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/information', this);

			for (let information_id of selected) {
				await this.model_catalog_information.deleteInformation(information_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
