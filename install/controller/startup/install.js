const fs = require('fs');
const path = require('path');
module.exports = class Install extends Controller {
    constructor(registry) {
        super(registry)
    }
    async index() {
        // Document
        this.registry.set('document', new DocumentLibrary(HTTP_SERVER));
        // URL
        this.registry.set('url', new UrlLibrary(HTTP_SERVER));
        // Language
        if (this.request && this.request.get.language && this.request.get.language !== this.config.get('language_code')) {
            const languageData = [];
            const languages = fs.readdirSync(path.resolve(DIR_LANGUAGE), { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            if (languages.length > 0) {
                languages.forEach(language => {
                    languageData.push(language);
                });
            }
            if (languageData.includes(this.request.get.language)) {
                this.config.set('language_code', this.request.get.language);
            }
        }
        const language = new LanguageLibrary(this.config.get('language_code'));
        language.addPath(DIR_LANGUAGE);
        await language.load(this.config.get('language_code'));
        this.registry.set('language', language);
    }
}