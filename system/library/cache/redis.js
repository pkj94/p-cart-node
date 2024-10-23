
module.exports = class CacheRedisLibrary {
    constructor(expire = 3600) {
        this.expire = expire;
        const redis = require('redis');
        this.client = redis.createClient({
            host: CACHE_HOSTNAME,
            port: CACHE_PORT
        });
    }
    async get(key) {
        return new Promise((resolve, reject) => {
            this.client.get(CACHE_PREFIX + key, (err, data) => {
                if (err) reject(err);
                resolve(JSON.parse(data));
            });
        });
    }
    async set(key, value, expire = 0) {
        return new Promise((resolve, reject) => {
            if (!expire) {
                expire = this.expire;
            }
            this.client.set(CACHE_PREFIX + key, JSON.stringify(value), 'EX', expire, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
    async delete(key) {
        return new Promise((resolve, reject) => {
            this.client.del(CACHE_PREFIX + key, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}