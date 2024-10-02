const fs = require('fs');
const Language = require('../../../system/library/language');
module.exports = class LanguageController extends Controller {
    constructor(registry) {
        super(registry);
    }
    async index() {
        await this.load.language('common/language');
        const data = {
            text_language: this.language.get('text_language')
        };
        let route = this.request.get.route || this.config.get('action_default');
        data.code = this.request.get.language || this.config.get('language_code');
        data.languages = [];
        const languages = fs.readdirSync(DIR_LANGUAGE, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        for (const code of languages) {
            const language = new Language(code);
            language.addPath(DIR_LANGUAGE);
            await language.load(code);
            data.languages.push({
                text: language.get('text_name'),
                code: code,
                href: this.url.link(route, { language: code })
            });
        }
        return await this.load.view('common/language', data);
    }
}
