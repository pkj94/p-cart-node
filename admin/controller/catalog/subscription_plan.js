module.exports = class SubscriptionPlanController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('catalog/subscription_plan');

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
			'href' : this.url.link('catalog/subscription_plan', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('catalog/subscription_plan.form', 'user_token=' + this.session.data['user_token'] + url);
		data['copy'] = this.url.link('catalog/subscription_plan.copy', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('catalog/subscription_plan.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/subscription_plan', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('catalog/subscription_plan');

		this.response.setOutput(this.getList());
	}

	/**
	 * @return string
	 */
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

		data['action'] = this.url.link('catalog/subscription_plan.list', 'user_token=' + this.session.data['user_token'] + url);

		data['subscription_plans'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('catalog/subscription_plan');

		subscription_plan_total await this.model_catalog_subscription_plan.getTotalSubscriptionPlans();

		const results = await this.model_catalog_subscription_plan.getSubscriptionPlans(filter_data);

		for (let result of results) {
			data['subscription_plans'].push({
				'subscription_plan_id' : result['subscription_plan_id'],
				'name'                 : result['name'],
				'status'               : result['status'],
				'sort_order'           : result['sort_order'],
				'edit'                 : this.url.link('catalog/subscription_plan.form', 'user_token=' + this.session.data['user_token'] + '&subscription_plan_id=' + result['subscription_plan_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('catalog/subscription_plan.list', 'user_token=' + this.session.data['user_token'] + '&sort=spd.name' + url);
		data['sort_sort_order'] = this.url.link('catalog/subscription_plan.list', 'user_token=' + this.session.data['user_token'] + '&sort=sp.sort_order' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : subscription_plan_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('catalog/subscription_plan.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (subscription_plan_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (subscription_plan_total - this.config.get('config_pagination_admin'))) ? subscription_plan_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), subscription_plan_total, Math.ceil(subscription_plan_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('catalog/subscription_plan_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('catalog/subscription_plan');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['subscription_plan_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('catalog/subscription_plan', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('catalog/subscription_plan.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('catalog/subscription_plan', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['subscription_plan_id'])) {
			this.load.model('catalog/subscription_plan');

			subscription_info await this.model_catalog_subscription_plan.getSubscriptionPlan(this.request.get['subscription_plan_id']);
		}

		if ((this.request.get['subscription_plan_id'])) {
			data['subscription_plan_id'] = this.request.get['subscription_plan_id'];
		} else {
			data['subscription_plan_id'] = 0;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['subscription_plan_id'])) {
			data['subscription_plan_description'] = await this.model_catalog_subscription_plan.getDescription(this.request.get['subscription_plan_id']);
		} else {
			data['subscription_plan_description'] = [];
		}

		data['frequencies'] = [];

		data['frequencies'].push({
			'text'  : this.language.get('text_day'),
			'value' : 'day'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_week'),
			'value' : 'week'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_semi_month'),
			'value' : 'semi_month'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_month'),
			'value' : 'month'
		});

		data['frequencies'].push({
			'text'  : this.language.get('text_year'),
			'value' : 'year'
		});

		if ((subscription_info)) {
			data['trial_frequency'] = subscription_info['trial_frequency'];
		} else {
			data['trial_frequency'] = '';
		}

		if ((subscription_info)) {
			data['trial_duration'] = subscription_info['trial_duration'];
		} else {
			data['trial_duration'] = '0';
		}

		if ((subscription_info)) {
			data['trial_cycle'] = subscription_info['trial_cycle'];
		} else {
			data['trial_cycle'] = '1';
		}

		if ((subscription_info)) {
			data['trial_status'] = subscription_info['trial_status'];
		} else {
			data['trial_status'] = 0;
		}

		if ((subscription_info)) {
			data['frequency'] = subscription_info['frequency'];
		} else {
			data['frequency'] = '';
		}

		if ((subscription_info)) {
			data['duration'] = subscription_info['duration'];
		} else {
			data['duration'] = 0;
		}

		if ((subscription_info)) {
			data['cycle'] = subscription_info['cycle'];
		} else {
			data['cycle'] = 1;
		}

		if ((subscription_info)) {
			data['status'] = subscription_info['status'];
		} else {
			data['status'] = 0;
		}

		if ((subscription_info)) {
			data['sort_order'] = subscription_info['sort_order'];
		} else {
			data['sort_order'] = 0;
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('catalog/subscription_plan_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('catalog/subscription_plan');

		const json = {};

		if (!await this.user.hasPermission('modify', 'catalog/subscription_plan')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['subscription_plan_description'] of language_id : value) {
			if ((oc_strlen(trim(value['name'])) < 3) || (oc_strlen(value['name']) > 255)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (this.request.post['trial_duration'] && this.request.post['trial_duration'] < 1) {
			json['error']['trial_duration'] = this.language.get('error_trial_duration');
		}

		if (Object.keys(json['error']).length && !(json['error']['warning'])) {
			json['error']['warning'] = this.language.get('error_warning');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/subscription_plan');

			if (!this.request.post['subscription_plan_id']) {
				json['subscription_plan_id'] = await this.model_catalog_subscription_plan.addSubscriptionPlan(this.request.post);
			} else {
				await this.model_catalog_subscription_plan.editSubscriptionPlan(this.request.post['subscription_plan_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async copy() {
		await this.load.language('catalog/subscription_plan');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'catalog/subscription_plan')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/subscription_plan');

			for (selected of subscription_plan_id) {
				await this.model_catalog_subscription_plan.copySubscriptionPlan(subscription_plan_id);
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
		await this.load.language('catalog/subscription_plan');

		const json = {};

		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		} else {
			selected = [];
		}

		if (!await this.user.hasPermission('modify', 'catalog/subscription_plan')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product');

		for (selected of subscription_id) {
			product_total await this.model_catalog_product.getTotalProductsBySubscriptionPlanId(subscription_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('catalog/subscription_plan');

			for (selected of subscription_plan_id) {
				await this.model_catalog_subscription_plan.deleteSubscriptionPlan(subscription_plan_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}