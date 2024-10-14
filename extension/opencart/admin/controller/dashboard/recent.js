const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class RecentDashboardController extends Controller {
	constructor(registry){
		super(registry)
	}
    async index() {
        await this.load.language('extension/opencart/dashboard/recent');

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
            href: this.url.link('extension/opencart/dashboard/recent', 'user_token=' + this.session.data.user_token)
        });

        data.save = this.url.link('extension/opencart/dashboard/recent.save', 'user_token=' + this.session.data.user_token);
        data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=dashboard');

        data.dashboard_recent_width = this.config.get('dashboard_recent_width');

        data.columns = [];
        for (let i = 3; i <= 12; i++) {
            data.columns.push(i);
        }

        data.dashboard_recent_status = this.config.get('dashboard_recent_status');
        data.dashboard_recent_sort_order = this.config.get('dashboard_recent_sort_order');

        data.header = await this.load.controller('common/header');
        data.column_left = await this.load.controller('common/column_left');
        data.footer = await this.load.controller('common/footer');

        this.response.setOutput(await this.load.view('extension/opencart/dashboard/recent_form', data));
    }

    async save() {
        await this.load.language('extension/opencart/dashboard/recent');

        const json = {};

        if (!await this.user.hasPermission('modify', 'extension/opencart/dashboard/recent')) {
            json.error = this.language.get('error_permission');
        }

        if (!json.error) {
            this.load.model('setting/setting',this);

            await this.model_setting_setting.editSetting('dashboard_recent', this.request.post);

            json.success = this.language.get('text_success');
        }

        this.response.addHeader('Content-Type: application/json');
        this.response.setOutput(json);
    }

    async dashboard() {
        await this.load.language('extension/opencart/dashboard/recent');

        const data = {};
        data.orders = [];

        const filter_data = {
            sort: 'o.date_added',
            order: 'DESC',
            start: 0,
            limit: 5
        };

        this.load.model('sale/order',this);

        const results = await this.model_sale_order.getOrders(filter_data);

        results.forEach(result => {
            data.orders.push({
                order_id: result.order_id,
                customer: result.customer,
                status: result.order_status,
                date_added: date(this.language.get('date_format_short'), new Date(result['date_added'])), // Adjust date format as needed
                total: this.currency.format(result.total, result.currency_code, result.currency_value),
                view: this.url.link('sale/order.info', 'user_token=' + this.session.data.user_token + '&order_id=' + result.order_id)
            });
        });

        data.user_token = this.session.data.user_token;

        return await this.load.view('extension/opencart/dashboard/recent_info', data);
    }
}

