module.exports = class Template {
    adaptor;
    constructor(adaptor) {
        let className = 'Template' + ucfirst(adaptor);
        if (global[className]) {
            this.adaptor = new (global[className])();
        } else {
            throw new Error('Error: Could not load template adaptor ' + adaptor + '!');
        }
    }

    /**
     * 
     *
     * @param	string	key
     * @param	mixed	value
      */
    set(key, value) {
        this.adaptor.set(key, value);
    }

    /**
     * 
     *
     * @param	string	template
     * @param	bool	cache
     *
     * @return	string
      */
    async render(template, cache = false) {
        return await this.adaptor.render(template, cache);
    }
}
