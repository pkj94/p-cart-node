<?php
namespace Opencart\Catalog\Controller\Extension\Opencart\Module;
/**
 * Class Banner
 *
 * @package
 */
class BannerController extends Controller {
	constructor(registry) {
		super(registry)
	}
	/**
	 * @param array $setting
	 *
	 * @return string
	 */
	async index(array $setting) {
		static $module = 0;

		this.load.model('design/banner');
		this.load.model('tool/image');

		data['banners'] = [];

		const results = await this.model_design_banner.getBanner($setting['banner_id']);

		for(let result of results) {
			if (is_file(DIR_IMAGE . html_entity_decode(result['image']))) {
				data['banners'].push({
					'title' : result['title'],
					'link'  : result['link'],
					'image' : this.model_tool_image.resize(html_entity_decode(result['image']), $setting['width'], $setting['height'])
				];
			}
		}

		if (data['banners']) {
			data['module'] = $module++;

			data['effect'] = $setting['effect'];
			data['controls'] = $setting['controls'];
			data['indicators'] = $setting['indicators'];
			data['items'] = $setting['items'];
			data['interval'] = $setting['interval'];
			data['width'] = $setting['width'];
			data['height'] = $setting['height'];

			return await this.load.view('extension/opencart/module/banner', data);
		} else {
			return '';
		}
	}
}
