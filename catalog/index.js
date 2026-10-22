const Framework = require("../system/framework");
const context = require('../system/engine/context');

module.exports = function (baseRegistry) {
    // Each request gets its own registry and its own config.json globals (see system/engine/context.js)
    const loadControllers = (req, res, next) => context.run(context.loadConfig(APPROOT + '/config.json'), () => handleCatalog(req, res, next));
    const handleCatalog = async (req, res, next) => {
        // console.log(req.params)
        const registry = context.createRegistry(baseRegistry);
        const config = registry.get('config');
        // console.log('DIR_APPLICATION', typeof DIR_APPLICATION)
        if (typeof DIR_APPLICATION == 'undefined')
            return res.redirect('/install');
        // console.log(typeof DIR_APPLICATION == 'undefined')
        new Framework(registry).init(req, res, next).then(output => {
            if (registry.get('response').redirect) {
                res.redirect(registry.get('response').redirect);
            } else {
                // console.log(registry.get('response').headers)
                registry.get('response').headers.forEach(header => {
                    // console.log('header----', header)
                    res.header(header.split(':')[0].trim(), header.slice(header.indexOf(':') + 1).trim());
                });
                res.status(registry.get('response').status || 200).send(output);
                console.log('request send---', new Date().toISOString())
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
                    // TypeError, ReferenceError, ...
                    errorType = error.name || 'Error';
                    break;
            }

            if (config.get('error_log')) {
                // Message, URL and the top of the stack, so the entry shows where it happened
                const stack = String(error.stack || '').split('\n').slice(1, 6).map(line => '    ' + line.trim()).join('\n');
                registry.get('log').write('JavaScript ' + errorType + ': ' + error.message + '\n    URL: ' + req.method + ' ' + req.originalUrl + (stack ? '\n' + stack : ''));
            }

            if (res.headersSent) {
                return;
            }
            if (config.get('error_display')) {
                return res.status(500).send('<b>' + errorType + '</b>: ' + error.toString());
            }
            return res.redirect(config.get('error_page'));
        });
    };
    // loadControllers();
    app.all('/*', loadControllers);
}