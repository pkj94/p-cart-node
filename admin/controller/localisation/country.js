<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class CountryController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/country');

		this.document.setTitle(this.language.get('heading_title'));

		let filter_name = '';
if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}

		if ((this.request.get['filter_iso_code_2'])) {
			filter_iso_code_2 = this.request.get['filter_iso_code_2'];
		} else {
			filter_iso_code_2 = '';
		}

		if ((this.request.get['filter_iso_code_3'])) {
			filter_iso_code_3 = this.request.get['filter_iso_code_3'];
		} else {
			filter_iso_code_3 = '';
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/country.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/country.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['filter_name'] = filter_name;
		data['filter_iso_code_2'] = filter_iso_code_2;
		data['filter_iso_code_3'] = filter_iso_code_3;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/country', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/country');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		let filter_name = '';
if ((this.request.get['filter_name'])) {
			filter_name = this.request.get['filter_name'];
		}

		if ((this.request.get['filter_iso_code_2'])) {
			filter_iso_code_2 = this.request.get['filter_iso_code_2'];
		} else {
			filter_iso_code_2 = '';
		}

		if ((this.request.get['filter_iso_code_3'])) {
			filter_iso_code_3 = this.request.get['filter_iso_code_3'];
		} else {
			filter_iso_code_3 = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'name';
		}

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
		}

		let page = 1;
		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_iso_code_2'])) {
			url += '&filter_iso_code_2=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_2']));
		}

		if ((this.request.get['filter_iso_code_3'])) {
			url += '&filter_iso_code_3=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_3']));
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('localisation/country.list', 'user_token=' + this.session.data['user_token'] + url);

		data['countries'] = [];

		let filter_data = {
			'filter_name'       : filter_name,
			'filter_iso_code_2' : filter_iso_code_2,
			'filter_iso_code_3' : filter_iso_code_3,
			'sort'              : sort,
			'order'             : order,
			'start'             : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'             : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/country');

		country_total await this.model_localisation_country.getTotalCountries(filter_data);

		const results = await this.model_localisation_country.getCountries(filter_data);

		for (let result of results) {
			data['countries'].push({
				'country_id' : result['country_id'],
				'name'       : result['name'] + ((result['country_id'] == this.config.get('config_country_id')) ? this.language.get('text_default') : ''),
				'status'      : result['status'],
				'iso_code_2' : result['iso_code_2'],
				'iso_code_3' : result['iso_code_3'],
				'edit'       : this.url.link('localisation/country.form', 'user_token=' + this.session.data['user_token'] + '&country_id=' + result['country_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_iso_code_2'])) {
			url += '&filter_iso_code_2=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_2']));
		}

		if ((this.request.get['filter_iso_code_3'])) {
			url += '&filter_iso_code_3=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_3']));
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('localisation/country.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_iso_code_2'] = this.url.link('localisation/country.list', 'user_token=' + this.session.data['user_token'] + '&sort=iso_code_2' + url);
		data['sort_iso_code_3'] = this.url.link('localisation/country.list', 'user_token=' + this.session.data['user_token'] + '&sort=iso_code_3' + url);

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_iso_code_2'])) {
			url += '&filter_iso_code_2=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_2']));
		}

		if ((this.request.get['filter_iso_code_3'])) {
			url += '&filter_iso_code_3=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_3']));
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : country_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/country.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (country_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (country_total - this.config.get('config_pagination_admin'))) ? country_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), country_total, Math.ceil(country_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/country_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/country');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['country_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_name'])) {
			url += '&filter_name=' + encodeURIComponent(html_entity_decode(this.request.get['filter_name']));
		}

		if ((this.request.get['filter_iso_code_2'])) {
			url += '&filter_iso_code_2=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_2']));
		}

		if ((this.request.get['filter_iso_code_3'])) {
			url += '&filter_iso_code_3=' + encodeURIComponent(html_entity_decode(this.request.get['filter_iso_code_3']));
		}

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
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/country.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['country_id'])) {
			this.load.model('localisation/country');

			country_info await this.model_localisation_country.getCountry(this.request.get['country_id']);
		}

		if ((this.request.get['country_id'])) {
			data['country_id'] = this.request.get['country_id'];
		} else {
			data['country_id'] = 0;
		}

		if ((country_info)) {
			data['name'] = country_info['name'];
		} else {
			data['name'] = '';
		}

		if ((country_info)) {
			data['iso_code_2'] = country_info['iso_code_2'];
		} else {
			data['iso_code_2'] = '';
		}

		if ((country_info)) {
			data['iso_code_3'] = country_info['iso_code_3'];
		} else {
			data['iso_code_3'] = '';
		}

		this.load.model('localisation/address_format');

		data['address_formats'] = await this.model_localisation_address_format.getAddressFormats();

		if ((country_info)) {
			data['address_format_id'] = country_info['address_format_id'];
		} else {
			data['address_format_id'] = '';
		}

		if ((country_info)) {
			data['postcode_required'] = country_info['postcode_required'];
		} else {
			data['postcode_required'] = 0;
		}

	    if ((country_info)) {
			data['status'] = country_info['status'];
		} else {
			data['status'] = '1';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/country_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/country');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/country')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 128)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/country');

			if (!this.request.post['country_id']) {
				json['country_id'] = await this.model_localisation_country.addCountry(this.request.post);
			} else {
				await this.model_localisation_country.editCountry(this.request.post['country_id'], this.request.post);
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
		await this.load.language('localisation/country');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/country')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/store',this);
		this.load.model('customer/customer',this);
		this.load.model('localisation/zone');
		this.load.model('localisation/geo_zone');

		for (selected of country_id) {
			if (this.config.get('config_country_id') == country_id) {
				json['error'] = this.language.get('error_default');
			}

			store_total await this.model_setting_store.getTotalStoresByCountryId(country_id);

			if (store_total) {
				json['error'] = sprintf(this.language.get('error_store'), store_total);
			}

			address_total await this.model_customer_customer.getTotalAddressesByCountryId(country_id);

			if (address_total) {
				json['error'] = sprintf(this.language.get('error_address'), address_total);
			}

			zone_total await this.model_localisation_zone.getTotalZonesByCountryId(country_id);

			if (zone_total) {
				json['error'] = sprintf(this.language.get('error_zone'), zone_total);
			}

			zone_to_geo_zone_total await this.model_localisation_geo_zone.getTotalZoneToGeoZoneByCountryId(country_id);

			if (zone_to_geo_zone_total) {
				json['error'] = sprintf(this.language.get('error_zone_to_geo_zone'), zone_to_geo_zone_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/country');

			for (selected of country_id) {
				await this.model_localisation_country.deleteCountry(country_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async country() {
		const json = {};

		if ((this.request.get['country_id'])) {
			country_id = this.request.get['country_id'];
		} else {
			country_id = 0;
		}

		this.load.model('localisation/country');

		country_info await this.model_localisation_country.getCountry(country_id);

		if (country_info) {
			this.load.model('localisation/zone');

			json = [
				'country_id'        : country_info['country_id'],
				'name'              : country_info['name'],
				'iso_code_2'        : country_info['iso_code_2'],
				'iso_code_3'        : country_info['iso_code_3'],
				'address_format_id' : country_info['address_format_id'],
				'postcode_required' : country_info['postcode_required'],
				'zone'              : this.model_localisation_zone.getZonesByCountryId(country_id),
				'status'            : country_info['status']
			];
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
