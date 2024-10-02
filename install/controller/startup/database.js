const fs = require('fs');
module.exports = class Database extends Controller {
    index() {
        if (fs.existsSync(DIR_OPENCART, 'config.js') && fs.statSync(DIR_OPENCART, 'config.js').size > 0) {
            const config = {};
            const lines = fs.readFileSync(DIR_OPENCART, 'config.js').split('\n');
            for (const line of lines) {
                if (line.toUpperCase().includes('DB_') && /define\((.*),\s+(.*)\)/.test(line)) {
                    const match = line.match(/define\((.*),\s+(.*)\)/);
                    process.env[match[1].trim()] = match[2].trim();
                }
            }
            const port = DB_PORT || require('mysql').createConnection().port;
            this.registry.set('db', new (require(DIR_OPENCART + '/system/Library/DB'))(
                DB_DRIVER,
                DB_HOSTNAME,
                DB_USERNAME,
                DB_PASSWORD,
                DB_DATABASE,
                port
            ));
        }
    }
}
