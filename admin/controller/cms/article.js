<?php
namespace Opencart\Admin\Controller\Cms;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Cms
 */
class ArticleController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('cms/article');

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
			'href' : this.url.link('cms/article', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('cms/article.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('cms/article.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/article', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('cms/article');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'date_added';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} else {
			page = 1;
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

		data['action'] = this.url.link('cms/article.list', 'user_token=' + this.session.data['user_token'] + url);

		data['articles'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('cms/article');

		article_total await this.model_cms_article.getTotalArticles();

		const results = await this.model_cms_article.getArticles(filter_data);

		for (let result of results) {
			data['articles'].push({
				'article_id'  : result['article_id'],
				'name'        : result['name'],
				'author'      : result['author'],
				'status'      : result['status'],
				'date_added'  : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit'        : this.url.link('cms/article.form', 'user_token=' + this.session.data['user_token'] + '&article_id=' + result['article_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('cms/article.list', 'user_token=' + this.session.data['user_token'] + '&sort=ad.name' + url);
		data['sort_author'] = this.url.link('cms/article.list', 'user_token=' + this.session.data['user_token'] + '&sort=a.author' + url);
		data['sort_date_added'] = this.url.link('cms/article.list', 'user_token=' + this.session.data['user_token'] + '&sort=a.date_added' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : article_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('cms/article.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (article_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (article_total - this.config.get('config_pagination_admin'))) ? article_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), article_total, Math.ceil(article_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('cms/article_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('cms/article');

		this.document.setTitle(this.language.get('heading_title'));

		

		data['text_form'] = !(this.request.get['article_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('cms/article', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('cms/article.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('cms/article', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['article_id'])) {
			this.load.model('cms/article');

			article_info await this.model_cms_article.getArticle(this.request.get['article_id']);
		}

		if ((this.request.get['article_id'])) {
			data['article_id'] = this.request.get['article_id'];
		} else {
			data['article_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		this.load.model('tool/image',this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['article_description'] = [];

		if ((this.request.get['article_id'])) {
			const results = await this.model_cms_article.getDescriptions(this.request.get['article_id']);

			for (results of key : result) {
				data['article_description'][key] = result;

				if (is_file(DIR_IMAGE + html_entity_decode(result['image']))) {
					data['article_description'][key]['thumb'] = await this.model_tool_image.resize(html_entity_decode(result['image']), 100, 100);
				} else {
					data['article_description'][key]['thumb'] = data['placeholder'];
				}
			}
		}

		if ((article_info)) {
			data['author'] = article_info['author'];
		} else {
			data['author'] = '';
		}

		this.load.model('cms/topic');

		data['topics'] = await this.model_cms_topic.getTopics();

		if ((article_info)) {
			data['topic_id'] = article_info['topic_id'];
		} else {
			data['topic_id'] = 0;
		}

		data['stores'] = [];

		data['stores'].push({
			'store_id' : 0,
			'name'     : this.language.get('text_default')
		});

		this.load.model('setting/store');

		let stores = await this.model_setting_store.getStores();

		for (let store of stores) {
			data['stores'].push({
				'store_id' : store['store_id'],
				'name'     : store['name']
			];
		}

		if ((this.request.get['article_id'])) {
			data['article_store'] = await this.model_cms_article.getStores(this.request.get['article_id']);
		} else {
			data['article_store'] = [0];
		}

		if ((article_info)) {
			data['image'] = article_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (is_file(DIR_IMAGE + html_entity_decode(data['image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(data['image']), 100, 100);
		} else {
			data['thumb'] = data['placeholder'];
		}

		if ((article_info)) {
			data['status'] = article_info['status'];
		} else {
			data['status'] = true;
		}

		if ((this.request.get['article_id'])) {
			data['article_seo_url'] = await this.model_cms_article.getSeoUrls(this.request.get['article_id']);
		} else {
			data['article_seo_url'] = [];
		}

		this.load.model('design/layout',this);

		data['layouts'] = await this.model_design_layout.getLayouts();

		if ((this.request.get['article_id'])) {
			data['article_layout'] = await this.model_cms_article.getLayouts(this.request.get['article_id']);
		} else {
			data['article_layout'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/article_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('cms/article');

		const json = {};

		if (!await this.user.hasPermission('modify', 'cms/article')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['article_description'] of language_id : value) {
			if ((oc_strlen(trim(value['name'])) < 1) || (oc_strlen(value['name']) > 255)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}

			if ((oc_strlen(trim(value['meta_title'])) < 1) || (oc_strlen(value['meta_title']) > 255)) {
				json['error']['meta_title_' + language_id] = this.language.get('error_meta_title');
			}
		}

		if ((oc_strlen(this.request.post['author']) < 3) || (oc_strlen(this.request.post['author']) > 64)) {
			json['error']['author'] = this.language.get('error_author');
		}

		if (this.request.post['article_seo_url']) {
			this.load.model('design/seo_url',this);

			for (this.request.post['article_seo_url'] of store_id : language) {
				for (let [language_id , keyword] of language ) {
					if ((oc_strlen(trim(keyword)) < 1) || (oc_strlen(keyword) > 64)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword');
					}

					if (preg_match('/[^a-zA-Z0-9\/_-]|[\p{Cyrillic}]+/u', keyword)) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_character');
					}

					let seo_url_info =  await this.model_design_seo_url.getSeoUrlByKeyword(keyword, store_id);

					if (seo_url_info.key && (!(this.request.post['article_id']) || seo_url_info['key'] != 'article_id' || seo_url_info['value'] != this.request.post['article_id'])) {
						json['error']['keyword_' + store_id + '_' + language_id] = this.language.get('error_keyword_exists');
					}
				}
			}
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			this.load.model('cms/article');

			if (!this.request.post['article_id']) {
				json['article_id'] = await this.model_cms_article.addArticle(this.request.post);
			} else {
				await this.model_cms_article.editArticle(this.request.post['article_id'], this.request.post);
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
		await this.load.language('cms/article');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'cms/article')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('cms/article');

			for (selected of article_id) {
				await this.model_cms_article.deleteArticle(article_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
