const fs = require('fs');
module.exports = class LanguageLibrary {
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
        return this.data[key] || key;
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
        return new Promise((resolve, reject) => {
            if (!code) {
                code = this.code;
            }
            if (!this.cache[code]) {
                this.cache[code] = {};
            }
            let fileContent = {};
            if (!this.cache[code][filename]) {
                const filePath = `${this.directory}${code}/${filename}.js`;
                const namespaceParts = filename.split('/');
                let namespace = '';
                // console.log('namespaceParts-----', namespaceParts, namespace)
                for (const part of namespaceParts) {
                    if (!namespace) {
                        namespace += part;
                    } else {
                        namespace += '/' + part;
                    }
                    // console.log('namespace-----', namespace, this.path)

                    if (this.path[namespace]) {
                        const nsFilePath = `${this.path[namespace]}${code}${filename.slice(namespace.length)}.js`;
                        // console.log('nsFilePath----', nsFilePath)
                        if (fs.existsSync(nsFilePath)) {
                            let _language = require(nsFilePath);
                            fileContent = _language;
                        }
                    }
                }

                if (fs.existsSync(filePath)) {
                    let _language = require(filePath);
                    fileContent = _language;
                }
                this.cache[code][filename] = fileContent;
            } else {
                fileContent = this.cache[code][filename];
            }
            if (prefix) {
                const prefixedContent = {};
                for (const [key, value] of Object.entries(fileContent)) {
                    prefixedContent[`${prefix}_${key}`] = value;
                }
                fileContent = prefixedContent;
            }
            this.data = { ...this.data, ...fileContent };
            resolve(this.data);
        });
    }
}
