module.exports = class ControllerExtensionModuleSlideshow extends Controller {
	error = {};

	async index() {
const data = {};
		await this.load.language('extension/module/slideshow');

		this.document.setTitle(this.language.get('heading_title'));

		this.load.model('setting/module',this);

		if ((this.request.server['method'] == 'POST') && await this.validate()) {
			if (!(this.request.get['module_id'])) {
				await this.model_setting_module.addModule('slideshow', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.get['module_id'], this.request.post);
			}

			this.session.data['success'] = this.language.get('text_success');
await this.session.save(this.session.data);

			this.response.setRedirect(await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true));
		}

		if ((this.error['warning'])) {
			data['error_warning'] = this.error['warning'];
		} else {
			data['error_warning'] = '';
		}

		if ((this.error['name'])) {
			data['error_name'] = this.error['name'];
		} else {
			data['error_name'] = '';
		}

		if ((this.error['width'])) {
			data['error_width'] = this.error['width'];
		} else {
			data['error_width'] = '';
		}

		if ((this.error['height'])) {
			data['error_height'] = this.error['height'];
		} else {
			data['error_height'] = '';
		}

		data['breadcrumbs'] = [];

		data['breadcrumbs'].push({
			'text' : this.language.get('text_home'),
			'href' : await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true)
		});

		data['breadcrumbs'].push({
			'text' : this.language.get('text_extension'),
			'href' : await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true)
		});

		if (!(this.request.get['module_id'])) {
			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('extension/module/slideshow', 'user_token=' + this.session.data['user_token'], true)
			});
		} else {
			data['breadcrumbs'].push({
				'text' : this.language.get('heading_title'),
				'href' : await this.url.link('extension/module/slideshow', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id'], true)
			});
		}

		if (!(this.request.get['module_id'])) {
			data['action'] = await this.url.link('extension/module/slideshow', 'user_token=' + this.session.data['user_token'], true);
		} else {
			data['action'] = await this.url.link('extension/module/slideshow', 'user_token=' + this.session.data['user_token'] + '&module_id=' + this.request.get['module_id'], true);
		}

		data['cancel'] = await this.url.link('marketplace/extension', 'user_token=' + this.session.data['user_token'] + '&type=module', true);
		let module_info;
		if ((this.request.get['module_id']) && (this.request.server['method'] != 'POST')) {
			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		if ((this.request.post['name'])) {
			data['name'] = this.request.post['name'];
		} else if ((module_info)) {
			data['name'] = module_info['name'];
		} else {
			data['name'] = '';
		}

		if ((this.request.post['banner_id'])) {
			data['banner_id'] = this.request.post['banner_id'];
		} else if ((module_info)) {
			data['banner_id'] = module_info['banner_id'];
		} else {
			data['banner_id'] = '';
		}

		this.load.model('design/banner',this);

		data['banners'] = await this.model_design_banner.getBanners();

		if ((this.request.post['width'])) {
			data['width'] = this.request.post['width'];
		} else if ((module_info)) {
			data['width'] = module_info['width'];
		} else {
			data['width'] = '';
		}

		if ((this.request.post['height'])) {
			data['height'] = this.request.post['height'];
		} else if ((module_info)) {
			data['height'] = module_info['height'];
		} else {
			data['height'] = '';
		}

		if ((this.request.post['status'])) {
			data['status'] = this.request.post['status'];
		} else if ((module_info)) {
			data['status'] = module_info['status'];
		} else {
			data['status'] = '';
		}

		data['header'] = await this.load.controller('common/header');
		data['column_left'] = await this.load.controller('common/column_left');
		data['footer'] = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/module/slideshow', data));
	}

	async validate() {
		if (!await this.user.hasPermission('modify', 'extension/module/slideshow')) {
			this.error['warning'] = this.language.get('error_permission');
		}

		if ((oc_strlen(this.request.post['name']) < 3) || (oc_strlen(this.request.post['name']) > 64)) {
			this.error['name'] = this.language.get('error_name');
		}

		if (!this.request.post['width']) {
			this.error['width'] = this.language.get('error_width');
		}

		if (!this.request.post['height']) {
			this.error['height'] = this.language.get('error_height');
		}

		return Object.keys(this.error).length?false:true
	}
}
