module.exports = class ControllerExtensionReportProductViewed extends Controller {
	error = {};

	async index() {
		await this.load.language('extension/report/product_viewed');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/setting',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			await this.model_setting_setting.editSetting('report_product_viewed', this.request.post);

			this.session.data['success'] = this.language.get('text_success');

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true)
		);

		data['breadcrumbs'].push({
			'text' : this.language.get('heading_title'),
			'href' : await this.url.link('extension/report/product_viewed', 'user_token=' + this.session.data['user_token'], true)
		);

		data['action'] = await this.url.link('extension/report/product_viewed', 'user_token=' + this.session.data['user_token'], true);

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report', true);

		if ((this.request.post['report_product_viewed_status'])) {
			data['report_product_viewed_status'] = this.request.post['report_product_viewed_status'];
		} else {
			data['report_product_viewed_status'] = this.config.get('report_product_viewed_status');
		}

		if ((this.request.post['report_product_viewed_sort_order'])) {
			data['report_product_viewed_sort_order'] = this.request.post['report_product_viewed_sort_order'];
		} else {
			data['report_product_viewed_sort_order'] = this.config.get('report_product_viewed_sort_order');
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/report/product_viewed_form', data));
	}
	
	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/report/product_viewed')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		return Object.keys(this.error).length?false:true
	}
		
	async report() {
		await this.load.language('extension/report/product_viewed');

		if ((this.request.get['page'])) {
			page = this.request.get['page'];
		} else {
			page = 1;
		}
		
		data['reset'] = await this.url.link('extension/report/product_viewed/reset', 'user_token=' + this.session.data['user_token'], true);

		this.load.model('extension/report/product');

		filter_data = array(
			'start' : (page - 1) * this.config.get('config_limit_admin'),
			'limit' : this.config.get('config_limit_admin')
		);

		data['products'] = {};

		product_viewed_total = await this.model_extension_report_product.getTotalProductViews();

		product_total = await this.model_extension_report_product.getTotalProductsViewed();

		results = await this.model_extension_report_product.getProductsViewed(filter_data);

		for (let result of results) {
			if (result['viewed']) {
				percent = Math.round(result['viewed'] / product_viewed_total * 100, 2);
			} else {
				percent = 0;
			}

			data['products'].push({
				'name'    : result['name'],
				'model'   : result['model'],
				'viewed'  : result['viewed'],
				'percent' : percent + '%'
			);
		}
		
		data['user_token'] = this.session.data['user_token'];

		url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		pagination = new Pagination();
		pagination.total = product_total;
		pagination.page = page;
		pagination.limit = this.config.get('config_limit_admin');
		pagination.url = await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=product_viewed&page={page}', true);

		data['pagination'] = pagination.render();

		data['results'] = sprintf(this.language.get('text_pagination'), (product_total) ? ((page - 1) * this.config.get('config_limit_admin')) + 1 : 0, (((page - 1) * this.config.get('config_limit_admin')) > (product_total - this.config.get('config_limit_admin'))) ? product_total : (((page - 1) * this.config.get('config_limit_admin')) + this.config.get('config_limit_admin')), product_total, ceil(product_total / this.config.get('config_limit_admin')));
		
		return await this.load.view('extension/report/product_viewed_info', data);
	}

	async reset() {
		await this.load.language('extension/report/product_viewed');

		if (!await this.user.hasPermission('modify', 'extension/report/product_viewed')) {
			this.session.data['error'] = this.language.get('error_permission');
		} else {
			this.load.model('extension/report/product');

			await this.model_extension_report_product.reset();

			this.session.data['success'] = this.language.get('text_success');
		}

		this.response.setRedirect(await this.url.link('report/report', 'user_token=' + this.session.data['user_token'] + '&code=product_viewed', true));
	}
}