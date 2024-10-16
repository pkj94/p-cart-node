const sprintf = require("locutus/php/strings/sprintf");

module.exports = class EventController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketplace/event');

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
			'href': await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['delete'] = await this.url.link('marketplace/event.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/event', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketplace/event');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let sort = 'code';
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

		data['action'] = await this.url.link('marketplace/event.list', 'user_token=' + this.session.data['user_token'] + url);

		data['events'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('setting/event', this);

		const event_total = await this.model_setting_event.getTotalEvents();

		const results = await this.model_setting_event.getEvents(filter_data);

		for (let result of results) {
			data['events'].push({
				'event_id': result['event_id'],
				'code': result['code'],
				'description': result['description'],
				'trigger': result['trigger'],
				'action': result['action'],
				'status': result['status'],
				'sort_order': result['sort_order'],
				'enable': await this.url.link('marketplace/event.enable', 'user_token=' + this.session.data['user_token'] + '&event_id=' + result['event_id']),
				'disable': await this.url.link('marketplace/event.disable', 'user_token=' + this.session.data['user_token'] + '&event_id=' + result['event_id'])
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_code'] = await this.url.link('marketplace/event.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_sort_order'] = await this.url.link('marketplace/event.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': event_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('marketplace/event.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (event_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (event_total - this.config.get('config_pagination_admin'))) ? event_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), event_total, Math.ceil(event_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketplace/event_list', data);
	}

	/**
	 * @return void
	 */
	async enable() {
		await this.load.language('marketplace/event');

		const json = {};
		let event_id = 0;
		if ((this.request.get['event_id'])) {
			event_id = this.request.get['event_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/event')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/event', this);

			await this.model_setting_event.editStatus(event_id, 1);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async disable() {
		await this.load.language('marketplace/event');

		const json = {};
		let event_id = 0;
		if ((this.request.get['event_id'])) {
			event_id = this.request.get['event_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/event')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/event', this);

			await this.model_setting_event.editStatus(event_id, 0);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('marketplace/event');

		const json = {};
		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/event')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/event', this);

			for (let event_id of selected) {
				await this.model_setting_event.deleteEvent(event_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
