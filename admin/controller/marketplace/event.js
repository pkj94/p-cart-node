module.exports = class ControllerMarketplaceEvent extends Controller {
	error = {};
	
	async index() {
		await this.load.language('marketplace/event');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/event',this);

		await this.getList();
	}

	async enable() {
		await this.load.language('marketplace/event');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/event',this);

		if ((this.request.get['event_id']) && await this.validate()) {
			await this.model_setting_event.enableEvent(this.request.get['event_id']);

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

			this.response.setRedirect(await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}

	async disable() {
		await this.load.language('marketplace/event');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/event',this);

		if ((this.request.get['event_id']) && await this.validate()) {
			await this.model_setting_event.disableEvent(this.request.get['event_id']);

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

			this.response.setRedirect(await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}
	
	async delete() {
		await this.load.language('marketplace/event');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/event',this);

		if ((this.request.post['selected']) && await this.validate()) {
			for (this.request.post['selected'] of event_id) {
				await this.model_setting_event.deleteEvent(event_id);
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

			this.response.setRedirect(await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + url, true));
		}

		await this.getList();
	}	
	
	async getList() {
		if ((this.request.get['sort'])) {
			sort = this.request.get['sort'];
		} else {
			sort = 'code';
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
			'href' : await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + url, true)
		);

		data['delete'] = await this.url.link('marketplace/event/delete', 'user_token=' + this.session.data['user_token'] + url, true);

		data['events'] = {};

		filter_data = array(
			'sort'  : sort,
			'order' : order,
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		event_total = await this.model_setting_event.getTotalEvents();

		results = await this.model_setting_event.getEvents(filter_data);

		for (let result of results) {
			data['events'].push({
				'event_id'   : result['event_id'],
				'code'       : result['code'],
				'trigger'    : result['trigger'],
				'action'     : result['action'],
				'sort_order' : result['sort_order'],
				'status'     : result['status'] ? this.language.get('text_enabled') : this.language.get('text_disabled'),
				'enable'     : await this.url.link('marketplace/event/enable', 'user_token=' + this.session.data['user_token'] + '&event_id=' + result['event_id'] + url, true),
				'disable'    : await this.url.link('marketplace/event/disable', 'user_token=' + this.session.data['user_token'] + '&event_id=' + result['event_id'] + url, true),
				'enabled'    : result['status']
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

		data['sort_code'] = await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + '&sort=code' + url, true);
		data['sort_sort_order'] = await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + '&sort=sort_order' + url, true);
		data['sort_status'] = await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + '&sort=status' + url, true);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		pagination = new Pagination();
		pagination.total = event_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'] + url + '&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (event_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (event_total - this.config.get('config_limit_admin'))) ? event_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), event_total, ceil(event_total / this.config.get('config_limit_admin')));

		data['sort'] = sort;
		data['order'] = order;

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('marketplace/event', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'marketplace/event')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
}