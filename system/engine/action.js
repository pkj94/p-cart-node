global['\Opencart\System\Engine\Action'] = class Action {
    constructor(route) {
        this.route = route.replace(/[^a-zA-Z0-9_|/\\.]/g, '').replace(/\|/g, '.').split('/').map(a => ucfirst(a)).join('/');
        const pos = this.route.lastIndexOf('.');
        if (pos === -1) {
            this.class = `Controller${this.route.split('_').map(a => ucfirst(a)).join('').replace(/_/g, '').replace(/\//g, '')}`;
            this.method = 'index';
        } else {
            this.class = `Controller${this.route.split('.')[0].split('_').map(a => ucfirst(a)).join('').slice(0, pos).replace(/_/g, '').replace(/\//g, '')}`;
            this.method = this.route.slice(pos + 1);
        }
    }

    getId() {
        return this.route;
    }

    async execute(registry, args=[]) {
        // Stop any magical methods being called
        if (this.method.startsWith('__')) {
            throw new Error('Error: Calls to magic methods are not allowed!');
        }

        // Get the current namespace being used by the config
        const application = registry.get('config').get('application');
        // Initialize the class
        let controller, namespace;
        try {
            namespace = `Opencart${application}${this.class}`;
            let ControllerClass = global[namespace];
            // console.log(namespace, this.method)
            controller = new ControllerClass(registry);
        } catch (e) {
            console.log(namespace, this)
            throw new Error(`Error: Could not call route ${this.route}!`);
        }
        if (typeof controller[this.method] === 'function') {
            return controller[this.method](...args);
        } else {
            throw new Error(`Error: Could not call route ${this.route}!`);
        }
    }
}
