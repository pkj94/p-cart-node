module.exports = class ControllerDesignTranslation extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('design/translation');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/translation', this);

		await this.getList();
	}

	async add() {
		await this.load.language('design/translation');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/translation', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_translation.addTranslation(this.request.post);

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

			this.response.setRedirect(await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('design/translation');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/translation', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_translation.editTranslation(this.request.get['translation_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('design/translation');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/translation', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let translation_id of this.request.post['selected']) {
				await this.model_design_translation.deleteTranslation(translation_id);
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

			this.response.setRedirect(await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		let sort = 'store';
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
			'href': await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'], true)
		});

		this.load.model('localisation/language', this);

		data['add'] = await this.url.link('design/translation/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('design/translation/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['translations'] = [];

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const translation_total = await this.model_design_translation.getTotalTranslations();

		const results = await this.model_design_translation.getTranslations(filter_data);

		for (let result of results) {
			data['translations'].push({
				'translation_id': result['translation_id'],
				'store': (result['store_id'] ? result['store'] : this.language.get('text_default')),
				'route': result['route'],
				'language': result['language'],
				'key': result['key'],
				'value': result['value'],
				'edit': await this.url.link('design/translation/edit', 'user_token=' + this.session.data['user_token'] + '&translation_id=' + result['translation_id'], true),
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

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_store'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + '&sort=store' + url, true);
		data['sort_language'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + '&sort=language' + url, true);
		data['sort_route'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + '&sort=route' + url, true);
		data['sort_key'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + '&sort=key' + url, true);
		data['sort_value'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url, true);

		const pagination = new Pagination();
		pagination.total = translation_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (translation_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (translation_total - Number(this.config.get('config_limit_admin')))) ? translation_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), translation_total, Math.ceil(translation_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/translation_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['translation_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['key'])) {
			data['error_key'] = this.error['key'];
		} else {
			data['error_key'] = '';
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
			'href': await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['translation_id'])) {
			data['action'] = await this.url.link('design/translation/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('design/translation/edit', 'user_token=' + this.session.data['user_token'] + '&translation_id=' + this.request.get['translation_id'] + url, true);
		}

		data['cancel'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url, true);

		data['user_token'] = this.session.data['user_token'];
		let translation_info;
		if ((this.request.get['translation_id']) && (this.request.server['method'] != 'POST')) {
			translation_info = await this.model_design_translation.getTranslation(this.request.get['translation_id']);
		}

		this.load.model('setting/store', this);

		data['stores'] = await this.model_setting_store.getStores();

		if ((this.request.post['store_id'])) {
			data['store_id'] = this.request.post['store_id'];
		} else if ((translation_info)) {
			data['store_id'] = translation_info['store_id'];
		} else {
			data['store_id'] = '';
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();
		let language;
		let code = this.config.get('config_language')
		if ((translation_info)) {
			language = await this.model_localisation_language.getLanguage(translation_info['language_id']);
			code = language['code'];
		} else {
			language = await this.model_localisation_language.getLanguageByCode(code)
		}

		if ((this.request.post['language_id'])) {
			data['language_id'] = this.request.post['language_id'];
		} else if ((translation_info)) {
			data['language_id'] = translation_info['language_id'];
		} else {
			data['language_id'] = language['language_id'];
		}

		if (!(translation_info)) {
			// Get a list of files ready to upload
			data['paths'] = [];

			let path = require('glob').sync(DIR_CATALOG + 'language/' + code + '/*');

			while (path.length != 0) {
				let next = path.shift();

				for (let file of require('glob').sync(next)) {
					if (is_dir(file)) {
						path.push(file + '/*');
					}

					if (file.substr(-4) == '.js') {
						data['paths'].push(file.substr((DIR_CATALOG + 'language/' + code + '/').length).substr(0, -3));
					}
				}
			}
		}

		if ((this.request.post['route'])) {
			data['route'] = this.request.post['route'];
		} else if ((translation_info)) {
			data['route'] = translation_info['route'];
		} else {
			data['route'] = '';
		}

		if ((this.request.post['key'])) {
			data['key'] = this.request.post['key'];
		} else if ((translation_info)) {
			data['key'] = translation_info['key'];
		} else {
			data['key'] = '';
		}

		if ((translation_info)) {
			let directory = DIR_CATALOG + 'language/';

			if (is_file(directory + code + '/' + translation_info['route'] + '.js') && fs.realpathSync(directory + code + '/' + translation_info['route'] + '.js').replaceAll('\\', '/').substr(0, (directory).length) == directory.replaceAll('\\', '/')) {

				const lanData = require(directory + code + '/' + translation_info['route'] + '.js');

				for (let [key, value] of Object.entries(lanData)) {
					if (translation_info['key'] == key) {
						data['default'] = value;
					}
				}

				if (!(data['default'])) {
					data['default'] = translation_info['value'];
				}
			}
		}

		if ((this.request.post['value'])) {
			data['value'] = this.request.post['value'];
		} else if ((translation_info)) {
			data['value'] = translation_info['value'];
		} else {
			data['value'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/translation_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'design/translation')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['key']) < 3) || (oc_strlen(this.request.post['key']) > 64)) {
			this.error['key'] = this.language.get('error_key');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'design/translation')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async path() {
		await this.load.language('design/translation');

		const json = [];
		let language_id = 0;
		if ((this.request.get['language_id'])) {
			language_id = this.request.get['language_id'];
		}

		this.load.model('localisation/language', this);

		const language_info = await this.model_localisation_language.getLanguage(language_id);

		if ((language_info.language_id)) {
			let path = require('glob').sync(DIR_CATALOG + 'language/' + language_info['code'] + '/*').sort();

			while (path.length != 0) {
				let next = path.shift();
				for (let file of require('glob').sync(next).sort()) {
					if (is_dir(file)) {
						path.push((DIR_OPENCART + file).replaceAll('\\', '/') + '/*');
					}

					if (file.substr(-3) == '.js') {
						file = file.replaceAll('\\', '/').indexOf(DIR_OPENCART) != -1 ? file : DIR_OPENCART.replaceAll('\\', '/') + file;

						json.push(file.substr((DIR_CATALOG + 'language/' + language_info['code'] + '/').length).replace('.js', '').replaceAll('\\', '/'));
					}
				}
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async translation() {
		await this.load.language('design/translation');

		const json = [];
		let store_id = 0;
		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		}
		let language_id = 0;
		if ((this.request.get['language_id'])) {
			language_id = this.request.get['language_id'];
		}
		let route = '';
		if ((this.request.get['path'])) {
			route = this.request.get['path'];
		}

		this.load.model('localisation/language', this);

		const language_info = await this.model_localisation_language.getLanguage(language_id);

		let directory = DIR_CATALOG + 'language/';

		if (language_info.language_id && is_file(directory + language_info['code'] + '/' + route + '.js') && fs.realpathSync(directory + language_info['code'] + '/' + route + '.js').replaceAll('\\', '/').substr(0, directory.length) == directory.replaceAll('\\', '/')) {

			const langData = require(directory + language_info['code'] + '/' + route + '.js');

			for (let [key, value] of Object.entries(langData)) {
				json.push({
					'key': key,
					'value': value
				});
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
