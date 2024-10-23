
global['\Opencart\System\Engine\Config'] = class Config {
    directory = '';
    path = {};
    data = {};
    constructor() {
    }
    addPath(namespace, directory = '') {
        if (!directory) {
            this.directory = namespace;
        } else {
            $this.path[namespace] = directory;
        }
    }
    set(key, value) {
        this.data[key] = value;
    }
    get(key) {
        return this.data[key]
    }
    has(key) {
        return this.data[key] ? true : false;
    }
    load(filename) {
        return new Promise(async (resolve, reject) => {
            let file = this.directory + filename + '.js';
            let namespace = '';
            let parts = filename.split('/');

            for (let part of parts) {
                if (!namespace) {
                    namespace += part;
                } else {
                    namespace += '/' + part;
                }
                if (this.path[namespace]) {
                    file = this.path[namespace] + filename.substring(namespace.length) + '.js';
                }
            }
            if (fs.lstatSync(file).isFile()) {
                let data = require(file);
                this.data = Object.assign({}, this.data, data);
                resolve(this.data);
            } else {
                resolve([]);
            }
        })
    }
}