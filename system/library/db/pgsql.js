const { Client } = require('pg');

module.exports = class PgSQLDBLibrary {
    constructor(hostname, username, password, database, port = '5432') {
        this.client = new Client({
            host: hostname,
            port: port,
            user: username,
            password: password,
            database: database
        });

        this.client.connect()
            .then(() => {
                return this.query("SET CLIENT_ENCODING TO 'UTF8'");
            })
            .then(() => {
                return this.query(`SET TIMEZONE = '${this.escape(new Date().toISOString().slice(-6))}'`);
            })
            .catch((err) => {
                throw new Error(`Error: Could not make a database link using ${username}@${hostname}`);
            });
    }

    async query(sql) {
        try {
            const res = await this.client.query(sql);

            if (res.command === 'SELECT') {
                return {
                    row: res.rows[0] || {},
                    rows: res.rows,
                    num_rows: res.rowCount
                };
            }

            return true;
        } catch (err) {
            throw new Error(`Error: ${err.message} <br/>${sql}`);
        }
    }

    escape(value) {
        return this.client.escapeIdentifier(value);
    }

    async countAffected() {
        const res = await this.client.query('SELECT COUNT(*) FROM '+DB_PREFIX+'affected_rows');
        return res.rowCount;
    }

    async getLastId() {
        const res = await this.query("SELECT LASTVAL() AS id");
        return res.row.id;
    }

    async isConnected() {
        return this.client._connected;
    }

    close() {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
    }
}

