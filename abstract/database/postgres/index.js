const massive = require('massive');

module.exports = class Postgres {
    constructor(defaults) {
        this.config = defaults;
    }

    async createConnection() {
        this.db_connection = await massive({
            host: this.config.host,
            port: this.config.port,
            database: this.config.database,
            user: this.config.user,
            password: this.config.pass
        });
    }

    createModel(opts) {
        return this.db_connection[opts.name];
    }
}