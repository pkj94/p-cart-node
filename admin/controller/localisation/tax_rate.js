module.exports = class ControllerLocalisationTaxRate extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/tax_rate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_rate');

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/tax_rate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_rate');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_tax_rate.addTaxRate(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/tax_rate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_rate');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_tax_rate.editTaxRate(this.request.get['tax_rate_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/tax_rate');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_rate');

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of tax_rate_id) {
				await this.model_localisation_tax_rate.deleteTaxRate(tax_rate_id);
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

			this.response.setRedirect(await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'tr.name';
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/tax_rate/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/tax_rate/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['tax_rates'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		tax_rate_total = await this.model_localisation_tax_rate.getTotalTaxRates();

		results = await this.model_localisation_tax_rate.getTaxRates(filter_data);

		for (let result of results) {
			data['tax_rates'].push({
				'tax_rate_id'   : result['tax_rate_id'],
				'name'          : result['name'],
				'rate'          : result['rate'],
				'type'          : (result['type'] == 'F' ? this.language.get('text_amount') : this.language.get('text_percent')),
				'geo_zone'      : result['geo_zone'],
				'date_added'    : date(this.language.get('date_format_short'), strtotime(result['date_added'])),
				'date_modified' : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit'          : await this.url.link('localisation/tax_rate/edit', 'user_token=' + this.session.data['user_token'] + '&tax_rate_id=' + result['tax_rate_id'] + url, true)
			});
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

		data['sort_name'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + '&sort=tr.name' + url, true);
		data['sort_rate'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + '&sort=tr.rate' + url, true);
		data['sort_type'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + '&sort=tr.type' + url, true);
		data['sort_geo_zone'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + '&sort=gz.name' + url, true);
		data['sort_date_added'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + '&sort=tr.date_added' + url, true);
		data['sort_date_modified'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + '&sort=tr.date_modified' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = tax_rate_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (tax_rate_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (tax_rate_total - Number(this.config.get('config_limit_admin')))) ? tax_rate_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), tax_rate_total, Math.ceil(tax_rate_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_rate_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['tax_rate_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['rate'])) {
			data['error_rate'] = this.error['rate'];
		} else {
			data['error_rate'] = '';
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['tax_rate_id'])) {
			data['action'] = await this.url.link('localisation/tax_rate/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/tax_rate/edit', 'user_token=' + this.session.data['user_token'] + '&tax_rate_id=' + this.request.get['tax_rate_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['tax_rate_id']) && (this.request.server['method'] != 'POST')) {
			tax_rate_info = await this.model_localisation_tax_rate.getTaxRate(this.request.get['tax_rate_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((tax_rate_info)) {
			data['name'] = tax_rate_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['rate'])) {
			data['rate'] = this.request.post['rate'];
		} else if ((tax_rate_info)) {
			data['rate'] = tax_rate_info['rate'];
		} else {
			data['rate'] = '';
		}

		if ((this.request.post['type'])) {
			data['type'] = this.request.post['type'];
		} else if ((tax_rate_info)) {
			data['type'] = tax_rate_info['type'];
		} else {
			data['type'] = '';
		}

		if ((this.request.post['tax_rate_customer_group'])) {
			data['tax_rate_customer_group'] = this.request.post['tax_rate_customer_group'];
		} else if ((this.request.get['tax_rate_id'])) {
			data['tax_rate_customer_group'] = await this.model_localisation_tax_rate.getTaxRateCustomerGroups(this.request.get['tax_rate_id']);
		} else {
			data['tax_rate_customer_group'] = array(this.config.get('config_customer_group_id'));
		}

		this.load.model('customer/customer_group',this);

		data['customer_groups'] = await this.model_customer_customer_group.getCustomerGroups();

		if ((this.request.post['geo_zone_id'])) {
			data['geo_zone_id'] = this.request.post['geo_zone_id'];
		} else if ((tax_rate_info)) {
			data['geo_zone_id'] = tax_rate_info['geo_zone_id'];
		} else {
			data['geo_zone_id'] = '';
		}

		this.load.model('localisation/geo_zone');

		data['geo_zones'] = await this.model_localisation_geo_zone.getGeoZones();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_rate_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/tax_rate')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			this.error['name'] = this.language.get('error_name');
		}

		if (!this.request.post['rate']) {
			this.error['rate'] = this.language.get('error_rate');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/tax_rate')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('localisation/tax_class',this);
		this.request.post['selected']  = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']];

		for (this.request.post['selected'] of tax_rate_id) {
			tax_rule_total = await this.model_localisation_tax_class.getTotalTaxRulesByTaxRateId(tax_rate_id);

			if (tax_rule_total) {
				this.error['warning'] = sprintf(this.language.get('error_tax_rule'), tax_rule_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}