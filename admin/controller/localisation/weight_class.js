module.exports = class ControllerLocalisationWeightClass extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/weight_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/weight_class',this);

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/weight_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/weight_class',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_weight_class.addWeightClass(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/weight_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/weight_class',this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_weight_class.editWeightClass(this.request.get['weight_class_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/weight_class');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/weight_class',this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of weight_class_id) {
				await this.model_localisation_weight_class.deleteWeightClass(weight_class_id);
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

			this.response.setRedirect(await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url, true));
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
			'href' : await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/weight_class/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/weight_class/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['weight_classes'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		weight_class_total = await this.model_localisation_weight_class.getTotalWeightClasses();

		results = await this.model_localisation_weight_class.getWeightClasses(filter_data);

		for (let result of results) {
			data['weight_classes'].push({
				'weight_class_id' : result['weight_class_id'],
				'title'           : result['title'] + ((result['weight_class_id'] == this.config.get('config_weight_class_id')) ? this.language.get('text_default') : null),
				'unit'            : result['unit'],
				'value'           : result['value'],
				'edit'            : await this.url.link('localisation/weight_class/edit', 'user_token=' + this.session.data['user_token'] + '&weight_class_id=' + result['weight_class_id'] + url, true)
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

		data['sort_title'] = await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + '&sort=title' + url, true);
		data['sort_unit'] = await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + '&sort=unit' + url, true);
		data['sort_value'] = await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = weight_class_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (weight_class_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (weight_class_total - Number(this.config.get('config_limit_admin')))) ? weight_class_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), weight_class_total, Math.ceil(weight_class_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/weight_class_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['weight_class_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['title'])) {
			data['error_title'] = this.error['title'];
		} else {
			data['error_title'] = {};
		}

		if ((this.error['unit'])) {
			data['error_unit'] = this.error['unit'];
		} else {
			data['error_unit'] = {};
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
			'href' : await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['weight_class_id'])) {
			data['action'] = await this.url.link('localisation/weight_class/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/weight_class/edit', 'user_token=' + this.session.data['user_token'] + '&weight_class_id=' + this.request.get['weight_class_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['weight_class_id']) && (this.request.server['method'] != 'POST')) {
			weight_class_info = await this.model_localisation_weight_class.getWeightClass(this.request.get['weight_class_id']);
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['weight_class_description'])) {
			data['weight_class_description'] = this.request.post['weight_class_description'];
		} else if ((this.request.get['weight_class_id'])) {
			data['weight_class_description'] = await this.model_localisation_weight_class.getWeightClassDescriptions(this.request.get['weight_class_id']);
		} else {
			data['weight_class_description'] = {};
		}

		if ((this.request.post['value'])) {
			data['value'] = this.request.post['value'];
		} else if ((weight_class_info)) {
			data['value'] = weight_class_info['value'];
		} else {
			data['value'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/weight_class_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/weight_class')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['weight_class_description'] of language_id : value) {
			if ((oc_strlen(value['title']) < 3) || (oc_strlen(value['title']) > 32)) {
				this.error['title'][language_id] = this.language.get('error_title');
			}

			if (!value['unit'] || (oc_strlen(value['unit']) > 4)) {
				this.error['unit'][language_id] = this.language.get('error_unit');
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/weight_class')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product',this);
		this.request.post['selected']  = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']];

		for (this.request.post['selected'] of weight_class_id) {
			if (this.config.get('config_weight_class_id') == weight_class_id) {
				this.error['warning'] = this.language.get('error_default');
			}

			product_total = await this.model_catalog_product.getTotalProductsByWeightClassId(weight_class_id);

			if (product_total) {
				this.error['warning'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}