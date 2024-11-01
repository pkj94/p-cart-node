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

let adminRoutes = require('./admin');
let catalogRoutes = require('./catalog');
let installRoutes;
if (fs.existsSync('./install'))
    installRoutes = require('./install');
// boostrap all models
process.setMaxListeners(100)
var compression = require('compression')
const bodyParser = require('body-parser');
const morgan = require('morgan');
global.express = require('express');
const fileUpload = require('express-fileupload');
global.app = express();
global.useragent = require('useragent');

const cookieParser = require("cookie-parser");
// Start Optimize
const autoloader = new OpencartSystemEngineAutoloader();
autoloader.register(`Opencart${getConfig('APPLICATION', 'admin')}`, getConfig('DIR_APPLICATION', 'admin'));
autoloader.register(`Opencart${getConfig('APPLICATION')}`, getConfig('DIR_APPLICATION'));
if (installRoutes)
    autoloader.register(`OpencartInstall`, getConfig('DIR_OPENCART') + '/install/');
autoloader.register('OpencartExtension', getConfig('DIR_EXTENSION'));
autoloader.register('OpencartSystem', getConfig('DIR_SYSTEM'));
// Registry
const registry = new global['\Opencart\System\Engine\Registry']();
registry.set('autoloader', autoloader);
const config = new global['\Opencart\System\Engine\Config']();
registry.set('config', config);
// End Optimize
app.use(cookieParser());
const session = require('express-session')
var sess = {
    secret: require('crypto').randomBytes(26).toString('hex').slice(0, 26),
    cookie: {
        maxAge: 30 * 60 * 60 * 1000,
        httpOnly: false,
        secure: false
    },
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

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(compression());
app.use('/image', express.static('image'));
// admin
app.use('/admin/view/stylesheet', express.static(getConfig('DIR_APPLICATION', 'admin') + 'view/stylesheet'));
app.use('/admin/view/javascript', express.static(getConfig('DIR_APPLICATION', 'admin') + 'view/javascript'));
app.use('/admin/view/image', express.static(getConfig('DIR_APPLICATION', 'admin') + 'view/image'));
app.use('/admin/language', express.static(getConfig('DIR_APPLICATION', 'admin') + '/language'));

app.use('/catalog/view/stylesheet', express.static('catalog/view/stylesheet'));
app.use('/catalog/view/javascript', express.static('catalog/view/javascript'));
app.use('/catalog/view/image', express.static('catalog/view/image'));
app.use('/catalog/language', express.static('catalog/language'));
app.use('/extension', express.static('extension'));
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

adminRoutes(registry);
if (installRoutes)
    installRoutes(registry);
app.use('/error.html', express.static('./error.html'));
catalogRoutes(registry);



let port = typeof SERVER_PORT == 'undefined' ? 8080 : SERVER_PORT;
app.listen(port, () => {
    console.log("Application is running on the port:" + port);
});
// app.listen(80, () => {
//     console.log("Application is running on the port:" + 80);
// });
