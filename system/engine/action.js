module.exports = class Action {
    constructor(route) {
        this.id = route;
        this.method = 'index';

        const parts = route.replace(/[^a-zA-Z0-9_/]/g, '').split('/');

        // Break apart the route
        while (parts.length) {
            const file = expressPath.join(DIR_APPLICATION, 'controller', parts.join('/') + '.js');
            // console.log('file---',file,fs.existsSync(file))
            if (fs.existsSync(file)) {
                this.route = parts.join('/');
                break;
            } else {
                this.method = parts.pop();
            }
        }
    }

    getId() {
        return this.id;
    }

    async execute(registry, args = []) {
        // Stop any magical methods being called
        if (this.method.startsWith('__')) {
            throw new Error('Error: Calls to magic methods are not allowed!');
        }

        const file = expressPath.join(DIR_APPLICATION, 'controller', `${this.route}.js`);
        // console.log('====', file, this)
        // const className = `Controller${this.route.replace(/[^a-zA-Z0-9]/g, '')}`;

        // Initialize the class
        if (fs.existsSync(file)) {
            // console.log('file----', file, this)
            const controller = new (require(file))(global.registry);

            if (typeof controller[this.method] === 'function') {
                return await controller[this.method](...args);
            } else {
                console.log(`Error: Could not call ${this.route}/${this.method}!`)
                // throw new Error(`Error: Could not call ${this.route}/${this.method}!`);
            }
        } else {
            throw new Error(`Error: Could not call ${this.route}/${this.method}!`);
        }
    }
}
