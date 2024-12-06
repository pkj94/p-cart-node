module.exports = class ControllerReportStatistics extends Controller {
	error = {};

	async index() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		await this.getList();
	}

	async ordersale() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('sale/order', this);

			await this.model_report_statistics.editValue('order_sale', await this.model_sale_order.getTotalSales({ 'filter_order_status': [...this.config.get('config_complete_status'), ...this.config.get('config_processing_status')].join(',') }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async orderprocessing() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('sale/order', this);

			await this.model_report_statistics.editValue('order_processing', await this.model_sale_order.getTotalOrders({ 'filter_order_status': this.config.get('config_processing_status').join(',') }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async ordercomplete() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('sale/order', this);

			await this.model_report_statistics.editValue('order_complete', await this.model_sale_order.getTotalOrders({ 'filter_order_status': this.config.get('config_complete_status').join(',') }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async orderother() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('localisation/order_status', this);

			const order_status_data = [];

			const results = await this.model_localisation_order_status.getOrderStatuses();

			for (let result of results) {
				if (![...this.config.get('config_complete_status'), ...this.config.get('config_processing_status')].includes(result['order_status_id'])) {
					order_status_data.push(result['order_status_id']);
				}
			}

			this.load.model('sale/order', this);

			await this.model_report_statistics.editValue('order_other', await this.model_sale_order.getTotalOrders({ 'filter_order_status': order_status_data.join(',') }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async returns() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('sale/return', this);

			await this.model_report_statistics.editValue('return', await this.model_sale_return.getTotalReturns({ 'filter_return_status_id': this.config.get('config_return_status_id') }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async customer() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('customer/customer', this);

			await this.model_report_statistics.editValue('customer', await this.model_customer_customer.getTotalCustomers({ 'filter_approved': 0 }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async affiliate() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('customer/customer', this);

			await this.model_report_statistics.editValue('affiliate', await this.model_customer_customer.getTotalAffiliates({ 'filter_approved': 0 }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async product() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('catalog/product', this);

			await this.model_report_statistics.editValue('product', await this.model_catalog_product.getTotalProducts({ 'filter_quantity': 0 }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async review() {
		await this.load.language('report/statistics');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('report/statistics', this);

		if (await this.validate()) {
			this.load.model('catalog/review', this);

			await this.model_report_statistics.editValue('review', await this.model_catalog_review.getTotalReviews({ 'filter_status': 0 }));

			this.session.data['success'] = this.language.get('text_success');
			await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true));
		} else
			await this.getList();
	}

	async getList() {
		const data = {};
		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('report/statistics', 'user_token=' + this.session.data['user_token'], true)
		});

		data['statistics'] = [];

		this.load.model('report/statistics', this);

		const results = await this.model_report_statistics.getStatistics();

		for (let result of results) {
			data['statistics'].push({
				'name': this.language.get('text_' + result['code']),
				'value': result['value'],
				'href': await this.url.link('report/statistics/' + result['code'].replaceAll('_', ''), 'user_token=' + this.session.data['user_token'], true)
			});
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}
		if ((this.session.data['success'])) {
			data['success'] = this.session.data['success'];

			delete this.session.data['success'];
		} else {
			data['success'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');
		await this.session.save(this.session.data)
		this.response.setOutput(await this.load.view('report/statistics', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'report/statistics')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length ? false : true
	}
}