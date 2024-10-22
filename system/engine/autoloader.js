const fs = require('fs');
const expressPath = require('path');

class Autoloader {
    constructor() {
        this.paths = {};
    }

    register(namespace, directory, psr4 = false) {
        this.paths[namespace] = { directory, psr4 };
        this.load(directory);
    }

    load(directory1) {
        fs.readdirSync(directory1).forEach(file => {
            if (file != 'view') {
                const filePath = expressPath.join(directory1, file);
                if (fs.statSync(filePath).isDirectory()) {
                    this.load(filePath);
                } else if (file.endsWith('.js')) {
                    console.log('filePath---', filePath)

                    require(filePath.replace('.js', ''));
                }
            }
        });
    }
}

global['\Opencart\System\Engine\Autoloader'] = Autoloader;
