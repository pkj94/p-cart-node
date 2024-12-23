const sprintf = require("locutus/php/strings/sprintf");

module.exports = class VoucherThemeController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('sale/voucher_theme');

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
			'href': await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('sale/voucher_theme.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('sale/voucher_theme.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/voucher_theme', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('sale/voucher_theme');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'vtd.name';
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

		data['action'] = await this.url.link('sale/voucher_theme.list', 'user_token=' + this.session.data['user_token'] + url);

		data['voucher_themes'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('sale/voucher_theme', this);

		const voucher_theme_total = await this.model_sale_voucher_theme.getTotalVoucherThemes();

		const results = await this.model_sale_voucher_theme.getVoucherThemes(filter_data);

		for (let result of results) {
			data['voucher_themes'].push({
				'voucher_theme_id': result['voucher_theme_id'],
				'name': result['name'],
				'edit': await this.url.link('sale/voucher_theme.form', 'user_token=' + this.session.data['user_token'] + '&voucher_theme_id=' + result['voucher_theme_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('sale/voucher_theme.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': voucher_theme_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('sale/voucher_theme.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (voucher_theme_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (voucher_theme_total - this.config.get('config_pagination_admin'))) ? voucher_theme_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), voucher_theme_total, Math.ceil(voucher_theme_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('sale/voucher_theme_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('sale/voucher_theme');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['voucher_theme_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('sale/voucher_theme.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'] + url);
		let voucher_theme_info;
		if ((this.request.get['voucher_theme_id'])) {
			this.load.model('sale/voucher_theme', this);

				let voucher_theme_info = await this.model_sale_voucher_theme.getVoucherTheme(this.request.get['voucher_theme_id']);
		}

		if ((this.request.get['voucher_theme_id'])) {
			data['voucher_theme_id'] = this.request.get['voucher_theme_id'];
		} else {
			data['voucher_theme_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((voucher_theme_info)) {
			data['voucher_theme_description'] = await this.model_sale_voucher_theme.getDescriptions(this.request.get['voucher_theme_id']);
		} else {
			data['voucher_theme_description'] = [];
		}

		if ((voucher_theme_info)) {
			data['image'] = voucher_theme_info['image'];
		} else {
			data['image'] = '';
		}

		this.load.model('tool/image', this);

		data['placeholder'] = await this.model_tool_image.resize('no_image.png', 100, 100);

		if (data['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(data['image']))) {
			data['thumb'] = await this.model_tool_image.resize(html_entity_decode(data['image']), 100, 100);
		} else {
			data['thumb'] = data['placeholder'];
		}
		// console.log("================", data['thumb'], data['placeholder'])
		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('sale/voucher_theme_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('sale/voucher_theme');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'sale/voucher_theme')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['voucher_theme_description'])) {
			language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
			if ((oc_strlen(value['name']) < 3) || (oc_strlen(value['name']) > 32)) {
				json['error']['name_' + language_id] = this.language.get('error_name');
			}
		}

		if (!this.request.post['image']) {
			json['error']['image'] = this.language.get('error_image');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('sale/voucher_theme', this);
			this.request.post['voucher_theme_id'] = Number(this.request.post['voucher_theme_id']);
			if (!this.request.post['voucher_theme_id']) {
				json['voucher_theme_id'] = await this.model_sale_voucher_theme.addVoucherTheme(this.request.post);
			} else {
				await this.model_sale_voucher_theme.editVoucherTheme(this.request.post['voucher_theme_id'], this.request.post);
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
		await this.load.language('sale/voucher_theme');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'sale/voucher_theme')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('sale/voucher', this);

		for (let voucher_theme_id of selected) {
			const voucher_total = await this.model_sale_voucher.getTotalVouchersByVoucherThemeId(voucher_theme_id);

			if (voucher_total) {
				json['error'] = sprintf(this.language.get('error_voucher'), voucher_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('sale/voucher_theme', this);

			for (let voucher_theme_id of selected) {
				await this.model_sale_voucher_theme.deleteVoucherTheme(voucher_theme_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
