module.exports = class ControllerCommonContentBottom extends Controller {
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

			const path = this.request.get['path'].split('_');

			layout_id = await this.model_catalog_category.getCategoryLayoutId(path[path.length - 1]);
		}

		if (route == 'product/product' && (this.request.get['product_id'])) {
			this.load.model('catalog/product', this);

			layout_id = await this.model_catalog_product.getProductLayoutId(this.request.get['product_id']);
		}

		if (route == 'information/information' && (this.request.get['information_id'])) {
			this.load.model('catalog/information', this);

			layout_id = await this.model_catalog_information.getInformationLayoutId(this.request.get['information_id']);
		}

		if (!layout_id) {
			layout_id = await this.model_design_layout.getLayout(route);
		}

		if (!layout_id) {
			layout_id = this.config.get('config_layout_id');
		}

		this.load.model('setting/module', this);

		data['modules'] = [];

		const modules = await this.model_design_layout.getLayoutModules(layout_id, 'content_bottom');

		for (let module of modules) {
			const part = module['code'].split('.');

			if ((part[0]) && Number(this.config.get('module_' + part[0] + '_status'))) {
				const module_data = await this.load.controller('extension/module/' + part[0]);

				if (module_data) {
					data['modules'].push(module_data);
				}
			}

			if ((part[1])) {
				const setting_info = await this.model_setting_module.getModule(part[1]);

				if (setting_info && setting_info['status']) {
					const output = await this.load.controller('extension/module/' + part[0], setting_info);

					if (output) {
						data['modules'].push(output);
					}
				}
			}
		}

		return await this.load.view('common/content_bottom', data);
	}
}
