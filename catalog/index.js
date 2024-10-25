const Framework = require("../system/framework");

module.exports = function (registry) {
    const loadControllers = async (req, res, next) => {
        if (fs.readFileSync(APPROOT + '/config.json').toString())
            for (let [key, value] of Object.entries(require('../config.json'))) {
                global[key] = value;
            }
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
                    res.header(header.split(':')[0].trim(), header.split(':')[1].trim());
                });
                res.status(registry.get('response').status || 200).send(output);
                console.log('request send---', new Date().toISOString())
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

            if (config.get('error_log')) {
                registry.get('log').write('JavaScript ' + errorType + ':  ' + error.toString());
            }

            if (config.get('error_display')) {
                res.status(200).send('<b>' + errorType + '</b>: ' + error.toString());
            } else {
                registry.get('log')(config.get('error_page'))
                res.redirect(config.get('error_page'));
            }

            return res.status(200).send(registry.get('response').outputData);
        });
    };
    // loadControllers();
    app.all('/', loadControllers);
}