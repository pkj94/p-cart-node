<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class LanguageController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/language');

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
			'href' : this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/language.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/language.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/language', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/language');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
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

		data['action'] = this.url.link('localisation/language.list', 'user_token=' + this.session.data['user_token'] + url);

		data['languages'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/language',this);

		language_total await this.model_localisation_language.getTotalLanguages();

		const results = await this.model_localisation_language.getLanguages(filter_data);

		for (let result of results) {
			data['languages'].push({
				'language_id' : result['language_id'],
				'name'        : result['name'] + ((result['code'] == this.config.get('config_language')) ? this.language.get('text_default') : ''),
				'code'        : result['code'],
				'status'      : result['status'],
				'sort_order'  : result['sort_order'],
				'edit'        : this.url.link('localisation/language.form', 'user_token=' + this.session.data['user_token'] + '&language_id=' + result['language_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('localisation/language.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_code'] = this.url.link('localisation/language.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_sort_order'] = this.url.link('localisation/language.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : language_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/language.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (language_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (language_total - this.config.get('config_pagination_admin'))) ? language_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), language_total, Math.ceil(language_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/language_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/language');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['language_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/language.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['language_id'])) {
			this.load.model('localisation/language',this);

			language_info await this.model_localisation_language.getLanguage(this.request.get['language_id']);
		}

		if ((this.request.get['language_id'])) {
			data['language_id'] = this.request.get['language_id'];
		} else {
			data['language_id'] = 0;
		}

		if ((language_info)) {
			data['name'] = language_info['name'];
		} else {
			data['name'] = '';
		}

		if ((language_info)) {
			data['code'] = language_info['code'];
		} else {
			data['code'] = '';
		}

		if ((language_info)) {
			data['locale'] = language_info['locale'];
		} else {
			data['locale'] = '';
		}

		if ((language_info)) {
			data['extension'] = language_info['extension'];
		} else {
			data['extension'] = '';
		}

		if ((language_info)) {
			data['sort_order'] = language_info['sort_order'];
		} else {
			data['sort_order'] = 1;
		}

		if ((language_info)) {
			data['status'] = language_info['status'];
		} else {
			data['status'] = 1;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/language_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/language');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/language')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 32)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['code']) < 2) || (oc_strlen(this.request.post['code']) > 5)) {
			json['error']['code'] = this.language.get('error_code');
		}
		
		if ((oc_strlen(this.request.post['locale']) < 2) || (oc_strlen(this.request.post['locale']) > 255)) {
			json['error']['locale'] = this.language.get('error_locale');
		}
		
		language_info await this.model_localisation_language.getLanguageByCode(this.request.post['code']);

		if (!this.request.post['language_id']) {
			if (language_info) {
				json['error']['warning'] = this.language.get('error_exists');
			}
		} else {
			if (language_info && (this.request.post['language_id'] != language_info['language_id'])) {
				json['error']['warning'] = this.language.get('error_exists');
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/language',this);

			if (!this.request.post['language_id']) {
				json['language_id'] = await this.model_localisation_language.addLanguage(this.request.post);
			} else {
				await this.model_localisation_language.editLanguage(this.request.post['language_id'], this.request.post);
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
		await this.load.language('localisation/language');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/language')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);
		this.load.model('sale/order');

		for (selected of language_id) {
			language_info await this.model_localisation_language.getLanguage(language_id);

			if (language_info) {
				if (this.config.get('config_language') == language_info['code']) {
					json['error'] = this.language.get('error_default');
				}

				if (this.config.get('config_language_admin') == language_info['code']) {
					json['error'] = this.language.get('error_admin');
				}

				store_total await this.model_setting_store.getTotalStoresByLanguage(language_info['code']);

				if (store_total) {
					json['error'] = sprintf(this.language.get('error_store'), store_total);
				}
			}

			order_total await this.model_sale_order.getTotalOrdersByLanguageId(language_id);

			if (order_total) {
				json['error'] = sprintf(this.language.get('error_order'), order_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/language',this);

			for (selected of language_id) {
				await this.model_localisation_language.deleteLanguage(language_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
