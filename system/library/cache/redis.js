module.exports = class CacheRedisLibrary {
    constructor(expire = 3600) {
        this.expire = expire;
        const redis = require('redis');
        this.client = redis.createClient({
            socket: {
                host: CACHE_HOSTNAME,
                port: CACHE_PORT
            }
        });
        this.client.on('error', (err) => console.log('Redis cache error:', err.message));
        this.ready = this.client.connect();
    }
    async get(key) {
        await this.ready;
        const data = await this.client.get(CACHE_PREFIX + key);
        return data ? JSON.parse(data) : data;
    }
    async set(key, value, expire = 0) {
        if (!expire) {
            expire = this.expire;
        }
        await this.ready;
        await this.client.set(CACHE_PREFIX + key, JSON.stringify(value), { EX: expire });
    }
    async delete(key) {
        await this.ready;
        await this.client.del(CACHE_PREFIX + key);
    }
}
