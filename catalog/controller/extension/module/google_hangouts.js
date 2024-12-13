module.exports = class ControllerExtensionModuleGoogleHangouts extends Controller {
	async index() {
const data = {};
		await this.load.language('extension/module/google_hangouts');

		if (this.request.server['HTTPS']) {
			data['code'] = str_replace('http', 'https', html_entity_decode(this.config.get('module_google_hangouts_code')));
		} else {
			data['code'] = html_entity_decode(this.config.get('module_google_hangouts_code'));
		}

		return await this.load.view('extension/module/google_hangouts', data);
	}
}