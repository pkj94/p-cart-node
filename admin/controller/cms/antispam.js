<?php
namespace Opencart\Admin\Controller\Cms;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Cms
 */
class AntispamController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('cms/antispam');

		this.document.setTitle(this.language.get('heading_title'));

		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		} else {
			filter_keyword = '';
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
			'href' : this.url.link('cms/antispam', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('cms/antispam.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('cms/antispam.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['filter_keyword'] = filter_keyword;

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/antispam', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('cms/antispam');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		if ((this.request.get['filter_keyword'])) {
			filter_keyword = this.request.get['filter_keyword'];
		} else {
			filter_keyword = '';
		}

		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'keyword';
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

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
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

		data['action'] = this.url.link('cms/antispam.list', 'user_token=' + this.session.data['user_token'] + url);

		data['antispams'] = [];

		let filter_data = {
			'filter_keyword' : filter_keyword,
			'sort'           : sort,
			'order'          : order,
			'start'          : (page - 1) * this.config.get('config_pagination_admin'),
			'limit'          : this.config.get('config_pagination_admin')
		});

		this.load.model('cms/antispam');

		antispam_total await this.model_cms_antispam.getTotalAntispams(filter_data);

		const results = await this.model_cms_antispam.getAntispams(filter_data);

		for (let result of results) {
			data['antispams'].push({
				'antispam_id' : result['antispam_id'],
				'keyword'     : result['keyword'],
				'edit'        : this.url.link('cms/antispam.form', 'user_token=' + this.session.data['user_token'] + '&antispam_id=' + result['antispam_id'] + url)
			];
		}

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_keyword'] = this.url.link('cms/antispam.list', 'user_token=' + this.session.data['user_token'] + '&sort=keyword' + url);

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
		}

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : antispam_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('cms/antispam.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (antispam_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (antispam_total - this.config.get('config_pagination_admin'))) ? antispam_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), antispam_total, Math.ceil(antispam_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('cms/antispam_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('cms/antispam');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['antispam_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		let url = '';

		if ((this.request.get['filter_keyword'])) {
			url += '&filter_keyword=' + encodeURIComponent(html_entity_decode(this.request.get['filter_keyword']));
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
			'href' : this.url.link('cms/antispam', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('cms/antispam.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('cms/antispam', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['antispam_id'])) {
			this.load.model('cms/antispam');

			antispam_info await this.model_cms_antispam.getAntispam(this.request.get['antispam_id']);
		}

		if ((this.request.get['antispam_id'])) {
			data['antispam_id'] = this.request.get['antispam_id'];
		} else {
			data['antispam_id'] = 0;
		}

		if ((antispam_info)) {
			data['keyword'] = antispam_info['keyword'];
		} else {
			data['keyword'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('cms/antispam_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('cms/antispam');

		const json = {};

		if (!await this.user.hasPermission('modify', 'cms/antispam')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['keyword']) < 1) || (oc_strlen(this.request.post['keyword']) > 64)) {
			json['error']['keyword'] = this.language.get('error_keyword');
		}

		if (!Object.keys(json).length) {
			this.load.model('cms/antispam');

			if (!this.request.post['antispam_id']) {
				json['antispam_id'] = await this.model_cms_antispam.addAntispam(this.request.post);
			} else {
				await this.model_cms_antispam.editAntispam(this.request.post['antispam_id'], this.request.post);
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
		await this.load.language('cms/antispam');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'cms/antispam')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('cms/antispam');

			for (selected of antispam_id) {
				await this.model_cms_antispam.deleteAntispam(antispam_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
