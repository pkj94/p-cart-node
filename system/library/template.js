module.exports = class TemplateLibrary {
    constructor(adaptor) {
        if (adaptor) {
            const AdaptorClass = require(`./template/${adaptor}`);
            if (AdaptorClass) {
                this.adaptor = new AdaptorClass();
            } else {
                throw new Error(`Error: Could not load template adaptor ${adaptor}!`);
            }
        } else {
            throw new Error(`Error: Could not load template adaptor ${adaptor}!`);
        }
    }
    addPath(namespace, directory = '') {
        this.adaptor.addPath(namespace, directory);
    }
    render(filename, data = {}, code = '') {
        return this.adaptor.render(filename, data, code);
    }
}
