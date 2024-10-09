<?php
namespace Opencart\Admin\Controller\Cms;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Cms
 */
class TopicController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('cms/topic');

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
			'href' : this.url.link('cms/topic', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('cms/topic.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('cms/topic.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/topic', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('cms/topic');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 't.sort_order';
		}

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page '])) {
			page = this.request.get['page '];
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

		data['action'] = this.url.link('cms/topic.list', 'user_token=' + this.session.data['user_token'] + url);

		data['topics'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('cms/topic');

		topic_total await this.model_cms_topic.getTotalTopics();

		const results = await this.model_cms_topic.getTopics(filter_data);

		for (let result of results) {
			data['topics'].push({
				'topic_id'   : result['topic_id'],
				'name'       : result['name'],
				'status'     : result['status'],
				'sort_order' : result['sort_order'],
				'edit'       : this.url.link('cms/topic.form', 'user_token=' + this.session.data['user_token'] + '&topic_id=' + result['topic_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('cms/topic.list', 'user_token=' + this.session.data['user_token'] + '&sort=bcd.name' + url);
		data['sort_sort_order'] = this.url.link('cms/topic.list', 'user_token=' + this.session.data['user_token'] + '&sort=bc.sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : topic_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('cms/topic.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (topic_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (topic_total - this.config.get('config_pagination_admin'))) ? topic_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), topic_total, Math.ceil(topic_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('cms/topic_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('cms/topic');

		this.document.setTitle(this.language.get('heading_title'));

		

		data['text_form'] = !(this.request.get['topic_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('cms/topic', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('cms/topic.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('cms/topic', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['topic_id'])) {
			this.load.model('cms/topic');

			topic_info await this.model_cms_topic.getTopic(this.request.get['topic_id']);
		}

		if ((this.request.get['topic_id'])) {
			data['topic_id'] = this.request.get['topic_id'];
		} else {
			data['topic_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		this.load.model('tool/image',this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['topic_description'] = [];

		if ((this.request.get['topic_id'])) {
			const results = await this.model_cms_topic.getDescriptions(this.request.get['topic_id']);

			for (results of key : result) {
				data['topic_description'][key] = result;

				if (is_file(DIR_IMAGE + html_entity_decode(result['image']))) {
					data['topic_description'][key]['thumb'] = await this.model_tool_image.resize(html_entity_decode(result['image']), 100, 100);
				} else {
					data['topic_description'][key]['thumb'] = data['placeholder'];
				}
			}
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

		if ((this.request.get['topic_id'])) {
			data['topic_store'] = await this.model_cms_topic.getStores(this.request.get['topic_id']);
		} else {
			data['topic_store'] = [0];
		}

		if ((topic_info)) {
			data['sort_order'] = topic_info['sort_order'];
		} else {
			data['sort_order'] = 0;
		}

		if ((topic_info)) {
			data['status'] = topic_info['status'];
		} else {
			data['status'] = true;
		}

		if ((this.request.get['topic_id'])) {
			data['topic_seo_url'] = await this.model_cms_topic.getSeoUrls(this.request.get['topic_id']);
		} else {
			data['topic_seo_url'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/topic_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('cms/topic');

		const json = {};

		if (!await this.user.hasPermission('modify', 'cms/topic')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['topic_description'] of language_id : value) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 255)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(trim(value['meta_title'])) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				json['error']['meta_title_' + language_id] = this.language.get('error_meta_title');
			}
		}

		if (this.request.post['topic_seo_url']) {
			this.load.model('design/seo_url',this);

			for (this.request.post['topic_seo_url'] of store_id : language) {
				for (let [language_id , keyword] of language ) {
					language_id = language_id.split('-')[1];
					if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword');
					}

					if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u', keyword)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_character');
					}

					let seo_url_info =  await this.model_design_seo_url.getSeoUrlByKeyword(keyword, store_id);

					if (seo_url_info.key && (!(this.request.post['topic_id']) || seo_url_info['key'] != 'topic_id' || seo_url_info['value'] != this.request.post['topic_id'])) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_exists');
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			this.load.model('cms/topic');

			if (!this.request.post['topic_id']) {
				json['topic_id'] = await this.model_cms_topic.addTopic(this.request.post);
			} else {
				await this.model_cms_topic.editTopic(this.request.post['topic_id'], this.request.post);
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
		await this.load.language('cms/topic');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'cms/topic')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('cms/topic');

			for (selected of topic_id) {
				await this.model_cms_topic.deleteTopic(topic_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
