const strtotime = require("locutus/php/datetime/strtotime");

global['\Opencart\Admin\Controller\Extension\Opencart\Dashboard\Activity'] = class Activity extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/dashboard/activity');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {};
		data.breadcrumbs = [];

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: await this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=dashboard')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: await this.url.link('extension/opencart/dashboard/activity', 'user_token=' + this.session.data.user_token)
		});

		data.save = await this.url.link('extension/opencart/dashboard/activity.save', 'user_token=' + this.session.data.user_token);
		data.back = await this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=dashboard');

		data.dashboard_activity_width = this.config.get('dashboard_activity_width');

		data.columns = [];
		for (let i = 3; i <= 12; i++) {
			data.columns.push(i);
		}

		data.dashboard_activity_status = this.config.get('dashboard_activity_status');
		data.dashboard_activity_sort_order = this.config.get('dashboard_activity_sort_order');

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/activity_form', data));
	}

	async save() {
		await this.load.language('extension/opencart/dashboard/activity');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/activity')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('dashboard_activity', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async dashboard() {
		await this.load.language('extension/opencart/dashboard/activity');

		const data = {};
		data.activities = [];

		this.load.model('extension/opencart/report/activity', this);

		const results = await this.model_extension_opencart_report_activity.getActivities();
		results.forEach(async (result) => {
			const comment = vsprintf(this.language.get('text_activity_' + result.key), JSON.parse(result.data));

			const find = [
				'customer_id=',
				'order_id=',
				'return_id='
			];

			const replace = [
				await this.url.link('customer/customer.form', 'user_token=' + this.session.data.user_token + '&customer_id='),
				await this.url.link('sale/order.info', 'user_token=' + this.session.data.user_token + '&order_id='),
				await this.url.link('sale/return.form', 'user_token=' + this.session.data.user_token + '&return_id=')
			];

			data.activities.push({
				comment: comment.replace(find, replace),
				date_added: date(this.language.get('datetime_format'), new Date(result['date_added']))
			});
		});

		data.user_token = this.session.data.user_token;

		return await this.load.view('extension/opencart/dashboard/activity_info', data);
	}
}

