const Framework = require('../system/framework');
const context = require('../system/engine/context');

// Globals this handler sets; scoped per request (see system/engine/context.js)
const INSTALL_GLOBALS = ['APPLICATION', 'HTTP_SERVER', 'HTTP_OPENCART', 'DIR_OPENCART', 'DIR_APPLICATION', 'DIR_SYSTEM', 'DIR_EXTENSION', 'DIR_IMAGE', 'DIR_STORAGE', 'DIR_LANGUAGE', 'DIR_TEMPLATE', 'DIR_CONFIG', 'DIR_CACHE', 'DIR_DOWNLOAD', 'DIR_LOGS', 'DIR_SESSION', 'DIR_UPLOAD'];

module.exports = function (baseRegistry) {
    const loadInstall = (req, res, next) => context.run(Object.fromEntries(INSTALL_GLOBALS.map(key => [key, undefined])), () => handleInstall(req, res, next));
    const handleInstall = async (req, res, next) => {
        const registry = context.createRegistry(baseRegistry);
        let protocol = req.protocol + '://';
        // APPLICATION
        global.APPLICATION = 'Install';
        // HTTP
        global.HTTP_SERVER = `${protocol}${req.get('host') + req.route.path.replace(/\/+$/, '')}/`;
        global.HTTP_OPENCART = `${protocol}${req.get('host') + req.route.path.replace(/\/+$/, '').replace(/install\/?$/, '')}`;
        // console.log('HTTP_OPENCART', HTTP_OPENCART)
        // DIR
        global.DIR_OPENCART = expressPath.join(__dirname, '..', '/').replace(/\\/g, '/');
        global.DIR_APPLICATION = DIR_OPENCART + 'install/';
        global.DIR_SYSTEM = DIR_OPENCART + 'system/';
        global.DIR_EXTENSION = DIR_OPENCART + 'extension/';
        global.DIR_IMAGE = DIR_OPENCART + 'image/';
        global.DIR_STORAGE = DIR_SYSTEM + 'storage/';
        global.DIR_LANGUAGE = DIR_APPLICATION + 'language/';
        global.DIR_TEMPLATE = DIR_APPLICATION + 'view/template/';
        global.DIR_CONFIG = DIR_SYSTEM + 'config/';
        global.DIR_CACHE = DIR_SYSTEM + 'storage/cache/';
        global.DIR_DOWNLOAD = DIR_SYSTEM + 'storage/download/';
        global.DIR_LOGS = DIR_SYSTEM + 'storage/logs/';
        global.DIR_SESSION = DIR_SYSTEM + 'storage/session/';
        global.DIR_UPLOAD = DIR_SYSTEM + 'storage/upload/';
        console.log("=================", HTTP_SERVER, HTTP_OPENCART, DIR_APPLICATION);
        // app.use('/install/view/stylesheet', express.static(DIR_APPLICATION + 'view/stylesheet'));
        // app.use('/install/view/javascript', express.static(DIR_APPLICATION + 'view/javascript'));
        // app.use('/install/view/image', express.static(DIR_APPLICATION + 'view/image'));
        // app.use('/install/language', express.static(DIR_APPLICATION + '/language'));


        new Framework(registry).init(req, res, next).then(output => {
            if (registry.get('response').redirect) {
                res.redirect(registry.get('response').redirect);
            } else {
                registry.get('response').headers.forEach(header => {
                    res.header(header.split(':')[0].trim(), header.slice(header.indexOf(':') + 1).trim());
                });
                res.status(200).send(output);
            }
        }).catch(error => {
            // Error Handler
            console.error('error------', error, JSON.stringify(error));
            let errorType;
            switch (error.name) {
                case 'NoticeError':
                case 'UserNoticeError':
                    errorType = 'Notice';
                    break;
                case 'WarningError':
                case 'UserWarningError':
                    errorType = 'Warning';
                    break;
                case 'ErrorError':
                case 'UserErrorError':
                    errorType = 'Fatal Error';
                    break;
                default:
                    errorType = 'Unknown';
                    break;
            }

            if (global.config && global.config.get('error_log')) {
                log.write('JavaScript ' + errorType + ':  ' + error.toString());
            }

            if (global.config && global.config.get('error_display')) {
                res.status(200).send('<b>' + errorType + '</b>: ' + error.toString());
            } else if (global.config) {
                console.log(global.config.get('error_page'))
                res.redirect(config.get('error_page'));
            }

            return res.status(200).send(global.registry.get('response').outputData);
        });
    }
    app.all('/install', loadInstall)
}