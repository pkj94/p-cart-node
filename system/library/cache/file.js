const fs = require('fs');
const path = require('path');

module.exports = class CacheFileLibrary {
    constructor(expire = 3600) {
        this.expire = expire;
    }
    get(key) {
        const filePath = this.getFilePath(key);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            return null;
        }
    }
    set(key, value, expire = 0) {
        this.delete(key);
        if (!expire) {
            expire = this.expire;
        }
        const filePath = this.getFilePath(key, time() + expire);
        fs.writeFileSync(filePath, JSON.stringify(value));
    }
    delete(key) {
        const files = this.getMatchingFiles(key);
        for (const file of files) {
            if(fs.existsSync(file))
            fs.unlinkSync(file);
        }
    }
    getFilePath(key, timestamp = null) {
        return path.join(DIR_CACHE, 'cache', `cache.${key}.${timestamp ? timestamp : ''}`);
    }
    getMatchingFiles(key) {
        if (!fs.existsSync(path.join(DIR_CACHE, 'cache')))
            fs.mkdirSync(path.join(DIR_CACHE, 'cache'), { recursive: true });
        return fs.readdirSync(path.join(DIR_CACHE, 'cache')).filter(file => file.startsWith(`cache.${key}.`));
    }
    destructor() {
        const files = fs.readdirSync(path.join(DIR_CACHE, 'cache'));
        if (Math.random() * 100 < 1) {
            for (const file of files) {
                const timestamp = parseInt(file.split('.').pop());
                if (timestamp < Date.now() / 1000) {
                    fs.unlinkSync(path.join(DIR_CACHE, 'cache', file));
                }
            }
        }
    }
}
