
global['\Opencart\System\Engine\Loader'] = class Loader {
    constructor(registry) {
        this.registry = registry;
    }
    get(key) {
        return this.registry.get(key);
    }
    set(key, value) {
        this.registry.set(key, value);
    }

    async controller(route, ...args) {
        route = route.replace(/[^a-zA-Z0-9_/.]/g, '').replace(/\|/g, '.');
        let output = '';
        let action = new global['\Opencart\System\Engine\Action'](route);
        // console.log('---',action)
        while (action) {
            route = action.getId();

            // Trigger the pre events
            let result = await this.registry.get('event').trigger('controller/' + route + '/before', [route, args]);
            if (result && result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
            }

            // Execute action
            result = await action.execute(this.registry, args);
            // if (route.indexOf('Api/Sale') != -1)
            //     console.log('---',args,action, result)

            // Reset action to prevent infinite loop
            action = null;

            // If an action object is returned, continue looping
            if (result && result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
            }

            // If not an action, it's the output
            if (!action) {
                output = result;
            }

            // Trigger the post events
            result = await this.registry.get('event').trigger('controller/' + route + '/after', [route, args, output]);
            if (result instanceof global['\Opencart\System\Engine\Action']) {
                action = result;
            }
        }

        return output;
    }
    model(route, registry) {
        route = route.replace(/[^a-zA-Z0-9_/]/g, '')
        const key = `model_${route.replace(/\//g, '_')}`;
        const className = `Opencart${this.registry.get('config').get('application')}Model${route.split('/').map(a => ucfirst(a)).join('/').split('_').map(a => ucfirst(a)).join('').replace(/[_/]/g, '')}`;
        // console.log(key, this.registry.has(key), className, global[className])
        // if (!this.registry.has(key)) {
        let model;
        try {
            let ModelClass = global[className];
            model = new ModelClass(this.registry);
        } catch (error) {
            console.log(className, error)
            throw new Error(`Error: Could not load model ${className}!`);
        }


        const proxy = {};

        for (const method of Object.getOwnPropertyNames(Object.getPrototypeOf(model))) {
            if (method !== 'constructor' && typeof model[method] === 'function') {
                proxy[method] = async (...args) => {
                    let result;
                    const eventRoute = `model/${route}/${method}`;
                    let output = ''
                    // Trigger pre events
                    result = await this.registry.get('event').trigger(`${eventRoute}/before`, [route, args]);
                    if (result) {
                        output = result;
                    }
                    if (!result) {
                        output = await model[method](...args);
                    }

                    // Trigger post events
                    result = await this.registry.get('event').trigger(`${eventRoute}/after`, [route, args, result]);
                    if (result) {
                        output = result;
                    }
                    return output;
                };
            }
        }
        // console.log(key, proxy)
        this.registry.set(key, proxy);
        registry.set(key, proxy);
        registry[key] = proxy;
        // } else {
        //     console.log(this.registry.get(key));
        //     registry.set(key, this.registry.get(key));
        //     registry[key] = this.registry.get(key);
        // }
    }

    view(route, data = {}, code = {}) {
        return new Promise(async (resolve, reject) => {
            route = route.replace(/[^a-zA-Z0-9_\/]/g, '');
            let output = '';
            let result = await this.registry.get('event').trigger(`view/${route}/before`, [route, data, code]);
            // if (route.indexOf('common/header') != -1)
            //     console.log('event header---', route, result, code);
            if (result) {
                output = result;
            }
            if (!output) {
                output = await this.registry.get('template').render(route, data, code.value);
            }

            result = await this.registry.get('event').trigger(`view/${route}/after`, [route, data, output]);

            if (result) {
                output = result;
            }
            // if (route.indexOf('captcha/basic') >= 0)
            //     console.log('load view', route, result, output)
            resolve(output);
        });
    }
    language(route, prefix = '', code = '') {
        return new Promise(async (resolve, reject) => {
            route = route.replace(/[^a-zA-Z0-9_\-\/]/g, '');
            let output = {};
            let result = await this.registry.get('event').trigger(`language/${route}/before`, [route, prefix, code]);

            if (result) {
                output = result;
            }
            if (Object.keys(output).length === 0) {
                output = await this.registry.get('language').load(route, prefix, code);
            }
            result = await this.registry.get('event').trigger(`language/${route}/after`, [route, prefix, code, output]);

            if (result) {
                output = result;
            }
            resolve(output);
        });
    }
    async config(route) {
        route = route.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        let output = {};
        let result = await this.registry.get('event').trigger(`config/${route}/before`, [route]);
        if (result) {
            output = result;
        }
        if (Object.keys(output).length === 0) {
            output = this.config.load(route);
        }
        result = await this.registry.get('event').trigger(`config/${route}/after`, [route, output]);
        if (result) {
            output = result;
        }
        return output;
    }
    helper(route) {
        route = route.replace(/[^a-zA-Z0-9_\/]/g, '');
        let file;
        if (!route.startsWith('extension/')) {
            file = DIR_SYSTEM + 'helper/' + `${route}.js`;
        } else {
            const parts = route.substring(10).split('/');
            const code = parts.shift();
            file = DIR_EXTENSION + code + '/system/' + '/helper/' + `${parts.join('/')}.js`;
        }
        if (fs.existsSync(file)) {
            require(file);
        } else {
            throw new Error(`Error: Could not load helper ${route}!`);
        }
    }
}
