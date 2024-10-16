module.exports = class UploadController extends Model {
	/**
	 * @param string name
	 * @param string filename
	 *
	 * @return string
	 */
	async addUpload(name, filename) {
		let code = oc_token(32);

		await this.db.query("INSERT INTO `" + DB_PREFIX + "upload` SET `name` = " + this.db.escape(name) + ", `filename` = " + this.db.escape(filename) + ", `code` = " + this.db.escape(code) + ", `date_added` = NOW()");

		return code;
	}

	/**
	 * @param string code
	 *
	 * @return array
	 */
	async getUploadByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "upload` WHERE code = " + this.db.escape(code));

		return query.row;
	}
}