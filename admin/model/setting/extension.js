module.exports = class ModelSettingExtension extends Model {
	async getInstalled(type) {
		let extension_data = [];

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension` WHERE `type` = '" + this.db.escape(type) + "' ORDER BY `code`");

		for (let result of query.rows) {
			extension_data.push(result['code']);
		}

		return extension_data;
	}

	async install(type, code) {
		let extensions = await this.getInstalled(type);

		if (!extensions.includes(code)) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "extension` SET `type` = '" + this.db.escape(type) + "', `code` = '" + this.db.escape(code) + "'");
		}
	}

	async uninstall(type, code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "extension` WHERE `type` = '" + this.db.escape(type) + "' AND `code` = '" + this.db.escape(code) + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "setting` WHERE `code` = '" + this.db.escape(type + '_' + code) + "'");
	}

	async addExtensionInstall(filename, extension_download_id = 0) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "extension_install` SET `filename` = '" + this.db.escape(filename) + "', `extension_download_id` = '" + extension_download_id + "', `date_added` = NOW()");

		return this.db.getLastId();
	}

	async deleteExtensionInstall(extension_install_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "extension_install` WHERE `extension_install_id` = '" + extension_install_id + "'");
	}

	async getExtensionInstalls(start = 0, limit = 10) {
		start = start || 0;
		if (start < 0) {
			start = 0;
		}
		limit = limit || 10;
		if (limit < 1) {
			limit = 10;
		}

		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension_install` ORDER BY date_added ASC LIMIT " + start + "," + limit);

		return query.rows;
	}

	async getExtensionInstallByExtensionDownloadId(extension_download_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension_install` WHERE `extension_download_id` = '" + extension_download_id + "'");

		return query.row;
	}

	async getTotalExtensionInstalls() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "extension_install`");

		return query.row['total'];
	}

	async addExtensionPath(extension_install_id, path) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "extension_path` SET `extension_install_id` = '" + extension_install_id + "', `path` = '" + this.db.escape(path) + "', `date_added` = NOW()");
	}

	async deleteExtensionPath(extension_path_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "extension_path` WHERE `extension_path_id` = '" + extension_path_id + "'");
	}

	async getExtensionPathsByExtensionInstallId(extension_install_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension_path` WHERE `extension_install_id` = '" + extension_install_id + "' ORDER BY `date_added` ASC");

		return query.rows;
	}
}