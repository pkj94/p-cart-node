module.exports = class ControllerLocalisationCurrency extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('localisation/currency');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/currency', this);

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/currency');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/currency', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_currency.addCurrency(this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/currency');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/currency', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_currency.editCurrency(this.request.get['currency_id'], this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/currency');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/currency', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let currency_id of this.request.post['selected']) {
				await this.model_localisation_currency.deleteCurrency(currency_id);
			}

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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

			this.response.setRedirect(await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async refresh() {
		await this.load.language('localisation/currency');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/currency', this);

		if (this.validateRefresh()) {
			await this.model_localisation_currency.refresh();

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

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
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'title';
		}

		if ((this.request.get['order'])) {
			order = this.request.get['order'];
		} else {
			order = 'ASC';
		}
		page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/currency/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/currency/delete', 'user_token=' + this.session.data['user_token'] + url, true);
		data['refresh'] = await this.url.link('localisation/currency/refresh', 'user_token=' + this.session.data['user_token'] + url, true);

		data['currencies'] = {};

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		});

		currency_total = await this.model_localisation_currency.getTotalCurrencies();

		results = await this.model_localisation_currency.getCurrencies(filter_data);

		for (let result of results) {
			data['currencies'].push({
				'currency_id': result['currency_id'],
				'title': result['title'] + ((result['code'] == this.config.get('config_currency')) ? this.language.get('text_default') : null),
				'code': result['code'],
				'value': result['value'],
				'date_modified': date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit': await this.url.link('localisation/currency/edit', 'user_token=' + this.session.data['user_token'] + '&currency_id=' + result['currency_id'] + url, true)
			});
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else if ((this.error['currency_engine'])) {
			data['error_warning'] = this.error['currency_engine'];
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

		data['sort_title'] = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + '&sort=title' + url, true);
		data['sort_code'] = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url, true);
		data['sort_value'] = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url, true);
		data['sort_date_modified'] = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + '&sort=date_modified' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = currency_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (currency_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (currency_total - Number(this.config.get('config_limit_admin')))) ? currency_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), currency_total, Math.ceil(currency_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/currency_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['currency_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['title'])) {
			data['error_title'] = this.error['title'];
		} else {
			data['error_title'] = '';
		}

		if ((this.error['code'])) {
			data['error_code'] = this.error['code'];
		} else {
			data['error_code'] = '';
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
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['currency_id'])) {
			data['action'] = await this.url.link('localisation/currency/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/currency/edit', 'user_token=' + this.session.data['user_token'] + '&currency_id=' + this.request.get['currency_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['currency_id']) && (this.request.server['method'] != 'POST')) {
			currency_info = await this.model_localisation_currency.getCurrency(this.request.get['currency_id']);
		}

		if ((this.request.post['title'])) {
			data['title'] = this.request.post['title'];
		} else if ((currency_info)) {
			data['title'] = currency_info['title'];
		} else {
			data['title'] = '';
		}

		if ((this.request.post['code'])) {
			data['code'] = this.request.post['code'];
		} else if ((currency_info)) {
			data['code'] = currency_info['code'];
		} else {
			data['code'] = '';
		}

		if ((this.request.post['symbol_left'])) {
			data['symbol_left'] = this.request.post['symbol_left'];
		} else if ((currency_info)) {
			data['symbol_left'] = currency_info['symbol_left'];
		} else {
			data['symbol_left'] = '';
		}

		if ((this.request.post['symbol_right'])) {
			data['symbol_right'] = this.request.post['symbol_right'];
		} else if ((currency_info)) {
			data['symbol_right'] = currency_info['symbol_right'];
		} else {
			data['symbol_right'] = '';
		}

		if ((this.request.post['decimal_place'])) {
			data['decimal_place'] = this.request.post['decimal_place'];
		} else if ((currency_info)) {
			data['decimal_place'] = currency_info['decimal_place'];
		} else {
			data['decimal_place'] = '';
		}

		if ((this.request.post['value'])) {
			data['value'] = this.request.post['value'];
		} else if ((currency_info)) {
			data['value'] = currency_info['value'];
		} else {
			data['value'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((currency_info)) {
			data['status'] = currency_info['status'];
		} else {
			data['status'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/currency_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/currency')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['title']) < 3) || (oc_strlen(this.request.post['title']) > 32)) {
			this.error['title'] = this.language.get('error_title');
		}

		if (oc_strlen(this.request.post['code']) != 3) {
			this.error['code'] = this.language.get('error_code');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/currency')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store', this);
		this.load.model('sale/order', this);
		this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];

		for (let currency_id of this.request.post['selected']) {
			const currency_info = await this.model_localisation_currency.getCurrency(currency_id);

			if (currency_info.currency_id) {
				if (this.config.get('config_currency') == currency_info['code']) {
					this.error['warning'] = this.language.get('error_default');
				}

				store_total = await this.model_setting_store.getTotalStoresByCurrency(currency_info['code']);

				if (store_total) {
					this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
				}
			}

			order_total = await this.model_sale_order.getTotalOrdersByCurrencyId(currency_id);

			if (order_total) {
				this.error['warning'] = sprintf(this.language.get('error_order'), order_total);
			}
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateRefresh() {
		if (!await this.user.hasPermission('modify', 'localisation/currency')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		config_currency_engine = this.config.get('config_currency_engine');

		if (!config_currency_engine) {
			this.error['currency_engine'] = this.language.get('error_currency_engine');
		} else if (!this.config.get('currency_'.config_currency_engine.'_status')) {
			this.error['currency_engine'] = this.language.get('error_currency_engine');
		}

		return Object.keys(this.error).length ? false : true
	}
}
