global.AbstractController = require('./abstract');
global.DatabaseController = require('./abstract/database');

global.APP = async () => {
    let adminRoutes = require('./admin');
    let catalogRoutes = require('./catalog');
    let installRoutes = require('./install');
    // boostrap all models

    var compression = require('compression')
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    global.express = require('express');
    const fileUpload = require('express-fileupload');
    global.app = express();
    var useragent = require('useragent');

    useragent(true);
    app.use(fileUpload());
    //
    app.get('/ping', (req, res) => {
        res.send("pong!");
    });

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
    app.use(compression());
    app.use('/image', express.static('image'))
    app.use(morgan('dev'));
    



    app.all('*', (req, res, next) => {
        global._GET = req.query;
        global._POST = req.body;
        global._COOKIE = req.headers.cookie;
        global._FILES = req.files;
        global._SERVER = req;
        global._PARAMS = req.params;
        global.RESPONSE = res;
        next();
    });

    app.use((req, res, next) => {
        if (req.method == 'OPTIONS') {
            res.send(200);
        } else {
            next();
        }
    });
    adminRoutes();
    catalogRoutes();
    installRoutes();
    let port = typeof SERVER_PORT == 'undefined' ? 8080 : SERVER_PORT;
    app.listen(port, () => {
        console.log("Application is running on the port:" + port);
    });
    // app.listen(80, () => {
    //     console.log("Application is running on the port:" + 80);
    // });
};
global.APP();