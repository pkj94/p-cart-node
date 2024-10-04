module.exports = class LanguageController extends Controller {
	constructor(registry) {
		super(registry)

		this.languages = [];
	}

	async index() {
		let code = this.request.cookie.language || this.config.get('config_language_admin');
		await this.load.model('localisation/language', this);

		this.languages = await this.model_localisation_language.getLanguages();

		if (this.languages[code]) {
			const language_info = this.languages[code];

			if (language_info.extension) {
				this.language.addPath('extension/' + language_info.extension, DIR_EXTENSION + language_info.extension + '/admin/language/');
			}

			this.config.set('config_language_id', language_info.language_id);
			this.config.set('config_language_admin', language_info.code);

			this.language.load('default');
		}
	}

	async after(route, prefix, code, output) {
		code = code || this.config.get('config_language_admin');

		await this.language.load(route, prefix, code);

		if (this.languages[code]) {
			const language_info = this.languages[code];
			let path = '';

			if (language_info.extension) {
				const extension = 'extension/' + language_info.extension;

				if (!route.startsWith(extension)) {
					path = extension + '/';
				}
			}

			await this.language.load(path + route, prefix, code);
		}
	}
}


