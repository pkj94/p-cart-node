module.exports = class ControllerDesignBanner extends Controller {
	error = {};

	async index() {
		await this.load.language('design/banner');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/banner');

		await this.getList();
	}

	async add() {
		await this.load.language('design/banner');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/banner');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_banner.addBanner(this.request.post);

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

			this.response.setRedirect(await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('design/banner');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/banner');

		if ((this.request.server['method'] == 'POST') && await this.validateForm()) {
			await this.model_design_banner.editBanner(this.request.get['banner_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('design/banner');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('design/banner');

		if ((this.request.post['selected']) && await this.validateDelete()) {
this.request.post['selected'] = Array.isArray(this.request.post['selected'])?this.request.post['selected']:[this.request.post['selected']]
			for (this.request.post['selected'] of banner_id) {
				await this.model_design_banner.deleteBanner(banner_id);
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

			this.response.setRedirect(await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url, true));
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
			'href' : await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		data['add'] = await this.url.link('design/banner/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('design/banner/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['banners'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * Number(this.config.get('config_limit_admin')),
			'limit' : Number(this.config.get('config_limit_admin'))
		});

		banner_total = await this.model_design_banner.getTotalBanners();

		results = await this.model_design_banner.getBanners(filter_data);

		for (let result of results) {
			data['banners'].push({
				'banner_id' : result['banner_id'],
				'name'      : result['name'],
				'status'    : (result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled')),
				'edit'      : await this.url.link('design/banner/edit', 'user_token=' + this.session.data['user_token'] + '&banner_id=' + result['banner_id'] + url, true)
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

		data['sort_name'] = await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);
		data['sort_status'] = await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = banner_total;
		pagination.page = page;
		pagination.limit = Number(this.config.get('config_limit_admin'));
		pagination.url = await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (banner_total) ? ((page - 1) * Number(this.config.get('config_limit_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_limit_admin'))) > (banner_total - Number(this.config.get('config_limit_admin')))) ? banner_total : (((page - 1) * Number(this.config.get('config_limit_admin'))) + Number(this.config.get('config_limit_admin'))), banner_total, Math.ceil(banner_total / Number(this.config.get('config_limit_admin'))));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/banner_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['banner_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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

		if ((this.error['banner_image'])) {
			data['error_banner_image'] = this.error['banner_image'];
		} else {
			data['error_banner_image'] = {};
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
			'href' : await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url, true)
		});

		if (!(this.request.get['banner_id'])) {
			data['action'] = await this.url.link('design/banner/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('design/banner/edit', 'user_token=' + this.session.data['user_token'] + '&banner_id=' + this.request.get['banner_id'] + url, true);
		}

		data['cancel'] = await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['banner_id']) && (this.request.server['method'] != 'POST')) {
			banner_info = await this.model_design_banner.getBanner(this.request.get['banner_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((banner_info)) {
			data['name'] = banner_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((banner_info)) {
			data['status'] = banner_info['status'];
		} else {
			data['status'] = true;
		}

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		this.load.model('tool/image',this);

		if ((this.request.post['banner_image'])) {
			banner_images = this.request.post['banner_image'];
		} else if ((this.request.get['banner_id'])) {
			banner_images = await this.model_design_banner.getBannerImages(this.request.get['banner_id']);
		} else {
			banner_images = {};
		}

		data['banner_images'] = {};

		for (banner_images of key : value) {
			for (value of banner_image) {
				if (is_file(DIR_IMAGE + banner_image['image'])) {
					image = banner_image['image'];
					thumb = banner_image['image'];
				} else {
					image = '';
					thumb = 'no_image.png';
				}

				data['banner_images'][key].push({
					'title'      : banner_image['title'],
					'link'       : banner_image['link'],
					'image'      : image,
					'thumb'      : await this.model_tool_image.resize(thumb, 100, 100),
					'sort_order' : banner_image['sort_order']
				});
			}
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('design/banner_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'design/banner')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		if ((this.request.post['banner_image'])) {
			for (this.request.post['banner_image'] of language_id : value) {
				for (value of banner_image_id : banner_image) {
					if ((oc_strlen(banner_image['title']) < 2) || (oc_strlen(banner_image['title']) > 64)) {
						this.error['banner_image'][language_id][banner_image_id] = this.language.get('error_title');
					}
				}
			}
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'design/banner')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}
