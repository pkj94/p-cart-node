const Memcached = require('memcached');
module.exports = class Mem {
    constructor(expire = 3600) {
        this.expire = expire;
        this.memcached = new Memcached(`${CACHE_HOSTNAME}:${CACHE_PORT}`);
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this.memcached.get(CACHE_PREFIX + key, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }
    set(key, value, expire = 0) {
        return new Promise((resolve, reject) => {
            if (!expire) {
                expire = this.expire;
            }
            this.memcached.set(CACHE_PREFIX + key, value, expire, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
    delete(key) {
        return new Promise((resolve, reject) => {
            this.memcached.del(CACHE_PREFIX + key, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}
