global['\Opencart\Catalog\Controller\Extension\Opencart\Module\Html'] = class HTML extends global['\Opencart\System\Engine\Controller'] {
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
		if ((setting['module_description'][this.config.get('config_language_id')])) {
			data['heading_title'] = html_entity_decode(setting['module_description'][this.config.get('config_language_id')]['title']);

			data['html'] = html_entity_decode(setting['module_description'][this.config.get('config_language_id')]['description']);

			return await this.load.view('extension/opencart/module/html', data);
		} else {
			return '';
		}
	}
}