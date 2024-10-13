<?php
namespace Opencart\Admin\Controller\Localisation;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Localisation
 */
class CurrencyController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('localisation/currency');

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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['refresh'] = this.url.link('localisation/currency.refresh', 'user_token=' + this.session.data['user_token'] + url);
		data['add'] = this.url.link('localisation/currency.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/currency.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/currency', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/currency');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'title';
		}

		let order= 'ASC';
		if ((this.request.get['order'])) {
			order= this.request.get['order'];
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
			'text' : this.language.get('text_home'),
			'href' : this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['action'] = this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + url);

		data['currencies'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('localisation/currency',this);

		currency_total await this.model_localisation_currency.getTotalCurrencies();

		const results = await this.model_localisation_currency.getCurrencies(filter_data);

		for (let result of results) {
			data['currencies'].push({
				'currency_id'   : result['currency_id'],
				'title'         : result['title'] + ((result['code'] == this.config.get('config_currency')) ? this.language.get('text_default') : ''),
				'code'          : result['code'],
				'value'         : result['value'],
				'status'        : result['status'],
				'date_modified' : date(this.language.get('date_format_short'), strtotime(result['date_modified'])),
				'edit'          : this.url.link('localisation/currency.form', 'user_token=' + this.session.data['user_token'] + '&currency_id=' + result['currency_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_title'] = this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + '&sort=title' + url);
		data['sort_code'] = this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_value'] = this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url);
		data['sort_status'] = this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url);
		data['sort_date_modified'] = this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + '&sort=date_modified' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : currency_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('localisation/currency.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (currency_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (currency_total - this.config.get('config_pagination_admin'))) ? currency_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), currency_total, Math.ceil(currency_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/currency_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('localisation/currency');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['currency_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/currency.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['currency_id'])) {
			this.load.model('localisation/currency',this);

			currency_info await this.model_localisation_currency.getCurrency(this.request.get['currency_id']);
		}

		if ((this.request.get['currency_id'])) {
			data['currency_id'] = this.request.get['currency_id'];
		} else {
			data['currency_id'] = 0;
		}

		if ((currency_info)) {
			data['title'] = currency_info['title'];
		} else {
			data['title'] = '';
		}

		if ((currency_info)) {
			data['code'] = currency_info['code'];
		} else {
			data['code'] = '';
		}

		if ((currency_info)) {
			data['symbol_left'] = currency_info['symbol_left'];
		} else {
			data['symbol_left'] = '';
		}

		if ((currency_info)) {
			data['symbol_right'] = currency_info['symbol_right'];
		} else {
			data['symbol_right'] = '';
		}

		if ((currency_info)) {
			data['decimal_place'] = currency_info['decimal_place'];
		} else {
			data['decimal_place'] = '';
		}

		if ((currency_info)) {
			data['value'] = currency_info['value'];
		} else {
			data['value'] = '';
		}

		if ((currency_info)) {
			data['status'] = currency_info['status'];
		} else {
			data['status'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/currency_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/currency');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/currency')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['title']) < 3) || (oc_strlen(this.request.post['title']) > 32)) {
			json['error']['title'] = this.language.get('error_title');
		}

		if (oc_strlen(this.request.post['code']) != 3) {
			json['error']['code'] = this.language.get('error_code');
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/currency',this);

			if (!this.request.post['currency_id']) {
				json['currency_id'] = await this.model_localisation_currency.addCurrency(this.request.post);
			} else {
				await this.model_localisation_currency.editCurrency(this.request.post['currency_id'], this.request.post);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async refresh() {
		await this.load.language('localisation/currency');

		const json = {};

		if (!await this.user.hasPermission('modify', 'localisation/currency')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('setting/extension',this);

		const extension_info = await this.model_setting_extension.getExtensionByCode('currency', this.config.get('config_currency_engine'));

		if (!extension_info) {
			json['error'] = this.language.get('error_extension');
		}

		if (!Object.keys(json).length) {
			this.load.controller('extension/' + extension_info['extension'] + '/currency/' + extension_info['code'] + '.currency', this.config.get('config_currency'));

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('localisation/currency');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/currency')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('localisation/currency',this);
		this.load.model('setting/store',this);
		this.load.model('sale/order',this);

		for (selected of currency_id) {
			currency_info await this.model_localisation_currency.getCurrency(currency_id);

			if (currency_info) {
				if (this.config.get('config_currency') == currency_info['code']) {
					json['error'] = this.language.get('error_default');
				}

				store_total await this.model_setting_store.getTotalStoresByCurrency(currency_info['code']);

				if (store_total) {
					json['error'] = sprintf(this.language.get('error_store'), store_total);
				}
			}

			order_total await this.model_sale_order.getTotalOrdersByCurrencyId(currency_id);

			if (order_total) {
				json['error'] = sprintf(this.language.get('error_order'), order_total);
			}
		}

		if (!Object.keys(json).length) {
			for (selected of currency_id) {
				await this.model_localisation_currency.deleteCurrency(currency_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
