const proxy = Proxy;
global['\Opencart\System\Engine\Registry'] = class Registry {
    data = {};
    constructor() {
        return new proxy(this, {
            get: (target, key) => {
                if (key in target) {
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
