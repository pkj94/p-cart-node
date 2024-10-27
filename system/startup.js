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
        process.env.DOCUMENT_ROOT = path.dirname(process.env.SCRIPT_FILENAME);
    }
}

if (!process.env.DOCUMENT_ROOT) {
    if (process.env.PATH_TRANSLATED) {
        process.env.DOCUMENT_ROOT = path.dirname(process.env.PATH_TRANSLATED);
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

// Load environment variables
// dotenv.config({ path: path.join(__dirname, 'config.env') });

// Autoloader equivalent in Node.js
require('./helper/general');
module.exports = {
    '\Opencart\System\Engine\Autoloader': require('./engine/autoloader'),
    '\Opencart\System\Engine\Config': require('./engine/config')
};
