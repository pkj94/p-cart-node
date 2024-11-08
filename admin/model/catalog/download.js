module.exports = class ModelCatalogDownload extends Model {
	async addDownload(data) {
		await this.db.query("INSERT INTO " + DB_PREFIX + "download SET filename = '" + this.db.escape(data['filename']) + "', mask = '" + this.db.escape(data['mask']) + "', date_added = NOW()");

		download_id = this.db.getLastId();

		for (data['download_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "download_description SET download_id = '" + download_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}

		return download_id;
	}

	async editDownload(download_id, data) {
		await this.db.query("UPDATE " + DB_PREFIX + "download SET filename = '" + this.db.escape(data['filename']) + "', mask = '" + this.db.escape(data['mask']) + "' WHERE download_id = '" + download_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "download_description WHERE download_id = '" + download_id + "'");

		for (data['download_description'] of language_id : value) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "download_description SET download_id = '" + download_id + "', language_id = '" + language_id + "', name = '" + this.db.escape(value['name']) + "'");
		}
	}

	async deleteDownload(download_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "download WHERE download_id = '" + download_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "download_description WHERE download_id = '" + download_id + "'");
	}

	async getDownload(download_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM " + DB_PREFIX + "download d LEFT JOIN " + DB_PREFIX + "download_description dd ON (d.download_id = dd.download_id) WHERE d.download_id = '" + download_id + "' AND dd.language_id = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	async getDownloads(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "download d LEFT JOIN " + DB_PREFIX + "download_description dd ON (d.download_id = dd.download_id) WHERE dd.language_id = '" + this.config.get('config_language_id') + "'";

		if ((data['filter_name'])) {
			sql += " AND dd.name LIKE '" + this.db.escape(data['filter_name']) + "%'";
		}

		let sort_data = [
			'dd.name',
			'd.date_added'
		);

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY dd.name";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			data['start'] = data['start']||0;
if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	async getDownloadDescriptions(download_id) {
		download_description_data = {};

		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "download_description WHERE download_id = '" + download_id + "'");

		for (let result of query.rows ) {
			download_description_data[result['language_id']] = array('name' : result['name']);
		}

		return download_description_data;
	}

	async getTotalDownloads() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM " + DB_PREFIX + "download");

		return query.row['total'];
	}
}