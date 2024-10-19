const fs = require('fs');
const Action = require('./action');
module.exports = class Loader {
    constructor(registry) {
        this.registry = registry;
    }
    get(key) {
        return this.registry.get(key);
    }
    set(key, value) {
        this.registry.set(key, value);
    }
    controller(route, ...args) {
        return new Promise(async (resolve, reject) => {
            // route = route.replace(/[^a-zA-Z0-9_|\/\.]/g, '').replace(/\|/g, '.');
            let output = '';
            let action = new Action(route);
            while (action) {
                route = action.getId();
                let result = await this.registry.get('event').trigger(`controller/${route}/before`, [route, args]);
                if (result instanceof Action) {
                    action = result;
                }
                result = await action.execute(this.registry, args);
                // console.log('result',result,args)

                action = null;
                if (result instanceof Action) {
                    action = result;
                }
                if (!action) {
                    output = result;
                }
                result = await this.registry.get('event').trigger(`controller/${route}/after`, [route, args, output]);
                if (result instanceof Action) {
                    action = result;
                }
            }
            resolve(output);
        })
    }
    model(route, registry) {
        // Sanitize the call
        // route = route.replace(/[^a-zA-Z0-9_\/]/g, '');

        // Converting a route path to a class name
        let className = DIR_OPENCART + `${this.registry.data.config.get('application').toLowerCase()}/model/${route}.js`;
        // Create a key to store the model object
        const key = `model_${route.replaceAll('/', '_')}`;
        if (!fs.existsSync(className)) {
            // console.log('route----===', route)
            let classT = route.split('opencart/')[1];
            // console.log(classT);
            className = DIR_EXTENSION + `opencart/${this.registry.data.config.get('application').toLowerCase()}/model/${classT}.js`
            // console.log(className);
        }
        // Check if the requested model is already stored in the registry.
        if (!this.registry.has(key)) {
            try {
                const ModelClass = require(`${className}`);
                const model = new ModelClass(this.registry);

                const proxy = new Proxy();

                for (const method of Object.getOwnPropertyNames(ModelClass.prototype).filter(method => method !== 'constructor')) {
                    if (!method.startsWith('__') && typeof model[method] === 'function') {
                        proxy[method] = async (...args) => {
                            route = `${route}/${method}`;

                            let output = '';

                            // Trigger the pre events
                            let result = await this.registry.get('event').trigger(`model/${route}/before`, [route, args]);
                            // if (route.indexOf('design/layout') >= 0)
                            //     console.log('load model', route,result)
                            if (result) {
                                output = result;
                            }

                            if (!output) {
                                try {
                                    output = model[method](...args);
                                } catch (error) {
                                    console.log(error)
                                    throw new Error(`Error: Could not call model/${route}!`);
                                }
                            }

                            // Trigger the post events
                            result = await this.registry.get('event').trigger(`model/${route}/after`, [route, args, output]);

                            if (result) {
                                output = result;
                            }

                            return output;
                        };
                    }
                }
                // console.log(key,proxy,route)
                registry.set(key, proxy);
                this.registry.set(key, proxy);
            } catch (error) {
                console.log(error)
                throw new Error(`Error: Could not load model ${className}!`);
            }

        }
    }

    view(route, data = {}, code = '') {
        return new Promise(async (resolve, reject) => {
            route = route.replace(/[^a-zA-Z0-9_\/]/g, '');
            let output = '';
            let result = await this.registry.get('event').trigger(`view/${route}/before`, [route, data, code]);

            if (result) {
                output = result;
            }
            if (!output) {

                output = await this.registry.get('template').render(route, data, code);
            }
            result = await this.registry.get('event').trigger(`view/${route}/after`, [route, data, output]);
            // if (route.indexOf('header') >= 0)
            //     console.log('load view', route,result)
            if (result) {
                output = result;
            }
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
    config(route) {
        route = route.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        let output = {};
        let result = this.registry.get('event').trigger(`config/${route}/before`, [route]);
        if (result) {
            output = result;
        }
        if (Object.keys(output).length === 0) {
            output = this.config.load(route);
        }
        result = this.registry.get('event').trigger(`config/${route}/after`, [route, output]);
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
