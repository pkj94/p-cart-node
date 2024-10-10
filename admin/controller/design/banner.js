<?php
namespace Opencart\Admin\Controller\Design;
/**
 * 
 *
 * @package Opencart\Admin\Controller\Design
 */
class BannerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('design/banner');

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
			'href' : this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('design/banner.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('design/banner.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/banner', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('design/banner');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
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

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['action'] = this.url.link('design/banner.list', 'user_token=' + this.session.data['user_token'] + url);

		data['banners'] = [];

		let filter_data = {
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_pagination_admin'),
			'limit' : this.config.get('config_pagination_admin')
		});

		this.load.model('design/banner');

		banner_total await this.model_design_banner.getTotalBanners();

		const results = await this.model_design_banner.getBanners(filter_data);

		for (let result of results) {
			data['banners'].push({
				'banner_id' : result['banner_id'],
				'name'      : result['name'],
				'status'    : result['status'],
				'edit'      : this.url.link('design/banner.form', 'user_token=' + this.session.data['user_token'] + '&banner_id=' + result['banner_id'] + url)
			];
		}

		let url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = this.url.link('design/banner.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		let url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total' : banner_total,
			'page'  : page,
			'limit' : this.config.get('config_pagination_admin'),
			'url'   : this.url.link('design/banner.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		]);

		data['results'] = sprintf(this.language.get('text_pagination'), (banner_total) ? ((page - 1) * this.config.get('config_pagination_admin')) + 1 : 0, (((page - 1) * this.config.get('config_pagination_admin')) > (banner_total - this.config.get('config_pagination_admin'))) ? banner_total : (((page - 1) * this.config.get('config_pagination_admin')) + this.config.get('config_pagination_admin')), banner_total, Math.ceil(banner_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('design/banner_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		await this.load.language('design/banner');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['banner_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href' : this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('design/banner.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url);

		if ((this.request.get['banner_id'])) {
			this.load.model('design/banner');

			banner_info await this.model_design_banner.getBanner(this.request.get['banner_id']);
		}

		if ((this.request.get['banner_id'])) {
			data['banner_id'] = this.request.get['banner_id'];
		} else {
			data['banner_id'] = 0;
		}

		if ((banner_info)) {
			data['name'] = banner_info['name'];
		} else {
			data['name'] = '';
		}

		if ((banner_info)) {
			data['status'] = banner_info['status'];
		} else {
			data['status'] = true;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		this.load.model('tool/image',this);

		if ((banner_info)) {
			banner_images await this.model_design_banner.getImages(this.request.get['banner_id']);
		} else {
			banner_images = [];
		}

		data['banner_images'] = [];

		for (banner_images of language_id : banner_image) {
			for (banner_image of value) {
				if (is_file(DIR_IMAGE + html_entity_decode(value['image']))) {
					image = value['image'];
					thumb = value['image'];
				} else {
					image = '';
					thumb = 'no_image.png';
				}
				
				data['banner_images'][language_id].push({
					'title'      : value['title'],
					'link'       : value['link'],
					'image'      : image,
					'thumb'      : this.model_tool_image.resize(html_entity_decode(thumb), 100, 100),
					'sort_order' : value['sort_order']
				];
			}
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/banner_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('design/banner');

		const json = {};

		if (!await this.user.hasPermission('modify', 'design/banner')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((this.request.post['banner_image'])) {
			for (this.request.post['banner_image'] of language_id : banner_image) {
				for (banner_image of key : value) {
					if ((oc_strlen(trim(value['title'])) < 2) || (oc_strlen(value['title']) > 64)) {
						json['error']['image_' + language_id + '_' + key + '_title'] = this.language.get('error_title');
					}
				}
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('design/banner');

			if (!this.request.post['banner_id']) {
				json['banner_id'] = await this.model_design_banner.addBanner(this.request.post);
			} else {
				await this.model_design_banner.editBanner(this.request.post['banner_id'], this.request.post);
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
		await this.load.language('design/banner');

		const json = {};

		let selected = [];
                 if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'design/banner')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('design/banner');

			for (let banner_id of selected) {
				await this.model_design_banner.deleteBanner(banner_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
