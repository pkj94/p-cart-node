module.exports = class Controller {
    constructor(registry) {
        Object.keys(registry.data).map(a => {
            this[a] = registry.data[a];
            return a;
        })
        this.registry = registry;
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
