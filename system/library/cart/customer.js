const bcrypt = require('bcrypt');
const crypto = require('crypto');
module.exports = class CustomerLibrary {
    constructor(registry) {
        this.db = registry.get('db');
        this.config = registry.get('config');
        this.request = registry.get('request');
        this.session = registry.get('session');
        this.customer_id = 0;
        this.firstname = '';
        this.lastname = '';
        this.customer_group_id = 0;
        this.email = '';
        this.telephone = '';
        this.newsletter = false;
        this.address_id = '';
    }
    async init() {
        if (this.session.data.customer_id) {
            const customer_query = await this.db.query(`SELECT * FROM ${DB_PREFIX}customer WHERE customer_id = ${this.session.data.customer_id} AND status = '1'`);
            if (customer_query.num_rows) {
                this.customer_id = customer_query.row.customer_id;
                this.firstname = customer_query.row.firstname;
                this.lastname = customer_query.row.lastname;
                this.customer_group_id = customer_query.row.customer_group_id;
                this.email = customer_query.row.email;
                this.telephone = customer_query.row.telephone;
                this.newsletter = customer_query.row.newsletter;
                this.address_id = customer_query.row.address_id;

                await this.db.query(`UPDATE ${DB_PREFIX}customer SET language_id = ${this.config.get('config_language_id')}, ip = '${this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress) : '')}' WHERE customer_id = ${this.customer_id}`);

                const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer_ip WHERE customer_id = '" + this.session.data['customer_id'] + "' AND ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress) : '')) + "'");

                if (!query.num_rows) {
                    await this.db.query("INSERT INTO " + DB_PREFIX + "customer_ip SET customer_id = '" + this.session.data['customer_id'] + "', ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
                        this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                            this.request.server.socket.remoteAddress ||
                            this.request.server.connection.socket.remoteAddress) : '')) + "', date_added = NOW()");
                }
            } else {
                await this.logout();
            }
        }
    }
    async login(email, password, override = false) {
        let customer_query = {};
        if (override) {
            customer_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer WHERE LOWER(email) = '" + this.db.escape(oc_strtolower(email)) + "' AND status = '1'");
        } else {
            customer_query = await this.db.query("SELECT * FROM " + DB_PREFIX + "customer WHERE LOWER(email) = '" + this.db.escape(oc_strtolower(email)) + "' AND (password = SHA1(CONCAT(salt, SHA1(CONCAT(salt, SHA1('" + this.db.escape(password) + "'))))) OR password = '" + this.db.escape(md5(password)) + "') AND status = '1'");
        }

        if (customer_query.num_rows) {
            this.session.data['customer_id'] = customer_query.row['customer_id'];

            this.customer_id = customer_query.row['customer_id'];
            this.firstname = customer_query.row['firstname'];
            this.lastname = customer_query.row['lastname'];
            this.customer_group_id = customer_query.row['customer_group_id'];
            this.email = customer_query.row['email'];
            this.telephone = customer_query.row['telephone'];
            this.newsletter = customer_query.row['newsletter'];
            this.address_id = customer_query.row['address_id'];

            await this.db.query("UPDATE " + DB_PREFIX + "customer SET language_id = '" + this.config.get('config_language_id') + "', ip = '" + this.db.escape(this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : '')) + "' WHERE customer_id = '" + this.customer_id + "'");

            return true;
        } else {
            return false;
        }
    }


    logout() {
        delete this.session.data.customer_id;

        this.customer_id = 0;
        this.firstname = '';
        this.lastname = '';
        this.customer_group_id = 0;
        this.email = '';
        this.telephone = '';
        this.newsletter = false;
        this.address_id = '';
    }

    async isLogged() {
        await this.init();
        return this.customer_id !== 0;
    }

    async getId() {
        await this.init();
        return this.customer_id;
    }

    async getFirstName() {
        await this.init();
        return this.firstname;
    }

    async getLastName() {
        await this.init();
        return this.lastname;
    }

    async getGroupId() {
        await this.init();
        return this.customer_group_id;
    }

    async getEmail() {
        await this.init();
        return this.email;
    }

    async getTelephone() {
        await this.init();
        return this.telephone;
    }

    async getNewsletter() {
        await this.init();
        return this.newsletter;
    }

    async getAddressId() {
        await this.init();
        return this.address_id;
    }

    async getBalance() {
        await this.init();
        const query = await this.db.query(`SELECT SUM(amount) AS total FROM ${DB_PREFIX}customer_transaction WHERE customer_id = ${this.customer_id}`);
        return query.row.total || 0;
    }

    async getRewardPoints() {
        await this.init();
        const query = await this.db.query(`SELECT SUM(points) AS total FROM ${DB_PREFIX}customer_reward WHERE customer_id = ${this.customer_id}`);
        return query.row.total || 0;
    }
}

