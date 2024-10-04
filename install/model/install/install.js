const Model = require('../../../system/engine/model');
const bcrypt = require('bcrypt');

module.exports = class Install extends Model {
    constructor(regisstry) {
        super(regisstry);
        this.db = null;
    }

    database(data) {
        return new Promise(async (resolve, reject) => {
            try {
                this.db =  new DbLibrary(
                    data.db_driver,
                    decodeHTMLEntities(data.db_hostname),
                    decodeHTMLEntities(data.db_username),
                    decodeHTMLEntities(data.db_password),
                    decodeHTMLEntities(data.db_database),
                    data.db_port
                );
                await this.db.connect();

                // Structure
                const tables = oc_db_schema();
                // Clear old DB
                for (const table of tables) {
                    await this.db.query(`DROP TABLE IF EXISTS \`${data.db_prefix}${table.name}\``);
                }

                // Create tables
                for (const table of tables) {
                    let sql = `CREATE TABLE \`${data.db_prefix}${table.name}\` (\n`;

                    for (const field of table.field) {
                        sql += `  \`${field.name}\` ${field.type}${field.not_null ? ' NOT NULL' : ''}${field.default !== undefined ? ` DEFAULT ${this.db.escape(field.default)}` : ''}${field.auto_increment ? ' AUTO_INCREMENT' : ''},\n`;
                    }

                    if (table.primary) {
                        const primaryData = table.primary.map(primary => `\`${primary}\``);
                        sql += `  PRIMARY KEY (${primaryData.join(',')}),\n`;
                    }

                    if (table.index) {
                        for (const index of table.index) {
                            const indexData = index.key.map(key => `\`${key}\``);
                            sql += `  KEY \`${index.name}\` (${indexData.join(',')}),\n`;
                        }
                    }

                    sql = sql.slice(0, -2) + '\n';
                    sql += `) ENGINE=${table.engine} CHARSET=${table.charset} ROW_FORMAT=DYNAMIC COLLATE=${table.collate};\n`;
                    // console.log('sql--------', sql);
                    try {
                        await this.db.query(sql);
                    } catch (err) {
                        console.log('create table error ===---===', err)
                        reject(err.message)
                    }
                }

                // Data
                const fs = require('fs').promises;
                const lines = (await fs.readFile(DIR_APPLICATION + 'opencart.sql', 'utf8')).split('\n');

                let sql = '';
                let start = false;

                for (const line of lines) {
                    if (line.startsWith('INSERT INTO ')) {
                        sql = '';
                        start = true;
                    }

                    if (start) {
                        sql += line;
                    }

                    if (line.endsWith(');')) {
                        await this.db.query(sql.replace(/INSERT INTO `oc_/g, `INSERT INTO \`${data.db_prefix}`));
                        start = false;
                    }
                }

                await this.db.query("SET CHARACTER SET utf8mb4");
                await this.db.query("SET @@session.sql_mode = ''");

                await this.db.query(`DELETE FROM \`${data.db_prefix}user\` WHERE \`user_id\` = '1'`);
                await this.db.query(`INSERT INTO \`${data.db_prefix}user\` SET \`user_id\` = '1', \`user_group_id\` = '1', \`username\` = ${this.db.escape(data.username)}, \`password\` = ${this.db.escape(await bcrypt.hash(decodeHTMLEntities(data.password), 10))}, \`firstname\` = 'John', \`lastname\` = 'Doe', \`email\` = ${this.db.escape(data.email)}, \`status\` = '1', \`date_added\` = NOW()`);

                await this.db.query(`UPDATE \`${data.db_prefix}setting\` SET \`code\` = 'config', \`key\` = 'config_email', \`value\` = ${this.db.escape(data.email)} WHERE \`key\` = 'config_email'`);

                await this.db.query(`DELETE FROM \`${data.db_prefix}setting\` WHERE \`key\` = 'config_encryption'`);
                await this.db.query(`INSERT INTO \`${data.db_prefix}setting\` SET \`code\` = 'config', \`key\` = 'config_encryption', \`value\` = ${this.db.escape(oc_token(512))}`);

                await this.db.query(`INSERT INTO \`${data.db_prefix}api\` SET \`username\` = 'Default', \`key\` = ${this.db.escape(oc_token(256))}, \`status\` = '1', \`date_added\` = NOW(), \`date_modified\` = NOW()`);

                const apiId = await this.db.getLastId();

                await this.db.query(`DELETE FROM \`${data.db_prefix}setting\` WHERE \`key\` = 'config_api_id'`);
                await this.db.query(`INSERT INTO \`${data.db_prefix}setting\` SET \`code\` = 'config', \`key\` = 'config_api_id', \`value\` = '${apiId}'`);

                // set the current years prefix
                await this.db.query(`UPDATE \`${data.db_prefix}setting\` SET \`value\` = 'INV-${new Date().getFullYear()}-00' WHERE \`key\` = 'config_invoice_prefix'`);
                resolve(true)
            } catch (e) {
                console.log('err==================', e)
                reject(e)
            }
        });
    }
}
function decodeHTMLEntities(text) {
    const entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, match => entities[match]);
}

