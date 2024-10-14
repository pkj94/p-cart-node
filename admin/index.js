const fs = require('fs');
module.exports = function () {
    const loadAdminControllers = async (req, res, next) => {
        // console.log('-=-=-=-=-=-',req.params)
        if (fs.readFileSync('./config.json').toString())
            for (let [key, value] of Object.entries(require('./config.json'))) {
                global[key] = value;
            }
        // console.log('DIR_APPLICATION', typeof DIR_APPLICATION)
        if (typeof DIR_APPLICATION == 'undefined')
            return res.redirect('/install');
        // console.log(typeof DIR_APPLICATION == 'undefined')
        app.use('/admin/view/stylesheet', express.static(DIR_APPLICATION + 'view/stylesheet'));
        app.use('/admin/view/javascript', express.static(DIR_APPLICATION + 'view/javascript'));
        app.use('/admin/view/image', express.static(DIR_APPLICATION + 'view/image'));
        app.use('/admin/language', express.static(DIR_APPLICATION + '/language'));

        // Registry
        global.registry = new Registry();
        global.config = new Config();
        registry.set('config', global.config);
        new Framework().init(req, res, next).then(output => {
            if (registry.get('response').end) {
                global.registry.get('response').headers.forEach(header => {
                    res.header((header.split(':')[0] || '').trim(), (header.split(':')[1] || '').trim());
                });
                res.end(registry.get('response').end);
            } else if (registry.get('response').file) {

                global.registry.get('response').headers.forEach(header => {
                    res.header((header.split(':')[0] || '').trim(), (header.split(':')[1] || '').trim());
                });
                res.sendFile(registry.get('response').file);
            } else if (registry.get('response').redirect) {
                res.redirect(registry.get('response').redirect);
            } else {
                global.registry.get('response').headers.forEach(header => {
                    res.header((header.split(':')[0] || '').trim(), (header.split(':')[1] || '').trim());
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
    };
    // loadAdminControllers();
    app.all('/admin', loadAdminControllers);
}