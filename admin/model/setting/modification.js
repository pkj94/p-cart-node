module.exports = class ModelSettingModification extends Model {
	async addModification(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "modification` SET `extension_install_id` = '" + data['extension_install_id'] + "', `name` = '" + this.db.escape(data['name']) + "', `code` = '" + this.db.escape(data['code']) + "', `author` = '" + this.db.escape(data['author']) + "', `version` = '" + this.db.escape(data['version']) + "', `link` = '" + this.db.escape(data['link']) + "', `xml` = '" + this.db.escape(data['xml']) + "', `status` = '" + data['status'] + "', `date_added` = NOW()");
	}

	async deleteModification(modification_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "modification` WHERE `modification_id` = '" + modification_id + "'");
	}

	async deleteModificationsByExtensionInstallId(extension_install_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "modification` WHERE `extension_install_id` = '" + extension_install_id + "'");
	}

	async enableModification(modification_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "modification` SET `status` = '1' WHERE `modification_id` = '" + modification_id + "'");
	}

	async disableModification(modification_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "modification` SET `status` = '0' WHERE `modification_id` = '" + modification_id + "'");
	}

	async getModification(modification_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "modification` WHERE `modification_id` = '" + modification_id + "'");

		return query.row;
	}

	async getModifications(data = {}) {
		let sql = "SELECT * FROM `" + DB_PREFIX + "modification`";

		let sort_data = [
			'name',
			'author',
			'version',
			'status',
			'date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY name";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start'] || 0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit'] || 20;
			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getTotalModifications() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "modification`");

		return query.row['total'];
	}

	async getModificationByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "modification` WHERE `code` = '" + this.db.escape(code) + "'");

		return query.row;
	}
}