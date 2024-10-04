const redis = require('redis');
const client = redis.createClient({
    host: CACHE_HOSTNAME,
    port: CACHE_PORT
});
module.exports = class CacheRedisLibrary {
    constructor(expire = 3600) {
        this.expire = expire;
    }
    async get(key) {
        return new Promise((resolve, reject) => {
            client.get(CACHE_PREFIX + key, (err, data) => {
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
            client.set(CACHE_PREFIX + key, JSON.stringify(value), 'EX', expire, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
    async delete(key) {
        return new Promise((resolve, reject) => {
            client.del(CACHE_PREFIX + key, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}