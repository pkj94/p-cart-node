const sprintf = require("locutus/php/strings/sprintf");

module.exports = class CommentController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */

	async index() {
		const data = {};
		await this.load.language('cms/comment');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('cms/comment', 'user_token=' + this.session.data['user_token'])
		});

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/comment', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('cms/comment');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let filter_keyword = '';
		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		}
		let filter_title = '';
		if ((this.request.get['filter_title'])) {
			filter_title = this.request.get['filter_title'];
		}
		let filter_customer = '';
		if ((this.request.get['filter_customer'])) {
			filter_customer = this.request.get['filter_customer'];
		}
		let filter_status = 0;
		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		}
		let filter_date_added = '';
		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		}
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_title'])) {
			url += '&filter_title=' + encodeURIComponent(html_entity_decode(this.request.get['filter_title']));
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['comments'] = [];

		let filter_data = {
			'filter_keyword': filter_keyword,
			'filter_title': filter_title,
			'filter_customer': filter_customer,
			'filter_status': filter_status,
			'filter_date_added': filter_date_added,
			'start': (page - 1) * 10,
			'limit': 10
		};

		this.load.model('cms/article', this);

		const comment_total = await this.model_cms_article.getTotalComments(filter_data);

		const results = await this.model_cms_article.getComments(filter_data);

		for (let result of results) {
			let approve = '';
			if (!result['status']) {
				approve = await this.url.link('cms/comment.approve', 'user_token=' + this.session.data['user_token'] + '&comment_id=' + result['comment_id'] + url);
			}

			data['comments'].push({
				'article': result['article'],
				'article_edit': await this.url.link('cms/article.edit', 'user_token=' + this.session.data['user_token'] + '&article_id=' + result['article_id']),
				'customer': result['customer'],
				'customer_edit': await this.url.link('customer/customer.edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=' + result['customer_id']),
				'comment': nl2br(result['comment']),
				'date_added': date('d/m/Y', new Date(result['date_added'])),
				'approve': approve,
				'spam': await this.url.link('cms/comment.spam', 'user_token=' + this.session.data['user_token'] + '&comment_id=' + result['comment_id'] + url),
				'delete': await this.url.link('cms/comment.delete', 'user_token=' + this.session.data['user_token'] + '&comment_id=' + result['comment_id'] + url)
			});
		}

		url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['filter_title'])) {
			url += '&filter_title=' + encodeURIComponent(html_entity_decode(this.request.get['filter_title']));
		}

		if ((this.request.get['filter_customer'])) {
			url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': comment_total,
			'page': page,
			'limit': 10,
			'url': await this.url.link('cms/comment.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (comment_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (comment_total - this.config.get('config_pagination_admin'))) ? comment_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), comment_total, Math.ceil(comment_total / this.config.get('config_pagination_admin')));

		return await this.load.view('cms/comment_list', data);
	}

	async approve() {
		await this.load.language('cms/comment');

		const json = {};
		let article_comment_id = 0;
		if ((this.request.get['article_comment_id'])) {
			article_comment_id = this.request.get['article_comment_id'];
		}

		if (!await this.user.hasPermission('modify', 'cms/comment')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('cms/article', this);

		const comment_info = await this.model_cms_article.getComment(article_comment_id);

		if (!comment_info.comment_id) {
			json['error'] = this.language.get('error_comment');
		}

		if (!Object.keys(json).length) {
			// Approve Commentor
			this.load.model('customer/customer', this);

			await this.model_customer_customer.editCommentor(comment_info['customer_id'], 1);

			// Approve all past comments
			let filter_data = {
				'filter_customer_id': comment_info['customer_id'],
				'filter_status': 0
			};

			const results = await this.model_cms_comment.getComments(filter_data);

			for (let result of results) {
				await this.model_cms_comment.editStatus(result['customer_id'], 1);
			}

			json['success'] = this.language.get('text_success');

			let url = '';

			if ((this.request.get['filter_keyword'])) {
				url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
			}

			if ((this.request.get['filter_title'])) {
				url += '&filter_title=' + encodeURIComponent(html_entity_decode(this.request.get['filter_title']));
			}

			if ((this.request.get['filter_customer'])) {
				url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			json['redirect'] = await this.url.link('cms/comment.comment', 'user_token=' + this.session.data['user_token'] + url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async spam() {
		await this.load.language('cms/comment');

		const json = {};
		let comment_id = 0;
		if ((this.request.get['comment_id'])) {
			comment_id = this.request.get['comment_id'];
		}

		if (!await this.user.hasPermission('modify', 'cms/comment')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('cms/article', this);

		const comment_info = await this.model_cms_article.getComment(comment_id);

		if (!comment_info.comment_id) {
			json['error'] = this.language.get('error_comment');
		}

		if (!Object.keys(json).length) {
			this.load.model('customer/customer', this);

			await this.model_customer_customer.editCommentor(comment_info['customer_id'], 0);
			await this.model_customer_customer.editStatus(comment_info['customer_id'], 0);
			await this.model_customer_customer.addHistory(comment_info['customer_id'], 'SPAMMER!!!');

			// Delete all customer comments
			const results = await this.model_cms_comment.getComments({ 'filter_customer_id': comment_info['customer_id'] });

			for (let result of results) {
				await this.model_cms_comment.deleteCommentsByCustomerId(result['comment_id']);
			}

			json['success'] = this.language.get('text_success');

			let url = '';

			if ((this.request.get['filter_keyword'])) {
				url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
			}

			if ((this.request.get['filter_title'])) {
				url += '&filter_title=' + encodeURIComponent(html_entity_decode(this.request.get['filter_title']));
			}

			if ((this.request.get['filter_customer'])) {
				url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			json['redirect'] = await this.url.link('cms/comment/comment', 'user_token=' + this.session.data['user_token'] + url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async delete() {
		await this.load.language('cms/comment');

		const json = {};
		let comment_id = 0;
		if ((this.request.get['comment_id'])) {
			comment_id = this.request.get['comment_id'];
		}

		if (!await this.user.hasPermission('modify', 'cms/comment')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('cms/article', this);

		const comment_info = await this.model_cms_article.getComment(comment_id);

		if (!comment_info.comment_id) {
			json['error'] = this.language.get('error_comment');
		}

		if (!Object.keys(json).length) {
			await this.model_cms_article.deleteComment(comment_id);

			json['success'] = this.language.get('error_success');

			let url = '';

			if ((this.request.get['filter_keyword'])) {
				url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
			}

			if ((this.request.get['filter_title'])) {
				url += '&filter_title=' + encodeURIComponent(html_entity_decode(this.request.get['filter_title']));
			}

			if ((this.request.get['filter_customer'])) {
				url += '&filter_customer=' + encodeURIComponent(html_entity_decode(this.request.get['filter_customer']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			json['redirect'] = await this.url.link('cms/comment.comment', 'user_token=' + this.session.data['user_token'] + url, true);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}