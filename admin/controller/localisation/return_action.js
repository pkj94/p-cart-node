module.exports = class ControllerLocalisationReturnAction extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/return_action');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/return_action', this);

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/return_action');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/return_action', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_return_action.addReturnAction(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/return_action');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/return_action', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_return_action.editReturnAction(this.request.get['return_action_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/return_action');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/return_action', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let return_action_id of this.request.post['selected']) {
				await this.model_localisation_return_action.deleteReturnAction(return_action_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

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

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/return_action/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/return_action/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['return_actions'] = [];

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const return_action_total = await this.model_localisation_return_action.getTotalReturnActions();

		const results = await this.model_localisation_return_action.getReturnActions(filter_data);

		for (let result of results) {
			data['return_actions'].push({
				'return_action_id': result['return_action_id'],
				'name': result['name'],
				'edit': await this.url.link('localisation/return_action/edit', 'user_token=' + this.session.data['user_token'] + '&return_action_id=' + result['return_action_id'] + url, true)
			});
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		if ((this.request.post['selected'])) {
			data['selected'] = this.request.post['selected'];
		} else {
			data['selected'] = [];
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

		data['sort_name'] = await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = return_action_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (return_action_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (return_action_total - Number(this.config.get('config_limit_admin')))) ? return_action_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), return_action_total, Math.ceil(return_action_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/return_action_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['return_action_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['return_action_id'])) {
			data['action'] = await this.url.link('localisation/return_action/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/return_action/edit', 'user_token=' + this.session.data['user_token'] + '&return_action_id=' + this.request.get['return_action_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'] + url, true);

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['return_action'])) {
			data['return_action'] = this.request.post['return_action'];
		} else if ((this.request.get['return_action_id'])) {
			data['return_action'] = await this.model_localisation_return_action.getReturnActionDescriptions(this.request.get['return_action_id']);
		} else {
			data['return_action'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/return_action_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/return_action')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['return_action'])) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 64)) {
				this.error['name'] = this.error['name'] || {};
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/return_action')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('sale/return', this);
		this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];

		for (let return_action_id of this.request.post['selected']) {
			const return_total = await this.model_sale_return.getTotalReturnsByReturnActionId(return_action_id);

			if (return_total) {
				this.error['warning'] = sprintf(this.language.get('error_return'), return_total);
			}
		}

		return Object.keys(this.error).length ? false : true
	}
}