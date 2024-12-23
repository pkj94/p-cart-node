const sprintf = require("locutus/php/strings/sprintf");

module.exports = class GeoZoneController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('localisation/geo_zone');

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
			'href': await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('localisation/geo_zone.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('localisation/geo_zone.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/geo_zone', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/geo_zone');

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

		data['action'] = await this.url.link('localisation/geo_zone.list', 'user_token=' + this.session.data['user_token'] + url);

		data['geo_zones'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('localisation/geo_zone', this);

		const geo_zone_total = await this.model_localisation_geo_zone.getTotalGeoZones();

		const results = await this.model_localisation_geo_zone.getGeoZones(filter_data);

		for (let result of results) {
			data['geo_zones'].push({
				'geo_zone_id': result['geo_zone_id'],
				'name': result['name'],
				'description': result['description'],
				'edit': await this.url.link('localisation/geo_zone.form', 'user_token=' + this.session.data['user_token'] + '&geo_zone_id=' + result['geo_zone_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('localisation/geo_zone.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_description'] = await this.url.link('localisation/geo_zone.list', 'user_token=' + this.session.data['user_token'] + '&sort=description' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': geo_zone_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('localisation/geo_zone.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (geo_zone_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (geo_zone_total - this.config.get('config_pagination_admin'))) ? geo_zone_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), geo_zone_total, Math.ceil(geo_zone_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/geo_zone_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('localisation/geo_zone');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['geo_zone_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('localisation/geo_zone.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'] + url);
		let geo_zone_info;
		if ((this.request.get['geo_zone_id'])) {
			this.load.model('localisation/geo_zone', this);

			geo_zone_info = await this.model_localisation_geo_zone.getGeoZone(this.request.get['geo_zone_id']);
		}

		if ((this.request.get['geo_zone_id'])) {
			data['geo_zone_id'] = this.request.get['geo_zone_id'];
		} else {
			data['geo_zone_id'] = 0;
		}

		if ((geo_zone_info)) {
			data['name'] = geo_zone_info['name'];
		} else {
			data['name'] = '';
		}

		if ((geo_zone_info)) {
			data['description'] = geo_zone_info['description'];
		} else {
			data['description'] = '';
		}

		this.load.model('localisation/country', this);

		data['countries'] = await this.model_localisation_country.getCountries();

		if ((geo_zone_info)) {
			data['zone_to_geo_zones'] = await this.model_localisation_geo_zone.getZoneToGeoZones(this.request.get['geo_zone_id']);
		} else {
			data['zone_to_geo_zones'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/geo_zone_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/geo_zone');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'localisation/geo_zone')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['description']) < 3) || (oc_strlen(this.request.post['description']) > 255)) {
			json['error']['description'] = this.language.get('error_description');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('localisation/geo_zone', this);
			this.request.post['geo_zone_id'] = Number(this.request.post['geo_zone_id']);
			if (!this.request.post['geo_zone_id']) {
				json['geo_zone_id'] = await this.model_localisation_geo_zone.addGeoZone(this.request.post);
			} else {
				await this.model_localisation_geo_zone.editGeoZone(this.request.post['geo_zone_id'], this.request.post);
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
		await this.load.language('localisation/geo_zone');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/geo_zone')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('localisation/tax_rate', this);

		for (let geo_zone_id of selected) {
			const tax_rate_total = await this.model_localisation_tax_rate.getTotalTaxRatesByGeoZoneId(geo_zone_id);

			if (tax_rate_total) {
				json['error'] = sprintf(this.language.get('error_tax_rate'), tax_rate_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/geo_zone', this);

			for (let geo_zone_id of selected) {
				await this.model_localisation_geo_zone.deleteGeoZone(geo_zone_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
