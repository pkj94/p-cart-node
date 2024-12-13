module.exports = class ControllerLocalisationZone extends Controller {
	error = {};

	async index() {
		await this.load.language('localisation/zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/zone', this);

		await this.getList();
	}

	async add() {
		await this.load.language('localisation/zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/zone', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_zone.addZone(this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getForm();
	}

	async edit() {
		await this.load.language('localisation/zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/zone', this);

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_localisation_zone.editZone(this.request.get['zone_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url, true));
		} else
			await this.getForm();
	}

	async delete() {
		await this.load.language('localisation/zone');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('localisation/zone', this);

		if ((this.request.post['selected']) && await this.validateDelete()) {
			this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']]
			for (let zone_id of this.request.post['selected']) {
				await this.model_localisation_zone.deleteZone(zone_id);
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

			this.response.setRedirect(await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		const data = {};
		let sort = 'c.name';
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
			'href': await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('localisation/zone/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('localisation/zone/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['zones'] = [];

		const filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit': Number(this.config.get('config_limit_admin'))
		};

		const zone_total = await this.model_localisation_zone.getTotalZones();

		const results = await this.model_localisation_zone.getZones(filter_data);

		for (let result of results) {
			data['zones'].push({
				'zone_id': result['zone_id'],
				'country': result['country'],
				'name': result['name'] + ((result['zone_id'] == this.config.get('config_zone_id')) ? this.language.get('text_default') : ''),
				'code': result['code'],
				'edit': await this.url.link('localisation/zone/edit', 'user_token=' + this.session.data['user_token'] + '&zone_id=' + result['zone_id'] + url, true)
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

		data['sort_country'] = await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + '&sort=c.name' + url, true);
		data['sort_name'] = await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + '&sort=z.name' + url, true);
		data['sort_code'] = await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + '&sort=z.code' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		const pagination = new Pagination();
		pagination.total = zone_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (zone_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (zone_total - Number(this.config.get('config_limit_admin')))) ? zone_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), zone_total, Math.ceil(zone_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/zone_list', data));
	}

	async getForm() {
		const data = {};
		data['text_form'] = !(this.request.get['zone_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['zone_id'])) {
			data['action'] = await this.url.link('localisation/zone/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('localisation/zone/edit', 'user_token=' + this.session.data['user_token'] + '&zone_id=' + this.request.get['zone_id'] + url, true);
		}

		data['cancel'] = await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'] + url, true);
		let zone_info;
		if ((this.request.get['zone_id']) && (this.request.server['method'] != 'POST')) {
			zone_info = await this.model_localisation_zone.getZone(this.request.get['zone_id']);
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((zone_info)) {
			data['status'] = zone_info['status'];
		} else {
			data['status'] = '1';
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((zone_info)) {
			data['name'] = zone_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['code'])) {
			data['code'] = this.request.post['code'];
		} else if ((zone_info)) {
			data['code'] = zone_info['code'];
		} else {
			data['code'] = '';
		}

		if ((this.request.post['country_id'])) {
			data['country_id'] = this.request.post['country_id'];
		} else if ((zone_info)) {
			data['country_id'] = zone_info['country_id'];
		} else {
			data['country_id'] = '';
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/zone_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'localisation/zone')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		return Object.keys(this.error).length ? false : true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'localisation/zone')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('setting/store', this);
		this.load.model('customer/customer', this);
		this.load.model('localisation/geo_zone', this);
		this.request.post['selected'] = Array.isArray(this.request.post['selected']) ? this.request.post['selected'] : [this.request.post['selected']];

		for (let zone_id of this.request.post['selected']) {
			if (this.config.get('config_zone_id') == zone_id) {
				this.error['warning'] = this.language.get('error_default');
			}

			const store_total = await this.model_setting_store.getTotalStoresByZoneId(zone_id);

			if (store_total) {
				this.error['warning'] = sprintf(this.language.get('error_store'), store_total);
			}

			const address_total = await this.model_customer_customer.getTotalAddressesByZoneId(zone_id);

			if (address_total) {
				this.error['warning'] = sprintf(this.language.get('error_address'), address_total);
			}

			const zone_to_geo_zone_total = await this.model_localisation_geo_zone.getTotalZoneToGeoZoneByZoneId(zone_id);

			if (zone_to_geo_zone_total) {
				this.error['warning'] = sprintf(this.language.get('error_zone_to_geo_zone'), zone_to_geo_zone_total);
			}
		}

		return Object.keys(this.error).length ? false : true
	}
}