
const expressPath = require('path');

module.exports = class Autoloader {
    constructor() {
        this.paths = {};
        this.register('Opencart\System\Engine', __dirname.replace(/\\/g, '/'));
    }

    register(namespace, directory, psr4 = false) {
        this.paths[namespace] = { directory, psr4 };
        this.load(directory);
    }

    load(directory1) {
        if (fs.existsSync(directory1))
            fs.readdirSync(directory1).forEach(file => {
                const filePath = expressPath.join(directory1, file);
                if (file != 'view' && !filePath.includes('system\\config')) {
                    if (fs.statSync(filePath).isDirectory()) {
                        this.load(filePath);
                    } else if (file.endsWith('.js')) {
                        // console.log('filePath---', fs.realpathSync(filePath), Object.entries(this.paths))
                        let selectedNamespace = Object.entries(this.paths).find(a => fs.realpathSync(filePath).indexOf(fs.realpathSync(a[1].directory)) != -1);
                        // console.log('selectedNamespace---', selectedNamespace)

                        let namespace = selectedNamespace && selectedNamespace.length ? selectedNamespace[0] : '';
                        namespace = (namespace + filePath.replace('.js', '').replace(fs.realpathSync(selectedNamespace[1].directory), '').split('\\').map(a => ucfirst(a)).join('')).replace(/\\/g, '');
                        namespace = namespace.split('_').map(a => ucfirst(a)).join('');//.replace('OpencartExtensionOpencart','OpencartExtension')
                        // if (namespace.includes('DashboardActivity'))
                        // console.log('namespace1---', namespace, filePath, selectedNamespace[0])
                        if (selectedNamespace[0] == 'OpencartExtension' || selectedNamespace[0] == 'OpencartInstall' || selectedNamespace[0] == 'OpencartSystemEngine')
                            require(filePath.replace('.js', ''));
                        else
                            global[namespace] = require(filePath.replace('.js', ''));
                    }
                }
            });
    }
}