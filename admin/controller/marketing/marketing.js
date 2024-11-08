module.exports = class ControllerMarketingMarketing extends Controller {
	error = {};

	async index() {
		await this.load.language('marketing/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/marketing');

		await this.getList();
	}

	async add() {
		await this.load.language('marketing/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/marketing');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_marketing_marketing.addMarketing(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_code'])) {
				url += '&filter_code=' + this.request.get['filter_code'];
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

			this.response.setRedirect(await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('marketing/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/marketing');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_marketing_marketing.editMarketing(this.request.get['marketing_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_code'])) {
				url += '&filter_code=' + this.request.get['filter_code'];
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

			this.response.setRedirect(await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('marketing/marketing');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('marketing/marketing');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of marketing_id) {
				await this.model_marketing_marketing.deleteMarketing(marketing_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['filter_name'])) {
				url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
			}

			if ((this.request.get['filter_code'])) {
				url += '&filter_code=' + this.request.get['filter_code'];
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

			this.response.setRedirect(await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		} else {
			filter_name = '';
		}

		if ((this.request.get['filter_code'])) {
			filter_code = this.request.get['filter_code'];
		} else {
			filter_code = '';
		}

		if ((this.request.get['filter_date_added'])) {
			filter_date_added = this.request.get['filter_date_added'];
		} else {
			filter_date_added = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'm.name';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
		}

		if ((this.request.get['filter_date_added'])) {
			url += '&filter_date_added=' + this.request.get['filter_date_added'];
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('marketing/marketing/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('marketing/marketing/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['marketings'] = {};

		filter_data = array(
			'filter_name'       : filter_name,
			'filter_code'       : filter_code,
			'filter_date_added' : filter_date_added,
			'sort'              : sort,
			'order'             : order,
			'start'             : (page - 1) * this.config.get('config_limit_admin'),
			'limit'             : this.config.get('config_limit_admin')
		);

		marketing_total = await this.model_marketing_marketing.getTotalMarketings(filter_data);

		results = await this.model_marketing_marketing.getMarketings(filter_data);

		for (let result of results) {
			data['marketings'].push({
				'marketing_id' : result['marketing_id'],
				'name'         : result['name'],
				'code'         : result['code'],
				'clicks'       : result['clicks'],
				'orders'       : result['orders'],
				'date_added'   : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'edit'         : await this.url.link('marketing/marketing/edit', 'user_token=' + this.session.data['user_token'] + '&marketing_id=' + result['marketing_id'] + url, true)
			);
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

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
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

		data['sort_name'] = await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + '&sort=m.name' + url, true);
		data['sort_code'] = await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + '&sort=m.code' + url, true);
		data['sort_date_added'] = await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + '&sort=m.date_added' + url, true);

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
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
		pagination.total = marketing_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (marketing_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (marketing_total - this.config.get('config_limit_admin'))) ? marketing_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), marketing_total, ceil(marketing_total / this.config.get('config_limit_admin')));

		data['filter_name'] = filter_name;
		data['filter_code'] = filter_code;
		data['filter_date_added'] = filter_date_added;

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/marketing_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['marketing_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		if ((this.error['code'])) {
			data['error_code'] = this.error['code'];
		} else {
			data['error_code'] = '';
		}

		url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + urlencode(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_code'])) {
			url += '&filter_code=' + this.request.get['filter_code'];
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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['marketing_id'])) {
			data['action'] = await this.url.link('marketing/marketing/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('marketing/marketing/edit', 'user_token=' + this.session.data['user_token'] + '&marketing_id=' + this.request.get['marketing_id'] + url, true);
		}

		data['cancel'] = await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['marketing_id']) && (this.request.server['method'] != 'POST')) {
			marketing_info = await this.model_marketing_marketing.getMarketing(this.request.get['marketing_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		data['store'] = HTTP_CATALOG;

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((marketing_info)) {
			data['name'] = marketing_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['description'])) {
			data['description'] = this.request.post['description'];
		} else if ((marketing_info)) {
			data['description'] = marketing_info['description'];
		} else {
			data['description'] = '';
		}

		if ((this.request.post['code'])) {
			data['code'] = this.request.post['code'];
		} else if ((marketing_info)) {
			data['code'] = marketing_info['code'];
		} else {
			data['code'] = uniqid();
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketing/marketing_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'marketing/marketing')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 32)) {
			this.error['name'] = this.language.get('error_name');
		}

		if (!this.request.post['code']) {
			this.error['code'] = this.language.get('error_code');
		}

		marketing_info = await this.model_marketing_marketing.getMarketingByCode(this.request.post['code']);

		if (!(this.request.get['marketing_id'])) {
			if (marketing_info) {
				this.error['code'] = this.language.get('error_exists');
			}
		} else {
			if (marketing_info && (this.request.get['marketing_id'] != marketing_info['marketing_id'])) {
				this.error['code'] = this.language.get('error_exists');
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'marketing/marketing')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}