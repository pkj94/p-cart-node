module.exports = class ControllerExtensionModuleHTML extends Controller {
	async index(setting) {
		if ((setting['module_description'][this.config.get('config_language_id')])) {
			data['heading_title'] = html_entity_decode(setting['module_description'][this.config.get('config_language_id')]['title']);
			data['html'] = html_entity_decode(setting['module_description'][this.config.get('config_language_id')]['description']);

			return await this.load.view('extension/module/html', data);
		}
	}
}