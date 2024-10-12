<?php
namespace Opencart\Admin\Controller\Design;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Design
 */
class SeoUrlController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('design/seo_url');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		} else {
			filter_keyword = '';
		}

		if ((this.request.get['filter_key'])) {
			filter_key = this.request.get['filter_key'];
		} else {
			filter_key = '';
		}

		if ((this.request.get['filter_value'])) {
			filter_value = this.request.get['filter_value'];
		} else {
			filter_value = '';
		}

		if ((this.request.get['filter_store_id'])) {
			filter_store_id = this.request.get['filter_store_id'];
		} else {
			filter_store_id = '';
		}

		if ((this.request.get['filter_language_id'])) {
			filter_language_id = this.request.get['filter_language_id'];
		} else {
			filter_language_id = 0;
		}

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_key'])) {
			url += '&filter_key=' + encodeURIComponent(html_entity_decode(this.request.get['filter_key']));
		}

		if ((this.request.get['filter_value'])) {
			url += '&filter_value=' + encodeURIComponent(html_entity_decode(this.request.get['filter_value']));
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('design/seo_url.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('design/seo_url.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		this.load.model('setting/store',this);

		data['stores'] = await this.model_setting_store.getStores();

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		data['filter_keyword'] = filter_keyword;
		data['filter_key'] = filter_key;
		data['filter_value'] = filter_value;
		data['filter_store_id'] = filter_store_id;
		data['filter_language_id'] = filter_language_id;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/seo_url', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('design/seo_url');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		} else {
			filter_keyword = '';
		}

		if ((this.request.get['filter_key'])) {
			filter_key = this.request.get['filter_key'];
		} else {
			filter_key = '';
		}

		if ((this.request.get['filter_value'])) {
			filter_value = this.request.get['filter_value'];
		} else {
			filter_value = '';
		}

		if ((this.request.get['filter_store_id'])) {
			filter_store_id = this.request.get['filter_store_id'];
		} else {
			filter_store_id = '';
		}

		if ((this.request.get['filter_language_id'])) {
			filter_language_id = this.request.get['filter_language_id'];
		} else {
			filter_language_id = 0;
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'key';
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

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_key'])) {
			url += '&filter_key=' + encodeURIComponent(html_entity_decode(this.request.get['filter_key']));
		}

		if ((this.request.get['filter_value'])) {
			url += '&filter_value=' + encodeURIComponent(html_entity_decode(this.request.get['filter_value']));
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

		data['action'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + url);

		data['seo_urls'] = [];

		let filter_data = {
			'filter_keyword'     : filter_keyword,
			'filter_key'         : filter_key,
			'filter_value'       : filter_value,
			'filter_store_id'    : filter_store_id,
			'filter_language_id' : filter_language_id,
			'sort'               : sort,
			'order'              : order,
			'start'              : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'              : this.config.get('config_pagination_admin')
		});

		this.load.model('design/seo_url',this);
		this.load.model('localisation/language',this);

		seo_url_total await this.model_design_seo_url.getTotalSeoUrls(filter_data);

		const results = await this.model_design_seo_url.getSeoUrls(filter_data);

		for (let result of results) {
			language_info await this.model_localisation_language.getLanguage(result['language_id']);

			if (language_info) {
				code = language_info['code'];
				image = language_info['image'];
			} else {
				code = '';
				image = '';
			}

			data['seo_urls'].push({
				'seo_url_id' : result['seo_url_id'],
				'keyword'    : result['keyword'],
				'image'      : image,
				'language'   : code,
				'key'        : result['key'],
				'value'      : result['value'],
				'sort_order' : result['sort_order'],
				'store'      : result['store_id'] ? result['store'] : this.language.get('text_default'),
				'edit'       : this.url.link('design/seo_url.form', 'user_token=' + this.session.data['user_token'] + '&seo_url_id=' + result['seo_url_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_key'])) {
			url += '&filter_key=' + encodeURIComponent(html_entity_decode(this.request.get['filter_key']));
		}

		if ((this.request.get['filter_value'])) {
			url += '&filter_value=' + encodeURIComponent(html_entity_decode(this.request.get['filter_value']));
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

		data['sort_keyword'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + '&sort=keyword' + url);
		data['sort_key'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + '&sort=key' + url);
		data['sort_value'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url);
		data['sort_sort_order'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);
		data['sort_store'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + '&sort=store' + url);
		data['sort_language'] = this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + '&sort=language' + url);

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_key'])) {
			url += '&filter_key=' + encodeURIComponent(html_entity_decode(this.request.get['filter_key']));
		}

		if ((this.request.get['filter_value'])) {
			url += '&filter_value=' + encodeURIComponent(html_entity_decode(this.request.get['filter_value']));
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

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : seo_url_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('design/seo_url.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (seo_url_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (seo_url_total - this.config.get('config_pagination_admin'))) ? seo_url_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), seo_url_total, Math.ceil(seo_url_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('design/seo_url_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('design/seo_url');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['seo_url_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_key'])) {
			url += '&filter_key=' + encodeURIComponent(html_entity_decode(this.request.get['filter_key']));
		}

		if ((this.request.get['filter_value'])) {
			url += '&filter_value=' + encodeURIComponent(html_entity_decode(this.request.get['filter_value']));
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('design/seo_url.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['seo_url_id'])) {
			this.load.model('design/seo_url',this);

			seo_url_info await this.model_design_seo_url.getSeoUrl(this.request.get['seo_url_id']);
		}

		if ((this.request.get['seo_url_id'])) {
			data['seo_url_id'] = this.request.get['seo_url_id'];
		} else {
			data['seo_url_id'] = 0;
		}

		data['stores'] = [];

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.language.get('text_default')
		});

		this.load.model('setting/store',this);

		let stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id' : store['store_id'],
				'name'     : store['name']
			];
		}

		if ((seo_url_info)) {
			data['store_id'] = seo_url_info['store_id'];
		} else {
			data['store_id'] = '';
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((seo_url_info)) {
			data['language_id'] = seo_url_info['language_id'];
		} else {
			data['language_id'] = '';
		}

		if ((seo_url_info)) {
			data['key'] = seo_url_info['key'];
		} else {
			data['key'] = '';
		}

		if ((seo_url_info)) {
			data['value'] = seo_url_info['value'];
		} else {
			data['value'] = '';
		}

		if ((seo_url_info)) {
			data['keyword'] = seo_url_info['keyword'];
		} else {
			data['keyword'] = '';
		}

		if ((seo_url_info)) {
			data['sort_order'] = seo_url_info['sort_order'];
		} else {
			data['sort_order'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/seo_url_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('design/seo_url');

		const json = {};

		if (!await this.user.hasPermission('modify', 'design/seo_url')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['key']) < 1) || (oc_strlen(this.request.post['key']) > 64)) {
			json['error']['key'] = this.language.get('error_key');
		}

		if ((oc_strlen(this.request.post['value']) < 1) || (oc_strlen(this.request.post['value']) > 255)) {
			json['error']['value'] = this.language.get('error_value');
		}

		this.load.model('design/seo_url',this);

		// Check if there is already a key value pair on the same store using the same language
		seo_url_info await this.model_design_seo_url.getSeoUrlByKeyValue(this.request.post['key'], this.request.post['value'], this.request.post['store_id'], this.request.post['language_id']);

		if (seo_url_info.key && (!(this.request.post['seo_url_id']) || seo_url_info['seo_url_id'] != this.request.post['seo_url_id'])) {
			json['error']['value'] = this.language.get('error_value_exists');
		}

		// Split keywords by / so we can validate each keyword
		keywords = explode('/', this.request.post['keyword']);

		for (keywords of keyword) {
			if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
				json['error']['keyword'] = this.language.get('error_keyword');
			}

			if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u', keyword)) {
				json['error']['keyword'] = this.language.get('error_keyword_character');
			}
		}

		// Check if keyword already exists and on the same store of long of the keyword matches the key / value pair
		seo_url_info await this.model_design_seo_url.getSeoUrlByKeyword(this.request.post['keyword'], this.request.post['store_id']);

		if (seo_url_info && ((seo_url_info['key'] != this.request.post['key']) || (seo_url_info['value'] != this.request.post['value']))) {
			json['error']['keyword'] = this.language.get('error_keyword_exists');
		}

		if (!Object.keys(json).length) {
			if (!this.request.post['seo_url_id']) {
				json['seo_url_id'] = await this.model_design_seo_url.addSeoUrl(this.request.post);
			} else {
				await this.model_design_seo_url.editSeoUrl(this.request.post['seo_url_id'], this.request.post);
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
		await this.load.language('design/seo_url');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'design/seo_url')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/seo_url',this);

			for (let seo_url_id of selected) {
				await this.model_design_seo_url.deleteSeoUrl(seo_url_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
