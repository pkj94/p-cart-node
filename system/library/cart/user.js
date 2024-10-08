const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = class UserLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.request = registry.get('request');
        this.session = registry.get('session');
        this.user_id = 0;
        this.username = '';
        this.user_group_id = 0;
        this.email = '';
        this.permission = {};
        this.init();
    }
    async init() {
        // console.log('library user-----', this.user_id, JSON.stringify(this.permission));
        if (this.session.data.user_id && !this.user_id) {
            const user_query = await this.db.query(`SELECT * FROM ${DB_PREFIX}user WHERE user_id = ${this.session.data.user_id} AND status = '1'`);

            if (user_query.num_rows) {
                this.user_id = user_query.row.user_id;
                this.username = user_query.row.username;
                this.user_group_id = user_query.row.user_group_id;
                this.email = user_query.row.email;

                await this.db.query(`UPDATE ${DB_PREFIX}user SET ip = '${this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress) : '')}' WHERE user_id = ${this.session.data.user_id}`);

                const user_group_query = await this.db.query(`SELECT permission FROM ${DB_PREFIX}user_group WHERE user_group_id = ${user_query.row.user_group_id}`);
                this.permission = JSON.parse(user_group_query.row.permission);
            } else {
                this.logout();
            }
        }
    }
    login(username, password) {
        return new Promise(async (resolve, reject) => {
            const user_query = await this.db.query(`SELECT * FROM ${DB_PREFIX}user WHERE username = '${username}' AND status = '1'`);
            if (user_query.num_rows) {
                let rehash = false;
                if (await bcrypt.compare(password, user_query.row.password)) {
                    rehash = bcrypt.getRounds(user_query.row.password) < 10;
                } else if (user_query.row.salt && user_query.row.password === crypto.createHash('sha1').update(user_query.row.salt + crypto.createHash('sha1').update(user_query.row.salt + crypto.createHash('sha1').update(password).digest('hex')).digest('hex')).digest('hex')) {
                    rehash = true;
                } else if (user_query.row.password === crypto.createHash('md5').update(password).digest('hex')) {
                    rehash = true;
                } else {
                    resolve(false);
                }
                if (rehash) {
                    await this.db.query(`UPDATE ${DB_PREFIX}user SET password = '${await bcrypt.hash(password, 10)}' WHERE user_id = ${user_query.row.user_id}`);
                }

                this.session.data.user_id = user_query.row.user_id;

                this.user_id = user_query.row.user_id;
                this.username = user_query.row.username;
                this.user_group_id = user_query.row.user_group_id;
                this.email = user_query.row.email;

                const user_group_query = await this.db.query(`SELECT permission FROM ${DB_PREFIX}user_group WHERE user_group_id = ${user_query.row.user_group_id}`);
                this.permission = JSON.parse(user_group_query.row.permission);
                await this.session.save(this.session.data);
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    logout() {
        delete this.session.data.user_id;

        this.user_id = 0;
        this.username = '';
        this.user_group_id = 0;
        this.email = '';
    }

    async hasPermission(key, value) {
        await this.init();
        return this.permission[key] ? this.permission[key].includes(value) : false;
    }

    async isLogged() {
        await this.init();
        return this.user_id !== 0;
    }

    async getId() {
        await this.init();
        return this.user_id;
    }

    async getUserName() {
        await this.init();
        return this.username;
    }

    async getGroupId() {
        await this.init();
        return this.user_group_id;
    }

    async getEmail() {
        await this.init();
        return this.email;
    }
}

