module.exports = class ActivityController extends Controller {
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
			href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=dashboard')
		});

		data.breadcrumbs.push({
			text: this.language.get('heading_title'),
			href: this.url.link('extension/opencart/dashboard/activity', 'user_token=' + this.session.data.user_token)
		});

		data.save = this.url.link('extension/opencart/dashboard/activity.save', 'user_token=' + this.session.data.user_token);
		data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=dashboard');

		data.dashboard_activity_width = this.config.get('dashboard_activity_width');

		data.columns = [];
		for (let i = 3; i <= 12; i++) {
			data.columns.push(i);
		}

		data.dashboard_activity_status = this.config.get('dashboard_activity_status');
		data.dashboard_activity_sort_order = this.config.get('dashboard_activity_sort_order');

		data.header = this.load.controller('common/header');
		data.column_left = this.load.controller('common/column_left');
		data.footer = this.load.controller('common/footer');

		this.response.setOutput(this.load.view('extension/opencart/dashboard/activity_form', data));
	}

	save() {
		this.load.language('extension/opencart/dashboard/activity');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/dashboard/activity')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting');

			this.model_setting_setting.editSetting('dashboard_activity', this.request.post);

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	dashboard() {
		this.load.language('extension/opencart/dashboard/activity');

		const data = {};
		data.activities = [];

		this.load.model('extension/opencart/report/activity');

		const results = this.model_extension_opencart_report_activity.getActivities();

		results.forEach(result => {
			const comment = vsprintf(this.language.get('text_activity_' + result.key), JSON.parse(result.data));

			const find = [
				'customer_id=',
				'order_id=',
				'return_id='
			];

			const replace = [
				this.url.link('customer/customer.form', 'user_token=' + this.session.data.user_token + '&customer_id='),
				this.url.link('sale/order.info', 'user_token=' + this.session.data.user_token + '&order_id='),
				this.url.link('sale/return.form', 'user_token=' + this.session.data.user_token + '&return_id=')
			];

			data.activities.push({
				comment: comment.replace(new RegExp(find.join('|'), 'g'), (matched) => replace[find.indexOf(matched)]),
				date_added: new Date(result.date_added).toLocaleString(this.language.get('datetime_format'))
			});
		});

		data.user_token = this.session.data.user_token;

		return this.load.view('extension/opencart/dashboard/activity_info', data);
	}
}

