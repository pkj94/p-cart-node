const sprintf = require("locutus/php/strings/sprintf");

module.exports = class ReturnActionController extends global['\Opencart\System\Engine\Controller'] {

	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('localisation/return_action');

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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('localisation/return_action.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('localisation/return_action.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/return_action', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/return_action');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'name';
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		}

		let order = 'ASC';
		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
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

		data['action'] = await this.url.link('localisation/return_action.list', 'user_token=' + this.session.data['user_token'] + url);

		data['return_actions'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('localisation/return_action', this);

		const return_action_total = await this.model_localisation_return_action.getTotalReturnActions();

		const results = await this.model_localisation_return_action.getReturnActions(filter_data);

		for (let result of results) {
			data['return_actions'].push({
				'return_action_id': result['return_action_id'],
				'name': result['name'],
				'edit': await this.url.link('localisation/return_action.form', 'user_token=' + this.session.data['user_token'] + '&return_action_id=' + result['return_action_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('localisation/return_action.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': return_action_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('localisation/return_action.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (return_action_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (return_action_total - this.config.get('config_pagination_admin'))) ? return_action_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), return_action_total, Math.ceil(return_action_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/return_action_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('localisation/return_action');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['return_action_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('localisation/return_action.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['return_action_id'])) {
			data['return_action_id'] = this.request.get['return_action_id'];
		} else {
			data['return_action_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.get['return_action_id'])) {
			this.load.model('localisation/return_action', this);

			data['return_action'] = await this.model_localisation_return_action.getDescriptions(this.request.get['return_action_id']);
		} else {
			data['return_action'] = [];
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/return_action_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/return_action');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'localisation/return_action')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['return_action'])) {
			language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 64)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (!Object.keys(json.error).length) {
			this.load.model('localisation/return_action', this);
			this.request.post['return_action_id'] = Number(this.request.post['return_action_id']);
			if (!this.request.post['return_action_id']) {
				json['return_action_id'] = await this.model_localisation_return_action.addReturnAction(this.request.post);
			} else {
				await this.model_localisation_return_action.editReturnAction(this.request.post['return_action_id'], this.request.post);
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
		await this.load.language('localisation/return_action');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/return_action')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/returns', this);

		for (let return_action_id of selected) {
			let return_total = await this.model_sale_returns.getTotalReturnsByReturnActionId(return_action_id);

			if (return_total) {
				json['error'] = sprintf(this.language.get('error_return'), return_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/return_action', this);

			for (let return_action_id of selected) {
				await this.model_localisation_return_action.deleteReturnAction(return_action_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
