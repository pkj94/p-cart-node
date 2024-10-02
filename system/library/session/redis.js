const redis = require('redis');

module.exports = class RedisSession {
    constructor(registry) {
        this.config = registry.get('config');
        this.prefix = `${CACHE_PREFIX}.session.`;

        try {
            this.redis = redis.createClient({
                url: `redis://${CACHE_HOSTNAME}:${CACHE_PORT}`
            });
            this.redis.connect();
        } catch (error) {
            // Handle Redis connection errors
        }
    }

    async read(session_id) {
        const data = await this.redis.get(`${this.prefix}${session_id}`);
        return data ? JSON.parse(data) : [];
    }

    async write(session_id, data) {
        if (session_id) {
            await this.redis.set(`${this.prefix}${session_id}`, JSON.stringify(data), {
                EX: this.config.get('session_expire')
            });
        }
        return true;
    }

    async destroy(session_id) {
        await this.redis.del(`${this.prefix}${session_id}`);
        return true;
    }

    gc() {
        // Redis handles Garbage Collection itself
        return true;
    }
}