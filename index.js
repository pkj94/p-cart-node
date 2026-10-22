// Environment from .env (git-ignored): DB_USERNAME, DB_PASSWORD, SESSION_SECRET, NODE_ENV, ... See .env.example
if (require('fs').existsSync(__dirname + '/.env') && process.loadEnvFile) {
    process.loadEnvFile(__dirname + '/.env');
}

const { OpencartSystemEngineAutoloader } = require('./system/startup');
const context = require('./system/engine/context');

global.VERSION = '4.0.2.3';
global.APPROOT = __dirname;
global.date = require('php-date-format');
global.fs = require('fs');
global.expressPath = require('path');
const isProduction = process.env.NODE_ENV === 'production';
// config.json value, with DB_* environment variables taking precedence
const getConfig = (key, from = '') => {
    const value = context.loadConfig(__dirname + '/' + (from ? from + '/' : from) + 'config.json')[key];
    return value === undefined ? '' : value;
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

var compression = require('compression')
const bodyParser = require('body-parser');
const morgan = require('morgan');
global.express = require('express');
const fileUpload = require('express-fileupload');
global.app = express();
global.useragent = require('useragent');

const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// In production only warnings/errors reach the console unless DEBUG=1 (morgan still logs each request)
if (isProduction && process.env.DEBUG !== '1') {
    console.log = console.info = console.debug = () => { };
}

if (isProduction) {
    app.set('trust proxy', 1) // trust first proxy, so req.ip / secure cookies work behind nginx
}

// Security headers. No Content-Security-Policy: the templates rely on inline scripts and styles.
app.use(helmet({
    contentSecurityPolicy: false,
    hsts: isProduction,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Brute-force protection for login, password reset and sign-up posts, and for the API
const routeOf = (req) => String(req.query.route || '').replace('|', '.');
const limitMessage = (message) => ({ error: { warning: message }, message });
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: parseInt(process.env.RATE_LIMIT_AUTH) || 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.method !== 'POST' || !/^(account\/(login|forgotten|register|reset|password)|common\/(login|forgotten|reset)|checkout\/register)/.test(routeOf(req)),
    message: limitMessage('Too many attempts. Please wait 15 minutes and try again.')
}));
app.use(rateLimit({
    windowMs: 60 * 1000,
    limit: parseInt(process.env.RATE_LIMIT_API) || 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => !routeOf(req).startsWith('api/'),
    message: limitMessage('Too many requests. Please slow down.')
}));

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

if (isProduction) {
    sess.cookie.secure = true // serve secure cookies (HTTPS only)
}

app.use(session(sess));

// Uploads: UPLOAD_MAX_MB per file (default 16), rejected with 413 when larger
app.use(fileUpload({
    limits: { fileSize: (parseInt(process.env.UPLOAD_MAX_MB) || 16) * 1024 * 1024, files: 20 },
    abortOnLimit: true
}));
//
app.get('/ping', (req, res) => {
    res.send("pong!");
});

// Form/JSON bodies: BODY_LIMIT (default 5mb) is plenty for admin forms with long descriptions
const bodyLimit = process.env.BODY_LIMIT || '5mb';
app.use(bodyParser.urlencoded({ limit: bodyLimit, extended: true }));
app.use(bodyParser.json({ limit: bodyLimit }));

app.use(compression());

// Browser caching for static files in production (1 day, revalidated with ETag afterwards)
const staticOptions = { maxAge: isProduction ? '1d' : 0 };
app.use('/image', express.static('image', staticOptions));

app.use('/catalog/view/stylesheet', express.static('catalog/view/stylesheet', staticOptions));
app.use('/catalog/view/javascript', express.static('catalog/view/javascript', staticOptions));
app.use('/catalog/view/image', express.static('catalog/view/image', staticOptions));
app.use('/catalog/language', express.static('catalog/language', staticOptions));
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
app.use('/extension', (req, res, next) => isExtensionAsset(req.path) ? next() : res.sendStatus(404), express.static('extension', staticOptions));
app.use('/favicon.ico', express.static('./favicon.ico', staticOptions));
// Apache-style access log in production (PM2 writes it to its log files), short coloured lines in development
app.use(morgan(isProduction ? 'combined' : 'dev'));
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
    req.body = decodeObject(req.body || {});
    next();
});

app.use((req, res, next) => {
    if (req.method == 'OPTIONS') {
        res.sendStatus(204);
    } else {
        next();
    }
});
AppLoad();

let port = parseInt(process.env.PORT) || (typeof SERVER_PORT == 'undefined' ? 8000 : SERVER_PORT);
const server = app.listen(port, () => {
    console.warn("Application is running on the port:" + port);
});

// Process-wide errors go to the console and to system/storage/logs/error.log (same format as the
// request error log), with the stack so the file and line are known
const writeErrorLog = (text) => {
    try {
        const dir = getConfig('DIR_LOGS') || __dirname + '/system/storage/logs/';
        fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(dir + 'error.log', new Date().toISOString().replace('T', ' ').slice(0, 19) + ' - ' + text + '\n');
    } catch (e) {
        console.error('Could not write error log:', e.message);
    }
};

// A rejected promise nobody handled: log it and keep serving other requests
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    writeErrorLog('Node.js Unhandled rejection: ' + (reason && reason.stack ? reason.stack : String(reason)));
});

// An exception outside any request handler leaves the process in an unknown state: log it and
// exit, so PM2 (or nodemon) starts a clean process
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    writeErrorLog('Node.js Uncaught exception: ' + (error && error.stack ? error.stack : String(error)));
    shutdown('uncaughtException', 1);
});

process.on('warning', (warning) => {
    writeErrorLog('Node.js Warning: ' + warning.name + ': ' + warning.message);
});

// Graceful shutdown: stop accepting connections, let running requests finish (max 10s), then exit
let shuttingDown = false;
const shutdown = (signal, code = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.warn(`${signal} received, shutting down`);
    setTimeout(() => process.exit(code), 10000).unref();
    server.close(() => process.exit(code));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
