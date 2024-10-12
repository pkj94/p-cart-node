const fs = require('fs');
module.exports = class Action {
    constructor(route) {
        this.route = route.replace(/[^a-zA-Z0-9_|\/\.]/g, '');

        const pos = this.route.lastIndexOf('.');

        if (pos === -1) {
            this.class = `controller/${this.route}`;
            this.method = 'index';
        } else {
            this.class = `controller/${this.route.split('.')[0]}`;
            this.method = this.route.slice(pos + 1);
        }
    }
    getId() {
        return this.route;
    }
    execute(registry, args = []) {
        return new Promise(async (resolve, reject) => {
            if (this.method.startsWith('__')) {
                reject(new Error('Error: Calls to magic methods are not allowed!'));
            }
            const app = registry.get('config').get('application');
            const className = DIR_OPENCART + `${app.toLowerCase()}/${this.class}.js`;
            if (!fs.existsSync(className)) {
                // console.log('className----===',className)
                let classT = this.class.split('opencart/')[1].split('/').reverse().map(a => ucfirst(a)).join('');
                if (global[classT + 'Controller']) {
                    try {
                        let controller = new (global[classT + 'Controller'])(registry);
                        // console.log(classT);
                        if (typeof controller[this.method] == 'function') {
                            resolve(await controller[this.method](...args));
                        } else {
                            resolve('')
                        }
                    } catch (e) {
                        console.log('errror', classT, e)
                        reject(new Error(`Error: Could not call route ${this.route}!`));
                    }
                }
            } else {
                try {
                    const ControllerClass = require(`${className}`);
                    const controller = new ControllerClass(registry);
                    if (typeof controller[this.method] == 'function') {
                        resolve(await controller[this.method](...args));
                    } else {
                        reject(new Error(`Error: Could not call route ${this.route}!`));
                    }
                } catch (e) {
                    console.log('errror', className, e)
                    reject(new Error(`Error: Could not call route ${this.route}!`));
                }
            }
        })
    }
    capitalize(word) {
        return word.charAt(0).toLowerCase() + word.slice(1);
    }
}
