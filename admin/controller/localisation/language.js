module.exports = class ControllerLocalisationLanguage extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/language');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/language', this);

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/language');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/language', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_language.addLanguage(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/language');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/language', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_language.editLanguage(this.request.get['language_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/language');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/language', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let language_id of this.request.post['selected']) {
				await this.model_localisation_language.deleteLanguage(language_id);
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

			this.response.setRedirect(await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/language/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/language/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['languages'] = [];

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const language_total = await this.model_localisation_language.getTotalLanguages();

		const results = await this.model_localisation_language.getLanguages(filter_data);

		for (let result of results) {
			data['languages'].push({
				'language_id': result['language_id'],
				'name': result['name'] + ((result['code'] == this.config.get('config_language')) ? this.language.get('text_default') : ''),
				'code': result['code'],
				'sort_order': result['sort_order'],
				'edit': await this.url.link('localisation/language/edit', 'user_token=' + this.session.data['user_token'] + '&language_id=' + result['language_id'] + url, true)
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

		data['sort_name'] = await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_code'] = await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url, true);
		data['sort_sort_order'] = await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = language_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (language_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (language_total - Number(this.config.get('config_limit_admin')))) ? language_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), language_total, Math.ceil(language_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/language_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['language_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		if ((this.error['code'])) {
			data['error_code'] = this.error['code'];
		} else {
			data['error_code'] = '';
		}

		if ((this.error['locale'])) {
			data['error_locale'] = this.error['locale'];
		} else {
			data['error_locale'] = '';
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
			'href': await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['language_id'])) {
			data['action'] = await this.url.link('localisation/language/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/language/edit', 'user_token=' + this.session.data['user_token'] + '&language_id=' + this.request.get['language_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url, true);
		let language_info;
		if ((this.request.get['language_id']) && (this.request.server['method'] != 'POST')) {
			language_info = await this.model_localisation_language.getLanguage(this.request.get['language_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((language_info)) {
			data['name'] = language_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['code'])) {
			data['code'] = this.request.post['code'];
		} else if ((language_info)) {
			data['code'] = language_info['code'];
		} else {
			data['code'] = '';
		}

		data['languages'] = [];

		let folders = require('glob').sync(DIR_LANGUAGE + '*');

		for (let folder of folders) {
			data['languages'].push(expressPath.basename(folder));
		}

		if ((this.request.post['locale'])) {
			data['locale'] = this.request.post['locale'];
		} else if ((language_info)) {
			data['locale'] = language_info['locale'];
		} else {
			data['locale'] = '';
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((language_info)) {
			data['sort_order'] = language_info['sort_order'];
		} else {
			data['sort_order'] = 1;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((language_info)) {
			data['status'] = language_info['status'];
		} else {
			data['status'] = true;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/language_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/language')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			this.error['name'] = this.language.get('error_name');
		}

		if (oc_strlen(this.request.post['code']) < 2) {
			this.error['code'] = this.language.get('error_code');
		}

		if (!this.request.post['locale']) {
			this.error['locale'] = this.language.get('error_locale');
		}

		const language_info = await this.model_localisation_language.getLanguageByCode(this.request.post['code']);

		if (!(this.request.get['language_id'])) {
			if (language_info.language_id) {
				this.error['warning'] = this.language.get('error_exists');
			}
		} else {
			if (language_info.language_id && (this.request.get['language_id'] != language_info['language_id'])) {
				this.error['warning'] = this.language.get('error_exists');
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/language')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store', this);
		this.load.model('sale/order', this);
		this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];

		for (let language_id of this.request.post['selected']) {
			const language_info = await this.model_localisation_language.getLanguage(language_id);

			if (language_info.language_id) {
				if (this.config.get('config_language') == language_info['code']) {
					this.error['warning'] = this.language.get('error_default');
				}

				if (this.config.get('config_admin_language') == language_info['code']) {
					this.error['warning'] = this.language.get('error_admin');
				}

				const store_total = await this.model_setting_store.getTotalStoresByLanguage(language_info['code']);

				if (store_total) {
					this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
				}
			}

			const order_total = await this.model_sale_order.getTotalOrdersByLanguageId(language_id);

			if (order_total) {
				this.error['warning'] = sprintf(this.language.get('error_order'), order_total);
			}
		}

		return Object.keys(this.error).length ? false : true
	}
}
