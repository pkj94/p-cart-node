
global.VERSION = '4.0.2.3';
global.APPROOT = __dirname;
global.date = require('php-date-format');
global.fs = require('fs');
global.expressPath = require('path');

global.APP = () => {
    let adminRoutes = require('./admin');
    let catalogRoutes = require('./catalog');
    let installRoutes;
    if (fs.existsSync('./install'))
        installRoutes = require('./install');
    // admin
    adminRoutes();
    if (installRoutes)
        installRoutes();
    app.use('/error.html', express.static('./error.html'));
    catalogRoutes();

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
app.use(bodyParser.json());

app.use(compression());
app.use('/image', express.static('image'));

app.use('/install/view/stylesheet', express.static('install/view/stylesheet'));
app.use('/install/view/javascript', express.static('install/view/javascript'));
app.use('/install/view/image', express.static('install/view/image'));
app.use('/install/language', express.static('install/language'));

app.use('/catalog/view/stylesheet', express.static('catalog/view/stylesheet'));
app.use('/catalog/view/javascript', express.static('catalog/view/javascript'));
app.use('/catalog/view/image', express.static('catalog/view/image'));
app.use('/catalog/language', express.static('catalog/language'));
app.use('/extension', express.static('extension'));
app.use('/favicon.ico', express.static('./favicon.ico'));
app.use(morgan('dev'));
const parseFormData = (formData) => {
    const data = {};

    for (const [key, value] of Object.entries(formData)) {
        const keys = key.match(/[^[\]]+/g); // Extract keys from the nested structure
        keys.reduce((acc, key, index) => {
            return acc[key] = acc[key] || (index === keys.length - 1 ? value : {});
        }, data);
    }

    return data;
}

app.all('*', (req, res, next) => {
    console.log('request start---', new Date().toISOString())
    // console.log('decoded before---', req.body)
    req.body = parseFormData(req.body);
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
APP();

let port = typeof SERVER_PORT == 'undefined' ? 8080 : SERVER_PORT;
app.listen(port, () => {
    console.log("Application is running on the port:" + port);
});
// app.listen(80, () => {
//     console.log("Application is running on the port:" + 80);
// });
