<?php
namespace Opencart\Admin\Controller\Design;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Design
 */
class TranslationController extends Controller {
	/**
	 * @return void
	 */
	async index() {
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('design/translation.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('design/translation.delete', 'user_token=' + this.session.data['user_token']);

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
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'store';
		}

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
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

		data['action'] = this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + url);

		this.load.model('localisation/language',this);

		data['translations'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('design/translation');

		translation_total await this.model_design_translation.getTotalTranslations();

		const results = await this.model_design_translation.getTranslations(filter_data);

		for (let result of results) {
			language_info await this.model_localisation_language.getLanguage(result['language_id']);

			if (language_info) {
				code = language_info['code'];
				image = language_info['image'];
			} else {
				code = '';
				image = '';
			}

			data['translations'].push({
				'translation_id' : result['translation_id'],
				'store'          : (result['store_id'] ? result['store'] : this.language.get('text_default')),
				'route'          : result['route'],
				'image'          : image,
				'language'       : code,
				'key'            : result['key'],
				'value'          : result['value'],
				'edit'           : this.url.link('design/translation.form', 'user_token=' + this.session.data['user_token'] + '&translation_id=' + result['translation_id'])
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_store'] = this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=store' + url);
		data['sort_language'] = this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=language' + url);
		data['sort_route'] = this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=route' + url);
		data['sort_key'] = this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=key' + url);
		data['sort_value'] = this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url);

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : translation_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('design/translation.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (translation_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (translation_total - this.config.get('config_pagination_admin'))) ? translation_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), translation_total, Math.ceil(translation_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('design/translation_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('design/translation.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('design/translation', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['translation_id'])) {
			this.load.model('design/translation');

			translation_info await this.model_design_translation.getTranslation(this.request.get['translation_id']);
		}

		if ((this.request.get['translation_id'])) {
			data['translation_id'] = this.request.get['translation_id'];
		} else {
			data['translation_id'] = 0;
		}

		this.load.model('setting/store',this);

		data['stores'] = await this.model_setting_store.getStores();

		if ((translation_info)) {
			data['store_id'] = translation_info['store_id'];
		} else {
			data['store_id'] = '';
		}

		this.load.model('localisation/language',this);

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
			this.load.model('design/translation');

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
			this.load.model('design/translation');

			for (selected of translation_id) {
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

		const json = {};

		if ((this.request.get['language_id'])) {
			language_id = this.request.get['language_id'];
		} else {
			language_id = 0;
		}

		this.load.model('localisation/language',this);

		language_info await this.model_localisation_language.getLanguage(language_id);

		if ((language_info)) {
			path = glob(DIR_CATALOG + 'language/' + language_info['code'] + '/*');

			while (count(path) != 0) {
				next = array_shift(path);

				for ((array)glob(next + '/*') of file) {
					if (is_dir(file)) {
						path[] = file;
					}

					if (substr(file, -4) == '.php') {
						json[] = substr(substr(file, strlen(DIR_CATALOG + 'language/' + language_info['code'] + '/')), 0, -4);
					}
				}
			}

			path = glob(DIR_EXTENSION + '*/catalog/language/' + language_info['code'] + '/*');

			while (count(path) != 0) {
				next = array_shift(path);

				for ((array)glob(next + '/*') of file) {
					if (is_dir(file)) {
						path[] = file;
					}

					if (substr(file, -4) == '.php') {
						new_path = substr(file, strlen(DIR_EXTENSION));

						code = substr(new_path, 0, strpos(new_path, '/'));

						length = strlen(DIR_EXTENSION + code + '/catalog/language/' + language_info['code'] + '/');

						route = substr(substr(file, length), 0, -4);

						json[] = 'extension/' + code + '/' + route;
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

		if ((this.request.get['store_id'])) {
			store_id = this.request.get['store_id'];
		} else {
			store_id = 0;
		}

		if ((this.request.get['language_id'])) {
			language_id = this.request.get['language_id'];
		} else {
			language_id = 0;
		}

		if ((this.request.get['path'])) {
			route = this.request.get['path'];
		} else {
			route = '';
		}

		this.load.model('localisation/language',this);

		language_info await this.model_localisation_language.getLanguage(language_id);

		part = explode('/', route);

		if (part[0] != 'extension') {
			directory = DIR_CATALOG + 'language/';
		} else {
			directory = DIR_EXTENSION + part[1] + '/catalog/language/';

			array_shift(part);
			// Don't remove. Required for extension route.
			array_shift(part);

			route = implode('/', part);
		}

		if (language_info && is_file(directory + language_info['code'] + '/' + route + '.php') && substr(str_replace('\\', '/', realpath(directory + language_info['code'] + '/' + route + '.php')), 0, strlen(directory)) == str_replace('\\', '/', directory)) {
			_ = [];

			include(directory + language_info['code'] + '/' + route + '.php');

			for (_ of key : value) {
				json.push({
					'key'   : key,
					'value' : value
				];
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
