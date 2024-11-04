global['\Opencart\System\Engine\Event'] = class Loader {
    constructor(registry) {
        this.registry = registry;
    }

    sanitizeRoute(route) {
        return route.replace(/[^a-zA-Z0-9_/]/g, '');
    }

    async controller(route, data = {}) {
        route = this.sanitizeRoute(route);
        const trigger = route;

        let output;
        let result = await this.registry.event.emitAsync(`controller/${trigger}/before`, route, data);

        if (result && !(result instanceof Error)) {
            output = result;
        } else {
            const Action = require(expressPath.join(__dirname, 'action')); // Adjust the path as needed
            const action = new Action(route);
            output = await action.execute(this.registry, data);
        }

        result = await this.registry.event.emitAsync(`controller/${trigger}/after`, route, data, output);
        if (result && !(result instanceof Error)) {
            output = result;
        }

        if (!(output instanceof Error)) {
            return output;
        }
    }

    async model(route) {
        route = this.sanitizeRoute(route);

        if (!this.registry.has(`model_${route.replace('/', '_')}`)) {
            const file = expressPath.join(__dirname, 'model', `${route}.js`); // Adjust the path as needed
            const ModelClass = require(file);

            const proxy = new Proxy({}, {
                get: (target, method) => {
                    return (...args) => this.callback(route, method).apply(this, args);
                }
            });

            this.registry.set(`model_${route.replace('/', '_')}`, proxy);
        }
    }

    async view(route, data = {}) {
        route = this.sanitizeRoute(route);
        const trigger = route;

        let output;
        let code = '';

        let result = await this.registry.event.emitAsync(`view/${trigger}/before`, route, data, code);
        if (result && !(result instanceof Error)) {
            output = result;
        } else {
            const Template = require(expressPath.join(__dirname, 'template')); // Adjust the path as needed
            const template = new Template(this.registry.get('config').get('template_engine'));

            for (const key in data) {
                template.set(key, data[key]);
            }

            output = await template.render(this.registry.get('config').get('template_directory') + route, code);
        }

        result = await this.registry.event.emitAsync(`view/${trigger}/after`, route, data, output);
        if (result && !(result instanceof Error)) {
            output = result;
        }

        return output;
    }

    async library(route) {
        route = this.sanitizeRoute(route);

        const file = expressPath.join(__dirname, 'library', `${route}.js`); // Adjust the path as needed
        const LibraryClass = require(file);

        this.registry.set(expressPath.basename(route), new LibraryClass(this.registry));
    }

    async helper(route) {
        const file = expressPath.join(__dirname, 'helper', `${route}.js`); // Adjust the path as needed

        if (require.resolve(file)) {
            require(file);
        } else {
            throw new Error(`Error: Could not load helper ${route}!`);
        }
    }

    async config(route) {
        await this.registry.event.emitAsync(`config/${route}/before`, route);
        this.registry.get('config').load(route);
        await this.registry.event.emitAsync(`config/${route}/after`, route);
    }

    async language(route, key = '') {
        route = this.sanitizeRoute(route);
        const trigger = route;

        let output;
        let result = await this.registry.event.emitAsync(`language/${trigger}/before`, route, key);
        if (result && !(result instanceof Error)) {
            output = result;
        } else {
            output = await this.registry.get('language').load(route, key);
        }

        result = await this.registry.event.emitAsync(`language/${trigger}/after`, route, key, output);
        if (result && !(result instanceof Error)) {
            output = result;
        }

        return output;
    }

    callback(route, method) {
        return async (...args) => {
            route = this.sanitizeRoute(route);
            const trigger = route;

            let output;
            let result = await this.registry.event.emitAsync(`model/${trigger}/before`, route, args);
            if (result && !(result instanceof Error)) {
                output = result;
            } else {
                const ModelClass = require(expressPath.join(__dirname, 'model', route.split('/')[0])); // Adjust the path as needed
                const model = new ModelClass(this.registry);

                if (typeof model[method] === 'function') {
                    output = await model[method](...args);
                } else {
                    throw new Error(`Error: Could not call model/${route}!`);
                }
            }

            result = await this.registry.event.emitAsync(`model/${trigger}/after`, route, args, output);
            if (result && !(result instanceof Error)) {
                output = result;
            }

            return output;
        };
    }
}
