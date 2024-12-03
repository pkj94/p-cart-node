module.exports = class Library {
    constructor(registry) {
        this.registry = registry;

        return new Proxy(this, {
            get: (target, key) => {
                if (key in target) {
                    return target[key];
                } else {
                    return registry.get(key);
                }
            },
            set: (target, key, value) => {
                if (key in target) {
                    target[key] = value;
                } else {
                    registry.set(key, value);
                }
                return true;
            }
        });
    }
}
