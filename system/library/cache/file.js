// When this process last removed expired files. Scanning the cache folder on every request (twice)
// and on every get() made each read cost a full directory listing.
let lastCleanUp = 0;
const CLEANUP_INTERVAL = 10 * 60 * 1000;

// Entries this process has read or written, by file path: {expire, data}. A page reads ~40 keys, and
// reading each file took ~40% of the CPU time of a page. Every delete() changes the generation file
// in the cache folder; each process reads it once per request and empties this map when it changed,
// so a delete in any process (admin edits, orders) is seen by all of them on their next request.
const memory = new Map();
const MEMORY_LIMIT = 1000;
let memoryGeneration = null;

module.exports = class File {
    constructor(expire = 3600) {
        this.expire = expire;
        // One cache object is made per request
        this.syncMemory();
        this.cleanUp();
    }

    // One file per key, cache.<key>, holding {"expire": <ms timestamp>, "data": <value>}
    get(key) {
        const filePath = this.file(key);
        let entry = memory.get(filePath);
        if (!entry) {
            try {
                entry = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch (e) {
                return null;
            }
            if (entry && typeof entry.expire == 'number') {
                this.remember(filePath, entry);
            }
        }
        if (!entry || typeof entry.expire != 'number' || entry.expire < Date.now()) {
            memory.delete(filePath);
            this.remove(filePath);
            return null;
        }
        // A copy, so callers that change the result don't change the cached value
        return structuredClone(entry.data);
    }

    set(key, value = null, expire = 0) {
        expire = expire || this.expire;
        const filePath = this.file(key);
        const content = JSON.stringify({ expire: Date.now() + expire, data: value });
        // Written to a temporary file and renamed, so another process never reads half a file
        const temp = filePath + '.' + process.pid + '.tmp';
        try {
            fs.writeFileSync(temp, content, 'utf-8');
            fs.renameSync(temp, filePath);
        } catch (e) {
            this.remove(temp);
            fs.writeFileSync(filePath, content, 'utf-8');
        }
        // Parsed back from the file content, so memory holds exactly what a file read returns
        this.remember(filePath, JSON.parse(content));
    }

    // Removes the key and every key below it, e.g. delete('product') clears all product.* entries
    delete(key) {
        const name = `cache.${this.sanitizeKey(key)}`;
        fs.readdirSync(DIR_CACHE).filter(file => file === name || file.startsWith(name + '.')).forEach(file => {
            this.remove(expressPath.join(DIR_CACHE, file));
        });
        // Tell every process (this one included) to drop what it has in memory
        memory.clear();
        const generation = process.pid + '.' + Date.now() + '.' + Math.random().toString(36).slice(2);
        try {
            fs.writeFileSync(this.generationFile(), generation);
            memoryGeneration = generation;
        } catch (e) {
            memoryGeneration = null;
        }
    }

    remember(filePath, entry) {
        if (memory.size >= MEMORY_LIMIT) {
            // Oldest first: a Map keeps insertion order
            memory.delete(memory.keys().next().value);
        }
        memory.set(filePath, entry);
    }

    generationFile() {
        return DIR_CACHE + 'generation';
    }

    // A random value per delete(), so two deletes in the same millisecond still differ
    generation() {
        try {
            return fs.readFileSync(this.generationFile(), 'utf-8');
        } catch (e) {
            return 'none';
        }
    }

    syncMemory() {
        const generation = this.generation();
        if (generation !== memoryGeneration) {
            memory.clear();
            memoryGeneration = generation;
        }
    }

    sanitizeKey(key) {
        return key.replace(/[^A-Z0-9\._-]/gi, '');
    }

    file(key) {
        return DIR_CACHE + `cache.${this.sanitizeKey(key)}`;
    }

    remove(filePath) {
        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            // Already removed by another request or process
        }
    }

    cleanUp() {
        if (Date.now() - lastCleanUp < CLEANUP_INTERVAL) {
            return;
        }
        lastCleanUp = Date.now();
        const now = Date.now();
        for (const file of fs.readdirSync(DIR_CACHE).filter(file => file.startsWith('cache.'))) {
            const filePath = expressPath.join(DIR_CACHE, file);
            // Files from the old naming, cache.<key>.<expire>, are no longer read
            const legacy = file.match(/\.(\d{13})$/);
            if (legacy) {
                if (parseInt(legacy[1], 10) < now) {
                    this.remove(filePath);
                }
                continue;
            }
            // Leftover temporary file from a crashed write
            if (file.endsWith('.tmp')) {
                try {
                    if (fs.statSync(filePath).mtimeMs < now - CLEANUP_INTERVAL) {
                        this.remove(filePath);
                    }
                } catch (e) {
                }
                continue;
            }
            try {
                const entry = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (!entry || typeof entry.expire != 'number' || entry.expire < now) {
                    this.remove(filePath);
                }
            } catch (e) {
                this.remove(filePath);
            }
        }
    }
}
