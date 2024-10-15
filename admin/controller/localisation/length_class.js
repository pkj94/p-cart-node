const sprintf = require("locutus/php/strings/sprintf");

module.exports = class LengthController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('localisation/length_class');

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
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('localisation/length_class', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = this.url.link('localisation/length_class.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = this.url.link('localisation/length_class.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/length_class', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/length_class');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'title';
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

		data['action'] = this.url.link('localisation/length_class.list', 'user_token=' + this.session.data['user_token'] + url);

		data['length_classes'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('localisation/length_class', this);

		const length_class_total = await this.model_localisation_length_class.getTotalLengthClasses();

		const results = await this.model_localisation_length_class.getLengthClasses(filter_data);

		for (let result of results) {
			data['length_classes'].push({
				'length_class_id': result['length_class_id'],
				'title': result['title'] + ((result['length_class_id'] == this.config.get('config_length_class_id')) ? this.language.get('text_default') : ''),
				'unit': result['unit'],
				'value': result['value'],
				'edit': this.url.link('localisation/length_class.form', 'user_token=' + this.session.data['user_token'] + '&length_class_id=' + result['length_class_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_title'] = this.url.link('localisation/length_class.list', 'user_token=' + this.session.data['user_token'] + '&sort=title' + url);
		data['sort_unit'] = this.url.link('localisation/length_class.list', 'user_token=' + this.session.data['user_token'] + '&sort=unit' + url);
		data['sort_value'] = this.url.link('localisation/length_class.list', 'user_token=' + this.session.data['user_token'] + '&sort=value' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': length_class_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': this.url.link('localisation/length_class.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (length_class_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (length_class_total - this.config.get('config_pagination_admin'))) ? length_class_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), length_class_total, Math.ceil(length_class_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/length_class_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('localisation/length_class');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['length_class_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('localisation/length_class', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = this.url.link('localisation/length_class.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('localisation/length_class', 'user_token=' + this.session.data['user_token'] + url);
		let length_class_info;
		if ((this.request.get['length_class_id'])) {
			this.load.model('localisation/length_class', this);

			length_class_info = await this.model_localisation_length_class.getLengthClass(this.request.get['length_class_id']);
		}

		if ((this.request.get['length_class_id'])) {
			data['length_class_id'] = this.request.get['length_class_id'];
		} else {
			data['length_class_id'] = 0;
		}

		this.load.model('localisation/language', this);

		data['languages'] = await this.model_localisation_language.getLanguages();

		if ((length_class_info)) {
			data['length_class_description'] = await this.model_localisation_length_class.getDescriptions(this.request.get['length_class_id']);
		} else {
			data['length_class_description'] = [];
		}

		if ((length_class_info)) {
			data['value'] = length_class_info['value'];
		} else {
			data['value'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/length_class_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/length_class');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'localisation/length_class')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		for (let [language_id, value] of Object.entries(this.request.post['length_class_description'])) {
			language_id = language_id.indexOf('language-') >= 0 ? language_id.split('-')[1] : language_id;
			if ((oc_strlen(value['title']) < 3) || (oc_strlen(value['title']) > 32)) {
				json['error']['title_' + language_id] = this.language.get('error_title');
			}

			if (!value['unit'] || (oc_strlen(value['unit']) > 4)) {
				json['error']['unit_' + language_id] = this.language.get('error_unit');
			}
		}

		if (!Object.keys(json.error).length) {
			this.load.model('localisation/length_class', this);
			this.request.post['length_class_id'] = Number(this.request.post['length_class_id']);
			if (!this.request.post['length_class_id']) {
				json['length_class_id'] = await this.model_localisation_length_class.addLengthClass(this.request.post);
			} else {
				await this.model_localisation_length_class.editLengthClass(this.request.post['length_class_id'], this.request.post);
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
		await this.load.language('localisation/length_class');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/length_class')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('catalog/product', this);

		for (let length_class_id of selected) {
			if (this.config.get('config_length_class_id') == length_class_id) {
				json['error'] = this.language.get('error_default');
			}

			const product_total = await this.model_catalog_product.getTotalProductsByLengthClassId(length_class_id);

			if (product_total) {
				json['error'] = sprintf(this.language.get('error_product'), product_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/length_class', this);

			for (let length_class_id of selected) {
				await this.model_localisation_length_class.deleteLengthClass(length_class_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
