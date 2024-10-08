module.exports = class LanguageController extends Controller {
    constructor(registry) {
        super(registry)
    }
    index(route, args) {
        const languageData = this.language.all();

        for (const [key, value] of Object.entries(languageData)) {
            if (!args[key]) {
                args[key] = value;
            }
        }
    }

    async before(route, args) {
        const data = await this.language.all();

        if (data) {
            this.language.set('backup', JSON.stringify(data));
        }
    }

    after(route, args, output) {
        const data = JSON.parse(this.language.get('backup'));

        if (Array.isArray(data)) {
            this.language.clear();

            for (const [key, value] of Object.entries(data)) {
                this.language.set(key, value);
            }
        }
    }
}

