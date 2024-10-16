module.exports = class LanguageController extends Controller {
	constructor(registry) {
		super(registry);
		this.languages = {};
	}
	async index() {
		let code = this.config.get('config_language');
		if ((this.request.get['language'])) {
			code = this.request.get['language'];
		}

		this.load.model('localisation/language', this);

		this.languages = await this.model_localisation_language.getLanguages();

		if ((this.languages[code])) {
			const language_info = this.languages[code];

			// If extension switch add language directory
			if (language_info['extension']) {
				this.language.addPath('extension/' + language_info['extension'], DIR_EXTENSION + language_info['extension'] + '/catalog/language/');
			}

			// Set the config language_id key
			this.config.set('config_language_id', language_info['language_id']);
			this.config.set('config_language', language_info['code']);

			await this.load.language('default');
		}
	}

	// Override the language default values

	/**
	 * @param route
	 * @param prefix
	 * @param code
	 * @param output
	 *
	 * @return void
	 */
	async after(route, prefix, code, output) {
		if (!code) {
			code = this.config.get('config_language');
		}

		// Use this.language.load so it's not triggering infinite loops
		await this.language.load(route, prefix, code);

		if ((this.languages[code])) {
			const language_info = this.languages[code];

			let path = '';

			if (language_info['extension']) {
				let extension = 'extension/' + language_info['extension'];

				if (oc_substr(route, 0, extension.length) != extension) {
					path = extension + '/';
				}
			}

			// Use this.language.load so it's not triggering infinite loops
			this.language.load(path + route, prefix, code);
		}
	}
}
