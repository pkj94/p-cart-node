const { OpencartSystemEngineAutoloader } = require('./system/startup');

global.VERSION = '4.0.2.3';
global.APPROOT = __dirname;
global.date = require('php-date-format');
global.fs = require('fs');
global.expressPath = require('path');
const getConfig = (key, from = '') => {
    if (fs.readFileSync(__dirname + '/' + (from ? from + '/' : from) + 'config.json').toString())
        return (require(__dirname + '/' + (from ? from + '/' : from) + 'config.json'))[key]
    return '';
}
// The store counts as installed once config.json has database details. The installer is then
// disabled, otherwise anyone could re-run it and take over the store. ALLOW_INSTALL=1 re-enables it.
const isInstalled = () => !!getConfig('DB_DATABASE') && fs.existsSync(__dirname + '/admin/config.json');

global.AppLoad = () => {
    let adminRoutes = require('./admin');
    let catalogRoutes = require('./catalog');
    let installRoutes;
    if (fs.existsSync('./install') && (!isInstalled() || process.env.ALLOW_INSTALL === '1'))
        installRoutes = require('./install');
    // boostrap all models
    // Start Optimize
    // console.log('installRoutes---', installRoutes)
    const autoloader = new OpencartSystemEngineAutoloader();
    autoloader.register(`Opencart${getConfig('APPLICATION', 'admin')}`, getConfig('DIR_APPLICATION', 'admin'));
    autoloader.register(`Opencart${getConfig('APPLICATION')}`, getConfig('DIR_APPLICATION'));
    if (installRoutes) {
        autoloader.register(`OpencartInstall`, (getConfig('DIR_OPENCART') || __dirname) + '/install/');
    }
    autoloader.register('OpencartExtension', getConfig('DIR_EXTENSION'));
    autoloader.register('OpencartSystem', getConfig('DIR_SYSTEM'));
    // Registry
    const registry = new global['OpencartSystemEngineRegistry']();
    registry.set('autoloader', autoloader);
    const config = new global['OpencartSystemEngineConfig']();
    registry.set('config', config);
    // End Optimize
    // Install
    if (installRoutes) {
        let path = __dirname.replaceAll('\\', '/') + '/install/';
        app.use('/install/view/stylesheet', express.static(path + 'view/stylesheet'));
        app.use('/install/view/javascript', express.static(path + 'view/javascript'));
        app.use('/install/view/image', express.static(path + 'view/image'));
        app.use('/install/language', express.static(path + 'language'));
    }

    // admin
    app.use('/admin/view/stylesheet', express.static(getConfig('DIR_APPLICATION', 'admin') + 'view/stylesheet'));
    app.use('/admin/view/javascript', express.static(getConfig('DIR_APPLICATION', 'admin') + 'view/javascript'));
    app.use('/admin/view/image', express.static(getConfig('DIR_APPLICATION', 'admin') + 'view/image'));
    app.use('/admin/language', express.static(getConfig('DIR_APPLICATION', 'admin') + '/language'));
    adminRoutes(registry);

    if (installRoutes) {
        installRoutes(registry);
    }
    app.use('/error.html', express.static('./error.html'));
    catalogRoutes(registry);

}

process.setMaxListeners(100)
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

// A fixed secret, so restarts don't log everyone out: SESSION_SECRET env var, else one generated
// once and kept in system/storage/session_secret (git-ignored)
const sessionSecret = () => {
    if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
    const file = __dirname + '/system/storage/session_secret';
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, require('crypto').randomBytes(32).toString('hex'), { mode: 0o600 });
    }
    return fs.readFileSync(file).toString().trim();
}

var sess = {
    secret: sessionSecret(),
    cookie: {
        maxAge: 30 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    },
    resave: false,
    // Guest carts are keyed by session id, so the id must stay stable from the first visit
    saveUninitialized: true
}

// Keep sessions in the database (OpenCart's session table) once installed; before install there is no DB yet
if (getConfig('DB_DATABASE')) {
    const MySQLSessionStore = require('./system/session_store');
    sess.store = new MySQLSessionStore({
        host: getConfig('DB_HOSTNAME'),
        user: getConfig('DB_USERNAME'),
        password: getConfig('DB_PASSWORD'),
        database: getConfig('DB_DATABASE'),
        port: getConfig('DB_PORT'),
        prefix: getConfig('DB_PREFIX'),
        ttl: sess.cookie.maxAge / 1000
    });
}

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

app.use(fileUpload());
//
app.get('/ping', (req, res) => {
    res.send("pong!");
});

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(compression());
app.use('/image', express.static('image'));

app.use('/catalog/view/stylesheet', express.static('catalog/view/stylesheet'));
app.use('/catalog/view/javascript', express.static('catalog/view/javascript'));
app.use('/catalog/view/image', express.static('catalog/view/image'));
app.use('/catalog/language', express.static('catalog/language'));
// Only extension view assets are public (extension/<name>/admin|catalog/view/...); the controllers,
// models and config next to them are server code and must not be downloadable
const isExtensionAsset = (urlPath) => {
    let decoded;
    try {
        decoded = decodeURIComponent(urlPath);
    } catch (e) {
        return false;
    }
    return /^\/[\w-]+\/(admin|catalog)\/view\/(?!template\/)/.test(decoded) && !decoded.split(/[\\/]/).includes('..');
}
app.use('/extension', (req, res, next) => isExtensionAsset(req.path) ? next() : res.sendStatus(404), express.static('extension'));
app.use('/favicon.ico', express.static('./favicon.ico'));
app.use(morgan('dev'));
const decodeObject = (obj) => {
    for (let [key, value] of Object.entries(obj)) {
        // console.log('value----', typeof value, value)
        if (typeof value == 'object') {
            if (Array.isArray(value)) {
                // console.log('value----', value)
                if (value.filter(a => a == '0' || a == '1').length == value.length && value.length == 2) {
                    obj[key] = decodeURIComponent(value[1]);
                } else
                    for (let i = 0; i < value.length; i++) {
                        obj[key][i] = decodeObject(value[i]);
                    }
            } else
                obj[key] = decodeObject(value);
        }
        else {
            try {
                obj[key] = decodeURIComponent(value);
            } catch (e) {
                obj[key] = value
            }
        }
    }
    return obj;
}
app.all('*', (req, res, next) => {
    console.log('request start---', new Date().toISOString())
    // console.log('decoded before---', req.body)
    req.body = decodeObject(req.body);
    // console.log('decoded---', req.body)
    next();
});

app.use((req, res, next) => {
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});
AppLoad();

let port = typeof SERVER_PORT == 'undefined' ? 8000 : SERVER_PORT;
app.listen(port, () => {
    console.log("Application is running on the port:" + port);
});
// app.listen(80, () => {
//     console.log("Application is running on the port:" + 80);
// });
