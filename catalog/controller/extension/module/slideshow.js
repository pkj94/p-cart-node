module.exports = class ControllerExtensionModuleSlideshow extends Controller {
	async index(setting) {
		const data = {};
		let module = 0;

		this.load.model('design/banner', this);
		this.load.model('tool/image', this);

		this.document.addStyle('catalog/view/javascript/jquery/swiper/css/swiper.min.css');
		this.document.addStyle('catalog/view/javascript/jquery/swiper/css/opencart.css');
		this.document.addScript('catalog/view/javascript/jquery/swiper/js/swiper.jquery.min.js');

		data['banners'] = [];

		const results = await this.model_design_banner.getBanner(setting['banner_id']);

		for (let result of results) {
			if (is_file(DIR_IMAGE + result['image'])) {
				data['banners'].push({
					'title': result['title'],
					'link': result['link'],
					'image': await this.model_tool_image.resize(result['image'], setting['width'], setting['height'])
				});
			}
		}

		data['module'] = module++;

		return await this.load.view('extension/module/slideshow', data);
	}
}