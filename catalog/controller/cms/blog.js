<?php
namespace Opencart\Catalog\Controller\Cms;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Cms
 */
class BlogController extends Controller {
	/**
	 * @return void
	 */
	async index() {
const data ={};
		await this.load.language('cms/blog');

		if ((this.request.get['search'])) {
			search = this.request.get['search'];
		} else {
			search = '';
		}

		if ((this.request.get['topic_id'])) {
			topic_id = this.request.get['topic_id'];
		} else {
			topic_id = 0;
		}

		if ((this.request.get['author'])) {
			author = this.request.get['author'];
		} else {
			author = '';
		}

		let page = 1;
if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} 

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
		];

		let url = '';

		if ((this.request.get['search'])) {
			url += '&search=' + this.request.get['search'];
		}

		if ((this.request.get['author'])) {
			url += '&author=' + this.request.get['author'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['breadcrumbs'].push({
			'text' : this.language.get('text_blog'),
			'href' : await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + url)
		];

		this.load.model('cms/topic');

		topic_info = await this.model_cms_topic.getTopic(topic_id);

		if (topic_info) {
			let url = '';

			if ((this.request.get['search'])) {
				url += '&search=' + this.request.get['search'];
			}

			if ((this.request.get['topic_id'])) {
				url += '&topic_id=' + this.request.get['topic_id'];
			}

			if ((this.request.get['author'])) {
				url += '&author=' + this.request.get['author'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			data['breadcrumbs'].push({
				'text' : topic_info['name'],
				'href' : await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + url)
			];
		}

		this.load.model('tool/image',this);

		if (topic_info && is_file(DIR_IMAGE + html_entity_decode(topic_info['image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(topic_info['image']), this.config.get('config_image_blog_width'), this.config.get('config_image_blog_height'));
		} else {
			data['thumb'] = '';
		}

		if (topic_info) {
			this.document.setTitle(topic_info['meta_title']);
			this.document.setDescription(topic_info['meta_description']);
			this.document.setKeywords(topic_info['meta_keyword']);

			data['heading_title'] = topic_info['name'];
		} else {
			this.document.setTitle(this.language.get('heading_title'));

			data['heading_title'] = this.language.get('heading_title');
		}

		if (topic_info) {
			data['description'] = html_entity_decode(topic_info['description']);
		} else {
			data['description'] = '';
		}

		limit = 20;

		data['articles'] = [];

		filter_data = [
			'filter_search'   : search,
			'filter_topic_id' : topic_id,
			'filter_author'   : author,
			'start'           : (page - 1) * limit,
			'limit'           : limit
		];

		this.load.model('cms/article');

		article_total = await this.model_cms_article.getTotalArticles(filter_data);

		const results = await this.model_cms_article.getArticles(filter_data);

		for (let result of results) {
			if (is_file(DIR_IMAGE + html_entity_decode(result['image']))) {
				image = await this.model_tool_image.resize(html_entity_decode(result['image']), this.config.get('config_image_blog_width'), this.config.get('config_image_blog_height'));
			} else {
				image = '';
			}

			data['articles'].push({
				'article_id'    : result['article_id'],
				'image'         : image,
				'name'          : result['name'],
				'description'   : oc_substr(trim(strip_tags(html_entity_decode(result['description']))), 0, this.config.get('config_article_description_length')) + '++',
				'author'        : result['author'],
				'comment_total' : this.model_cms_article.getTotalComments(result['article_id']),
				'date_added'    : date(this.language.get('date_format_short'), new Date(result['date_added'])),
				'href'          : await this.url.link('cms/blog.info', 'language=' + this.config.get('config_language') + '&article_id=' + result['article_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['search'])) {
			url += '&search=' + this.request.get['search'];
		}

		if ((this.request.get['topic_id'])) {
			url += '&topic_id=' + this.request.get['topic_id'];
		}

		if ((this.request.get['author'])) {
			url += '&author=' + this.request.get['author'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : article_total,
			'page'  : page,
			'limit' : limit,
			'url'   : await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (article_total) ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (article_total - limit)) ? article_total : (((page - 1) * limit) + limit), article_total, Math.ceil(article_total / limit));

		// http://googlewebmastercentral+articlespot+com/2011/09/pagination-with-relnext-and-relprev+html
		if (page == 1) {
			this.document.addLink(await this.url.link('cms/blog', 'language=' + this.config.get('config_language')), 'canonical');
		} else {
			this.document.addLink(await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + '&page='+ page), 'canonical');
		}

		if (page > 1) {
			this.document.addLink(await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + ((page - 2) ? '&page='+ (page - 1) : '')), 'prev');
		}

		if (ceil(article_total / limit) > page) {
			this.document.addLink(await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + '&page='+ (page + 1)), 'next');
		}

		data['search'] = search;
		data['topic_id'] = topic_id;

		data['topics'] = [];

		data['topics'].push({
			'name' : this.language.get('text_all'),
			'href' : await this.url.link('cms/blog', 'language=' + this.config.get('config_language'))
		];

		const results = await this.model_cms_topic.getTopics();

		for (let result of results) {
			data['topics'].push({
				'name' : result['name'],
				'href' : await this.url.link('cms/blog', 'language=' + this.config.get('config_language') + '&topic_id='+ result['topic_id'])
			];
		}

		data['column_left'] = await this.load.controller('common/column_left');
		data['column_right'] = await this.load.controller('common/column_right');
		data['content_top'] = await this.load.controller('common/content_top');
		data['content_bottom'] = await this.load.controller('common/content_bottom');
		data['footer'] = await this.load.controller('common/footer');
		data['header'] = await this.load.controller('common/header');

		this.response.setOutput(await this.load.view('cms/blog_list', data));
	}

	async info() {
		await this.load.language('cms/blog');

		if ((this.request.get['article_id'])) {
			article_id = this.request.get['article_id'];
		} else {
			article_id = 0;
		}

		if ((this.request.get['topic_id'])) {
			topic_id = this.request.get['topic_id'];
		} else {
			topic_id = 0;
		}

		this.load.model('cms/article');

		article_info = await this.model_cms_article.getArticle(article_id);

		if (article_info) {
			this.document.setTitle(article_info['meta_title']);
			this.document.setDescription(article_info['meta_description']);
			this.document.setKeywords(article_info['meta_keyword']);

			data['breadcrumbs'] = [];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_home'),
				'href' : await this.url.link('common/home', 'language=' + this.config.get('config_language'))
			];

			data['breadcrumbs'].push({
				'text' : this.language.get('text_blog'),
				'href' : await this.url.link('cms/blog', 'language=' + this.config.get('config_language'))
			];

			let url = '';

			if ((this.request.get['topic_id'])) {
				url += '&topic_id=' + this.request.get['topic_id'];
			}

			if ((this.request.get['author'])) {
				url += '&author=' + this.request.get['author'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.load.model('cms/topic');

			topic_info = await this.model_cms_topic.getTopic(topic_id);

			if (topic_info) {
				data['breadcrumbs'].push({
					'text' : topic_info['name'],
					'href' : await this.url.link('cms/article', 'language=' + this.config.get('config_language') + url)
				];
			}

			data['breadcrumbs'].push({
				'text' : article_info['name'],
				'href' : await this.url.link('cms/article+info', 'language=' + this.config.get('config_language') + '&article_id=' +  article_id + url)
			];

			data['heading_title'] = article_info['name'];

			data['description'] = html_entity_decode(article_info['description']);
			data['author'] = article_info['author'];
			data['date_added'] = article_info['date_added'];

			data['comment'] = this.getComments();

			data['continue'] = await this.url.link('cms/article', 'language=' + this.config.get('config_language') + url);

			data['column_left'] = await this.load.controller('common/column_left');
			data['column_right'] = await this.load.controller('common/column_right');
			data['content_top'] = await this.load.controller('common/content_top');
			data['content_bottom'] = await this.load.controller('common/content_bottom');
			data['footer'] = await this.load.controller('common/footer');
			data['header'] = await this.load.controller('common/header');

			this.response.setOutput(await this.load.view('cms/blog_info', data));
		} else {
			return new Action('error/not_found');
		}

		return null;
	}

	/**
	 * @return void
	 */
	async comment() {
		await this.load.language('cms/blog');

		this.response.setOutput(this.getComments());
	}

	/**
	 * @return string
	 */
	async getComments() {
		if ((this.request.get['article_id'])) {
			article_id = this.request.get['article_id'];
		} else {
			article_id = 0;
		}

		let page = 1;
if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		} 

		data['articles'] = [];

		this.load.model('cms/article');

		comment_total = await this.model_cms_article.getTotalComments(article_id);

		const results = await this.model_cms_article.getComments(article_id, (page - 1) * this.config.get('config_pagination_admin'), this.config.get('config_pagination_admin'));

		for (let result of results) {
			data['articles'].push({
				'text'       : nl2br(result['text']),
				'author'     : result['author'],
				'date_added' : date(this.language.get('date_format_short'), new Date(result['date_added']))
			];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : comment_total,
			'page'  : page,
			'limit' : 5,
			'url'   : await this.url.link('cms/blog+comment', 'language=' + this.config.get('config_language') + '&article_id=' + article_id + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (comment_total) ? ((page - 1) * 5) + 1 : 0, (((page - 1) * 5) > (comment_total - 5)) ? comment_total : (((page - 1) * 5) + 5), comment_total, Math.ceil(comment_total / 5));

		return await this.load.view('cms/comment', data);
	}

	async addComment() {
		await this.load.language('cms/article');

		const json = array();

		if ((this.request.get['article_id'])) {
			article_id = this.request.get['article_id'];
		} else {
			article_id = 0;
		}

		if (!(this.request.get['comment_token']) || !(this.session.data['comment_token']) || this.request.get['comment_token'] != this.session.data['comment_token']) {
			json['error']['warning'] = this.language.get('error_token');
		}

		keys = [
			'comment',
			'author'
		];

		for (let key of keys) {
			if (!(this.request.post[key])) {
				this.request.post[key] = '';
			}
		}

		this.load.model('cms/article');

		article_info = await this.model_cms_article.getArticle(article_id);

		if (!article_info) {
			json['error']['warning'] = this.language.get('error_article');
		}

		if (!await this.customer.isLogged() && !this.config.get('config_comment_guest')) {
			json['error']['warning'] = this.language.get('error_guest');
		}

		if ((oc_strlen(this.request.post['author']) < 3) || (oc_strlen(this.request.post['author']) > 25)) {
			json['error']['author'] = this.language.get('error_author');
		}

		if ((utf8_strlen(this.request.post['comment']) < 2) || (utf8_strlen(this.request.post['comment']) > 1000)) {
			json['error']['comment'] = this.language.get('error_comment');
		}

		// Captcha
		this.load.model('setting/extension',this);

		extension_info = await this.model_setting_extension.getExtensionByCode('captcha', this.config.get('config_captcha'));

		if (extension_info && Number(this.config.get('captcha_' + this.config.get('config_captcha') + '_status')) && in_array('comment', this.config.get('config_captcha_page'))) {
			const captcha = await this.load.controller('extension/'  + extension_info['extension'] + '/captcha/' + extension_info['code'] + '+validate');

			if (captcha) {
				json['error']['captcha'] = captcha;
			}
		}

		if (!Object.keys(json).length) {
			// Anti-Spam
			comment = str_replace(' ', '', this.request.post['comment']);

			this.load.model('cms/antispam');

			spam = await this.model_cms_antispam.getSpam(comment);

			if (!await this.customer.isCommentor() || spam) {
				status = 0;
			} else {
				status = 1;
			}

			await this.model_cms_article.addComment(article_id, this.request.post + ['status' : status]);

			if (!status) {
				json['success'] = this.language.get('text_queue');
			} else {
				json['success'] = this.language.get('text_success');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}