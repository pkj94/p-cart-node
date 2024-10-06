const sprintf = require("locutus/php/strings/sprintf");

module.exports = class BestSellerModuleController extends Controller {
	constructor(registry) {
		super(registry)
	}
	async index() {
		await this.load.language('extension/opencart/module/bestseller');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {};
		data.breadcrumbs = [];

		data.breadcrumbs.push({
			text: this.language.get('text_home'),
			href: this.url.link('common/dashboard', 'user_token=' + this.session.data.user_token)
		});

		data.breadcrumbs.push({
			text: this.language.get('text_extension'),
			href: this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module')
		});

		if (!this.request.get['module_id']) {
			data.breadcrumbs.push({
				text: this.language.get('heading_title'),
				href: this.url.link('extension/opencart/module/bestseller', 'user_token=' + this.session.data.user_token)
			});
		} else {
			data.breadcrumbs.push({
				text: this.language.get('heading_title'),
				href: this.url.link('extension/opencart/module/bestseller', 'user_token=' + this.session.data.user_token + '&module_id=' + this.request.get['module_id'])
			});
		}

		if (!this.request.get['module_id']) {
			data.save = this.url.link('extension/opencart/module/bestseller.save', 'user_token=' + this.session.data.user_token);
		} else {
			data.save = this.url.link('extension/opencart/module/bestseller.save', 'user_token=' + this.session.data.user_token + '&module_id=' + this.request.get['module_id']);
		}

		data.back = this.url.link('marketplace/extension', 'user_token=' + this.session.data.user_token + '&type=module');

		let module_info;
		if (this.request.get['module_id']) {
			this.load.model('setting/module', this);
			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		data.name = module_info && module_info.name ? module_info.name : '';
		data.axis = module_info && module_info.axis ? module_info.axis : '';
		data.limit = module_info && module_info.limit ? module_info.limit : 5;
		data.width = module_info && module_info.width ? module_info.width : 200;
		data.height = module_info && module_info.height ? module_info.height : 200;
		data.status = module_info && module_info.status ? module_info.status : '';

		data.module_id = this.request.get['module_id'] ? parseInt(this.request.get['module_id']) : 0;

		data.report = await this.getReport();
		data.user_token = this.session.data.user_token;

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/bestseller', data));
	}

	async save() {
		await this.load.language('extension/opencart/module/bestseller');

		const json = {};

		if (!this.user.hasPermission('modify', 'extension/opencart/module/bestseller')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		if (this.request.post['name'].length < 3 || this.request.post['name'].length > 64) {
			json.error.name = this.language.get('error_name');
		}

		if (!this.request.post['width']) {
			json.error.width = this.language.get('error_width');
		}

		if (!this.request.post['height']) {
			json.error.height = this.language.get('error_height');
		}

		if (!json.error) {
			this.load.model('setting/module', this);

			if (!this.request.post['module_id']) {
				json.module_id = await this.model_setting_module.addModule('opencart.bestseller', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.post['module_id'], this.request.post);
			}

			this.cache.delete('product');

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}

	async install() {
		if (this.user.hasPermission('modify', 'extension/opencart/module/bestseller')) {
			this.load.model('extension/opencart/module/bestseller', this);
			await this.model_extension_opencart_module_bestseller.install();
		}
	}

	async uninstall() {
		if (this.user.hasPermission('modify', 'extension/opencart/module/bestseller')) {
			this.load.model('extension/opencart/module/bestseller', this);
			await this.model_extension_opencart_module_bestseller.uninstall();
		}
	}

	async report() {
		await this.load.language('extension/opencart/module/bestseller');
		this.response.setOutput(await this.getReport());
	}

	async getReport() {
		let page = this.request.get['page'] && this.request.get['route'] === 'extension/opencart/module/bestseller.report' ? parseInt(this.request.get['page']) : 1;
		const limit = 10;
		const data = { reports: [] };

		this.load.model('extension/opencart/module/bestseller', this);
		this.load.model('catalog/product', this);

		const results = await this.model_extension_opencart_module_bestseller.getReports((page - 1) * limit, limit);

		results.forEach(async result : {
			const product_info = await this.model_catalog_product.getProduct(result.product_id);
			const product = product_info ? product_info.name : '';

			data.reports.push({
				product: product,
				total: result.total,
				edit: this.url.link('catalog/product.edit', 'user_token=' + this.session.data.user_token + '&product_id=' + result.product_id)
			});
		});

		const report_total = await this.model_extension_opencart_module_bestseller.getTotalReports();

		data.pagination = await this.load.controller('common/pagination', {
			total: report_total,
			page: page,
			limit: limit,
			url: this.url.link('extension/opencart/module/bestseller.report', 'user_token=' + this.session.data.user_token + '&page={page}')
		});

		data.results = sprintf(this.language.get('text_pagination'), report_total ? ((page - 1) * limit) + 1 : 0, (((page - 1) * limit) > (report_total - limit)) ? report_total : (((page - 1) * limit) + limit), report_total, Math.ceil(report_total / limit));

		return await this.load.view('extension/opencart/module/bestseller_report', data);
	}

	async sync() {
		await this.load.language('extension/opencart/module/bestseller');

		const json = {};
		let page = this.request.get['page'] ? parseInt(this.request.get['page']) : 1;

		if (!this.user.hasPermission('modify', 'extension/opencart/module/bestseller')) {
			json.error = this.language.get('error_permission');
		}

		if (!json.error) {
			this.load.model('extension/opencart/module/bestseller', this);
			this.load.model('catalog/product', this);
			this.load.model('sale/order', this);

			const total = await this.model_catalog_product.getTotalProducts();
			const limit = 10;

			const start = (page - 1) * limit;
			const end = start > (total - limit) ? total : (start + limit);

			const product_data = {
				start: (page - 1) * limit,
				limit: limit
			};

			const results = await this.model_catalog_product.getProducts(product_data);

			results.forEach(async result : {
				const product_total = await this.model_sale_order.getTotalProductsByProductId(result.product_id);

				if (product_total) {
					await this.model_extension_opencart_module_bestseller.editTotal(result.product_id, product_total);
				} else {
					await this.model_extension_opencart_module_bestseller.delete(result.product_id);
				}
			});

			if (end < total) {
				json.text = sprintf(this.language.get('text_next'), end, total);
				json.next = this.url.link('extension/opencart/module/bestseller.sync', 'user_token=' + this.session.data.user_token + '&page=' + (page + 1), true);
			} else {
				json.success = sprintf(this.language.get('text_next'), end, total);
				json.next = '';
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}

