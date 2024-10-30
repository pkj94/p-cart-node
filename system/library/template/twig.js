const { join } = require('path');
const twigNode = require('twig');
module.exports = class TemplateTwigLibrary {
    constructor() {
        this.root = join(__dirname, '../../..'); // Adjust the path as needed
        // this.loader = new FileSystemLoader('/', { root: this.root });
        this.directory = '';
        this.path = {};
    }
    addPath(namespace, directory = '') {
        if (!directory) {
            this.directory = namespace;
        } else {
            this.path[namespace] = directory;
        }
    }
    render(filename, data = {}, code = '') {
        return new Promise((resolve, reject) => {
            let file = join(this.directory, `${filename}.twig`);
            const parts = filename.split('/');
            let namespace = '';
            for (const part of parts) {
                if (!namespace) {
                    namespace += part;
                } else {
                    namespace += `/${part}`;
                }
                if (this.path[namespace]) {
                    file = join(this.path[namespace], filename.slice(namespace.length + 1) + '.twig');
                }
            }
            file = file.slice(this.root.length + 1);
            // let loader;
            // if (code) {
            //     loader = new ArrayLoader({ [file]: code });
            // } else {
            //     loader = this.loader;
            // }
            // const config = {
            //     charset: 'utf-8',
            //     autoescape: false,
            //     debug: false,
            //     auto_reload: true,
            //     cache: join(__dirname, '../../../cache/template/')
            // };
            // const twig = new Environment(loader, config);
            try {
                if (code) {
                    let template = twigNode.twig({ data: code }).render(data);
                    // console.log('=======================', template)
                    resolve(template);
                } else
                    twigNode.renderFile(file, {
                        ...data, allowAsync: true, settings: {
                            'twig options': {
                                allowAsync: true, // Allow asynchronous compiling
                                strict_variables: false
                            }
                        }
                    }, (err, template) => {
                        if (err) {
                            console.log(file, err)
                            throw new Error(`Error: Could not load template ${filename}!`);
                        } else
                            resolve(template)
                    });
            } catch (e) {
                console.log(e)
                throw new Error(`Error: Could not load template ${filename}!`);
            }
        })
    }
}
