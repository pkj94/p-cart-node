const fs = require('fs');
module.exports = class Database extends Controller {
    index() {
        if (fs.existsSync(DIR_OPENCART + 'config.json') && fs.statSync(DIR_OPENCART + 'config.json').size > 0) {
            const config = {};
            const lines = require(DIR_OPENCART + 'config.json');
            for (const [key,value] of Object.entries(lines)) {
                if(key.toUpperCase().includes('DB_')){
                    global[key]=value;
                }
            }
            const port = DB_PORT || 3306;
            this.registry.set('db', new DbLibrary(
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
