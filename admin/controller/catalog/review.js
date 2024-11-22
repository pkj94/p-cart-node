module.exports = class ControllerCatalogReview extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/review');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/review');

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/review');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/review');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_review.addReview(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_product'])) {
				url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
			}

			if ((this.request.get['filter_author'])) {
				url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/review');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/review');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_catalog_review.editReview(this.request.get['review_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_product'])) {
				url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
			}

			if ((this.request.get['filter_author'])) {
				url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/review');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/review');

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (let review_id of this.request.post['selected']) {
				await this.model_catalog_review.deleteReview(review_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_product'])) {
				url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
			}

			if ((this.request.get['filter_author'])) {
				url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
			}

			if ((this.request.get['filter_status'])) {
				url += '&filter_status=' + this.request.get['filter_status'];
			}

			if ((this.request.get['filter_date_added'])) {
				url += '&filter_date_added=' + this.request.get['filter_date_added'];
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

			this.response.setRedirect(await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

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

		if ((this.request.get['filter_status'])) {
			filter_status = this.request.get['filter_status'];
		} else {
			filter_status = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
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

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('catalog/review/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/review/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['reviews'] = {};

		filter_data = array(
			'filter_product'    : filter_product,
			'filter_author'     : filter_author,
			'filter_status'     : filter_status,
			'filter_date_added' : filter_date_added,
			'sort'              : sort,
			'order'             : order,
			'start'             : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit'             : Number(this.config.get('config_limit_admin'))
		});

		review_total = await this.model_catalog_review.getTotalReviews(filter_data);

		results = await this.model_catalog_review.getReviews(filter_data);

		for (let result of results) {
			data['reviews'].push({
				'review_id'  : result['review_id'],
				'name'       : result['name'],
				'author'     : result['author'],
				'rating'     : result['rating'],
				'status'     : (result['status']) ? this.language.get('text_enabled') : this.language.get('text_disabled'),
				'date_added' : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit'       : await this.url.link('catalog/review/edit', 'user_token=' + this.session.data['user_token'] + '&review_id=' + result['review_id'] + url, true)
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

			delete this.session.data['success']);
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = {};
		}

		url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_product'] = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + '&sort=pd.name' + url, true);
		data['sort_author'] = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + '&sort=r.author' + url, true);
		data['sort_rating'] = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + '&sort=r.rating' + url, true);
		data['sort_status'] = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + '&sort=r.status' + url, true);
		data['sort_date_added'] = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + '&sort=r.date_added' + url, true);

		url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = review_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (review_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (review_total - Number(this.config.get('config_limit_admin')))) ? review_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), review_total, Math.ceil(review_total / Number(this.config.get('config_limit_admin'))));

		data['filter_product'] = filter_product;
		data['filter_author'] = filter_author;
		data['filter_status'] = filter_status;
		data['filter_date_added'] = filter_date_added;

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/review_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['review_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['product'])) {
			data['error_product'] = this.error['product'];
		} else {
			data['error_product'] = '';
		}

		if ((this.error['author'])) {
			data['error_author'] = this.error['author'];
		} else {
			data['error_author'] = '';
		}

		if ((this.error['text'])) {
			data['error_text'] = this.error['text'];
		} else {
			data['error_text'] = '';
		}

		if ((this.error['rating'])) {
			data['error_rating'] = this.error['rating'];
		} else {
			data['error_rating'] = '';
		}

		url = '';

		if ((this.request.get['filter_product'])) {
			url += '&filter_product=' + encodeURIComponent(html_entity_decode(this.request.get['filter_product']));
		}

		if ((this.request.get['filter_author'])) {
			url += '&filter_author=' + encodeURIComponent(html_entity_decode(this.request.get['filter_author']));
		}

		if ((this.request.get['filter_status'])) {
			url += '&filter_status=' + this.request.get['filter_status'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
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
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['review_id'])) {
			data['action'] = await this.url.link('catalog/review/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/review/edit', 'user_token=' + this.session.data['user_token'] + '&review_id=' + this.request.get['review_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['review_id']) && (this.request.server['method'] != 'POST')) {
			review_info = await this.model_catalog_review.getReview(this.request.get['review_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('catalog/product',this);

		if ((this.request.post['product_id'])) {
			data['product_id'] = this.request.post['product_id'];
		} else if ((review_info)) {
			data['product_id'] = review_info['product_id'];
		} else {
			data['product_id'] = '';
		}

		if ((this.request.post['product'])) {
			data['product'] = this.request.post['product'];
		} else if ((review_info)) {
			data['product'] = review_info['product'];
		} else {
			data['product'] = '';
		}

		if ((this.request.post['author'])) {
			data['author'] = this.request.post['author'];
		} else if ((review_info)) {
			data['author'] = review_info['author'];
		} else {
			data['author'] = '';
		}

		if ((this.request.post['text'])) {
			data['text'] = this.request.post['text'];
		} else if ((review_info)) {
			data['text'] = review_info['text'];
		} else {
			data['text'] = '';
		}

		if ((this.request.post['rating'])) {
			data['rating'] = this.request.post['rating'];
		} else if ((review_info)) {
			data['rating'] = review_info['rating'];
		} else {
			data['rating'] = '';
		}

		if ((this.request.post['date_added'])) {
			data['date_added'] = this.request.post['date_added'];
		} else if ((review_info)) {
			data['date_added'] = (review_info['date_added'] != '0000-00-00 00:00' ? review_info['date_added'] : '');
		} else {
			data['date_added'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((review_info)) {
			data['status'] = review_info['status'];
		} else {
			data['status'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/review_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/review')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if (!this.request.post['product_id']) {
			this.error['product'] = this.language.get('error_product');
		}

		if ((oc_strlen(this.request.post['author']) < 3) || (oc_strlen(this.request.post['author']) > 64)) {
			this.error['author'] = this.language.get('error_author');
		}

		if (oc_strlen(this.request.post['text']) < 1) {
			this.error['text'] = this.language.get('error_text');
		}

		if (!(this.request.post['rating']) || this.request.post['rating'] < 0 || this.request.post['rating'] > 5) {
			this.error['rating'] = this.language.get('error_rating');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/review')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}
