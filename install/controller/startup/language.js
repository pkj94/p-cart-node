module.exports = class ControllerStartupLanguage extends Controller {
    async index() {
        // Default language code
        let code = this.config.get('language_default');

        let allLanguages = require('glob').sync(DIR_LANGUAGE + '*');
        let languages = [];
        for (let language of allLanguages) {
            languages.push(expressPath.basename(language));
        }

        if (this.request.server.headers['accept-language']) {
            const browser_languages = this.request.server.headers['accept-language'].split(',');

            for (let browser_language of browser_languages) {
                if (languages.includes(browser_language)) {
                    code = browser_language;
                    break;
                }
            }
        }

        if (!this.session.data['language'] || !is_dir(DIR_LANGUAGE + expressPath.basename(this.session.data['language']))) {
            this.session.data['language'] = code;
        }

        // Language
        const language = new Language(this.session.data['language']);
        language.load(this.session.data['language']);
        await this.session.save(this.session.data);
        this.registry.set('language', language);
    }
}
