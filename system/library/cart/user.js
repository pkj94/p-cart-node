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
        if (this.session.data['user_id']) {
            const user_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "user WHERE user_id = '" + this.session.data['user_id'] + "' AND status = '1'");

            if (user_query.num_rows) {
                this.user_id = user_query.row['user_id'];
                this.username = user_query.row['username'];
                this.user_group_id = user_query.row['user_group_id'];

                await this.db.query("UPDATE " + DB_PREFIX + "user SET ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress) : '')) + "' WHERE user_id = '" + this.session.data['user_id'] + "'");

                const user_group_query = await this.db.query("SELECT permission FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_query.row['user_group_id'] + "'");

                let permissions = JSON.parse(user_group_query.row['permission']);

                if (typeof permissions == 'object') {
                    for (let [key, value] of Object.entries(permissions)) {
                        this.permission[key] = value;
                    }
                }
            } else {
                await this.logout();
            }
        }
    }


    async login(username, password) {
        const user_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "user WHERE username = '" + this.db.escape(username) + "' AND (password = SHA1(CONCAT(salt, SHA1(CONCAT(salt, SHA1('" + this.db.escape(password) + "'))))) OR password = '" + this.db.escape(md5(password)) + "') AND status = '1'");

        if (user_query.num_rows) {
            this.session.data['user_id'] = user_query.row['user_id'];

            this.user_id = user_query.row['user_id'];
            this.username = user_query.row['username'];
            this.user_group_id = user_query.row['user_group_id'];

            const user_group_query = await this.db.query("SELECT permission FROM " + DB_PREFIX + "user_group WHERE user_group_id = '" + user_query.row['user_group_id'] + "'");

            let permissions = JSON.parse(user_group_query.row['permission']);

            if (typeof permissions == 'object') {
                for (let [key, value] of Object.entries(permissions)) {
                    this.permission[key] = value;
                }
            }

            return true;
        } else {
            return false;
        }
    }

    async logout() {
        delete this.session.data['user_id'];

        this.user_id = '';
        this.username = '';
    }

    async hasPermission(key, value) {
        await this.init();
        if ((this.permission[key])) {
            return (this.permission[key]||[]).includes(value);
        } else {
            return false;
        }
    }

    async isLogged() {
        await this.init();
        return this.user_id;
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
}

