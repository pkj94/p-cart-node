module.exports = class StartupModel extends global['\Opencart\System\Engine\Model'] {
    constructor(registry) {
        super(registry);
    }

    async addStartup(data) {
        await this.db.query(`INSERT INTO ${DB_PREFIX}startup SET code = ${this.db.escape(data.code)}, action = ${this.db.escape(data.action)}, status = ${data.status}, sort_order = ${parseInt(data.sort_order)}`);
        return this.db.getLastId();
    }

    async deleteStartup(startup_id) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}startup WHERE startup_id = ${parseInt(startup_id)}`);
    }

    async deleteStartupByCode(code) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}startup WHERE code = ${this.db.escape(code)}`);
    }

    async editStatus(startup_id, status) {
        await this.db.query(`UPDATE ${DB_PREFIX}startup SET status = {status} WHERE startup_id = ${parseInt(startup_id)}`);
    }

    async getStartup(startup_id) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}startup WHERE startup_id = ${parseInt(startup_id)}`);
        return query.row;
    }

    async getStartupByCode(code) {
        const query = await this.db.query(`SELECT DISTINCT * FROM ${DB_PREFIX}startup WHERE code = ${this.db.escape(code)} LIMIT 1`);
        return query.row;
    }

    async getStartups(data = {}) {
        let sql = `SELECT * FROM ${DB_PREFIX}startup`;

        const sort_data = [
            'code',
            'action',
            'status',
            'sort_order',
            'date_added'
        ];

        if (data.sort && sort_data.includes(data.sort)) {
            sql += ` ORDER BY ${data.sort}`;
        } else {
            sql += ` ORDER BY sort_order`;
        }

        if (data.order === 'DESC') {
            sql += ` DESC`;
        } else {
            sql += ` ASC`;
        }

        if (data.start >= 0 || data.limit > 0) {
            const start = data.start < 0 ? 0 : parseInt(data.start);
            const limit = data.limit < 1 ? 20 : parseInt(data.limit);
            sql += ` LIMIT ${start}, ${limit}`;
        }

        const query = await this.db.query(sql);
        return query.rows;
    }

    async getTotalStartups() {
        const query = await this.db.query(`SELECT COUNT(*) AS total FROM ${DB_PREFIX}startup`);
        return parseInt(query.row.total, 10);
    }
}

