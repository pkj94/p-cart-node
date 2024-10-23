module.exports = class LanguageController extends global['\Opencart\System\Engine\Controller'] {
	constructor(registry){
        super(registry);
    }
	async index() {
		const data = {
            languages: []
        };

		this.load.model('localisation/language',this);

		const results = await this.model_localisation_language.getLanguages();
		for (let [key, result] of Object.entries(results)) {
			data['languages'].push({
				'name'  : result['name'],
				'code'  : result['code'],
				'image' : result['image']
            });
		}

		if ((this.request.cookie['language'])) {
			data['code'] = this.request.cookie['language'];
		} else {
			data['code'] = this.config.get('config_language');
		}

		// Redirect
		let url_data = this.request.get;
        let route = 'common/dashboard';
		if ((url_data['route'])) {
			route = url_data['route'];
		} 

		delete url_data['route'];

		let url = '';

		if (url_data) {
			url += '&' + decodeURIComponent(url_data);
		}

		data['redirect'] = await this.url.link(route, url);

		data['user_token'] = this.session.data['user_token'];

		return await this.load.view('common/language', data);
	}

	/**
	 * @return void
	 */
	async save() {
		await  this.load.language('common/language');

		const json = {};
        let code = '';
		if ((this.request.post['code'])) {
			code = this.request.post['code'];
		}
        let redirect = '';
		if ((this.request.post['redirect'])) {
			redirect = htmlspecialchars_decode(this.request.post['redirect']);
		}

		this.load.model('localisation/language',this);

		const language_info = await this.model_localisation_language.getLanguageByCode(code);

		if (!language_info) {
			json['error'] = this.language.get('error_language');
		}

		if (!Object.keys(json).length) {
            // , time() + 60 * 60 * 24 * 365 * 10
			this.response.response.cookie('language', code);

			if (redirect && substr(redirect, 0, strlen(this.config.get('config_url'))) == this.config.get('config_url')) {
				json['redirect'] = redirect;
			} else {
				json['redirect'] = await this.url.link('common/dashboard', 'user_token=' + this.session.data['user_token'], true);
			}
		}

		this.response.addHeader('Content-Type: application/json');
		this.response.setOutput(json);
	}
}
