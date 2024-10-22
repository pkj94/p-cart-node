// const fs = require('fs');
// module.exports = class Action {
//     constructor(route) {
//         this.route = route.replace(/[^a-zA-Z0-9_|\/\.]/g, '');

//         const pos = this.route.lastIndexOf('.');

//         if (pos === -1) {
//             this.class = `controller/${this.route}`;
//             this.method = 'index';
//         } else {
//             this.class = `controller/${this.route.split('.')[0]}`;
//             this.method = this.route.slice(pos + 1);
//         }
//     }
//     getId() {
//         return this.route;
//     }
//     execute(registry, args = []) {
//         return new Promise(async (resolve, reject) => {
//             if (this.method.startsWith('__')) {
//                 reject(new Error('Error: Calls to magic methods are not allowed!'));
//             }
//             const app = registry.get('config').get('application');
//             const className = DIR_OPENCART + `${app.toLowerCase()}/${this.class}.js`;
//             if (!fs.existsSync(className)) {
//                 // console.log('className----===',className)
//                 let classT = this.class.split('opencart/')[1].split('/').reverse().map(a => ucfirst(a)).join('');
//                 // console.log('classT----===', classT, typeof global[classT + 'Controller'])
//                 if (global[classT + 'Controller']) {
//                     try {
//                         let controller = new (global[classT + 'Controller'])(registry);
//                         // console.log(classT, this, typeof controller, JSON.stringify(Object.keys(global)));
//                         if (typeof controller[this.method] == 'function') {
//                             resolve(await controller[this.method](...args));
//                         } else {
//                             resolve('');
//                         }
//                     } catch (e) {
//                         console.log('errror', classT, e)
//                         reject(new Error(`Error: Could not call route ${this.route}!`));
//                     }
//                 } else {
//                     resolve('');
//                 }
//             } else {
//                 try {
//                     const ControllerClass = require(`${className}`);
//                     const controller = new ControllerClass(registry);
//                     // if (this.route.indexOf('theme') >= 0)
//                     // console.log(className)
//                     if (typeof controller[this.method] == 'function') {
//                         resolve(await controller[this.method](...args));
//                     } else {
//                         reject(new Error(`Error: Could not call route ${this.route}!`));
//                     }
//                 } catch (e) {
//                     console.log('errror', className, e)
//                     reject(new Error(`Error: Could not call route ${this.route}!`));
//                 }
//             }
//         })
//     }
//     capitalize(word) {
//         return word.charAt(0).toLowerCase() + word.slice(1);
//     }
// }
class Action {
    constructor(route) {
        this.route = route.replace(/[^a-zA-Z0-9_|/\\.]/g, '').replace(/\|/g, '.');

        const pos = this.route.lastIndexOf('.');
        if (pos === -1) {
            this.class = `Controller.${this.route.replace(/_/g, '').replace(/\//g, '.')}`;
            this.method = 'index';
        } else {
            this.class = `Controller.${this.route.slice(0, pos).replace(/_/g, '').replace(/\//g, '.')}`;
            this.method = this.route.slice(pos + 1);
        }
    }

    getId() {
        return this.route;
    }

    async execute(registry, ...args) {
        // Stop any magical methods being called
        if (this.method.startsWith('__')) {
            throw new Error('Error: Calls to magic methods are not allowed!');
        }

        // Get the current namespace being used by the config
        const config = registry.get('config');
        const namespace = `Opencart.${config.application}.${this.class}`;

        // Initialize the class
        let ControllerClass;
        try {
            ControllerClass = require(`./${namespace.split('.').join('/')}`);
        } catch (e) {
            throw new Error(`Error: Could not call route ${this.route}!`);
        }

        const controller = new ControllerClass(registry);

        if (typeof controller[this.method] === 'function') {
            return controller[this.method](...args);
        } else {
            throw new Error(`Error: Could not call route ${this.route}!`);
        }
    }
}
global['\Opencart\System\Engine\Action'] = Action;
