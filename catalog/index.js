
module.exports = function () {
    const loadControllers = async (req, res, next) => {
        // console.log('params=======', req.params)
        if (fs.readFileSync(APPROOT + '/config.json').toString())
            for (let [key, value] of Object.entries(require(APPROOT + '/config.json'))) {
                global[key] = value;
            }
        // console.log('DIR_APPLICATION', typeof DIR_APPLICATION)
        if (typeof DIR_APPLICATION == 'undefined')
            return res.redirect('/install');
        // console.log(typeof DIR_APPLICATION == 'undefined')
        new Framework().init(req, res, next).then(output => {
            if (registry.get('response').redirect) {
                res.redirect(registry.get('response').redirect);
            } else {
                // console.log(global.registry.get('response').headers)
                global.registry.get('response').headers.forEach(header => {
                    // console.log('header----', header)
                    res.header(header.split(':')[0].trim(), header.split(':')[1].trim());
                });
                res.status(global.registry.get('response').status || 200).send(output);
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
    };
    // loadControllers();
    app.all('/', loadControllers);
}