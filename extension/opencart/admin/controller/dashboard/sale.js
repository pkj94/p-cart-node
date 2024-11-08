const strtotime = require("locutus/php/datetime/strtotime");

global['\Opencart\Admin\Controller\Extension\Opencart\Dashboard\Sale'] = class Sale extends Controller {
	constructor(registry) {
		super(registry);
	}
	async index() {
		await this.language.load('extension/opencart/dashboard/sale');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: [
				{
					text: this.language.get('text_home'),
					href: await this.url.link('common/dashboard', `user_token=${this.session.data['user_token']}`)
				},
				{
					text: this.language.get('text_extension'),
					href: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=dashboard`)
				},
				{
					text: this.language.get('heading_title'),
					href: await this.url.link('extension/opencart/dashboard/sale', `user_token=${this.session.data['user_token']}`)
				}
			],
			save: await this.url.link('extension/opencart/dashboard/sale.save', `user_token=${this.session.data['user_token']}`),
			back: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=dashboard`),
			dashboard_sale_width: this.config.get('dashboard_sale_width'),
			columns: [],
			dashboard_sale_status: this.config.get('dashboard_sale_status'),
			dashboard_sale_sort_order: this.config.get('dashboard_sale_sort_order'),
			header: await this.load.controller('common/header'),
			column_left: await this.load.controller('common/column_left'),
			footer: await this.load.controller('common/footer')
		};

		for (let i = 3; i <= 12; i++) {
			data.columns.push(i);
		}

		this.response.setOutput(await this.load.view('extension/opencart/dashboard/sale_form', data));
	}

	async save() {
		await this.language.load('extension/opencart/dashboard/sale');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/sale')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);
			await this.model_setting_setting.editSetting('dashboard_sale', this.request.post);
			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(JSON.stringify(json));
	}

	async dashboard() {
		await this.language.load('extension/opencart/dashboard/sale');
		this.load.model('extension/opencart/report/sale', this);

		const today = await this.model_extension_opencart_report_sale.getTotalSales({
			filter_date_added: date('Y-m-d', new Date('-1 day'))
		});

		const yesterday = await this.model_extension_opencart_report_sale.getTotalSales({
			filter_date_added:date('Y-m-d', new Date('-2 day'))
		});

		const difference = today - yesterday;

		const data = {
			percentage: difference && today ? Math.round((difference / today) * 100) : 0,
			sale: await this.url.link('sale/order', `user_token=${this.session.data['user_token']}`),
			user_token: this.session.data['user_token']
		};

		const sale_total = await this.model_extension_opencart_report_sale.getTotalSales();

		if (sale_total > 1000000000000) {
			data.total = `${Math.round(sale_total / 1000000000000 * 10) / 10}T`;
		} else if (sale_total > 1000000000) {
			data.total = `${Math.round(sale_total / 1000000000 * 10) / 10}B`;
		} else if (sale_total > 1000000) {
			data.total = `${Math.round(sale_total / 1000000 * 10) / 10}M`;
		} else if (sale_total > 1000) {
			data.total = `${Math.round(sale_total / 1000 * 10) / 10}K`;
		} else {
			data.total = Math.round(sale_total);
		}

		return await this.load.view('extension/opencart/dashboard/sale_info', data);
	}
}
