module.exports = class Config {
    constructor() {
        this.data = {};
    }

    get(key) {
        return this.data.hasOwnProperty(key) ? this.data[key] : null;
    }

    set(key, value) {
        this.data[key] = value;
    }

    has(key) {
        return this.data.hasOwnProperty(key);
    }

    load(filename) {
        const file = expressPath.join(DIR_CONFIG, `${filename}.js`);
        // console.log(file)
        if (fs.existsSync(file)) {
            const configData = require(file);
            this.data = { ...this.data, ...configData };
        } else {
            console.error(`Error: Could not load config ${filename}!`);
            process.exit(1);
        }
    }
}