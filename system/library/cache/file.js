const fs = require('fs');
const path = require('path');
function time() {
    return Math.floor(Date.now() / 1000);
}
module.exports = class File {
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
            fs.unlinkSync(file);
        }
    }
    getFilePath(key, timestamp = null) {
        return path.join(__dirname, 'cache', `cache.${key}.${timestamp ? timestamp : ''}`);
    }
    getMatchingFiles(key) {
        return fs.readdirSync(path.join(__dirname, 'cache')).filter(file => file.startsWith(`cache.${key}.`));
    }
    destructor() {
        const files = fs.readdirSync(path.join(__dirname, 'cache'));
        if (Math.random() * 100 < 1) {
            for (const file of files) {
                const timestamp = parseInt(file.split('.').pop());
                if (timestamp < Date.now() / 1000) {
                    fs.unlinkSync(path.join(__dirname, 'cache', file));
                }
            }
        }
    }
}
