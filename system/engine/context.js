const { AsyncLocalStorage } = require('async_hooks');

// Per-request values for the config.json globals (APPLICATION, DIR_*, HTTP_SERVER, DB_*, ...).
// Admin, catalog and install each use different values under the same global names. As plain
// globals, a request that awaited (e.g. on the DB) could resume with another request's values,
// such as the catalog loading OpencartAdmin* models. Each name stays a global, so existing code is
// unchanged, but reads and writes go to the store of the request that is running.
const storage = new AsyncLocalStorage();
const fallback = {};

function scope(key) {
    const descriptor = Object.getOwnPropertyDescriptor(global, key);
    if (descriptor && descriptor.get) {
        return;
    }
    if (descriptor) {
        fallback[key] = global[key];
    }
    Object.defineProperty(global, key, {
        configurable: true,
        enumerable: true,
        get() {
            const store = storage.getStore();
            return store && key in store ? store[key] : fallback[key];
        },
        set(value) {
            const store = storage.getStore();
            if (store) {
                store[key] = value;
            } else {
                fallback[key] = value;
            }
        }
    });
}

// Runs callback with values as this request's globals.
function run(values, callback) {
    for (const key of Object.keys(values)) {
        scope(key);
    }
    return storage.run({ ...values }, callback);
}

// Reads a config.json; {} when it is missing or empty (not installed yet).
function loadConfig(file) {
    try {
        const content = require('fs').readFileSync(file).toString();
        return content.trim() ? withEnv(JSON.parse(content)) : {};
    } catch (e) {
        return {};
    }
}

// DB_* environment variables (e.g. DB_USERNAME, DB_PASSWORD from .env) override config.json,
// so credentials don't have to live in a committed file
function withEnv(config) {
    for (const key of Object.keys(process.env)) {
        if (key.startsWith('DB_')) {
            const value = process.env[key];
            config[key] = value === 'true' ? true : (value === 'false' ? false : value);
        }
    }
    return config;
}

// A fresh registry per request, so concurrent requests never share request/response/session/config.
function createRegistry(baseRegistry) {
    const registry = new global['OpencartSystemEngineRegistry']();
    registry.set('autoloader', baseRegistry.get('autoloader'));
    registry.set('config', new global['OpencartSystemEngineConfig']());
    return registry;
}

module.exports = { scope, run, loadConfig, withEnv, createRegistry };
