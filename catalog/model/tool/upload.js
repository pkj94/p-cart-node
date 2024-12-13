const mt_rand = require("locutus/php/math/mt_rand");
const uniqid = require("locutus/php/misc/uniqid");
const sha1 = require("locutus/php/strings/sha1");

module.exports = class ModelToolUpload extends Model {
	async addUpload(name, filename) {
		let code = sha1(uniqid(mt_rand(), true));

		await this.db.query("INSERT INTO `" + DB_PREFIX + "upload` SET `name` = '" + this.db.escape(name) + "', `filename` = '" + this.db.escape(filename) + "', `code` = '" + this.db.escape(code) + "', `date_added` = NOW()");

		return code;
	}

	async getUploadByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "upload` WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}
}