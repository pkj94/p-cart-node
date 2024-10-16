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
        this.init();
    }
    async init() {
        if (this.session.customer_id) {
            const customer_query = await this.db.query(`SELECT * FROM ${DB_PREFIX}customer WHERE customer_id = ${this.session.customer_id} AND status = '1'`);
            if (customer_query.length) {
                this.customer_id = customer_query[0].customer_id;
                this.firstname = customer_query[0].firstname;
                this.lastname = customer_query[0].lastname;
                this.customer_group_id = customer_query[0].customer_group_id;
                this.email = customer_query[0].email;
                this.telephone = customer_query[0].telephone;
                this.newsletter = customer_query[0].newsletter;

                await this.db.query(`UPDATE customer SET language_id = ${this.config.get('config_language_id')}, ip = '${this.request.server.headers['x-forwarded-for'] || (
                    this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                        this.request.server.socket.remoteAddress ||
                        this.request.server.connection.socket.remoteAddress):'')}' WHERE customer_id = ${this.customer_id}`);
            } else {
                this.logout();
            }
        }
    }
    async login(email, password, override = false) {
        const customer_query = await this.db.query(`SELECT * FROM ${DB_PREFIX}customer WHERE LOWER(email) = '${email.toLowerCase()}' AND status = '1'`);

        if (customer_query.length) {
            let rehash = false;

            if (!override) {
                if (await bcrypt.compare(password, customer_query[0].password)) {
                    rehash = bcrypt.getRounds(customer_query[0].password) < 10;
                } else if (customer_query[0].salt && customer_query[0].password === sha1(customer_query[0].salt + sha1(customer_query[0].salt + sha1(password)))) {
                    rehash = true;
                } else if (customer_query[0].password === md5(password)) {
                    rehash = true;
                } else {
                    return false;
                }

                if (rehash) {
                    await this.db.query(`UPDATE customer SET password = '${await bcrypt.hash(password, 10)}' WHERE customer_id = ${customer_query[0].customer_id}`);
                }
            }

            this.session.customer_id = customer_query[0].customer_id;

            this.customer_id = customer_query[0].customer_id;
            this.firstname = customer_query[0].firstname;
            this.lastname = customer_query[0].lastname;
            this.customer_group_id = customer_query[0].customer_group_id;
            this.email = customer_query[0].email;
            this.telephone = customer_query[0].telephone;
            this.newsletter = customer_query[0].newsletter;

            await this.db.query(`UPDATE customer SET language_id = ${this.config.get('config_language_id')}, ip = '${this.request.server.headers['x-forwarded-for'] || (
                this.request.server.connection ? (this.request.server.connection.remoteAddress ||
                    this.request.server.socket.remoteAddress ||
                    this.request.server.connection.socket.remoteAddress):'')}' WHERE customer_id = ${this.customer_id}`);

            return true;
        }

        return false;
    }

    logout() {
        delete this.session.customer_id;

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
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}address WHERE customer_id = ${this.customer_id} AND default = '1'`);

        return query.length ? query[0].address_id : 0;
    }

    async getBalance() {
        await this.init();
        const query = await this.db.query(`SELECT SUM(amount) AS total FROM ${DB_PREFIX}customer_transaction WHERE customer_id = ${this.customer_id}`);
        return query.length ? query[0].total : 0;
    }

    async getRewardPoints() {
        await this.init();
        const query = await this.db.query(`SELECT SUM(points) AS total FROM ${DB_PREFIX}customer_reward WHERE customer_id = ${this.customer_id}`);
        return query.length ? query[0].total : 0;
    }
}

