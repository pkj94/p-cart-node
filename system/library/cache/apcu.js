const NodeCache = require('node-cache');
module.exports = class CacheAPCULibrary {
    constructor(expire = 3600) {
        this.expire = expire;
        this.cache = new NodeCache({ stdTTL: this.expire, checkperiod: 120 });
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value, expire = 0) {
        const ttl = expire || this.expire;
        this.cache.set(key, value, ttl);
    }
    delete(key) {
        this.cache.del(key);
    }
    flush() {
        this.cache.flushAll();
        return true;
    }
}
