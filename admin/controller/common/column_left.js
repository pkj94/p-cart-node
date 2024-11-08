module.exports = class ControllerCommonColumnLeft extends Controller {
	async index() {
		const data = { menus: [] };
		if ((this.request.get['user_token']) && (this.session.data['user_token']) && (this.request.get['user_token'] == this.session.data['user_token'])) {
			await this.load.language('common/column_left');

			// Create a 3 level menu array
			// Level 2 can not have children

			// Menu
			data['menus'].push({
				'id': 'menu-dashboard',
				'icon': 'fa-dashboard',
				'name': this.language.get('text_dashboard'),
				'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true),
				'children': []
			});

			// Catalog
			let catalog = [];

			if (await this.user.hasPermission('access', 'catalog/category')) {
				catalog.push({
					'name': this.language.get('text_category'),
					'href': await this.url.link('catalog/category', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/product')) {
				catalog.push({
					'name': this.language.get('text_product'),
					'href': await this.url.link('catalog/product', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/recurring')) {
				catalog.push({
					'name': this.language.get('text_recurring'),
					'href': await this.url.link('catalog/recurring', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/filter')) {
				catalog.push({
					'name': this.language.get('text_filter'),
					'href': await this.url.link('catalog/filter', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			// Attributes
			let attribute = [];

			if (await this.user.hasPermission('access', 'catalog/attribute')) {
				attribute.push({
					'name': this.language.get('text_attribute'),
					'href': await this.url.link('catalog/attribute', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/attribute_group')) {
				attribute.push({
					'name': this.language.get('text_attribute_group'),
					'href': await this.url.link('catalog/attribute_group', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (attribute.length) {
				catalog.push({
					'name': this.language.get('text_attribute'),
					'href': '',
					'children': attribute
				});
			}

			if (await this.user.hasPermission('access', 'catalog/option')) {
				catalog.push({
					'name': this.language.get('text_option'),
					'href': await this.url.link('catalog/option', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/manufacturer')) {
				catalog.push({
					'name': this.language.get('text_manufacturer'),
					'href': await this.url.link('catalog/manufacturer', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/download')) {
				catalog.push({
					'name': this.language.get('text_download'),
					'href': await this.url.link('catalog/download', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/review')) {
				catalog.push({
					'name': this.language.get('text_review'),
					'href': await this.url.link('catalog/review', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'catalog/information')) {
				catalog.push({
					'name': this.language.get('text_information'),
					'href': await this.url.link('catalog/information', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (catalog.length) {
				data['menus'].push({
					'id': 'menu-catalog',
					'icon': 'fa-tags',
					'name': this.language.get('text_catalog'),
					'href': '',
					'children': catalog
				});
			}

			// Extension
			let marketplace = [];

			if (await this.user.hasPermission('access', 'marketplace/marketplace')) {
				marketplace.push({
					'name': this.language.get('text_marketplace'),
					'href': await this.url.link('marketplace/marketplace', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'marketplace/installer')) {
				marketplace.push({
					'name': this.language.get('text_installer'),
					'href': await this.url.link('marketplace/installer', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'marketplace/extension')) {
				marketplace.push({
					'name': this.language.get('text_extension'),
					'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'marketplace/modification')) {
				marketplace.push({
					'name': this.language.get('text_modification'),
					'href': await this.url.link('marketplace/modification', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'marketplace/event')) {
				marketplace.push({
					'name': this.language.get('text_event'),
					'href': await this.url.link('marketplace/event', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (marketplace.length) {
				data['menus'].push({
					'id': 'menu-extension',
					'icon': 'fa-puzzle-piece',
					'name': this.language.get('text_extension'),
					'href': '',
					'children': marketplace
				});
			}

			// Design
			let design = [];

			if (await this.user.hasPermission('access', 'design/layout')) {
				design.push({
					'name': this.language.get('text_layout'),
					'href': await this.url.link('design/layout', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'design/theme')) {
				design.push({
					'name': this.language.get('text_theme'),
					'href': await this.url.link('design/theme', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'design/translation')) {
				design.push({
					'name': this.language.get('text_language_editor'),
					'href': await this.url.link('design/translation', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'design/banner')) {
				design.push({
					'name': this.language.get('text_banner'),
					'href': await this.url.link('design/banner', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'design/seo_url')) {
				design.push({
					'name': this.language.get('text_seo_url'),
					'href': await this.url.link('design/seo_url', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (design.length) {
				data['menus'].push({
					'id': 'menu-design',
					'icon': 'fa-television',
					'name': this.language.get('text_design'),
					'href': '',
					'children': design
				});
			}

			// Sales
			let sale = [];

			if (await this.user.hasPermission('access', 'sale/order')) {
				sale.push({
					'name': this.language.get('text_order'),
					'href': await this.url.link('sale/order', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'sale/recurring')) {
				sale.push({
					'name': this.language.get('text_order_recurring'),
					'href': await this.url.link('sale/recurring', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'sale/return')) {
				sale.push({
					'name': this.language.get('text_return'),
					'href': await this.url.link('sale/return', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			// Voucher
			let voucher = [];

			if (await this.user.hasPermission('access', 'sale/voucher')) {
				voucher.push({
					'name': this.language.get('text_voucher'),
					'href': await this.url.link('sale/voucher', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'sale/voucher_theme')) {
				voucher.push({
					'name': this.language.get('text_voucher_theme'),
					'href': await this.url.link('sale/voucher_theme', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (voucher.length) {
				sale.push({
					'name': this.language.get('text_voucher'),
					'href': '',
					'children': voucher
				});
			}

			if (sale.length) {
				data['menus'].push({
					'id': 'menu-sale',
					'icon': 'fa-shopping-cart',
					'name': this.language.get('text_sale'),
					'href': '',
					'children': sale
				});
			}

			// Customer
			let customer = [];

			if (await this.user.hasPermission('access', 'customer/customer')) {
				customer.push({
					'name': this.language.get('text_customer'),
					'href': await this.url.link('customer/customer', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'customer/customer_group')) {
				customer.push({
					'name': this.language.get('text_customer_group'),
					'href': await this.url.link('customer/customer_group', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'customer/customer_approval')) {
				customer.push({
					'name': this.language.get('text_customer_approval'),
					'href': await this.url.link('customer/customer_approval', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'customer/custom_field')) {
				customer.push({
					'name': this.language.get('text_custom_field'),
					'href': await this.url.link('customer/custom_field', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (customer.length) {
				data['menus'].push({
					'id': 'menu-customer',
					'icon': 'fa-user',
					'name': this.language.get('text_customer'),
					'href': '',
					'children': customer
				});
			}

			// Marketing
			let marketing = [];

			if (await this.user.hasPermission('access', 'marketing/marketing')) {
				marketing.push({
					'name': this.language.get('text_marketing'),
					'href': await this.url.link('marketing/marketing', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'marketing/coupon')) {
				marketing.push({
					'name': this.language.get('text_coupon'),
					'href': await this.url.link('marketing/coupon', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'marketing/contact')) {
				marketing.push({
					'name': this.language.get('text_contact'),
					'href': await this.url.link('marketing/contact', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (marketing.length) {
				data['menus'].push({
					'id': 'menu-marketing',
					'icon': 'fa-share-alt',
					'name': this.language.get('text_marketing'),
					'href': '',
					'children': marketing
				});
			}

			// System
			let system = [];

			if (await this.user.hasPermission('access', 'setting/setting')) {
				system.push({
					'name': this.language.get('text_setting'),
					'href': await this.url.link('setting/store', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			// Users
			let user = [];

			if (await this.user.hasPermission('access', 'user/user')) {
				user.push({
					'name': this.language.get('text_users'),
					'href': await this.url.link('user/user', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'user/user_permission')) {
				user.push({
					'name': this.language.get('text_user_group'),
					'href': await this.url.link('user/user_permission', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'user/api')) {
				user.push({
					'name': this.language.get('text_api'),
					'href': await this.url.link('user/api', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (user.length) {
				system.push({
					'name': this.language.get('text_users'),
					'href': '',
					'children': user
				});
			}

			// Localisation
			let localisation = [];

			if (await this.user.hasPermission('access', 'localisation/location')) {
				localisation.push({
					'name': this.language.get('text_location'),
					'href': await this.url.link('localisation/location', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/language')) {
				localisation.push({
					'name': this.language.get('text_language'),
					'href': await this.url.link('localisation/language', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/currency')) {
				localisation.push({
					'name': this.language.get('text_currency'),
					'href': await this.url.link('localisation/currency', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/stock_status')) {
				localisation.push({
					'name': this.language.get('text_stock_status'),
					'href': await this.url.link('localisation/stock_status', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/order_status')) {
				localisation.push({
					'name': this.language.get('text_order_status'),
					'href': await this.url.link('localisation/order_status', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			// Returns
			let returns = [];

			if (await this.user.hasPermission('access', 'localisation/return_status')) {
				returns.push({
					'name': this.language.get('text_return_status'),
					'href': await this.url.link('localisation/return_status', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/return_action')) {
				returns.push({
					'name': this.language.get('text_return_action'),
					'href': await this.url.link('localisation/return_action', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/return_reason')) {
				returns.push({
					'name': this.language.get('text_return_reason'),
					'href': await this.url.link('localisation/return_reason', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (returns.length) {
				localisation.push({
					'name': this.language.get('text_return'),
					'href': '',
					'children': returns
				});
			}

			if (await this.user.hasPermission('access', 'localisation/country')) {
				localisation.push({
					'name': this.language.get('text_country'),
					'href': await this.url.link('localisation/country', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/zone')) {
				localisation.push({
					'name': this.language.get('text_zone'),
					'href': await this.url.link('localisation/zone', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/geo_zone')) {
				localisation.push({
					'name': this.language.get('text_geo_zone'),
					'href': await this.url.link('localisation/geo_zone', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			// Tax
			let tax = [];

			if (await this.user.hasPermission('access', 'localisation/tax_class')) {
				tax.push({
					'name': this.language.get('text_tax_class'),
					'href': await this.url.link('localisation/tax_class', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/tax_rate')) {
				tax.push({
					'name': this.language.get('text_tax_rate'),
					'href': await this.url.link('localisation/tax_rate', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (tax.length) {
				localisation.push({
					'name': this.language.get('text_tax'),
					'href': '',
					'children': tax
				});
			}

			if (await this.user.hasPermission('access', 'localisation/length_class')) {
				localisation.push({
					'name': this.language.get('text_length_class'),
					'href': await this.url.link('localisation/length_class', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'localisation/weight_class')) {
				localisation.push({
					'name': this.language.get('text_weight_class'),
					'href': await this.url.link('localisation/weight_class', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (localisation.length) {
				system.push({
					'name': this.language.get('text_localisation'),
					'href': '',
					'children': localisation
				});
			}

			// Tools
			let maintenance = [];

			if (await this.user.hasPermission('access', 'tool/backup')) {
				maintenance.push({
					'name': this.language.get('text_backup'),
					'href': await this.url.link('tool/backup', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'tool/upload')) {
				maintenance.push({
					'name': this.language.get('text_upload'),
					'href': await this.url.link('tool/upload', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'tool/log')) {
				maintenance.push({
					'name': this.language.get('text_log'),
					'href': await this.url.link('tool/log', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (maintenance.length) {
				system.push({
					'id': 'menu-maintenance',
					'icon': 'fa-cog',
					'name': this.language.get('text_maintenance'),
					'href': '',
					'children': maintenance
				});
			}

			if (system.length) {
				data['menus'].push({
					'id': 'menu-system',
					'icon': 'fa-cog',
					'name': this.language.get('text_system'),
					'href': '',
					'children': system
				});
			}

			let report = [];

			if (await this.user.hasPermission('access', 'report/report')) {
				report.push({
					'name': this.language.get('text_reports'),
					'href': await this.url.link('report/report', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'report/online')) {
				report.push({
					'name': this.language.get('text_online'),
					'href': await this.url.link('report/online', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (await this.user.hasPermission('access', 'report/statistics')) {
				report.push({
					'name': this.language.get('text_statistics'),
					'href': await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true),
					'children': []
				});
			}

			if (report.length) {
				data['menus'].push({
					'id': 'menu-report',
					'icon': 'fa-bar-chart',
					'name': this.language.get('text_reports'),
					'href': '',
					'children': report
				});
			}

			// Stats
			if (await this.user.hasPermission('access', 'report/statistics')) {
				this.load.model('sale/order', this);

				const order_total = await this.model_sale_order.getTotalOrders();

				this.load.model('report/statistics', this);

				const complete_total = await this.model_report_statistics.getValue('order_complete');

				if (complete_total && order_total) {
					data['complete_status'] = Math.round((complete_total / order_total) * 100);
				} else {
					data['complete_status'] = 0;
				}

				const processing_total = await this.model_report_statistics.getValue('order_processing');

				if (processing_total && order_total) {
					data['processing_status'] = Math.round((processing_total / order_total) * 100);
				} else {
					data['processing_status'] = 0;
				}

				const other_total = await this.model_report_statistics.getValue('order_other');

				if (other_total && order_total) {
					data['other_status'] = Math.round((other_total / order_total) * 100);
				} else {
					data['other_status'] = 0;
				}

				data['statistics_status'] = true;
			} else {
				data['statistics_status'] = false;
			}

			return await this.load.view('common/column_left', data);
		}
	}
}
