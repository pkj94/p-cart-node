module.exports = class ControllerLocalisationTaxClass extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/tax_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_class',this);

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/tax_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_class',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_tax_class.addTaxClass(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/tax_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_class',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_tax_class.editTaxClass(this.request.get['tax_class_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/tax_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/tax_class',this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of tax_class_id) {
				await this.model_localisation_tax_class.deleteTaxClass(tax_class_id);
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

			this.response.setRedirect(await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
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
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/tax_class/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/tax_class/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['tax_classes'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		tax_class_total = await this.model_localisation_tax_class.getTotalTaxClasses();

		results = await this.model_localisation_tax_class.getTaxClasses(filter_data);

		for (let result of results) {
			data['tax_classes'].push({
				'tax_class_id' : result['tax_class_id'],
				'title'        : result['title'],
				'edit'         : await this.url.link('localisation/tax_class/edit', 'user_token=' + this.session.data['user_token'] + '&tax_class_id=' + result['tax_class_id'] + url, true)
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

		data['sort_title'] = await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + '&sort=title' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = tax_class_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (tax_class_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (tax_class_total - Number(this.config.get('config_limit_admin')))) ? tax_class_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), tax_class_total, Math.ceil(tax_class_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_class_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['tax_class_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['description'])) {
			data['error_description'] = this.error['description'];
		} else {
			data['error_description'] = '';
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
			'href' : await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['tax_class_id'])) {
			data['action'] = await this.url.link('localisation/tax_class/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/tax_class/edit', 'user_token=' + this.session.data['user_token'] + '&tax_class_id=' + this.request.get['tax_class_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['tax_class_id']) && (this.request.server['method'] != 'POST')) {
			tax_class_info = await this.model_localisation_tax_class.getTaxClass(this.request.get['tax_class_id']);
		}

		if ((this.request.post['title'])) {
			data['title'] = this.request.post['title'];
		} else if ((tax_class_info)) {
			data['title'] = tax_class_info['title'];
		} else {
			data['title'] = '';
		}

		if ((this.request.post['description'])) {
			data['description'] = this.request.post['description'];
		} else if ((tax_class_info)) {
			data['description'] = tax_class_info['description'];
		} else {
			data['description'] = '';
		}

		this.load.model('localisation/tax_rate');

		data['tax_rates'] = await this.model_localisation_tax_rate.getTaxRates();

		if ((this.request.post['tax_rule'])) {
			data['tax_rules'] = this.request.post['tax_rule'];
		} else if ((this.request.get['tax_class_id'])) {
			data['tax_rules'] = await this.model_localisation_tax_class.getTaxRules(this.request.get['tax_class_id']);
		} else {
			data['tax_rules'] = {};
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/tax_class_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/tax_class')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['title']) < 3) || (oc_strlen(this.request.post['title']) > 32)) {
			this.error['title'] = this.language.get('error_title');
		}

		if ((oc_strlen(this.request.post['description']) < 3) || (oc_strlen(this.request.post['description']) > 255)) {
			this.error['description'] = this.language.get('error_description');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/tax_class')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product',this);

		for (this.request.post['selected'] of tax_class_id) {
			product_total = await this.model_catalog_product.getTotalProductsByTaxClassId(tax_class_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}
