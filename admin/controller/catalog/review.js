module.exports = class ReviewController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('catalog/review');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_product'])) {
			filter_product = this.request.get['filter_product'];
		} else {
			filter_product = '';
		}

		if ((this.request.get['filter_author'])) {
			filter_author = this.request.get['filter_author'];
		} else {
			filter_author = '';
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		} else {
			filter_date_from = '';
		}

		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		} else {
			filter_date_to = '';
		}

		let url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
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
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/review.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/review.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/review', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/review');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_product'])) {
			filter_product = this.request.get['filter_product'];
		} else {
			filter_product = '';
		}

		if ((this.request.get['filter_author'])) {
			filter_author = this.request.get['filter_author'];
		} else {
			filter_author = '';
		}

		let filter_status = '';
		if (typeof this.request.get['filter_status'] != 'undefined' && this.request.get['filter_status'] !== '') {
			filter_status = this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			filter_date_from = this.request.get['filter_date_from'];
		} else {
			filter_date_from = '';
		}

		if ((this.request.get['filter_date_to'])) {
			filter_date_to = this.request.get['filter_date_to'];
		} else {
			filter_date_to = '';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'DESC';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'r.date_added';
		}

		let page = 1;
		if ((this.request.get['page '])) {
			page = this.request.get['page '];
		}

		let url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
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

		data['action'] = this.url.link('catalog/review.list', 'user_token=' + this.session.data['user_token'] + url);

		data['reviews'] = [];

		let filter_data = {
			'filter_product': filter_product,
			'filter_author': filter_author,
			'filter_status': filter_status,
			'filter_date_from': filter_date_from,
			'filter_date_to': filter_date_to,
			'sort': sort,
			'order': order,
			'start': (page - 1) * this.config.get('config_pagination_admin'),
			'limit': this.config.get('config_pagination_admin')
		});

		this.load.model('catalog/review');

		review_total await this.model_catalog_review.getTotalReviews(filter_data);

		const results = await this.model_catalog_review.getReviews(filter_data);

		for (let result of results) {
			data['reviews'].push({
				'review_id': result['review_id'],
				'name': result['name'],
				'author': result['author'],
				'rating': result['rating'],
				'status': result['status'],
				'date_added': date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit': this.url.link('catalog/review.form', 'user_token=' + this.session.data['user_token'] + '&review_id=' + result['review_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_product'] = this.url.link('catalog/review.list', 'user_token=' + this.session.data['user_token'] + '&sort=pd.name' + url);
		data['sort_author'] = this.url.link('catalog/review.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.author' + url);
		data['sort_rating'] = this.url.link('catalog/review.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.rating' + url);
		data['sort_date_added'] = this.url.link('catalog/review.list', 'user_token=' + this.session.data['user_token'] + '&sort=r.date_added' + url);

		let url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': review_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('catalog/review.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (review_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (review_total - this.config.get('config_pagination_admin'))) ? review_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), review_total, Math.ceil(review_total / this.config.get('config_pagination_admin')));

		data['filter_product'] = filter_product;
		data['filter_author'] = filter_author;
		data['filter_status'] = filter_status;
		data['filter_date_from'] = filter_date_from;
		data['filter_date_to'] = filter_date_to;

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/review_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('catalog/review');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['review_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_from'])) {
			url += '&filter_date_from=' + this.request.get['filter_date_from'];
		}

		if ((this.request.get['filter_date_to'])) {
			url += '&filter_date_to=' + this.request.get['filter_date_to'];
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
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/review.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['review_id'])) {
			this.load.model('catalog/review');

			review_info await this.model_catalog_review.getReview(this.request.get['review_id']);
		}

		if ((this.request.get['review_id'])) {
			data['review_id'] = this.request.get['review_id'];
		} else {
			data['review_id'] = 0;
		}

		if ((review_info)) {
			data['product_id'] = review_info['product_id'];
		} else {
			data['product_id'] = '';
		}

		if ((review_info)) {
			data['product'] = review_info['product'];
		} else {
			data['product'] = '';
		}

		if ((review_info)) {
			data['author'] = review_info['author'];
		} else {
			data['author'] = '';
		}

		if ((review_info)) {
			data['text'] = review_info['text'];
		} else {
			data['text'] = '';
		}

		if ((review_info)) {
			data['rating'] = review_info['rating'];
		} else {
			data['rating'] = '';
		}

		if ((review_info)) {
			data['date_added'] = (review_info['date_added'] != '0000-00-00 00:00' ? review_info['date_added'] : date('Y-m-d'));
		} else {
			data['date_added'] = date('Y-m-d');
		}

		if ((review_info)) {
			data['status'] = review_info['status'];
		} else {
			data['status'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/review_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/review');

		const json = {};

		if (!await this.user.hasPermission('modify', 'catalog/review')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['author']) < 3) || (oc_strlen(this.request.post['author']) > 64)) {
			json['error']['author'] = this.language.get('error_author');
		}

		if (!this.request.post['product_id']) {
			json['error']['product'] = this.language.get('error_product');
		}

		if (oc_strlen(this.request.post['text']) < 1) {
			json['error']['text'] = this.language.get('error_text');
		}

		if (!(this.request.post['rating']) || this.request.post['rating'] < 0 || this.request.post['rating'] > 5) {
			json['error']['rating'] = this.language.get('error_rating');
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}
		this.request.post['review_id'] = Number(this.request.post['review_id']);
		if (!Object.keys(json).length) {
			this.load.model('catalog/review');

			if (!this.request.post['review_id']) {
				json['review_id'] = await this.model_catalog_review.addReview(this.request.post);
			} else {
				await this.model_catalog_review.editReview(this.request.post['review_id'], this.request.post);
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
		await this.load.language('catalog/review');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'catalog/review')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/review');

			for (let review_id of selected) {
				await this.model_catalog_review.deleteReview(review_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async sync() {
		await this.load.language('catalog/review');

		const json = {};

		let page = 1;
		if ((this.request.get['page '])) {
			page = this.request.get['page '];
		}

		if (!await this.user.hasPermission('modify', 'catalog/review')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/product', this);
			this.load.model('catalog/review');

			total await this.model_catalog_product.getTotalProducts();
			let limit = 10;

			start = (page - 1) * limit;
			end = start > (total - limit) ? total : (start + limit);

			product_data = [
				'start' : (page - 1) * limit,
				'limit' : limit
			];

			const results = await this.model_catalog_product.getProducts(product_data);

			for (let result of results) {
				await this.model_catalog_product.editRating(result['product_id'], this.model_catalog_review.getRating(result['product_id']));
			}

			if (total && end < total) {
				json['text'] = sprintf(this.language.get('text_next'), end, total);

				json['next'] = this.url.link('catalog/review.sync', 'user_token=' + this.session.data['user_token'] + '&page=' + (page + 1), true);
			} else {
				json['success'] = sprintf(this.language.get('text_next'), end, total);

				json['next'] = '';
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
