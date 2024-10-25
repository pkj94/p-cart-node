module.exports = class Language {
    constructor(code) {
        this.code = code;
        this.directory = '';
        this.path = {};
        this.data = {};
        this.cache = {};
    }

    addPath(namespace, directory = '') {
        if (!directory) {
            this.directory = namespace;
        } else {
            this.path[namespace] = directory;
        }
    }

    get(key) {
        return this.data[key] !== undefined ? this.data[key] : key;
    }

    set(key, value) {
        this.data[key] = value;
    }

    all(prefix = '') {
        if (!prefix) {
            return this.data;
        }
        const result = {};
        const length = prefix.length;
        for (const [key, value] of Object.entries(this.data)) {
            if (key.startsWith(prefix)) {
                result[key.slice(length + 1)] = value;
            }
        }
        return result;
    }

    clear() {
        this.data = {};
    }

    load(filename, prefix = '', code = '') {
        code = code || this.code;

        if (!this.cache[code]) {
            this.cache[code] = {};
        }

        let data = {};
        if (!this.cache[code][filename]) {
            let filePath = `${this.directory}${code}/${filename}.js`;

            // Handle namespace paths
            let namespace = '';
            const parts = filename.split('/');
            for (const part of parts) {
                namespace = namespace ? `${namespace}/${part}` : part;
                if (this.path[namespace]) {
                    filePath = `${this.path[namespace]}${code}${filename.slice(namespace.length)}.js`;
                }
            }

            if (fs.existsSync(filePath)) {
                data = require(filePath); // Assuming the language files export an object
            }

            this.cache[code][filename] = data;
        } else {
            data = this.cache[code][filename];
        }

        if (prefix) {
            const prefixedData = {};
            for (const [key, value] of Object.entries(data)) {
                prefixedData[`${prefix}_${key}`] = value;
            }
            data = prefixedData;
        }

        this.data = { ...this.data, ...data };
        return this.data;
    }
}