const mysql = require('mysql2');
const session = require('express-session');

// express-session store backed by OpenCart's `session` table (session_id varchar(32), data text, expire datetime).
// Sessions survive restarts and are shared by every process, unlike the default MemoryStore.
module.exports = class MySQLSessionStore extends session.Store {
    constructor({ host, user, password, database, port, prefix = '', ttl = 86400 }) {
        super();
        this.table = '`' + prefix + 'session`';
        this.ttl = ttl;
        this.pool = mysql.createPool({ host, user, password, database, port, charset: 'utf8mb4', connectionLimit: 3, enableKeepAlive: true });
        // Remove expired rows once an hour
        this.cleanup = setInterval(() => this.pool.query('DELETE FROM ' + this.table + ' WHERE `expire` < NOW()', () => { }), 3600 * 1000);
        this.cleanup.unref();
    }

    expires(sess) {
        const expires = sess && sess.cookie && sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + this.ttl * 1000);
        return Math.floor(expires.getTime() / 1000);
    }

    get(sid, callback) {
        this.pool.query('SELECT `data` FROM ' + this.table + ' WHERE `session_id` = ? AND `expire` > NOW()', [sid], (error, rows) => {
            if (error) return callback(error);
            if (!rows.length) return callback(null, null);
            try {
                callback(null, JSON.parse(rows[0].data));
            } catch (e) {
                callback(null, null);
            }
        });
    }

    set(sid, sess, callback = () => { }) {
        this.pool.query('INSERT INTO ' + this.table + ' (`session_id`, `data`, `expire`) VALUES (?, ?, FROM_UNIXTIME(?)) ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `expire` = VALUES(`expire`)',
            [sid, JSON.stringify(sess), this.expires(sess)], (error) => callback(error || null));
    }

    touch(sid, sess, callback = () => { }) {
        this.pool.query('UPDATE ' + this.table + ' SET `expire` = FROM_UNIXTIME(?) WHERE `session_id` = ?', [this.expires(sess), sid], (error) => callback(error || null));
    }

    destroy(sid, callback = () => { }) {
        this.pool.query('DELETE FROM ' + this.table + ' WHERE `session_id` = ?', [sid], (error) => callback(error || null));
    }
}
