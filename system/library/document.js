module.exports = class Document {
    title;
    description;
    keywords;

    links = {};
    styles = {};
    scripts = {};

    /**
     * 
     *
     * @param	string	title
     */
    setTitle(title) {
        this.title = title;
    }

    /**
     * 
     * 
     * @return	string
     */
    getTitle() {
        return this.title;
    }

    /**
     * 
     *
     * @param	string	description
     */
    setDescription(description) {
        this.description = description;
    }

    /**
     * 
     *
     * @param	string	description
     * 
     * @return	string
     */
    getDescription() {
        return this.description;
    }

    /**
     * 
     *
     * @param	string	keywords
     */
    setKeywords(keywords) {
        this.keywords = keywords;
    }

    /**
     *
     * 
     * @return	string
     */
    getKeywords() {
        return this.keywords;
    }

    /**
     * 
     *
     * @param	string	href
     * @param	string	rel
     */
    addLink(href, rel) {
        this.links[href] = {
            'href': href,
            'rel': rel
        };
    }

    /**
     * 
     * 
     * @return	array
     */
    getLinks() {
        return this.links;
    }

    /**
     * 
     *
     * @param	string	href
     * @param	string	rel
     * @param	string	media
     */
    addStyle(href, rel = 'stylesheet', media = 'screen', position = 'header') {
        this.styles[position] = this.styles[position] || {};
        this.styles[position][href] = {
            'href': href,
            'rel': rel,
            'media': media
        };
    }

    /**
     * 
     * 
     * @return	array
     */
    getStyles(position = 'header') {
        if ((this.styles[position])) {
            return this.styles[position];
        } else {
            return [];
        }
    }

    /**
     * 
     *
     * @param	string	href
     * @param	string	position
     */
    addScript(href, position = 'header') {
        this.scripts[position] = this.scripts[position] || {};
        this.scripts[position][href] = href;
    }

    /**
     * 
     *
     * @param	string	position
     * 
     * @return	array
     */
    getScripts(position = 'header') {
        if ((this.scripts[position])) {
            return this.scripts[position];
        } else {
            return [];
        }
    }
}