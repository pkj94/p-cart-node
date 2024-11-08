module.exports = class ControllerSaleVoucherTheme extends Controller {
	error = {};

	async index() {
		await this.load.language('sale/voucher_theme');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/voucher_theme');

		await this.getList();
	}

	async add() {
		await this.load.language('sale/voucher_theme');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/voucher_theme');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_sale_voucher_theme.addVoucherTheme(this.request.post);

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

			this.response.setRedirect(await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async edit() {
		await this.load.language('sale/voucher_theme');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/voucher_theme');

		if ((this.request.server['method'] == 'POST') && this.validateForm()) {
			await this.model_sale_voucher_theme.editVoucherTheme(this.request.get['voucher_theme_id'], this.request.post);

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

			this.response.setRedirect(await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getForm();
	}

	async delete() {
		await this.load.language('sale/voucher_theme');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('sale/voucher_theme');

		if ((this.request.post['selected']) && this.validateDelete()) {
			for (this.request.post['selected'] of voucher_theme_id) {
				await this.model_sale_voucher_theme.deleteVoucherTheme(voucher_theme_id);
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

			this.response.setRedirect(await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'vtd.name';
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
			'href' : await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['add'] = await this.url.link('sale/voucher_theme/add', 'user_token=' + this.session.data['user_token'] + url, true);
		data['delete'] = await this.url.link('sale/voucher_theme/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['voucher_themes'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		voucher_theme_total = await this.model_sale_voucher_theme.getTotalVoucherThemes();

		results = await this.model_sale_voucher_theme.getVoucherThemes(filter_data);

		for (let result of results) {
			data['voucher_themes'].push({
				'voucher_theme_id' : result['voucher_theme_id'],
				'name'             : result['name'],
				'edit'             : await this.url.link('sale/voucher_theme/edit', 'user_token=' + this.session.data['user_token'] + '&voucher_theme_id=' + result['voucher_theme_id'] + url, true)
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

		data['sort_name'] = await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = voucher_theme_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (voucher_theme_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (voucher_theme_total - this.config.get('config_limit_admin'))) ? voucher_theme_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), voucher_theme_total, ceil(voucher_theme_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/voucher_theme_list', data));
	}

	async getForm() {
		data['text_form'] = !(this.request.get['voucher_theme_id']) ? this.language.get('text_add') : this.language.get('text_edit');

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = {};
		}

		if ((this.error['image'])) {
			data['error_image'] = this.error['image'];
		} else {
			data['error_image'] = '';
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
			'href' : await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		if (!(this.request.get['voucher_theme_id'])) {
			data['action'] = await this.url.link('sale/voucher_theme/add', 'user_token=' + this.session.data['user_token'] + url, true);
		} else {
			data['action'] = await this.url.link('sale/voucher_theme/edit', 'user_token=' + this.session.data['user_token'] + '&voucher_theme_id=' + this.request.get['voucher_theme_id'] + url, true);
		}

		data['cancel'] = await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url, true);

		if ((this.request.get['voucher_theme_id']) && (this.request.server['method'] != 'POST')) {
			voucher_theme_info = await this.model_sale_voucher_theme.getVoucherTheme(this.request.get['voucher_theme_id']);
		}

		data['user_token'] = this.session.data['user_token'];

		this.load.model('localisation/language',this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((this.request.post['voucher_theme_description'])) {
			data['voucher_theme_description'] = this.request.post['voucher_theme_description'];
		} else if ((this.request.get['voucher_theme_id'])) {
			data['voucher_theme_description'] = await this.model_sale_voucher_theme.getVoucherThemeDescriptions(this.request.get['voucher_theme_id']);
		} else {
			data['voucher_theme_description'] = {};
		}

		if ((this.request.post['image'])) {
			data['image'] = this.request.post['image'];
		} else if ((voucher_theme_info)) {
			data['image'] = voucher_theme_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image',this);

		if ((this.request.post['image']) && is_file(DIR_IMAGE + this.request.post['image'])) {
			data['thumb'] = await this.model_tool_image.resize(this.request.post['image'], 100, 100);
		} else if ((voucher_theme_info) && is_file(DIR_IMAGE + voucher_theme_info['image'])) {
			data['thumb'] = await this.model_tool_image.resize(voucher_theme_info['image'], 100, 100);
		} else {
			data['thumb'] = await this.model_tool_image.resize('no_image.png', 100, 100);
		}

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/voucher_theme_form', data));
	}

	async validateForm() {
		if (!await this.user.hasPermission('modify', 'sale/voucher_theme')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		for (this.request.post['voucher_theme_description'] of language_id : value) {
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				this.error['name'][language_id] = this.language.get('error_name');
			}
		}

		if (!this.request.post['image']) {
			this.error['image'] = this.language.get('error_image');
		}

		return Object.keys(this.error).length?false:true
	}

	async validateDelete() {
		if (!await this.user.hasPermission('modify', 'sale/voucher_theme')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		this.load.model('sale/voucher');

		for (this.request.post['selected'] of voucher_theme_id) {
			voucher_total = await this.model_sale_voucher.getTotalVouchersByVoucherThemeId(voucher_theme_id);

			if (voucher_total) {
				this.error['warning'] = sprintf(this.language.get('error_voucher'), voucher_total);
			}
		}

		return Object.keys(this.error).length?false:true
	}
}