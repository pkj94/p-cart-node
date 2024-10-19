const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
const expressPath = require('path');
module.exports = class TranslationController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('design/translation');

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
			'href': await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('design/translation.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('design/translation.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/translation', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('design/translation');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
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

		data['action'] = await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + url);

		this.load.model('localisation/language', this);

		data['translations'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('design/translation', this);

		const translation_total = await this.model_design_translation.getTotalTranslations();

		const results = await this.model_design_translation.getTranslations(filter_data);

		for (let result of results) {
			const language_info = await this.model_localisation_language.getLanguage(result['language_id']);
			let code = '';
			let image = '';
			if (language_info) {
				code = language_info['code'];
				image = language_info['image'];
			}

			data['translations'].push({
				'translation_id': result['translation_id'],
				'store': (result['store_id'] ? result['store'] : this.language.get('text_default')),
				'route': result['route'],
				'image': image,
				'language': code,
				'key': result['key'],
				'value': result['value'],
				'edit': await this.url.link('design/translation.form', 'user_token=' + this.session.data['user_token'] + '&translation_id=' + result['translation_id'])
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_store'] = await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=store' + url);
		data['sort_language'] = await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=language' + url);
		data['sort_route'] = await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=route' + url);
		data['sort_key'] = await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=key' + url);
		data['sort_value'] = await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': translation_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (translation_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (translation_total - this.config.get('config_pagination_admin'))) ? translation_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), translation_total, Math.ceil(translation_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('design/translation_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('design/translation');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['translation_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('design/translation.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url);
		let translation_info
		if ((this.request.get['translation_id'])) {
			this.load.model('design/translation', this);

			translation_info = await this.model_design_translation.getTranslation(this.request.get['translat;ion_id']);
		}

		if ((this.request.get['translation_id'])) {
			data['translation_id'] = this.request.get['translation_id'];
		} else {
			data['translation_id'] = 0;
		}

		this.load.model('setting/store', this);

		data['stores'] = await this.model_setting_store.getStores();

		if ((translation_info)) {
			data['store_id'] = translation_info['store_id'];
		} else {
			data['store_id'] = '';
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((translation_info)) {
			data['language_id'] = translation_info['language_id'];
		} else {
			data['language_id'] = '';
		}

		if ((translation_info)) {
			data['route'] = translation_info['route'];
		} else {
			data['route'] = '';
		}

		if ((translation_info)) {
			data['key'] = translation_info['key'];
		} else {
			data['key'] = '';
		}

		if ((translation_info)) {
			data['value'] = translation_info['value'];
		} else {
			data['value'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/translation_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('design/translation');

		const json = {};

		if (!await this.user.hasPermission('modify', 'design/translation')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['key']) < 3) || (oc_strlen(this.request.post['key']) > 64)) {
			json['error']['key'] = this.language.get('error_key');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/translation', this);
			this.request.post['translation_id'] = Number(this.request.post['translation_id']);
			if (!this.request.post['translation_id']) {
				json['translation_id'] = await this.model_design_translation.addTranslation(this.request.post);
			} else {
				await this.model_design_translation.editTranslation(this.request.post['translation_id'], this.request.post);
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
		await this.load.language('design/translation');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'design/translation')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/translation', this);

			for (let translation_id of selected) {
				await this.model_design_translation.deleteTranslation(translation_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
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
			let path = fs.readdirSync(DIR_CATALOG + 'language/' + language_info['code'] + '/');

			while (path.length != 0) {
				let next = path.shift();

				for (let file of fs.readdirSync(next + '/')) {
					if (fs.lstatSync(file).isDirectory()) {
						path.push(next + '/' + file);
					}

					if (file.substring(-3) == '.js') {
						json.push(file.substring((DIR_CATALOG + 'language/' + language_info['code'] + '/').length).substring(0, -4));
					}
				}
			}

			path = require('glob').sync(DIR_EXTENSION + '*/catalog/language/' + language_info['code'] + '/*');

			while (path.length != 0) {
				next = path.shift();

				for (let file of require('glob').sync(next + '/*')) {
					if (fs.lstatSync(file).isDirectory()) {
						path.push(file);
					}

					if (file.substring(-3) == '.js') {
						let new_path = file.substring(DIR_EXTENSION.length);

						let code = new_path.substring(0, new_path.indexOf('/'));

						let length = (DIR_EXTENSION + code + '/catalog/language/' + language_info['code'] + '/').length;

						let route = file.substring(length).substring(0, -3);

						json.push('extension/' + code + '/' + route);
					}
				}
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async translation() {
		await this.load.language('design/translation');

		const json = {};
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

		let part = route.split('/');
		let directory = '';
		if (part[0] != 'extension') {
			directory = DIR_CATALOG + 'language/';
		} else {
			directory = DIR_EXTENSION + part[1] + '/catalog/language/';

			part.shift();
			// Don't remove. Required for extension route.
			part.shift();

			route = part.join('/');
		}

		if (language_info.language_id && fs.lstatSync(directory + language_info['code'] + '/' + route + '.js').isFile() && fs.realpathSync(directory + language_info['code'] + '/' + route + '.js').replaceAll('\\', '/').substring(0, directory.length) == directory.replaceAll('\\', '/')) {
			let fileContent = require(directory + language_info['code'] + '/' + route + '.js');

			for (let [key, value] of Object.entries(fileContent)) {
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
