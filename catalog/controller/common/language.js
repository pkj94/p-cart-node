module.exports = class LanguageController extends Controller {
	/**
	 * @return string
	 */
	async index() {
		const data = {};
		await this.load.language('common/language');

		let url_data = this.request.get;
		let route = this.config.get('action_default');
		if ((url_data['route'])) {
			route = url_data['route'];
		}

		delete url_data['route'];
		delete url_data['_route_'];
		delete url_data['language'];

		let url = '';

		if (url_data) {
			url += '&' + decodeURIComponent(http_build_query(url_data));
		}

		// Added so the correct SEO language URL is used+
		let language_id = this.config.get('config_language_id');

		data['languages'] = [];

		this.load.model('localisation/language', this);

		const results = await this.model_localisation_language.getLanguages();
		for (let [code, result] of Object.entries(results)) {
			this.config.set('config_language_id', result['language_id']);

			data['languages'].push({
				'name': result['name'],
				'code': result['code'],
				'image': result['image'],
				'href': await this.url.link(route, 'language=' + result['code'] + url, true)
			});
		}

		this.config.set('config_language_id', language_id);

		data['code'] = this.config.get('config_language');

		return await this.load.view('common/language', data);
	}
}
