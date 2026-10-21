const mysql = require('mysql2');

// One pool per set of credentials, shared by every request. Opening a new connection per
// request leaked connections ("Too many connections") and made queries queue behind each other.
const pools = {};

module.exports = class MySQLiDBLibrary {
    constructor(hostname, username, password, database, port = '3306', debug = false) {
        this.error = `Error: Could not make a database link using ${username}@${hostname}! Message: `;
        const key = [hostname, username, password, database, port].join('|');
        if (!pools[key]) {
            const pool = mysql.createPool({
                host: hostname,
                user: username,
                password: password,
                database: database,
                port: port,
                charset: 'utf8mb4',
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit: 0,
                connectTimeout: 10000,
                enableKeepAlive: true
            });
            // Same session setup as OpenCart's mysqli driver, run once on every new pooled connection
            pool.on('connection', (connection) => {
                const logError = (error) => error && console.error(this.error + error.message);
                connection.query("SET SESSION sql_mode = 'NO_ZERO_IN_DATE,NO_ENGINE_SUBSTITUTION'", logError);
                connection.query("SET FOREIGN_KEY_CHECKS = 0", logError);
            });
            pools[key] = pool;
        }
        this.connection = pools[key];
        // DB_DEBUG logs each SQL statement. It is not passed to mysql2, whose debug option dumps every raw packet (row data included).
        this.debug = debug;
        this.insertId = 0;
        this.affectedRows = 0;
    }

    // Verifies the credentials; rejects (like PHP's constructor throwing) when the server can't be reached.
    connect() {
        return new Promise((resolve, reject) => {
            this.connection.getConnection((err, connection) => {
                if (err) {
                    return reject(new Error(this.error + err.message));
                }
                connection.release();
                resolve(this);
            });
        });
    }

    /**
     * Like OpenCart's PHP mysqli::query():
     * - SELECT/SHOW/... returns { num_rows, row, rows }
     * - INSERT/UPDATE/DELETE/... returns true
     * On a SQL or connection error it logs and resolves an empty result instead of rejecting, so a bad
     * query never leaves a request hanging or crashes callers that read rows/row/num_rows.
     */
    query(sql) {
        return new Promise((resolve) => {
            const empty = { num_rows: 0, row: {}, rows: [] };
            this.connection.getConnection((err, connection) => {
                if (err) {
                    console.error(new Error(this.error + err.message));
                    return resolve(empty);
                }
                // Keep the MySQL session time zone equal to Node's (process.env.TZ is set from config_timezone)
                const timezone = MySQLiDBLibrary.timezone();
                if (connection.timezone !== timezone) {
                    connection.timezone = timezone;
                    connection.query(`SET time_zone = '${timezone}'`, (error) => error && console.error(this.error + error.message));
                }
                if (this.debug) {
                    console.log('SQL:', sql);
                }
                connection.query({ sql: sql, timeout: 120000 }, (error, results) => {
                    connection.release();
                    if (error) {
                        console.error(new Error(`Error: ${error.message}<br/>Error No: ${error.errno}<br/>${sql}`));
                        return resolve(empty);
                    }
                    if (Array.isArray(results)) {
                        return resolve({
                            num_rows: results.length,
                            row: results[0] || {},
                            rows: results
                        });
                    }
                    this.affectedRows = results.affectedRows || 0;
                    if (results.insertId) {
                        this.insertId = results.insertId;
                    }
                    resolve(true);
                });
            });
        });
    }

    // Not date('P'): php-date-format rounds half-hour zones (+05:30 becomes +06:30)
    static timezone() {
        const offset = -new Date().getTimezoneOffset();
        return (offset < 0 ? '-' : '+') + String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0') + ':' + String(Math.abs(offset) % 60).padStart(2, '0');
    }

    escape(value) {
        return this.connection.escape(value);
    }

    escapeId(value) {
        return this.connection.escapeId(value);
    }

    countAffected() {
        return this.affectedRows;
    }

    getLastId() {
        return this.insertId;
    }

    isConnected() {
        return !!this.connection;
    }

    // The pool is shared by all requests, so a request must not end it.
    close() {
    }
}
