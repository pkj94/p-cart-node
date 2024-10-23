
const path = require('path');
global['\Opencart\Install\Controller\Startup\Install'] = class Install extends global['\Opencart\System\Engine\Controller'] {
    constructor(registry) {
        super(registry)
    }
    async index() {
        // Document
        this.registry.set('document', new global['\Opencart\System\Library\Document'](HTTP_SERVER));
        // URL
        this.registry.set('url', new global['\Opencart\System\Library\Url'](HTTP_SERVER));
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
        const language = new global['\Opencart\System\Library\Language'](this.config.get('language_code'));
        language.addPath(DIR_LANGUAGE);
        await language.load(this.config.get('language_code'));
        this.registry.set('language', language);
    }
}