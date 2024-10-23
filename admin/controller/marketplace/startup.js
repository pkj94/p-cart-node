const sprintf = require("locutus/php/strings/sprintf");

module.exports = class StartupController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('marketplace/startup');

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
			'href': await this.url.link('marketplace/startup', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['delete'] = await this.url.link('marketplace/startup.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/startup', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('marketplace/startup');

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

		data['action'] = await this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + url);

		data['startups'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('setting/startup', this);

		const startup_total = await this.model_setting_startup.getTotalStartups();

		const results = await this.model_setting_startup.getStartups(filter_data);

		for (let result of results) {
			data['startups'].push({
				'startup_id': result['startup_id'],
				'code': result['code'],
				'action': result['action'],
				'status': result['status'],
				'sort_order': result['sort_order'],
				'enable': await this.url.link('marketplace/startup.enable', 'user_token=' + this.session.data['user_token'] + '&startup_id=' + result['startup_id']),
				'disable': await this.url.link('marketplace/startup.disable', 'user_token=' + this.session.data['user_token'] + '&startup_id=' + result['startup_id'])
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_code'] = await this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url);
		data['sort_action'] = await this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + '&sort=action' + url);
		data['sort_sort_order'] = await this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': startup_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('marketplace/startup.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (startup_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (startup_total - this.config.get('config_pagination_admin'))) ? startup_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), startup_total, Math.ceil(startup_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('marketplace/startup_list', data);
	}

	/**
	 * @return void
	 */
	async enable() {
		await this.load.language('marketplace/startup');

		const json = {};
		let startup_id = 0;
		if ((this.request.get['startup_id'])) {
			startup_id = this.request.get['startup_id'];
		}
		if (!await this.user.hasPermission('modify', 'marketplace/startup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/startup', this);

			await this.model_setting_startup.editStatus(startup_id, 1);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async disable() {
		await this.load.language('marketplace/startup');

		const json = {};
		let startup_id = 0;
		if ((this.request.get['startup_id'])) {
			startup_id = this.request.get['startup_id'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/startup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/startup', this);

			await this.model_setting_startup.editStatus(startup_id, 0);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('marketplace/startup');

		const json = {};
		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'marketplace/startup')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('setting/startup', this);

			for (let startup_id of selected) {
				await this.model_setting_startup.deleteStartup(startup_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
