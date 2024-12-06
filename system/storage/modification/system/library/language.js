module.exports = class Language {
    constructor(directory = '') {
        this.default = 'en-gb';
        this.directory = directory;
        this.data = {};
    }

    get(key) {
        return this.data[key] !== undefined ? this.data[key] : key;
    }

    set(key, value) {
        this.data[key] = value;
    }

    all() {
        return this.data;
    }

    load(filename, key = '') {
        let data = {};

        if (!key) {
            let file = expressPath.join(DIR_LANGUAGE, this.default, `${filename}.js`);

            if (fs.existsSync(file)) {
                data = 
        require(modification(file))
      ;
            }

            file = expressPath.join(DIR_LANGUAGE, this.directory, `${filename}.js`);

            if (fs.existsSync(file)) {
                data = { ...data, ...
        require(modification(file))
       };
            }

            this.data = { ...this.data, ...data };
        } else {
            // Put the language into a sub key
            this.data[key] = new Language(this.directory);
            this.data[key].load(filename);
        }

        return this.data;
    }
}
