module.exports = class ControllerLocalisationGeoZone extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/geo_zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/geo_zone');

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/geo_zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/geo_zone');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_localisation_geo_zone.addGeoZone(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/geo_zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/geo_zone');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_localisation_geo_zone.editGeoZone(this.request.get['geo_zone_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/geo_zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/geo_zone');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of geo_zone_id) {
				await this.model_localisation_geo_zone.deleteGeoZone(geo_zone_id);
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

			this.response.setRedirect(await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
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
			'href' : await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('localisation/geo_zone/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/geo_zone/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['geo_zones'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		geo_zone_total = await this.model_localisation_geo_zone.getTotalGeoZones();

		results = await this.model_localisation_geo_zone.getGeoZones(filter_data);

		for (let result of results) {
			data['geo_zones'].push({
				'geo_zone_id' : result['geo_zone_id'],
				'name'        : result['name'],
				'description' : result['description'],
				'edit'        : await this.url.link('localisation/geo_zone/edit', 'user_token=' + this.session.data['user_token'] + '&geo_zone_id=' + result['geo_zone_id'] + url, true)
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

		data['sort_name'] = await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_description'] = await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + '&sort=description' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = geo_zone_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (geo_zone_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (geo_zone_total - this.config.get('config_limit_admin'))) ? geo_zone_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), geo_zone_total, ceil(geo_zone_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/geo_zone_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['geo_zone_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['geo_zone_id'])) {
			data['action'] = await this.url.link('localisation/geo_zone/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/geo_zone/edit', 'user_token=' + this.session.data['user_token'] + '&geo_zone_id=' + this.request.get['geo_zone_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['geo_zone_id']) && (this.request.server['method'] != 'POST')) {
			geo_zone_info = await this.model_localisation_geo_zone.getGeoZone(this.request.get['geo_zone_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((geo_zone_info)) {
			data['name'] = geo_zone_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['description'])) {
			data['description'] = this.request.post['description'];
		} else if ((geo_zone_info)) {
			data['description'] = geo_zone_info['description'];
		} else {
			data['description'] = '';
		}

		this.load.model('localisation/country');

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((this.request.post['zone_to_geo_zone'])) {
			data['zone_to_geo_zones'] = this.request.post['zone_to_geo_zone'];
		} else if ((this.request.get['geo_zone_id'])) {
			data['zone_to_geo_zones'] = await this.model_localisation_geo_zone.getZoneToGeoZones(this.request.get['geo_zone_id']);
		} else {
			data['zone_to_geo_zones'] = {};
		}

		geo_zone_ids = {};
		for (data['zone_to_geo_zones'] of zone_to_geo_zone) {
			if (!in_array(zone_to_geo_zone['geo_zone_id'],geo_zone_ids)) {
				geo_zone_ids[] = zone_to_geo_zone['geo_zone_id'];
			}
		}
		data['zones'] = await this.model_localisation_geo_zone.getZonesByGeoZones(geo_zone_ids);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/geo_zone_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/geo_zone')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			this.error['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['description']) < 3) || (oc_strlen(this.request.post['description']) > 255)) {
			this.error['description'] = this.language.get('error_description');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/geo_zone')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('localisation/tax_rate');

		for (this.request.post['selected'] of geo_zone_id) {
			tax_rate_total = await this.model_localisation_tax_rate.getTotalTaxRatesByGeoZoneId(geo_zone_id);

			if (tax_rate_total) {
				this.error['warning'] = sprintf(this.language.get('error_tax_rate'), tax_rate_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}