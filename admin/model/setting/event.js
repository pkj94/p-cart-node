module.exports = class EventModel extends Model {
    constructor(registry) {
        super(registry);
    }

    async addEvent(data) {
        await this.db.query(`INSERT INTO ${DB_PREFIX}event SET code = '${this.db.escape(data.code)}', description = '${this.db.escape(data.description)}', trigger = '${this.db.escape(data.trigger)}', action = '${this.db.escape(data.action)}', status = ${!!data.status}, sort_order = ${parseInt(data.sort_order)}`);
        return this.db.getLastId();
    }

    async deleteEvent(event_id) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}event WHERE event_id = ${parseInt(event_id)}`);
    }

    async deleteEventByCode(code) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}event WHERE code = '${this.db.escape(code)}'`);
    }

    async editStatus(event_id, status) {
        await this.db.query(`UPDATE ${DB_PREFIX}event SET status = ${!!status} WHERE event_id = ${parseInt(event_id)}`);
    }

    async getEvent(event_id) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}event WHERE event_id = ${parseInt(event_id)}`);
        return query.row;
    }

    async getEventByCode(code) {
        const query = await this.db.query(`SELECT DISTINCT * FROM ${DB_PREFIX}event WHERE code = '${this.db.escape(code)}' LIMIT 1`);
        return query.row;
    }

    async getEvents(data = {}) {
        let sql = `SELECT * FROM ${DB_PREFIX}event`;

        const sort_data = [
            'code',
            'trigger',
            'action',
            'sort_order',
            'status',
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

    async getTotalEvents() {
        const query = await this.db.query(`SELECT COUNT(*) AS total FROM ${DB_PREFIX}event`);
        return parseInt(query.row.total, 10);
    }
}

