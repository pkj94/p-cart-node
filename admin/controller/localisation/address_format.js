<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class AddressFormatController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/address_format');

		this.document.setTitle(this.language.get('heading_title'));

		let url = '';

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
			'href' : this.url.link('localisation/address_format', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/address_format.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/address_format.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/address_format', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/address_format');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('localisation/address_format.list', 'user_token=' + this.session.data['user_token'] + url);

		data['address_formats'] = [];

		let filter_data = {
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/address_format');

		address_format_total await this.model_localisation_address_format.getTotalAddressFormats(filter_data);

		const results = await this.model_localisation_address_format.getAddressFormats(filter_data);

		for (let result of results) {
			data['address_formats'].push({
				'address_format_id' : result['address_format_id'],
				'name'              : result['name'] + ((result['address_format_id'] == this.config.get('config_address_format_id')) ? this.language.get('text_default') : ''),
				'address_format'    : nl2br(result['address_format']),
				'edit'              : this.url.link('localisation/address_format.form', 'user_token=' + this.session.data['user_token'] + '&address_format_id=' + result['address_format_id'] + url)
			];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : address_format_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/address_format.list', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (address_format_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (address_format_total - this.config.get('config_pagination_admin'))) ? address_format_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), address_format_total, Math.ceil(address_format_total / this.config.get('config_pagination_admin')));

		return await this.load.view('localisation/address_format_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/address_format');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['address_format_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

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
			'href' : this.url.link('localisation/address_format', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/address_format.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/address_format', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['address_format_id'])) {
			this.load.model('localisation/address_format');

			address_format_info await this.model_localisation_address_format.getAddressFormat(this.request.get['address_format_id']);
		}

		if ((this.request.get['address_format_id'])) {
			data['address_format_id'] = this.request.get['address_format_id'];
		} else {
			data['address_format_id'] = 0;
		}

		if ((address_format_info)) {
			data['name'] = address_format_info['name'];
		} else {
			data['name'] = '';
		}

		if ((address_format_info)) {
			data['address_format'] = address_format_info['address_format'];
		} else {
			data['address_format'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/address_format_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/address_format');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/address_format')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 1) || (oc_strlen(this.request.post['name']) > 128)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/address_format');

			if (!this.request.post['address_format_id']) {
				json['address_format_id'] = await this.model_localisation_address_format.addAddressFormat(this.request.post);
			} else {
				await this.model_localisation_address_format.editAddressFormat(this.request.post['address_format_id'], this.request.post);
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
		await this.load.language('localisation/address_format');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/address_format')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('localisation/country');

		for (let address_format_id of selected) {
			if (this.config.get('config_address_format_id') == address_format_id) {
				json['error'] = this.language.get('error_default');
			}

			country_total await this.model_localisation_country.getTotalCountriesByAddressFormatId(address_format_id);

			if (country_total) {
				json['error'] = sprintf(this.language.get('error_country'), country_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/address_format');

			for (let address_format_id of selected) {
				await this.model_localisation_address_format.deleteAddressFormat(address_format_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}