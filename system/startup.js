// Error reporting
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err);
});

// Check PHP version equivalent in Node.js (we'll just note the version)
// console.log(`Node.js version: ${process.version}`);
if (parseInt(process.version.slice(1).split('.')[0]) < 14) {
    console.error('Node.js 14+ Required');
    process.exit(1);
}

// Set default timezone if not set
if (!process.env.TZ) {
    process.env.TZ = 'UTC';
}

// Windows IIS Compatibility equivalent
if (!process.env.DOCUMENT_ROOT) {
    if (process.env.SCRIPT_FILENAME) {
        process.env.DOCUMENT_ROOT = expressPath.dirname(process.env.SCRIPT_FILENAME);
    }
}

if (!process.env.DOCUMENT_ROOT) {
    if (process.env.PATH_TRANSLATED) {
        process.env.DOCUMENT_ROOT = expressPath.dirname(process.env.PATH_TRANSLATED);
    }
}

if (!process.env.REQUEST_URI) {
    process.env.REQUEST_URI = process.env.PHP_SELF;
    if (process.env.QUERY_STRING) {
        process.env.REQUEST_URI += '?' + process.env.QUERY_STRING;
    }
}

if (!process.env.HTTP_HOST) {
    process.env.HTTP_HOST = process.env.HOST || '';
}

// Check if SSL
if ((process.env.HTTPS && (process.env.HTTPS === 'on' || process.env.HTTPS === '1')) ||
    (process.env.HTTPS && process.env.SERVER_PORT && process.env.SERVER_PORT === '443')) {
    process.env.HTTPS = true;
} else if ((process.env.HTTP_X_FORWARDED_PROTO && process.env.HTTP_X_FORWARDED_PROTO === 'https') ||
    (process.env.HTTP_X_FORWARDED_SSL && process.env.HTTP_X_FORWARDED_SSL === 'on')) {
    process.env.HTTPS = true;
} else {
    process.env.HTTPS = false;
}

// Check forwarded IP
if (process.env.HTTP_X_FORWARDED_FOR) {
    process.env.REMOTE_ADDR = process.env.HTTP_X_FORWARDED_FOR;
} else if (process.env.HTTP_CLIENT_IP) {
    process.env.REMOTE_ADDR = process.env.HTTP_CLIENT_IP;
}
global.modification = (filename) => {
    let file;
    if (typeof DIR_CATALOG !== 'undefined') {
        file = expressPath.join(DIR_MODIFICATION, 'admin', filename.substring(DIR_APPLICATION.length));
    } else if (typeof DIR_OPENCART !== 'undefined') {
        file = expressPath.join(DIR_MODIFICATION, 'install', filename.substring(DIR_APPLICATION.length));
    } else {
        file = expressPath.join(DIR_MODIFICATION, 'catalog', filename.substring(DIR_APPLICATION.length));
    } if (filename.startsWith(DIR_SYSTEM)) {
        file = expressPath.join(DIR_MODIFICATION, 'system', filename.substring(DIR_SYSTEM.length));
    } if (fs.existsSync(file)) {
        return file;
    }
    return filename;
}
global.library = (className) => {
    const file = expressPath.join(DIR_SYSTEM, 'library', className.replace(/\\/g, '/').toLowerCase() + '.js');
    if (fs.existsSync(file)) {
        require(modification(file));
        return true;
    } else {
        return false;
    }
}
require(DIR_SYSTEM + 'helper/general.js');
require(DIR_SYSTEM + 'helper/utf8.js');
fs.readdirSync(DIR_SYSTEM + 'library').map(a => {
    if (is_file(DIR_SYSTEM + 'library/' + a)) {
        global[ucfirst(a.replace('.js', ''))] = require(DIR_SYSTEM + 'library/' + a);
    } else {
        fs.readdirSync(DIR_SYSTEM + 'library/' + a).map(aa => {
            if (is_file(DIR_SYSTEM + 'library/' + a + '/' + aa)) {
                global[ucfirst(a.replace('.js', '')) + ucfirst(aa.replace('.js', ''))] = require(DIR_SYSTEM + 'library/' + a + '/' + aa);
            }
        });
    }
    return a;
})
// Engine
global.Action = require(modification(DIR_SYSTEM + 'engine/action.js'));
global.Controller = require(modification(DIR_SYSTEM + 'engine/controller.js'));
global.Event = require(modification(DIR_SYSTEM + 'engine/event.js'));
global.Router = require(modification(DIR_SYSTEM + 'engine/router.js'));
global.Loader = require(modification(DIR_SYSTEM + 'engine/loader.js'));
global.Model = require(modification(DIR_SYSTEM + 'engine/model.js'));
global.Registry = require(modification(DIR_SYSTEM + 'engine/registry.js'));
global.ProxyLocal = require(modification(DIR_SYSTEM + 'engine/proxy.js'));
// Helper



global.start = (application_config, req, res, next) => {
    console.log(application_config,req.url)
    const framework = require(DIR_SYSTEM + 'framework');
    return new framework().init(application_config, req, res, next);
}