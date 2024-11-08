
module.exports = class Database extends Controller {
    async index() {
        if (fs.existsSync(DIR_OPENCART + 'config.json') && fs.statSync(DIR_OPENCART + 'config.json').size > 0) {
            const lines = require(DIR_OPENCART + 'config.json');
            for (const [key, value] of Object.entries(lines)) {
                if (key.toUpperCase().includes('DB_')) {
                    global[key] = value;
                }
            }
            const port = DB_PORT || 3306;
            let db = new global.Db(
                DB_DRIVER,
                DB_HOSTNAME,
                DB_USERNAME,
                DB_PASSWORD,
                DB_DATABASE,
                port
            );
            await db.connect();
            this.registry.set('db',db);
        }
    }
}
