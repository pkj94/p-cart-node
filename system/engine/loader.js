const fs = require('fs');
const path = require('path');
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
            route = route.replace(/[^a-zA-Z0-9_|\/\.]/g, '').replace(/\|/g, '.');
            let output = '';
            let action = new Action(route);
            while (action) {
                route = action.getId();
                let result = await this.registry.data.event.trigger(`controller/${route}/before`, [route, args]);
                if (result instanceof Action) {
                    action = result;
                }
                result = await action.execute(this.registry, args);
                action = null;
                if (result instanceof Action) {
                    action = result;
                }
                if (!action) {
                    output = result;
                }
                result = await this.registry.data.event.trigger(`controller/${route}/after`, [route, args, output]);
                if (result instanceof Action) {
                    action = result;
                }
            }
            resolve(output);
        })
    }
    model(route) {
        route = route.replace(/[^a-zA-Z0-9_\/]/g, '');
        const className = `Opencart.${this.config.get('application')}.Model.${route.split('/').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('.')}`;
        const key = `model_${route.replace(/\//g, '_')}`;
        if (!this.registry.has(key)) {
            if (global[className]) {
                const model = new global[className](this.registry);
                const proxy = new Proxy({}, {
                    get: (target, prop) => {
                        if (typeof model[prop] === 'function' && prop.substr(0, 2) !== '__') {
                            return (...args) => {
                                const methodRoute = `${route}/${prop}`;
                                let output = '';
                                let result = this.registry.data.event.trigger(`model/${methodRoute}/before`, [methodRoute, args]);
                                if (result) {
                                    output = result;
                                }
                                if (!output) {
                                    if (typeof model[prop] === 'function') {
                                        output = model[prop](...args);
                                    } else {
                                        throw new Error(`Error: Could not call model/${methodRoute}!`);
                                    }
                                }
                                result = this.registry.data.event.trigger(`model/${methodRoute}/after`, [methodRoute, args, output]);
                                if (result) {
                                    output = result;
                                }
                                return output;
                            };
                        }
                        return model[prop];
                    }
                });
                this.registry.set(key, proxy);
            } else {
                throw new Error(`Error: Could not load model ${className}!`);
            }
        }
    }
    view(route, data = {}, code = '') {
        return new Promise(async (resolve, reject) => {
            route = route.replace(/[^a-zA-Z0-9_\/]/g, '');
            let output = '';
            let result = this.registry.data.event.trigger(`view/${route}/before`, [route, data, code]);
            if (result) {
                output = result;
            }
            if (!output) {
                output = await this.registry.data.template.render(route, data, code);
            }
            result = this.registry.data.event.trigger(`view/${route}/after`, [route, data, output]);
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
            let result = await this.registry.data.event.trigger(`language/${route}/before`, [route, prefix, code]);
            if (result) {
                output = result;
            }
            if (Object.keys(output).length === 0) {
                output = await this.registry.data.language.load(route, prefix, code);
            }
            result = await this.registry.data.event.trigger(`language/${route}/after`, [route, prefix, code, output]);
            if (result) {
                output = result;
            }
            resolve(output);
        });
    }
    config(route) {
        route = route.replace(/[^a-zA-Z0-9_\-\/]/g, '');
        let output = {};
        let result = this.registry.data.event.trigger(`config/${route}/before`, [route]);
        if (result) {
            output = result;
        }
        if (Object.keys(output).length === 0) {
            output = this.config.load(route);
        }
        result = this.registry.data.event.trigger(`config/${route}/after`, [route, output]);
        if (result) {
            output = result;
        }
        return output;
    }
    helper(route) {
        route = route.replace(/[^a-zA-Z0-9_\/]/g, '');
        let file;
        if (!route.startsWith('extension/')) {
            file = path.join(DIR_SYSTEM, 'helper', `${route}.js`);
        } else {
            const parts = route.substring(10).split('/');
            const code = parts.shift();
            file = path.join(DIR_EXTENSION, code, 'system', 'helper', `${parts.join('/')}.js`);
        }
        if (fs.existsSync(file)) {
            require(file);
        } else {
            throw new Error(`Error: Could not load helper ${route}!`);
        }
    }
}
