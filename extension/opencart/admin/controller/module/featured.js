module.exports = class FeaturedModuleController extends Controller {
	constructor(registry) {
		super(registry)
	}

	async index() {
		this.load.language('extension/opencart/module/featured');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: [
				{
					text: this.language.get('text_home'),
					href: this.url.link('common/dashboard', `user_token=${this.session.data['user_token']}`)
				},
				{
					text: this.language.get('text_extension'),
					href: this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=module`)
				}
			]
		};

		if (!this.request.get['module_id']) {
			data.breadcrumbs.push({
				text: this.language.get('heading_title'),
				href: this.url.link('extension/opencart/module/featured', `user_token=${this.session.data['user_token']}`)
			});
			data.save = this.url.link('extension/opencart/module/featured.save', `user_token=${this.session.data['user_token']}`);
		} else {
			data.breadcrumbs.push({
				text: this.language.get('heading_title'),
				href: this.url.link('extension/opencart/module/featured', `user_token=${this.session.data['user_token']}&module_id=${this.request.get['module_id']}`)
			});
			data.save = this.url.link('extension/opencart/module/featured.save', `user_token=${this.session.data['user_token']}&module_id=${this.request.get['module_id']}`);
		}

		data.back = this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=module`);

		let module_info;
		if (this.request.get['module_id']) {
			this.load.model('setting/module', this);
			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		data.name = module_info ? module_info.name : '';

		data.products = [];
		const products = module_info && module_info.product ? module_info.product : [];
		this.load.model('catalog/product', this);
		for (const product_id of products) {
			const product_info = this.model_catalog_product.getProduct(product_id);
			if (product_info) {
				data.products.push({
					product_id: product_info.product_id,
					name: product_info.name
				});
			}
		}

		data.axis = module_info && module_info.axis ? module_info.axis : '';
		data.width = module_info && module_info.width ? module_info.width : 200;
		data.height = module_info && module_info.height ? module_info.height : 200;
		data.status = module_info && module_info.status ? module_info.status : '';
		data.module_id = this.request.get['module_id'] ? parseInt(this.request.get['module_id']) : 0;
		data.user_token = this.session.data['user_token'];

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/featured', data));
	}

	async save() {
		await this.load.language('extension/opencart/module/featured');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/module/featured')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		if (this.request.post['name'].length < 3 || this.request.post['name'].length > 64) {
			json.error = { ...json.error, name: this.language.get('error_name') };
		}

		if (!this.request.post['width']) {
			json.error = { ...json.error, width: this.language.get('error_width') };
		}

		if (!this.request.post['height']) {
			json.error = { ...json.error, height: this.language.get('error_height') };
		}
		this.load.model('setting/module', this);
		if (!json.error) {
			if (!this.request.post['module_id']) {
				json.module_id = await this.model_setting_module.addModule('opencart.featured', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.post['module_id'], this.request.post);
			}

			json.success = this.language.get('text_success');
		}

		this.response.setHeader('Content-Type', 'application/json');
		this.response.end(json);
	}
}

