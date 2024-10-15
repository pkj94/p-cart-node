/**
 * Class Online
 *
 * @package Opencart\Admin\Controller\Extension\Opencart\Dashboard
 */
module.exports = class OnlineDashboardController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/online');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': this.url.link('extension/opencart/dashboard/online', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = this.url.link('extension/opencart/dashboard/online+save', 'user_token=' + this.session.data['user_token']);
		data['back'] = this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=dashboard');

		data['dashboard_online_width'] = this.config.get('dashboard_online_width');

		data['columns'] = [];

		for (let i = 3; i <= 12; i++) {
			data['columns'].push(i);
		}

		data['dashboard_online_status'] = this.config.get('dashboard_online_status');
		data['dashboard_online_sort_order'] = this.config.get('dashboard_online_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/online_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/dashboard/online');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/online')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('dashboard_online', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return string
	 */
	async dashboard() {
		const data = {};
		await this.load.language('extension/opencart/dashboard/online');

		this.load.model('report/online', this);

		// Customers Online
		let online_total = await this.model_report_online.getTotalOnline();

		if (online_total > 1000000000000) {
			data['total'] = round(online_total / 1000000000000, 1) + 'T';
		} else if (online_total > 1000000000) {
			data['total'] = round(online_total / 1000000000, 1) + 'B';
		} else if (online_total > 1000000) {
			data['total'] = round(online_total / 1000000, 1) + 'M';
		} else if (online_total > 1000) {
			data['total'] = round(online_total / 1000, 1) + 'K';
		} else {
			data['total'] = online_total;
		}

		data['online'] = this.url.link('report/online', 'user_token=' + this.session.data['user_token']);

		return await this.load.view('extension/opencart/dashboard/online_info', data);
	}
}
