const sprintf = require("locutus/php/strings/sprintf");
const fs = require('fs');
const { error } = require("console");
module.exports = class UserPermissionController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('user/user_group');

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
			'href': await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['add'] = await this.url.link('user/user_permission.form', 'user_token=' + this.session.data['user_token'] + url);
		data['delete'] = await this.url.link('user/user_permission.delete', 'user_token=' + this.session.data['user_token']);

		data['list'] = await this.getList();

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_group', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('user/user_group');

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

		data['action'] = await this.url.link('user/user_permission.list', 'user_token=' + this.session.data['user_token'] + url);

		data['user_groups'] = [];

		let filter_data = {
			'sort': sort,
			'order': order,
			'start': (page - 1) * Number(this.config.get('config_pagination_admin')),
			'limit': this.config.get('config_pagination_admin')
		};

		this.load.model('user/user_group', this);

		const user_group_total = await this.model_user_user_group.getTotalUserGroups();

		const results = await this.model_user_user_group.getUserGroups(filter_data);

		for (let result of results) {
			data['user_groups'].push({
				'user_group_id': result['user_group_id'],
				'name': result['name'],
				'edit': await this.url.link('user/user_permission.form', 'user_token=' + this.session.data['user_token'] + '&user_group_id=' + result['user_group_id'] + url)
			});
		}

		url = '';

		if (order == 'ASC') {
			url += '&order=DESC';
		} else {
			url += '&order=ASC';
		}

		data['sort_name'] = await this.url.link('user/user_permission.list', 'user_token=' + this.session.data['user_token'] + '&sort=name' + url);

		url = '';

		if ((this.request.get['sort'])) {
			url += '&sort=' + this.request.get['sort'];
		}

		if ((this.request.get['order'])) {
			url += '&order=' + this.request.get['order'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': user_group_total,
			'page': page,
			'limit': this.config.get('config_pagination_admin'),
			'url': await this.url.link('user/user_permission.list', 'user_token=' + this.session.data['user_token'] + url + '&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (user_group_total) ? ((page - 1) * Number(this.config.get('config_pagination_admin'))) + 1 : 0, (((page - 1) * Number(this.config.get('config_pagination_admin'))) > (user_group_total - this.config.get('config_pagination_admin'))) ? user_group_total : (((page - 1) * Number(this.config.get('config_pagination_admin'))) + this.config.get('config_pagination_admin')), user_group_total, Math.ceil(user_group_total / this.config.get('config_pagination_admin')));

		data['sort'] = sort;
		data['order'] = order;

		return await this.load.view('user/user_group_list', data);
	}

	/**
	 * @return void
	 */
	async form() {
		const data = {};
		await this.load.language('user/user_group');

		this.document.setTitle(this.language.get('heading_title'));

		data['text_form'] = !(this.request.get['user_group_id']) ? this.language.get('text_add') : this.language.get('text_edit');

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
			'href': await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url)
		});

		data['save'] = await this.url.link('user/user_permission.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'] + url);
		let user_group_info
		if ((this.request.get['user_group_id'])) {
			this.load.model('user/user_group', this);

			user_group_info = await this.model_user_user_group.getUserGroup(this.request.get['user_group_id']);
		}

		if ((this.request.get['user_group_id'])) {
			data['user_group_id'] = this.request.get['user_group_id'];
		} else {
			data['user_group_id'] = 0;
		}

		if ((user_group_info)) {
			data['name'] = user_group_info['name'];
		} else {
			data['name'] = '';
		}

		// Routes to ignore
		let ignore = [
			'common/dashboard',
			'common/startup',
			'common/login',
			'common/logout',
			'common/forgotten',
			'common/authorize',
			'common/footer',
			'common/header',
			'common/column_left',
			'common/language',
			'common/pagination',
			'error/not_found',
			'error/permission',
			'event/currency',
			'event/debug',
			'event/language',
			'event/statistics',
			'startup/application',
			'startup/authorize',
			'startup/error',
			'startup/event',
			'startup/extension',
			'startup/language',
			'startup/login',
			'startup/notification',
			'startup/permission',
			'startup/sass',
			'startup/session',
			'startup/setting',
			'startup/startup'
		];

		let files = [];

		// Make path into an array
		let path = [DIR_APPLICATION + 'controller/*'];

		// While the path array is still populated keep looping through
		while (path.length != 0) {
			let next = path.shift();

			for (let file of require('glob').sync(next + '/*')) {
				// If directory add to path array
				if (fs.lstatSync(file).isDirectory()) {
					path.push(file);
				}

				// Add the file to the files to be deleted array
				if (fs.lstatSync(file).isFile()) {
					files.push(file);
				}
			}
		}

		// Sort the file array
		files = files.sort();

		data['permissions'] = [];

		for (let file of files) {
			let controller = file.substring((DIR_APPLICATION + 'controller/').length);

			let permission = controller.substring(0, controller.indexOf('.'));

			if (!ignore.includes(permission)) {
				data['permissions'].push(permission);
			}
		}

		data['extensions'] = [];

		// Extension permissions
		this.load.model('setting/extension', this);

		const results = await this.model_setting_extension.getPaths('%/admin/controller/%.js');

		for (let result of results) {
			data['extensions'].push('extension/' + result['path'].substring(0, result['path'].indexOf('.')).replace('admin/controller/', ''));
		}

		if ((user_group_info['permission']['access'])) {
			data['access'] = user_group_info['permission']['access'];
		} else {
			data['access'] = [];
		}

		if ((user_group_info['permission']['modify'])) {
			data['modify'] = user_group_info['permission']['modify'];
		} else {
			data['modify'] = [];
		}

		data['user_token'] = this.session.data['user_token'];

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('user/user_group_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('user/user_group');

		const json = { error: {} };

		if (!await this.user.hasPermission('modify', 'user/user_permission')) {
			json['error']['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			json['error']['name'] = this.language.get('error_name');
		}

		if (!Object.keys(json.error).length) {
			this.load.model('user/user_group', this);
			this.request.post['user_group_id'] = Number(this.request.post['user_group_id']);
			if (!this.request.post['user_group_id']) {
				json['user_group_id'] = await this.model_user_user_group.addUserGroup(this.request.post);
			} else {
				await this.model_user_user_group.editUserGroup(this.request.post['user_group_id'], this.request.post);
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
		await this.load.language('user/user_group');

		const json = {};

		let selected = [];
		if ((this.request.post['selected'])) {
			selected = this.request.post['selected'];
		}

		if (!await this.user.hasPermission('modify', 'user/user_permission')) {
			json['error'] = this.language.get('error_permission');
		}

		this.load.model('user/user', this);

		for (let user_group_id of selected) {
			const user_total = await this.model_user_user.getTotalUsersByGroupId(user_group_id);

			if (user_total) {
				json['error'] = sprintf(this.language.get('error_user'), user_total);
			}
		}

		if (!Object.keys(json).length) {
			this.load.model('user/user_group', this);

			for (let user_group_id of selected) {
				await this.model_user_user_group.deleteUserGroup(user_group_id);
			}

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
