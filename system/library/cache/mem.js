const memcache = require('memcache');
module.exports = class Mem {
    constructor(expire = 3600) {
        this.expire = expire;
        this.memcache = new memcache.Client();
        this.memcache.connect(CACHE_HOSTNAME, CACHE_PORT, (err) => {
            if (err) throw new Error('Memcache connection error: ' + err);
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this.memcache.get(CACHE_PREFIX + key, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }
    set(key, value, expire = 0) {
        return new Promise((resolve, reject) => {
            if (!expire) {
                expire = this.expire;
            }
            this.memcache.set(CACHE_PREFIX + key, value, MEMCACHE_COMPRESSED, expire, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
    delete(key) {
        return new Promise((resolve, reject) => {
            this.memcache.delete(CACHE_PREFIX + key, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}