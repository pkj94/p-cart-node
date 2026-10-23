const proxy = Proxy;
const sharedName = require('./shared_name');
module.exports = class Model {
    constructor(registry = {}) {
        this.registry = registry;
        return new proxy(this, {
            get: (target, key, receiver) => {
                if (key in target) {
                    // A method named like a registry key (load, cart, currency, ...) serves both uses
                    if (typeof target[key] == 'function' && typeof key == 'string' && key != 'get' && key != 'set' && typeof target.registry.has == 'function' && target.registry.has(key)) {
                        return sharedName(target[key], receiver, target.registry.get(key));
                    }
                    return target[key];
                }
                return target.get(key);
            },
            set: (target, key, value) => {
                if (key in target) {
                    target[key] = value;
                } else {
                    target.set(key, value);
                }
                return true;
            }
        });
    }

    get(key) {
        if (this.registry.has(key)) {
            return this.registry.get(key);
        } else {
            throw new Error(`Error: Could not call registry key ${key}!`);
        }
    }

    set(key, value) {
        this.registry.set(key, value);
    }
}
