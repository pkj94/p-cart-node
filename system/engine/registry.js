module.exports = class Registry {
    data = {};
    get(key) {
        return this.data[key] || null;
    }

    set(key, value) {
        this.data[key] = value;
    }

    has(key) {
        return Object.prototype.hasOwnProperty.call(this.data, key);
    }

    unset(key) {
        delete this.data[key];
    }
}
