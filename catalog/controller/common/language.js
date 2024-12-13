const http_build_query = require("locutus/php/url/http_build_query");

module.exports = class ControllerCommonLanguage extends Controller {
	async index() {
		const data = {};
		await this.load.language('common/language');

		data['action'] = await this.url.link('common/language/language', '', this.request.server['HTTPS']);

		data['code'] = this.session.data['language'];

		this.load.model('localisation/language', this);

		data['languages'] = [];

		const results = await this.model_localisation_language.getLanguages();
		for (let [code, result] of Object.entries(results)) {
			if (result['status']) {
				data['languages'].push({
					'name': result['name'],
					'code': result['code']
				});
			}
		}

		if (!(this.request.get['route'])) {
			data['redirect'] = await this.url.link('common/home');
		} else {
			const url_data = this.request.get;

			delete url_data['_route_'];

			const route = url_data['route'];

			delete url_data['route'];

			let url = '';

			if (url_data) {
				url = '&' + decodeURIComponent(http_build_query(url_data, '', '&'));
			}

			data['redirect'] = await this.url.link(route, url, this.request.server['HTTPS']);
		}

		return await this.load.view('common/language', data);
	}

	async language() {
		if ((this.request.post['code'])) {
			this.session.data['language'] = this.request.post['code'];
		}

		if ((this.request.post['redirect']) && (this.request.post['redirect'].indexOf(this.config.get('config_url')) === 0 || this.request.post['redirect'].indexOf(this.config.get('config_ssl')) === 0)) {
			this.response.setRedirect(this.request.post['redirect']);
		} else {
			this.response.setRedirect(await this.url.link('common/home'));
		}
	}
}