module.exports = class Cache {
    constructor(adaptor, expire = 3600) {
        if (adaptor) {
            const AdaptorClass = require(`./cache/${adaptor}`);
            if (AdaptorClass) {
                this.adaptor = new AdaptorClass(expire);
            } else {
                throw new Error(`Error: Could not load cache adaptor ${adaptor} cache!`);
            }
        }
    }
    async get(key) {
        return this.adaptor.get(key);
    }
    async set(key, value, expire = 0) {
        return this.adaptor.set(key, value, expire);
    }
    async delete(key) {
        return this.adaptor.delete(key);
    }
}  