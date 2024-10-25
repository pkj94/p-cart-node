const proxy = Proxy;
class Controller {
    registry;
    constructor(registry) {
        this.registry = registry;

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
        // console.log('key---',key)
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
global['\Opencart\System\Engine\Controller'] = Controller