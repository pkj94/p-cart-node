module.exports = class ControllerLocalisationCountry extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/country');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/country');

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/country');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/country');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_localisation_country.addCountry(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/country');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/country');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_localisation_country.editCountry(this.request.get['country_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/country');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/country');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of country_id) {
				await this.model_localisation_country.deleteCountry(country_id);
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

			this.response.setRedirect(await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url, true));
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
			'href' : await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('localisation/country/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/country/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['countries'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		country_total = await this.model_localisation_country.getTotalCountries();

		results = await this.model_localisation_country.getCountries(filter_data);

		for (let result of results) {
			data['countries'].push({
				'country_id' : result['country_id'],
				'name'       : result['name'] + ((result['country_id'] == this.config.get('config_country_id')) ? this.language.get('text_default') : null),
				'iso_code_2' : result['iso_code_2'],
				'iso_code_3' : result['iso_code_3'],
				'edit'       : await this.url.link('localisation/country/edit', 'user_token=' + this.session.data['user_token'] + '&country_id=' + result['country_id'] + url, true)
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

		data['sort_name'] = await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_iso_code_2'] = await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + '&sort=iso_code_2' + url, true);
		data['sort_iso_code_3'] = await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + '&sort=iso_code_3' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = country_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (country_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (country_total - this.config.get('config_limit_admin'))) ? country_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), country_total, ceil(country_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/country_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['country_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['country_id'])) {
			data['action'] = await this.url.link('localisation/country/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/country/edit', 'user_token=' + this.session.data['user_token'] + '&country_id=' + this.request.get['country_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['country_id']) && (this.request.server['method'] != 'POST')) {
			country_info = await this.model_localisation_country.getCountry(this.request.get['country_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((country_info)) {
			data['name'] = country_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['iso_code_2'])) {
			data['iso_code_2'] = this.request.post['iso_code_2'];
		} else if ((country_info)) {
			data['iso_code_2'] = country_info['iso_code_2'];
		} else {
			data['iso_code_2'] = '';
		}

		if ((this.request.post['iso_code_3'])) {
			data['iso_code_3'] = this.request.post['iso_code_3'];
		} else if ((country_info)) {
			data['iso_code_3'] = country_info['iso_code_3'];
		} else {
			data['iso_code_3'] = '';
		}

		if ((this.request.post['address_format'])) {
			data['address_format'] = this.request.post['address_format'];
		} else if ((country_info)) {
			data['address_format'] = country_info['address_format'];
		} else {
			data['address_format'] = '';
		}

		if ((this.request.post['postcode_required'])) {
			data['postcode_required'] = this.request.post['postcode_required'];
		} else if ((country_info)) {
			data['postcode_required'] = country_info['postcode_required'];
		} else {
			data['postcode_required'] = 0;
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((country_info)) {
			data['status'] = country_info['status'];
		} else {
			data['status'] = '1';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/country_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/country')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 128)) {
			this.error['name'] = this.language.get('error_name');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/country')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);
		this.load.model('customer/customer',this);
		this.load.model('localisation/zone');
		this.load.model('localisation/geo_zone');

		for (this.request.post['selected'] of country_id) {
			if (this.config.get('config_country_id') == country_id) {
				this.error['warning'] = this.language.get('error_default');
			}

			store_total = await this.model_setting_store.getTotalStoresByCountryId(country_id);

			if (store_total) {
				this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
			}

			address_total = await this.model_customer_customer.getTotalAddressesByCountryId(country_id);

			if (address_total) {
				this.error['warning'] = sprintf(this.language.get('error_address'), address_total);
			}

			zone_total = await this.model_localisation_zone.getTotalZonesByCountryId(country_id);

			if (zone_total) {
				this.error['warning'] = sprintf(this.language.get('error_zone'), zone_total);
			}

			zone_to_geo_zone_total = await this.model_localisation_geo_zone.getTotalZoneToGeoZoneByCountryId(country_id);

			if (zone_to_geo_zone_total) {
				this.error['warning'] = sprintf(this.language.get('error_zone_to_geo_zone'), zone_to_geo_zone_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
	
	async country() {
		json = {};

		this.load.model('localisation/country');

		country_info = await this.model_localisation_country.getCountry(this.request.get['country_id']);

		if (country_info) {
			this.load.model('localisation/zone');

			json = array(
				'country_id'        : country_info['country_id'],
				'name'              : country_info['name'],
				'iso_code_2'        : country_info['iso_code_2'],
				'iso_code_3'        : country_info['iso_code_3'],
				'address_format'    : country_info['address_format'],
				'postcode_required' : country_info['postcode_required'],
				'zone'              : await this.model_localisation_zone.getZonesByCountryId(this.request.get['country_id']),
				'status'            : country_info['status']
			);
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}	
}