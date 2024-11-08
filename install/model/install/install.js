const bcrypt = require('bcrypt');
module.exports = class ModelInstallInstall {
    constructor(registry) {
        this.registry = registry;
    }

    async database(data) {
        const db = new global.Db(data['db_driver'], data.db_hostname, data.db_username, data.db_password, data.db_database, data.db_port, data.debug
        );

        const file = expressPath.join(DIR_APPLICATION, 'opencart.sql');

        if (!fs.existsSync(file)) {
            console.error(`Could not load sql file: ${file}`);
            process.exit(1);
        }

        const lines = fs.readFileSync(file, 'utf8').toString().split('\n');
        if (lines.length) {
            let sql = '';
            for (let line of lines) {
                // console.log("============line---", line, sql, (line && !line.startsWith('--') && !line.startsWith('#')));

                if (line && !line.startsWith('--') && !line.startsWith('#')) {
                    sql = sql + line;
                    // console.log("===========sql1---", sql)
                    if (line.trim().endsWith(';')) {
                        sql = sql.replace(/DROP TABLE IF EXISTS `oc_/g, `DROP TABLE IF EXISTS \`${data.db_prefix}`);
                        sql = sql.replace(/CREATE TABLE `oc_/g, `CREATE TABLE \`${data.db_prefix}`);
                        sql = sql.replace(/INSERT INTO `oc_/g, `INSERT INTO \`${data.db_prefix}`);
                        // console.log("=========sql---", sql)
                        await db.query(sql.replace(/\r/g, ''));
                        sql = '';

                    }
                }
            }

            await db.query("SET CHARACTER SET utf8");

            await db.query(`DELETE FROM \`${data.db_prefix}user\` WHERE user_id = '1'`);
            const salt = oc_token(9);
            await db.query(`INSERT INTO \`${data.db_prefix}user\` SET user_id = '1', user_group_id = '1', username = '${data.username}', salt = '${salt}', password = '${sha1(salt + sha1(salt + sha1(data.password)))}', firstname = 'John', lastname = 'Doe', email = '${data.email}', status = '1', date_added = NOW()`);

            await db.query(`DELETE FROM \`${data.db_prefix}setting\` WHERE \`key\` = 'config_email'`);
            await db.query(`INSERT INTO \`${data.db_prefix}setting\` SET \`code\` = 'config', \`key\` = 'config_email', value = '${data.email}'`);

            await db.query(`DELETE FROM \`${data.db_prefix}setting\` WHERE \`key\` = 'config_encryption'`);
            await db.query(`INSERT INTO \`${data.db_prefix}setting\` SET \`code\` = 'config', \`key\` = 'config_encryption', value = '${oc_token(1024)}'`);

            await db.query(`UPDATE \`${data.db_prefix}product\` SET \`viewed\` = '0'`);

            let api_id = await db.query(`INSERT INTO \`${data.db_prefix}api\` SET username = 'Default', \`key\` = '${oc_token(256)}', status = 1, date_added = NOW(), date_modified = NOW()`);
            

            await db.query(`DELETE FROM \`${data.db_prefix}setting\` WHERE \`key\` = 'config_api_id'`);
            await db.query(`INSERT INTO \`${data.db_prefix}setting\` SET \`code\` = 'config', \`key\` = 'config_api_id', value = ${api_id}`);

            await db.query(`UPDATE \`${data.db_prefix}setting\` SET \`value\` = 'INV-${new Date().getFullYear()}-00' WHERE \`key\` = 'config_invoice_prefix'`);
        }
    }
}