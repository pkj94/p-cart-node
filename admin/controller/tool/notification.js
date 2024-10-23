const sprintf = require("locutus/php/strings/sprintf");

module.exports = class NotificationController extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('tool/notification');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('tool/notification', 'user_token=' + this.session.data['user_token'])
		});

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('tool/notification', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('tool/notification');

		this.response.setOutput(await this.getList());
	}

	/**
	 * @return string
	 */
	async getList() {
		const data = {};
		let page = 1;
		if ((this.request.get['page'])) {
			page = Number(this.request.get['page']);
		}

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['notifications'] = [];

		this.load.model('tool/notification', this);

		const notification_total = await this.model_tool_notification.getTotalNotifications();

		let filter_data = {
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		const results = await this.model_tool_notification.getNotifications(filter_data);

		for (let result of results) {
			let second = (new Date().getTime() - new Date(result['date_added']).getTime()) / 1000;

			let ranges = {
				'second': second,
				'minute': Math.floor(second / 60),
				'hour': Math.floor(second / 3600),
				'day': Math.floor(second / 86400),
				'week': Math.floor(second / 604800),
				'month': Math.floor(second / 2629743),
				'year': Math.floor(second / 31556926)
			};
			let date_added, code;
			for (let [range, value] of Object.entries(ranges)) {
				if (value) {
					date_added = value;
					code = range + (value > 1) ? 's' : '';
				}
			}

			data['notifications'].push({
				'notification_id': result['notification_id'],
				'title': result['title'],
				'status': result['status'],
				'date_added': sprintf(this.language.get('text_' + code + '_ago'), date_added),
				'view': await this.url.link('tool/notification.info', 'user_token=' + this.session.data['user_token'] + '&notification_id=' + result['notification_id'] + url),
				'delete': await this.url.link('tool/notification.delete', 'user_token=' + this.session.data['user_token'] + '&notification_id=' + result['notification_id'] + url)
			});
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': notification_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('tool/notification.list', 'user_token=' + this.session.data['user_token'] + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (notification_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (notification_total - this.config.get('config_pagination_admin'))) ? notification_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), notification_total, Math.ceil(notification_total / this.config.get('config_pagination_admin')));

		return await this.load.view('tool/notification_list', data);
	}

	/**
	 * @return void
	 */
	async info() {
		const data = {};
		let notification_id = 0;
		if ((this.request.get['notification_id'])) {
			notification_id = this.request.get['notification_id'];
		}

		this.load.model('tool/notification', this);

		const notification_info = await this.model_tool_notification.getNotification(notification_id);

		if (notification_info.notification_id) {
			await this.load.language('tool/notification');

			data['title'] = notification_info['title'];

			data['text'] = oc_bbcode_decode(notification_info['text']);

			await this.model_tool_notification.editStatus(notification_id, 1);

			this.response.setOutput(await this.load.view('tool/notification_info', data));
		}
	}

	/**
	 * @return void
	 */
	async delete() {
		await this.load.language('tool/notification');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'tool/notification')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!Object.keys(json).length) {
			this.load.model('tool/notification', this);

			for (let notification_id of selected) {
				await this.model_tool_notification.deleteNotification(notification_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
