const fs = require('fs');
global.date = require('php-date-format');
global.Framework = require('./system/framework');

global.APP = async () => {
    //Autoload Engine
    fs.readdirSync('system/engine').forEach((engine) => {
        let name = engine.charAt(0).toUpperCase() + engine.slice(1);
        global[name.replace('.js', '')] = require('./system/engine/' + engine)
    });
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
    global.useragent = require('useragent');
    const cookieParser = require("cookie-parser");

    app.use(cookieParser());
    const session = require('express-session')
    var sess = {
        secret: require('crypto').randomBytes(26).toString('hex').slice(0, 26),
        cookie: {},
        resave: false,
        saveUninitialized: true
    }

    if (app.get('env') === 'production') {
        app.set('trust proxy', 1) // trust first proxy
        sess.cookie.secure = true // serve secure cookies
    }

    app.use(session(sess));
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