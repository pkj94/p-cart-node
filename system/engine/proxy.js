global['\Opencart\System\Engine\Proxy'] = class ProxyLocal {
    constructor() {
        return new Proxy(this, {
            get: (target, key) => {
                if (key in target) {
                    return target[key];
                } else {
                    throw new Error(`Undefined property: Proxy::${key}`);
                }
            },
            set: (target, key, value) => {
                target[key] = value;
                return true;
            },
            apply: (target, thisArg, args) => {
                if (typeof target[key] === 'function') {
                    return target[key](...args);
                } else {
                    throw new Error(`Undefined property: Proxy::${key}`);
                }
            }
        });
    }

    __call(key, ...args) {
        if (typeof this[key] === 'function') {
            return this[key](...args);
        } else {
            const trace = new Error().stack;
            console.error(`Notice: Undefined property: Proxy::${key} in ${trace.split('\n')[1].trim()}`);
        }
    }
}
