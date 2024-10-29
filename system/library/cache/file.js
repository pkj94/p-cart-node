module.exports = class File {
    constructor(expire = 3600) {
        this.expire = expire;
        this.cleanUp();
    }

    get(key) {
        const files = fs.readdirSync(DIR_CACHE).filter(file => file.startsWith(`cache.${this.sanitizeKey(key)}.`));
        if (files.length) {
            const filePath = expressPath.join(DIR_CACHE, files[0]);
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        return null;
    }

    set(key, value, expire = 0) {
        this.delete(key);
        expire = expire || this.expire;
        const filePath = DIR_CACHE + `cache.${this.sanitizeKey(key)}.${Date.now() + expire}`;
        fs.writeFileSync(filePath, JSON.stringify(value), 'utf-8');
    }

    delete(key) {
        const files = fs.readdirSync(DIR_CACHE).filter(file => file.startsWith(`cache.${this.sanitizeKey(key)}.`));
        files.forEach(file => {
            const filePath = expressPath.join(DIR_CACHE, file);
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                // Handle error if necessary
                clearTimeout(false, filePath);
            }
        });
    }

    sanitizeKey(key) {
        return key.replace(/[^A-Z0-9\._-]/gi, '');
    }

    cleanUp() {
        const files = fs.readdirSync(DIR_CACHE).filter(file => file.startsWith('cache.'));
        files.forEach(file => {
            const time = parseInt(file.split('.').pop(), 10);
            if (time < Date.now()) {
                try {
                    fs.unlinkSync(expressPath.join(DIR_CACHE, file));
                } catch (err) {
                    // Handle error if necessary
                    clearTimeout(false, file);
                }
            }
        });
    }
}