const mt_rand = require("locutus/php/math/mt_rand");
const uniqid = require("locutus/php/misc/uniqid");
const sha1 = require("locutus/php/strings/sha1");

module.exports = class ModelToolUpload extends Model {
	async addUpload(name, filename) {
		const code = sha1(uniqid(mt_rand(), true));

		await this.db.query("INSERT INTO `" + DB_PREFIX + "upload` SET `name` = '" + this.db.escape(name) + "', `filename` = '" + this.db.escape(filename) + "', `code` = '" + this.db.escape(code) + "', `date_added` = NOW()");

		return code;
	}

	async deleteUpload(upload_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "upload WHERE upload_id = '" + upload_id + "'");
	}

	async getUpload(upload_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "upload` WHERE upload_id = '" + upload_id + "'");

		return query.row;
	}

	async getUploadByCode(code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "upload WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}

	async getUploads(data = {}) {
		let sql = "SELECT * FROM " + DB_PREFIX + "upload";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("name LIKE '" + this.db.escape(data['filter_name']) + "%'");
		}

		if ((data['filter_filename'])) {
			implode.push("filename LIKE '" + this.db.escape(data['filter_filename']) + "%'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'name',
			'filename',
			'date_added'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY date_added";
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

	async getTotalUploads(data = {}) {
		let sql = "SELECT COUNT(*) AS total FROM " + DB_PREFIX + "upload";

		let implode = [];

		if ((data['filter_name'])) {
			implode.push("name LIKE '" + this.db.escape(data['filter_name']) + "%'");
		}

		if ((data['filter_filename'])) {
			implode.push("filename LIKE '" + this.db.escape(data['filter_filename']) + "%'");
		}

		if ((data['filter_date_added'])) {
			implode.push("DATE(date_added) = DATE('" + this.db.escape(data['filter_date_added']) + "')");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		const query = await this.db.query(sql);

		return query.row['total'];
	}
}
