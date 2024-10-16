/**
 * Class Banner
 *
 * @package Opencart\Admin\Controller\Extension\Opencart\Module
 */
module.exports = class BannerModuleController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		await this.load.language('extension/opencart/module/banner');

		this.document.setTitle(this.language.get('heading_title'));

		const data = {
			breadcrumbs: [
				{
					text: this.language.get('text_home'),
					href: await this.url.link('common/dashboard', `user_token=${this.session.data['user_token']}`)
				},
				{
					text: this.language.get('text_extension'),
					href: await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=module`)
				}
			]
		};

		if (!this.request.get['module_id']) {
			data.breadcrumbs.push({
				text: this.language.get('heading_title'),
				href: await this.url.link('extension/opencart/module/banner', `user_token=${this.session.data['user_token']}`)
			});
		} else {
			data.breadcrumbs.push({
				text: this.language.get('heading_title'),
				href: await this.url.link('extension/opencart/module/banner', `user_token=${this.session.data['user_token']}&module_id=${this.request.get['module_id']}`)
			});
		}

		data.save = !this.request.get['module_id'] ?
			await this.url.link('extension/opencart/module/banner.save', `user_token=${this.session.data['user_token']}`) :
			await this.url.link('extension/opencart/module/banner.save', `user_token=${this.session.data['user_token']}&module_id=${this.request.get['module_id']}`);

		data.back = await this.url.link('marketplace/extension', `user_token=${this.session.data['user_token']}&type=module`);

		let module_info;
		if (this.request.get['module_id']) {
			this.load.model('setting/module', this);
			module_info = await this.model_setting_module.getModule(this.request.get['module_id']);
		}

		data.name = module_info?.name || '';
		data.banner_id = module_info?.banner_id || '';

		this.load.model('design/banner', this);
		data.banners = await this.model_design_banner.getBanners();

		data.effect = module_info?.effect || '';
		data.items = module_info?.items || 4;
		data.controls = module_info?.controls || '';
		data.indicators = module_info?.indicators || '';
		data.interval = module_info?.interval || 5000;
		data.width = module_info?.width || '';
		data.height = module_info?.height || '';
		data.status = module_info?.status || '';

		data.module_id = this.request.get['module_id'] ? parseInt(this.request.get['module_id']) : 0;

		data.header = await this.load.controller('common/header');
		data.column_left = await this.load.controller('common/column_left');
		data.footer = await this.load.controller('common/footer');

		this.response.setOutput(await this.load.view('extension/opencart/module/banner', data));
	}

	/**
	 * @return void
	 */
	async save() {
		await this.load.language('extension/opencart/module/banner');

		const json = {};

		if (!await this.user.hasPermission('modify', 'extension/opencart/module/banner')) {
			json.error = { warning: this.language.get('error_permission') };
		}

		if (this.request.post['name'].length < 3 || this.request.post['name'].length > 64) {
			json.error = { ...json.error, name: this.language.get('error_name') };
		}

		if (!this.request.post['interval']) {
			json.error = { ...json.error, interval: this.language.get('error_interval') };
		}

		if (!this.request.post['width']) {
			json.error = { ...json.error, width: this.language.get('error_width') };
		}

		if (!this.request.post['height']) {
			json.error = { ...json.error, height: this.language.get('error_height') };
		}

		if (!json.error) {
			this.load.model('setting/module', this);
			this.request.post.module_id = Number(this.request.post.module_id);
			if (!this.request.post['module_id']) {
				json.module_id = await this.model_setting_module.addModule('opencart.banner', this.request.post);
			} else {
				await this.model_setting_module.editModule(this.request.post['module_id'], this.request.post);
			}

			json.success = this.language.get('text_success');
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}


