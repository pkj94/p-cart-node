const str_replace = require("locutus/php/strings/str_replace");
const vsprintf = require("locutus/php/strings/vsprintf");

module.exports = class ControllerExtensionDashboardActivity extends Controller {
	error = {};

	async index() {
		const data = {};
		await this.load.language('extension/dashboard/activity');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting', this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('dashboard_activity', this.request.post);

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
			'href': await this.url.link('extension/dashboard/activity', 'user_token=' + this.session.data['user_token'], true)
		});

		data['action'] = await this.url.link('extension/dashboard/activity', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard', true);

		if ((this.request.post['dashboard_activity_width'])) {
			data['dashboard_activity_width'] = this.request.post['dashboard_activity_width'];
		} else {
			data['dashboard_activity_width'] = this.config.get('dashboard_activity_width');
		}

		data['columns'] = [];

		for (let i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		if ((this.request.post['dashboard_activity_status'])) {
			data['dashboard_activity_status'] = this.request.post['dashboard_activity_status'];
		} else {
			data['dashboard_activity_status'] = this.config.get('dashboard_activity_status');
		}

		if ((this.request.post['dashboard_activity_sort_order'])) {
			data['dashboard_activity_sort_order'] = this.request.post['dashboard_activity_sort_order'];
		} else {
			data['dashboard_activity_sort_order'] = this.config.get('dashboard_activity_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/dashboard/activity_form', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/dashboard/activity')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true;
	}

	async dashboard() {
		const data = {};
		await this.load.language('extension/dashboard/activity');

		data['user_token'] = this.session.data['user_token'];

		data['activities'] = {};

		this.load.model('extension/dashboard/activity', this);

		const results = await this.model_extension_dashboard_activity.getActivities();

		for (let result of results) {
			let comment = vsprintf(this.language.get('text_activity_' + result['key']), JSON.parse(result['data']));

			let find = [
				'customer_id=',
				'order_id=',
				'return_id='
			];

			let replace = [
				await this.url.link('customer/customer/edit', 'user_token=' + this.session.data['user_token'] + '&customer_id=', true),
				await this.url.link('sale/order/info', 'user_token=' + this.session.data['user_token'] + '&order_id=', true),
				await this.url.link('sale/return/edit', 'user_token=' + this.session.data['user_token'] + '&return_id=', true)
			];

			data['activities'].push({
				'comment': str_replace(find, replace, comment),
				'date_added': date(this.language.get('datetime_format'), new Date(result['date_added']))
			});
		}

		return await this.load.view('extension/dashboard/activity_info', data);
	}
}