const sprintf = require("locutus/php/strings/sprintf");

module.exports = class LocationController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('localisation/location');

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
			'href': await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('localisation/location.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('localisation/location.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/location', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('localisation/location');

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

		data['action'] = await this.url.link('localisation/location.list', 'user_token=' + this.session.data['user_token'] + url);

		data['locations'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('localisation/location', this);

		const location_total = await this.model_localisation_location.getTotalLocations();

		const results = await this.model_localisation_location.getLocations(filter_data);

		for (let result of results) {
			data['locations'].push({
				'location_id': result['location_id'],
				'name': result['name'],
				'address': result['address'],
				'edit': await this.url.link('localisation/location.form', 'user_token=' + this.session.data['user_token'] + '&location_id=' + result['location_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('localisation/location.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);
		data['sort_address'] = await this.url.link('localisation/location.list', 'user_token=' + this.session.data['user_token'] + '&sort=address' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': location_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('localisation/location.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (location_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (location_total - this.config.get('config_pagination_admin'))) ? location_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), location_total, Math.ceil(location_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('localisation/location_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('localisation/location');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['location_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('localisation/location.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'] + url);
		let location_info;
		if ((this.request.get['location_id'])) {
			this.load.model('localisation/location', this);

			location_info = await this.model_localisation_location.getLocation(this.request.get['location_id']);
		}

		if ((this.request.get['location_id'])) {
			data['location_id'] = this.request.get['location_id'];
		} else {
			data['location_id'] = 0;
		}

		this.load.model('setting/store', this);

		if ((location_info)) {
			data['name'] = location_info['name'];
		} else {
			data['name'] = '';
		}

		if ((location_info)) {
			data['address'] = location_info['address'];
		} else {
			data['address'] = '';
		}

		if ((location_info)) {
			data['geocode'] = location_info['geocode'];
		} else {
			data['geocode'] = '';
		}

		if ((location_info)) {
			data['telephone'] = location_info['telephone'];
		} else {
			data['telephone'] = '';
		}

		if ((location_info)) {
			data['image'] = location_info['image'];
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

		if ((location_info)) {
			data['open'] = location_info['open'];
		} else {
			data['open'] = '';
		}

		if ((location_info)) {
			data['comment'] = location_info['comment'];
		} else {
			data['comment'] = '';
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('localisation/location_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('localisation/location');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'localisation/location')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 32)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if ((oc_strlen(this.request.post['address']) < 3) || (oc_strlen(this.request.post['address']) > 128)) {
			json['error']['address'] = this.language.get('error_address');
		}

		if ((oc_strlen(this.request.post['telephone']) < 3) || (oc_strlen(this.request.post['telephone']) > 32)) {
			json['error']['telephone'] = this.language.get('error_telephone');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('localisation/location', this);
			this.request.post['location_id'] = Number(this.request.post['location_id']);
			if (!this.request.post['location_id']) {
				json['location_id'] = await this.model_localisation_location.addLocation(this.request.post);
			} else {
				await this.model_localisation_location.editLocation(this.request.post['location_id'], this.request.post);
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
		await this.load.language('localisation/location');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'localisation/location')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('localisation/location', this);

			for (let location_id of selected) {
				await this.model_localisation_location.deleteLocation(location_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
