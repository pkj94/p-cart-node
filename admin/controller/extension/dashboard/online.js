module.exports = class ControllerExtensionDashboardOnline extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/dashboard/online');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_online', this.request.post);

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);
			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/dashboard/online', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/dashboard/online', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

		if ((this.request.post['dashboard_online_width'])) {
			data['dashboard_online_width'] = this.request.post['dashboard_online_width'];
		} else {
			data['dashboard_online_width'] = this.config.get('dashboard_online_width');
		}

		data['columns'] = [];

		for (let i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		if ((this.request.post['dashboard_online_status'])) {
			data['dashboard_online_status'] = this.request.post['dashboard_online_status'];
		} else {
			data['dashboard_online_status'] = this.config.get('dashboard_online_status');
		}

		if ((this.request.post['dashboard_online_sort_order'])) {
			data['dashboard_online_sort_order'] = this.request.post['dashboard_online_sort_order'];
		} else {
			data['dashboard_online_sort_order'] = this.config.get('dashboard_online_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/dashboard/online_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/online')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/online');

		data['user_token'] = this.session.data['user_token'];

		// Total Orders
		this.load.model('extension/dashboard/online', this);

		// Customers Online
		let online_total = await this.model_extension_dashboard_online.getTotalOnline();

		if (online_total > 1000000000000) {
			data['total'] = Math.round(online_total / 1000000000000, 1) + 'T';
		} else if (online_total > 1000000000) {
			data['total'] = Math.round(online_total / 1000000000, 1) + 'B';
		} else if (online_total > 1000000) {
			data['total'] = Math.round(online_total / 1000000, 1) + 'M';
		} else if (online_total > 1000) {
			data['total'] = Math.round(online_total / 1000, 1) + 'K';
		} else {
			data['total'] = online_total;
		}

		data['online'] = await this.url.link('report/online', 'user_token=' + this.session.data['user_token'], true);

		return await this.load.view('extension/dashboard/online_info', data);
	}
}
