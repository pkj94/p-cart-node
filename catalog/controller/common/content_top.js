module.exports = class ContentTop extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		this.load.model('design/layout', this);
		let route = 'common/home';
		if ((this.request.get['route'])) {
			route = this.request.get['route'];
		}

		let layout_id = 0;

		if (route == 'product/category' && (this.request.get['path'])) {
			this.load.model('catalog/category', this);

			let path = (Array.isArray(this.request.get['path']) ? this.request.get['path'][this.request.get['path'].length - 1] : this.request.get['path']).split('_');

			layout_id = await this.model_catalog_category.getLayoutId(path[path.length - 1]);
		}

		if (route == 'product/product' && (this.request.get['product_id'])) {
			this.load.model('catalog/product', this);

			layout_id = await this.model_catalog_product.getLayoutId(this.request.get['product_id']);
		}

		if (route == 'product/manufacturer.info' && (this.request.get['manufacturer_id'])) {
			this.load.model('catalog/manufacturer', this);

			layout_id = await this.model_catalog_manufacturer.getLayoutId(this.request.get['manufacturer_id']);
		}

		if (route == 'information/information' && (this.request.get['information_id'])) {
			this.load.model('catalog/information', this);

			layout_id = await this.model_catalog_information.getLayoutId(this.request.get['information_id']);
		}

		if (route == 'cms/blog.info' && (this.request.get['blog_id'])) {
			this.load.model('cms/blog', this);

			layout_id = await this.model_cms_blog.getLayoutId(this.request.get['blog_id']);
		}

		if (!layout_id) {
			layout_id = await this.model_design_layout.getLayout(route);
		}

		if (!layout_id) {
			layout_id = this.config.get('config_layout_id');
		}

		this.load.model('setting/module', this);

		data['modules'] = [];

		const modules = await this.model_design_layout.getModules(layout_id, 'content_top');

		for (let module of modules) {
			let part = module['code'].split('.');

			if ((part[1]) && Number(this.config.get('module_' + part[1] + '_status'))) {
				const module_data = await this.load.controller('extension/' + part[0] + '/module/' + part[1]);

				if (module_data.length) {
					data['modules'].push(module_data);
				}
			}
			if ((part[2])) {
				const setting_info = await this.model_setting_module.getModule(part[2]);
				
				if (setting_info.name && Number(setting_info['status'])) {
					const output = await this.load.controller('extension/' + part[0] + '/module/' + part[1], setting_info);

					if (output.length) {
						data['modules'].push(output);
					}
				}
			}
		}

		return await this.load.view('common/content_top', data);
	}
}
