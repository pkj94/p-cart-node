module.exports = class ControllerDesignSeoUrl extends Controller {
	error = {};

	async index() {
		await this.load.language('design/seo_url');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/seo_url', this);

		await this.getList();
	}

	async add() {
		await this.load.language('design/seo_url');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/seo_url', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_seo_url.addSeoUrl(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_query'])) {
				url += '&filter_query=' + encodeURIComponent(html_entity_decode(this.request.get['filter_query']));
			}

			if ((this.request.get['filter_keyword'])) {
				url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
			}

			if ((this.request.get['filter_store_id'])) {
				url += '&filter_store_id=' + this.request.get['filter_store_id'];
			}

			if ((this.request.get['filter_language_id'])) {
				url += '&filter_language_id=' + this.request.get['filter_language_id'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getForm();
	}

	async edit() {
		await this.load.language('design/seo_url');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/seo_url', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_seo_url.editSeoUrl(this.request.get['seo_url_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_query'])) {
				url += '&filter_query=' + encodeURIComponent(html_entity_decode(this.request.get['filter_query']));
			}

			if ((this.request.get['filter_keyword'])) {
				url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
			}

			if ((this.request.get['filter_store_id'])) {
				url += '&filter_store_id=' + this.request.get['filter_store_id'];
			}

			if ((this.request.get['filter_language_id'])) {
				url += '&filter_language_id=' + this.request.get['filter_language_id'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getForm();
	}

	async delete() {
		await this.load.language('design/seo_url');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/seo_url', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let seo_url_id of this.request.post['selected']) {
				await this.model_design_seo_url.deleteSeoUrl(seo_url_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			let url = '';

			if ((this.request.get['filter_query'])) {
				url += '&filter_query=' + encodeURIComponent(html_entity_decode(this.request.get['filter_query']));
			}

			if ((this.request.get['filter_keyword'])) {
				url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
			}

			if ((this.request.get['filter_store_id'])) {
				url += '&filter_store_id=' + this.request.get['filter_store_id'];
			}

			if ((this.request.get['filter_language_id'])) {
				url += '&filter_language_id=' + this.request.get['filter_language_id'];
			}

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		let filter_query = '';
		if ((this.request.get['filter_query'])) {
			filter_query = this.request.get['filter_query'];
		}
		let filter_keyword = '';
		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		}
		let filter_store_id = '';
		if ((this.request.get['filter_store_id'])) {
			filter_store_id = this.request.get['filter_store_id'];
		}
		let filter_language_id = '';
		if ((this.request.get['filter_language_id'])) {
			filter_language_id = this.request.get['filter_language_id'];
		}
		let sort = 'keyword';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {

		}
		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {

		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_query'])) {
			url += '&filter_query=' + encodeURIComponent(html_entity_decode(this.request.get['filter_query']));
		}

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_language_id'])) {
			url += '&filter_language_id=' + this.request.get['filter_language_id'];
		}

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
			'href': await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('design/seo_url/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('design/seo_url/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['seo_urls'] = [];

		const filter_data = {
			'filter_query': filter_query,
			'filter_keyword': filter_keyword,
			'filter_store_id': filter_store_id,
			'filter_language_id': filter_language_id,
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const seo_url_total = await this.model_design_seo_url.getTotalSeoUrls(filter_data);

		const results = await this.model_design_seo_url.getSeoUrls(filter_data);

		for (let result of results) {
			data['seo_urls'].push({
				'seo_url_id': result['seo_url_id'],
				'query': result['query'],
				'keyword': result['keyword'],
				'store': result['store_id'] ? result['store'] : this.language.get('text_default'),
				'language': result['language'],
				'edit': await this.url.link('design/seo_url/edit', 'user_token=' + this.session.data['user_token'] + '&seo_url_id=' + result['seo_url_id'] + url, true)
			});
		}

		data['user_token'] = this.session.data['user_token'];

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

		if ((this.request.get['filter_query'])) {
			url += '&filter_query=' + encodeURIComponent(html_entity_decode(this.request.get['filter_query']));
		}

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_language_id'])) {
			url += '&filter_language_id=' + this.request.get['filter_language_id'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_query'] = await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + '&sort=query' + url, true);
		data['sort_keyword'] = await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + '&sort=keyword' + url, true);
		data['sort_store'] = await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + '&sort=store' + url, true);
		data['sort_language'] = await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + '&sort=language' + url, true);

		url = '';

		if ((this.request.get['filter_query'])) {
			url += '&filter_query=' + encodeURIComponent(html_entity_decode(this.request.get['filter_query']));
		}

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_store_id'])) {
			url += '&filter_store_id=' + this.request.get['filter_store_id'];
		}

		if ((this.request.get['filter_language_id'])) {
			url += '&filter_language_id=' + this.request.get['filter_language_id'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = seo_url_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (seo_url_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (seo_url_total - Number(this.config.get('config_limit_admin')))) ? seo_url_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), seo_url_total, Math.ceil(seo_url_total / Number(this.config.get('config_limit_admin'))));

		data['filter_query'] = filter_query;
		data['filter_keyword'] = filter_keyword;
		data['filter_store_id'] = filter_store_id;
		data['filter_language_id'] = filter_language_id;

		data['sort'] = sort;
		data['order'] = order;

		this.load.model('setting/store', this);

		data['stores'] = await this.model_setting_store.getStores();

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/seo_url_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['seo_url_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['query'])) {
			data['error_query'] = this.error['query'];
		} else {
			data['error_query'] = '';
		}

		if ((this.error['keyword'])) {
			data['error_keyword'] = this.error['keyword'];
		} else {
			data['error_keyword'] = '';
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
			'href': await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['seo_url_id'])) {
			data['action'] = await this.url.link('design/seo_url/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('design/seo_url/edit', 'user_token=' + this.session.data['user_token'] + '&seo_url_id=' + this.request.get['seo_url_id'] + url, true);
		}

		data['cancel'] = await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url, true);
		let seo_url_info;
		if ((this.request.get['seo_url_id']) && (this.request.server['method'] != 'POST')) {
			seo_url_info = await this.model_design_seo_url.getSeoUrl(this.request.get['seo_url_id']);
		}

		if ((this.request.post['query'])) {
			data['query'] = this.request.post['query'];
		} else if ((seo_url_info)) {
			data['query'] = seo_url_info['query'];
		} else {
			data['query'] = '';
		}

		if ((this.request.post['keyword'])) {
			data['keyword'] = this.request.post['keyword'];
		} else if ((seo_url_info)) {
			data['keyword'] = seo_url_info['keyword'];
		} else {
			data['keyword'] = '';
		}

		this.load.model('setting/store', this);

		data['stores'] = [];

		data['stores'].push({
			'store_id': 0,
			'name': this.language.get('text_default')
		});

		const stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id': store['store_id'],
				'name': store['name']
			});
		}

		if ((this.request.post['store_id'])) {
			data['store_id'] = this.request.post['store_id'];
		} else if ((seo_url_info)) {
			data['store_id'] = seo_url_info['store_id'];
		} else {
			data['store_id'] = '';
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['language_id'])) {
			data['language_id'] = this.request.post['language_id'];
		} else if ((seo_url_info)) {
			data['language_id'] = seo_url_info['language_id'];
		} else {
			data['language_id'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/seo_url_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'design/seo_url')) {
			this.error['warning'] = this.language.get('error_permission');
		}
		let seo_urls = [];
		if ((this.request.get['seo_url_id']) && this.request.get['seo_url_id']) {
			seo_urls = await this.model_design_seo_url.getSeoUrlsByQueryId(this.request.get['seo_url_id'], this.request.post['query']);
		} else {
			seo_urls = await this.model_design_seo_url.getSeoUrlsByQuery(this.request.post['query']);
		}

		for (let seo_url of seo_urls) {
			if (seo_url['store_id'] == this.request.post['store_id'] && seo_url['query'] == this.request.post['query']) {
				this.error['query'] = this.language.get('error_query_exists');

				break;
			}
		}

		if (!this.request.post['query']) {
			this.error['query'] = this.language.get('error_query');
		}

		seo_urls = await this.model_design_seo_url.getSeoUrlsByKeyword(this.request.post['keyword']);

		for (let seo_url of seo_urls) {
			if (seo_url['store_id'] == this.request.post['store_id'] && seo_url['query'] != this.request.post['query']) {
				this.error['keyword'] = this.language.get('error_exists');

				break;
			}
		}

		if (!this.request.post['keyword']) {
			this.error['keyword'] = this.language.get('error_keyword');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'design/seo_url')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}
