const path = require('path');
const Framework = require('../system/framework');
const Config = require('../system/engine/config');
const Registry = require('../system/engine/registry');
module.exports = function () {
    const loadInstall = async (req, res, next) => {
        let protocol = req.protocol + '://';
        // APPLICATION
        global.APPLICATION = 'Install';
        // HTTP
        global.HTTP_SERVER = `${protocol}${req.get('host') + req.route.path.replace(/\/+$/, '')}/`;
        global.HTTP_OPENCART = `${protocol}${req.get('host') + req.route.path.replace(/\/+$/, '').replace(/install\/?$/, '')}`;
        // DIR
        global.DIR_OPENCART = path.join(__dirname, '..', '/').replace(/\\/g, '/');
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
        // console.log("=================", HTTP_SERVER, HTTP_OPENCART);
        app.use('/install/view/stylesheet', express.static(DIR_APPLICATION + 'view/stylesheet'));
        app.use('/install/view/javascript', express.static(DIR_APPLICATION + 'view/javascript'));
        app.use('/install/view/image', express.static(DIR_APPLICATION + 'view/image'));
        app.use('/install/language', express.static(DIR_APPLICATION + '/language'));
        
        require(DIR_SYSTEM + 'startup.js');

        new Framework().init(req, res, next).then(output => {
            if (registry.get('response').redirect) {
                res.redirect(registry.get('response').redirect);
            } else {
                registry.get('response').headers.forEach(header => {
                    res.header(header.split(':')[0].trim(), header.split(':')[1].trim());
                });
                res.status(200).send(output);
            }
        }).catch(error => {
            // Error Handler
            console.log('error------', error, JSON.stringify(error));
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

            if (global.config.get('error_log')) {
                log.write('JavaScript ' + errorType + ':  ' + error.toString());
            }

            if (global.config.get('error_display')) {
                res.status(200).send('<b>' + errorType + '</b>: ' + error.toString());
            } else {
                console.log(global.config.get('error_page'))
                res.redirect(config.get('error_page'));
            }

            return res.status(200).send(registry.get('response').outputData);
        });
    }
    app.all('/install', loadInstall)
}