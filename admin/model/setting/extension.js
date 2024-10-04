module.exports = class ExtensionModel extends Model {
    constructor(registry) {
        super(registry);
    }
    async getExtensions() {
        const query = await this.db.query(`SELECT DISTINCT extension FROM ${DB_PREFIX}extension`);
        return query.rows;
    }
    async getExtensionsByType(type) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension WHERE type = '${this.db.escape(type)}' ORDER BY code ASC`);
        return query.rows;
    }
    async getExtensionByCode(type, code) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension WHERE type = '${this.db.escape(type)}' AND code = '${this.db.escape(code)}'`);
        return query.row;
    }
    async getTotalExtensionsByExtension(extension) {
        const query = await this.db.query(`SELECT COUNT(*) AS total FROM ${DB_PREFIX}extension WHERE extension = '${this.db.escape(extension)}'`);
        return parseInt(query.row.total, 10);
    }
    async install(type, extension, code) {
        const extensions = await this.getExtensionsByType(type);
        const codes = extensions.map(ext => ext.code);

        if (!codes.includes(code)) {
            await this.db.query(`INSERT INTO extension SET extension = '${this.db.escape(extension)}', type = '${this.db.escape(type)}', code = '${this.db.escape(code)}'`);
        }
    }

    async uninstall(type, code) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}extension WHERE type = '${this.db.escape(type)}' AND code = '${this.db.escape(code)}'`);
        await this.db.query(`DELETE FROM ${DB_PREFIX}setting WHERE code = '${this.db.escape(type + '_' + code)}'`);
    }

    async addInstall(data) {
        await this.db.query(`INSERT INTO extension_install SET extension_id = '${parseInt(data.extension_id)}', extension_download_id = '${parseInt(data.extension_download_id)}', name = '${this.db.escape(data.name)}', code = '${this.db.escape(data.code)}', version = '${this.db.escape(data.version)}', author = '${this.db.escape(data.author)}', link = '${this.db.escape(data.link)}', status = '0', date_added = NOW()`);
        return await this.db.getLastId();
    }

    async deleteInstall(extension_install_id) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}extension_install WHERE extension_install_id = '${parseInt(extension_install_id)}'`);
    }

    async editStatus(extension_install_id, status) {
        await this.db.query(`UPDATE extension_install SET status = '${status}' WHERE extension_install_id = '${parseInt(extension_install_id)}'`);
    }

    async getInstall(extension_install_id) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension_install WHERE extension_install_id = '${parseInt(extension_install_id)}'`);
        return query.row;
    }
    async getInstallByExtensionDownloadId(extension_download_id) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension_install WHERE extension_download_id = ${parseInt(extension_download_id)}`);
        return query.row;
    }

    async getInstallByCode(code) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension_install WHERE code = '${this.db.escape(code)}'`);
        return query.row;
    }

    async getInstalls(data = {}) {
        let sql = "SELECT * FROM "+DB_PREFIX+"extension_install";

        if (data.filter_extension_download_id) {
            sql += ` WHERE extension_download_id = ${parseInt(data.filter_extension_download_id)}`;
        }

        const sort_data = ['name', 'version', 'date_added'];

        if (data.sort && sort_data.includes(data.sort)) {
            sql += ` ORDER BY ${data.sort}`;
        } else {
            sql += " ORDER BY date_added";
        }

        if (data.order === 'DESC') {
            sql += " DESC";
        } else {
            sql += " ASC";
        }

        if (data.start >= 0 || data.limit > 0) {
            const start = data.start < 0 ? 0 : parseInt(data.start);
            const limit = data.limit < 1 ? 20 : parseInt(data.limit);
            sql += ` LIMIT ${start}, ${limit}`;
        }

        const query = await this.db.query(sql);
        return query.rows;
    }

    async getTotalInstalls(data = {}) {
        let sql = "SELECT COUNT(*) AS total FROM "+DB_PREFIX+"extension_install";

        if (data.filter_extension_download_id) {
            sql += ` WHERE extension_download_id = ${parseInt(data.filter_extension_download_id)}`;
        }

        const query = await this.db.query(sql);
        return parseInt(query.row.total, 10);
    }

    async addPath(extension_install_id, path) {
        await this.db.query(`INSERT INTO extension_path SET extension_install_id = ${parseInt(extension_install_id)}, path = '${this.db.escape(path)}'`);
    }

    async deletePath(extension_path_id) {
        await this.db.query(`DELETE FROM ${DB_PREFIX}extension_path WHERE extension_path_id = ${parseInt(extension_path_id)}`);
    }

    async getPathsByExtensionInstallId(extension_install_id) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension_path WHERE extension_install_id = ${parseInt(extension_install_id)} ORDER BY extension_path_id ASC`);
        return query.rows;
    }

    async getPaths(path) {
        const query = await this.db.query(`SELECT * FROM ${DB_PREFIX}extension_path WHERE path LIKE '${this.db.escape(path)}' ORDER BY path ASC`);
        return query.rows;
    }

    async getTotalPaths(path) {
        const query = await this.db.query(`SELECT COUNT(*) AS total FROM ${DB_PREFIX}extension_path WHERE path LIKE '${this.db.escape(path)}'`);
        return parseInt(query.row.total, 10);
    }
}

