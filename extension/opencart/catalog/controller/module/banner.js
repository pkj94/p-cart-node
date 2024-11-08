
global['\Opencart\Catalog\Controller\Extension\Opencart\Module\Banner'] = class Banner extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param array setting
	 *
	 * @return string
	 */
	async index(setting) {
		const data = {};
		let module = 0;
		this.load.model('design/banner', this);
		this.load.model('tool/image', this);

		data['banners'] = [];

		const results = await this.model_design_banner.getBanner(setting['banner_id']);

		for (let result of results) {
			if (result['image'] && fs.existsSync(DIR_IMAGE + html_entity_decode(result['image']))) {
				data['banners'].push({
					'title': result['title'],
					'link': result['link'],
					'image': await this.model_tool_image.resize(html_entity_decode(result['image']), setting['width'], setting['height'])
				});
			}
		}

		if (data['banners'].length) {
			data['module'] = module++;

			data['effect'] = setting['effect'];
			data['controls'] = Number(setting['controls']);
			data['indicators'] = Number(setting['indicators']);
			data['items'] = Number(setting['items']);
			data['interval'] = Number(setting['interval']);
			data['width'] = Number(setting['width']);
			data['height'] = Number(setting['height']);
			return await this.load.view('extension/opencart/module/banner', data);
		} else {
			return '';
		}
	}
}
