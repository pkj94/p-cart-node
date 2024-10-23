
const path = require('path');
module.exports = class TemplateTemplateLibrary {
    constructor() {
        this.directory = '';
        this.path = {};
    }
    addPath(namespace, directory = '') {
        if (!directory) {
            this.directory = namespace;
        } else {
            this.path[namespace] = directory;
        }
    }
    render(filename, data = {}, code = '') {
        if (!code) {
            let file = path.join(this.directory, `${filename}.tpl`);
            let namespace = '';
            const parts = filename.split('/');
            for (const part of parts) {
                if (!namespace) {
                    namespace += part;
                } else {
                    namespace += `/${part}`;
                }
                if (this.path[namespace]) {
                    file = path.join(this.path[namespace], filename.slice(namespace.length + 1) + '.tpl');
                }
            }
            if (fs.existsSync(file)) {
                code = fs.readFileSync(file, 'utf8');
            } else {
                throw new Error(`Error: Could not load template ${filename}!`);
            }
        }
        if (code) {
            const compiledFile = this.compile(filename, code);
            return new Function(...Object.keys(data), fs.readFileSync(compiledFile, 'utf8'))(...Object.values(data));
        } else {
            return '';
        }
    }
    compile(filename, code) {
        const hash = require('crypto').createHash('md5').update(filename + code).digest('hex');
        const file = path.join(__dirname, '../../../cache/template', `${hash}.js`);
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, code, { flag: 'w' });
        }
        return file;
    }
}
