module.exports = class Cache {
    constructor(adaptor, expire = 3600) {
        let className = 'Opencart\System\Library\Cache' + ucfirst(adaptor);
        if (global[className]) {
            this.adaptor = new global[className](expire * 1000);
        } else {
            throw new Error(`Error: Could not load cache adaptor ${adaptor} cache!`);
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
    cleanUp() {
        return this.adaptor.cleanUp();
    }
}  