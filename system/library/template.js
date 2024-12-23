module.exports = class TemplateLibrary {
    constructor(adaptor) {
        let className = 'Opencart\System\Library\Template' + ucfirst(adaptor);

        if (global[className]) {
            this.adaptor = new global[className]();
        } else {
            throw new Error(`Error: Could not load template adaptor ${adaptor}!`);
        }
    }
    addPath(namespace, directory = '') {
        this.adaptor.addPath(namespace, directory);
    }
    async render(filename, data = {}, code = '') {
        return await this.adaptor.render(filename, data, code);
    }
}
