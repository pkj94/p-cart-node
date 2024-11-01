module.exports = class LanguageController extends global['\Opencart\System\Engine\Controller'] {
    index(route, args) {
        const allLanguages = this.language.all();
        for (const [key, value] of Object.entries(allLanguages)) {
            if (!args[key]) {
                args[key] = value;
            }
        }
    }

    async before(route, args) {
        if (this.language) {
            const data = this.language.all();

            if (data) {
                this.language.set('backup', JSON.stringify(data));
            }
        }
    }

    after(route, args, output) {
        let data = {};
        try {
            data = this.language.get('backup') ? JSON.parse(this.language.get('backup')) : {};
        } catch (e) {
            data = {};
        }
        if (typeof data == 'object') {
            this.language.clear();
            for (const [key, value] of Object.entries(data)) {
                this.language.set(key, value);
            }
        }
    }
}

