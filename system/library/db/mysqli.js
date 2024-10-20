const mysql = require('mysql');

module.exports = class MySQLiDBLibrary {
    constructor(hostname, username, password, database, port = '3306', debug = false) {
        this.error = `Error: Could not make a database link using ${username}@${hostname}! Message: `;
        this.connection = mysql.createConnection({
            host: hostname,
            user: username,
            password: password,
            database: database,
            port: port,
            charset: 'utf8mb4',
            debug: debug
        });

        this.insertId = 0;
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect(async (err) => {
                if (err) {
                    reject(new Error(this.error + err.message));
                } else {
                    await this.query("SET SESSION sql_mode = 'NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION'");
                    await this.query("SET FOREIGN_KEY_CHECKS = 0");
                    await this.query(`SET time_zone = '${date('P')}'`);
                    resolve(this.connection)
                }
            });
        });
    }
    query(sql) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (error, results) => {
                if (error) {
                    reject(new Error(`Error: ${error.message}\nSQL: ${sql}`));
                } else {
                    if (Array.isArray(results)) {
                        const result = {
                            num_rows: results.length,
                            row: results[0] || {},
                            rows: results
                        };
                        resolve(result);
                    } else {
                        if (results.insertId)
                            this.insertId = results.insertId;
                        resolve(results.insertId || true);
                    }
                }
            });
        });
    }

    escape(value) {
        return this.connection.escape(value);
    }

    countAffected() {
        return this.connection.affectedRows;
    }

    getLastId() {
        return this.insertId;
    }

    isConnected() {
        return !!this.connection;
    }

    close() {
        if (this.connection) {
            this.connection.end();
            this.connection = null;
        }
    }
}

