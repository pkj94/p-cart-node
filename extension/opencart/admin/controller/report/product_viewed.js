const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Admin\Controller\Extension\Opencart\Report\ProductViewed'] = class ProductViewed extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @return void
	 */
	async index() {
		const data = {};
		await this.load.language('extension/opencart/report/product_viewed');

		this.document.setTitle(this.language.get('heading_title'));

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text': this.language.get('text_home'),
			'href': await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'])
		});

		data['breadcrumbs'].push({
			'text': this.language.get('text_extension'),
			'href': await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report')
		});

		data['breadcrumbs'].push({
			'text': this.language.get('heading_title'),
			'href': await this.url.link('extension/opencart/report/product_viewed', 'user_token=' + this.session.data['user_token'])
		});

		data['save'] = await this.url.link('extension/opencart/report/product_viewed.save', 'user_token=' + this.session.data['user_token']);
		data['back'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=report');

		data['report_product_viewed_status'] = this.config.get('report_product_viewed_status');
		data['report_product_viewed_sort_order'] = this.config.get('report_product_viewed_sort_order');

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/report/product_viewed_form', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/report/product_viewed');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/product_viewed')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('setting/setting', this);

			await this.model_setting_setting.editSetting('report_product_viewed', this.request.post);

			json['success'] = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	/**
	 * @return void
	 */
	async install() {
		if (await this.user.hasPermission('modify', 'extension/report')) {
			this.load.model('extension/opencart/report/product_viewed', this);

			await this.model_extension_opencart_report_product_viewed.install();
		}
	}

	/**
	 * @return void
	 */
	async uninstall() {
		if (await this.user.hasPermission('modify', 'extension/report')) {
			this.load.model('extension/opencart/report/product_viewed', this);

			await this.model_extension_opencart_report_product_viewed.uninstall();
		}
	}

	/**
	 * @return void
	 */
	async report() {
		await this.load.language('extension/opencart/report/product_viewed');

		const data = {
			list: await this.getReport()
		}

		data['user_token'] = this.session.data['user_token'];

		this.response.setOutput(await this.load.view('extension/opencart/report/product_viewed', data));
	}

	/**
	 * @return void
	 */
	async list() {
		await this.load.language('extension/opencart/report/product_viewed');

		this.response.setOutput(await this.getReport());
	}

	/**
	 * @return string
	 */
	async getReport() {
		const data = {};
		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		data['products'] = [];

		this.load.model('extension/opencart/report/product_viewed', this);
		this.load.model('catalog/product', this);

		const total = await this.model_extension_opencart_report_product_viewed.getTotal();

		const viewed_total = await this.model_extension_opencart_report_product_viewed.getTotalViewed();

		const results = await this.model_extension_opencart_report_product_viewed.getViewed((page - 1) * this.config.get('config_pagination'), this.config.get('config_pagination'));

		for (let result of results) {
			const product_info = await this.model_catalog_product.getProduct(result['product_id']);

			if (product_info) {
				let percent = 0;
				if (result['viewed']) {
					percent = Math.round((result['viewed'] / total) * 100, 2);
				}

				data['products'].push({
					'name': product_info['name'],
					'model': product_info['model'],
					'viewed': result['viewed'],
					'percent': percent + '%'
				});
			}
		}

		let url = '';

		if ((this.request.get['page'])) {
			url += '&page=' + this.request.get['page'];
		}

		data['pagination'] = await this.load.controller('common/pagination', {
			'total': viewed_total,
			'page': page,
			'limit': this.config.get('config_pagination'),
			'url': await this.url.link('extension/opencart/report/product_viewed.list', 'user_token=' + this.session.data['user_token'] + '&code=product_viewed&page={page}')
		});

		data['results'] = sprintf(this.language.get('text_pagination'), (viewed_total) ? ((page - 1) * this.config.get('config_pagination')) + 1 : 0, (((page - 1) * this.config.get('config_pagination')) > (viewed_total - this.config.get('config_pagination'))) ? viewed_total : (((page - 1) * this.config.get('config_pagination')) + this.config.get('config_pagination')), viewed_total, Math.ceil(viewed_total / this.config.get('config_pagination')));

		return await this.load.view('extension/opencart/report/product_viewed_list', data);
	}

	/**
	 * @return void
	 */
	async generate() {
		await this.load.language('extension/opencart/report/product_viewed');

		const json = {};

		let page = 1;
		if (this.request.get['page']) {
			page = Number(this.request.get['page']);
		}

		let limit = 10;

		if (!await this.user.hasPermission('modify', 'extension/opencart/report/product_viewed')) {
			json['error'] = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('extension/opencart/report/product_viewed', this);

			if (page == 1) {
				await this.model_extension_opencart_report_product_viewed.clear();
			}

			const filter_data = {
				'start': (page - 1) * limit,
				'limit': limit
			};

			this.load.model('catalog/product', this);

			const product_total = await this.model_catalog_product.getTotalProducts();

			const products = await this.model_catalog_product.getProducts(filter_data);

			for (let product of products) {
				await this.model_extension_opencart_report_product_viewed.addReport(product['product_id'], await this.model_catalog_product.getTotalReports(product['product_id']));
			}

			if ((page * limit) <= product_total) {
				json['text'] = sprintf(this.language.get('text_progress'), (page - 1) * limit, product_total);

				json['next'] = await this.url.link('extension/opencart/report/product_viewed.generate', 'user_token=' + this.session.data['user_token'] + '&page=' + (page + 1), true);
			} else {
				json['success'] = this.language.get('text_success');
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
