module.exports = class Document {
    constructor() {
        this.title = '';
        this.description = '';
        this.keywords = '';
        this.links = {};
        this.styles = {};
        this.scripts = { header: {}, footer: {} };
    }
    setTitle(title) {
        this.title = title;
    }
    getTitle() {
        return this.title;
    }
    setDescription(description) {
        this.description = description;
    }
    getDescription() {
        return this.description;
    }
    setKeywords(keywords) {
        this.keywords = keywords;
    }
    getKeywords() {
        return this.keywords;
    }
    addLink(href, rel) {
        this.links[href] = { href, rel };
    }
    getLinks() {
        return this.links;
    }
    addStyle(href, rel = 'stylesheet', media = 'screen') {
        this.styles[href] = { href, rel, media };
    }
    getStyles() {
        return this.styles;
    }
    addScript(href, position = 'header') {
        this.scripts[position][href] = { href };
    }
    getScripts(position = 'header') {
        return this.scripts[position] || {};
    }
}
