module.exports = class SettingModel extends Model {
    constructor(registry) {
        super(registry);
    }

    async getSettings(store_id = 0) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}setting WHERE store_id = ${store_id} OR store_id = 0 ORDER BY store_id ASC`);
        return query.rows;
    }

    async getSetting(code, store_id = 0) {
        const setting_data = [];
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}setting WHERE store_id = ${store_id} AND code = ${this.db.escape(code)}`);

        query.rows.forEach(result => {
            setting_data[result.key] = result.serialized ? JSON.parse(result.value) : result.value;
        });

        return setting_data;
    }

    async editSetting(code, data, store_id = 0) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}setting WHERE store_id = ${store_id} AND code = ${this.db.escape(code)}`);

        for (const key in data) {
            const value = data[key];
            if (key.startsWith(code)) {
                const serialized = Array.isArray(value) ? 1 : 0;
                const valueToStore = serialized ? JSON.stringify(value) : value;
                await this.db.query('INSERT INTO ' + DB_PREFIX + 'setting SET store_id = ' + store_id + ', code = ' + this.db.escape(code) + ', `key` = ' + this.db.escape(key) + ', value = ' + this.db.escape(valueToStore) + ', serialized = ' + serialized);
            }
        }
    }

    async deleteSetting(code, store_id = 0) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}setting WHERE store_id = ${store_id} AND code = ${this.db.escape(code)}`);
    }

    async getValue(key, store_id = 0) {
        const query = await this.db.query('SELECT value FROM ' + DB_PREFIX + 'setting WHERE store_id = ' + store_id + ' AND `key` = ' + this.db.escape(key));
        return query.rows.length ? query.rows[0].value : '';
    }

    async editValue(code, key, value, store_id = 0) {
        const serialized = Array.isArray(value) ? 1 : 0;
        const valueToStore = serialized ? JSON.stringify(value) : value;
        await this.db.query('UPDATE ' + DB_PREFIX + 'setting SET value = ' + this.db.escape(valueToStore) + ', serialized = ' + serialized + ' WHERE code = ' + this.db.escape(code) + ' AND `key` = ' + this.db.escape(key) + ' AND store_id = ' + store_id);
    }
}

