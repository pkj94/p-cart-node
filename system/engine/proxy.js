global['\Opencart\System\Engine\Proxy'] = class Proxy {
    constructor() {
        this.data = {};
    }

    get(key) {
        if (this.data[key]) {
            return this.data[key];
        } else {
            throw new Error(`Error: Could not call proxy key ${key}!`);
        }
    }

    set(key, value) {
        this.data[key] = value;
    }

    isset(key) {
        return this.data.hasOwnProperty(key);
    }

    unset(key) {
        delete this.data[key];
    }

    call(method, ...args) {
        if (typeof this.data[method] === 'function') {
            return this.data[method](...args);
        } else {
            throw new Error(`Notice: Undefined property: Proxy::${method}`);
        }
    }
}

