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

                await this.db.query(`UPDATE ${DB_PREFIX}customer SET language_id = ${this.config.get('config_language_id')}, ip = '${this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress) : '')}' WHERE customer_id = ${this.customer_id}`);
            } else {
                this.logout();
            }
        }
    }
    async login(email, password, override = false) {
        const customer_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer` WHERE LCASE(`email`) = " + this.db.escape(oc_strtolower(email)) + " AND `status` = '1'");

        if (customer_query.num_rows) {
            if (!override) {
                let rehash;
                if (await bcrypt.compare(password, customer_query.row['password'])) {
                    rehash = bcrypt.getRounds(customer_query.row['password']) < 10;
                } else if (customer_query.row['salt'] && customer_query.row['password'] == crypto.createHash('sha1').update(customer_query.row.salt + crypto.createHash('sha1').update(customer_query.row.salt + crypto.createHash('sha1').update(password).digest('hex')).digest('hex')).digest('hex')) {
                    rehash = true;
                } else if (customer_query.row['password'] == md5(password)) {
                    rehash = true;
                } else {
                    return false;
                }

                if (rehash) {
                    await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `password` = " + this.db.escape(password_hash(password)) + " WHERE `customer_id` = '" + customer_query.row['customer_id'] + "'");
                }
            }

            this.session.data['customer_id'] = customer_query.row['customer_id'];

            this.customer_id = customer_query.row['customer_id'];
            this.firstname = customer_query.row['firstname'];
            this.lastname = customer_query.row['lastname'];
            this.customer_group_id = customer_query.row['customer_group_id'];
            this.email = customer_query.row['email'];
            this.telephone = customer_query.row['telephone'];
            this.newsletter = customer_query.row['newsletter'];

            await this.db.query("UPDATE `" + DB_PREFIX + "customer` SET `language_id` = '" + this.config.get('config_language_id') + "', `ip` = " + this.db.escape((
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress) : '')) + " WHERE `customer_id` = '" + this.customer_id + "'");

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
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}address WHERE customer_id = ${this.customer_id} AND \`default\` = '1'`);

        return query.row.address_id || 0;
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

