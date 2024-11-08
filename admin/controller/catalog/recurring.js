module.exports = class ControllerCatalogRecurring extends Controller {
	error = {};

	async index() {
		await this.load.language('catalog/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/recurring');

		await this.getList();
	}

	async add() {
		await this.load.language('catalog/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/recurring');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_recurring.addRecurring(this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('catalog/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/recurring');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_catalog_recurring.editRecurring(this.request.get['recurring_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('catalog/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/recurring');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of recurring_id) {
				await this.model_catalog_recurring.deleteRecurring(recurring_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async copy() {
		await this.load.language('catalog/recurring');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('catalog/recurring');

		if ((this.request.post['selected']) && this.validateCopy()) {
			for (this.request.post['selected'] of recurring_id) {
				await this.model_catalog_recurring.copyRecurring(recurring_id);
			}

			this.session.data['success'] = this.language.get('text_success');

			url = '';

			if ((this.request.get['sort'])) {
				url += '&sort=' + this.request.get['sort'];
			}

			if ((this.request.get['order'])) {
				url += '&order=' + this.request.get['order'];
			}

			if ((this.request.get['page'])) {
				url += '&page=' + this.request.get['page'];
			}

			this.response.setRedirect(await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'rd.name';
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
			'href' : await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('catalog/recurring/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['copy'] = await this.url.link('catalog/recurring/copy', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('catalog/recurring/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['recurrings'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		recurring_total = await this.model_catalog_recurring.getTotalRecurrings();

		results = await this.model_catalog_recurring.getRecurrings(filter_data);

		for (let result of results) {
			data['recurrings'].push({
				'recurring_id' : result['recurring_id'],
				'name'         : result['name'],
				'sort_order'   : result['sort_order'],
				'edit'         : await this.url.link('catalog/recurring/edit', 'user_token=' + this.session.data['user_token'] + '&recurring_id=' + result['recurring_id'] + url, true)
			);
		}

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

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['sort_name'] = await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=pd.name' + url, true);
		data['sort_sort_order'] = await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + '&sort=p.sort_order' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = recurring_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (recurring_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (recurring_total - this.config.get('config_limit_admin'))) ? recurring_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), recurring_total, ceil(recurring_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/recurring_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['recurring_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = {};
		}

		url = '';

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
			'href' : await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['recurring_id'])) {
			data['action'] = await this.url.link('catalog/recurring/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('catalog/recurring/edit', 'user_token=' + this.session.data['user_token'] + '&recurring_id=' + this.request.get['recurring_id'] + url, true);
		}

		data['cancel'] = await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['recurring_id']) && (this.request.server['method'] != 'POST')) {
			recurring_info = await this.model_catalog_recurring.getRecurring(this.request.get['recurring_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['recurring_description'])) {
			data['recurring_description'] = this.request.post['recurring_description'];
		} else if ((recurring_info)) {
			data['recurring_description'] = await this.model_catalog_recurring.getRecurringDescription(recurring_info['recurring_id']);
		} else {
			data['recurring_description'] = {};
		}

		if ((this.request.post['price'])) {
			data['price'] = this.request.post['price'];
		} else if ((recurring_info)) {
			data['price'] = recurring_info['price'];
		} else {
			data['price'] = 0;
		}

		data['frequencies'] = {};

		data['frequencies'].push({
			'text'  : this.language.get('text_day'),
			'value' : 'day'
		);

		data['frequencies'].push({
			'text'  : this.language.get('text_week'),
			'value' : 'week'
		);

		data['frequencies'].push({
			'text'  : this.language.get('text_semi_month'),
			'value' : 'semi_month'
		);

		data['frequencies'].push({
			'text'  : this.language.get('text_month'),
			'value' : 'month'
		);

		data['frequencies'].push({
			'text'  : this.language.get('text_year'),
			'value' : 'year'
		);

		if ((this.request.post['frequency'])) {
			data['frequency'] = this.request.post['frequency'];
		} else if ((recurring_info)) {
			data['frequency'] = recurring_info['frequency'];
		} else {
			data['frequency'] = '';
		}

		if ((this.request.post['duration'])) {
			data['duration'] = this.request.post['duration'];
		} else if ((recurring_info)) {
			data['duration'] = recurring_info['duration'];
		} else {
			data['duration'] = 0;
		}

		if ((this.request.post['cycle'])) {
			data['cycle'] = this.request.post['cycle'];
		} else if ((recurring_info)) {
			data['cycle'] = recurring_info['cycle'];
		} else {
			data['cycle'] = 1;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((recurring_info)) {
			data['status'] = recurring_info['status'];
		} else {
			data['status'] = 0;
		}

		if ((this.request.post['trial_price'])) {
			data['trial_price'] = this.request.post['trial_price'];
		} else if ((recurring_info)) {
			data['trial_price'] = recurring_info['trial_price'];
		} else {
			data['trial_price'] = 0.00;
		}

		if ((this.request.post['trial_frequency'])) {
			data['trial_frequency'] = this.request.post['trial_frequency'];
		} else if ((recurring_info)) {
			data['trial_frequency'] = recurring_info['trial_frequency'];
		} else {
			data['trial_frequency'] = '';
		}

		if ((this.request.post['trial_duration'])) {
			data['trial_duration'] = this.request.post['trial_duration'];
		} else if ((recurring_info)) {
			data['trial_duration'] = recurring_info['trial_duration'];
		} else {
			data['trial_duration'] = '0';
		}

		if ((this.request.post['trial_cycle'])) {
			data['trial_cycle'] = this.request.post['trial_cycle'];
		} else if ((recurring_info)) {
			data['trial_cycle'] = recurring_info['trial_cycle'];
		} else {
			data['trial_cycle'] = '1';
		}
		if ((this.request.post['trial_status'])) {
			data['trial_status'] = this.request.post['trial_status'];
		} else if ((recurring_info)) {
			data['trial_status'] = recurring_info['trial_status'];
		} else {
			data['trial_status'] = 0;
		}

		if ((this.request.post['sort_order'])) {
			data['sort_order'] = this.request.post['sort_order'];
		} else if ((recurring_info)) {
			data['sort_order'] = recurring_info['sort_order'];
		} else {
			data['sort_order'] = 0;
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/recurring_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'catalog/recurring')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['recurring_description'] of language_id : value) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 255)) {
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		if (this.error && !(this.error['warning'])) {
			this.error['warning'] = this.language.get('error_warning');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'catalog/recurring')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product');

		for (this.request.post['selected'] of recurring_id) {
			product_total = await this.model_catalog_product.getTotalProductsByProfileId(recurring_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateCopy() {
		if (!await this.user.hasPermission('modify', 'catalog/recurring')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}