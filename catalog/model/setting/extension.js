module.exports =class ExtensionModel extends Model {
	/**
	 * @return array
	 */
	async getExtensions() {
		const query = await this.db.query("SELECT DISTINCT `extension` FROM `" + DB_PREFIX + "extension`");

		return query.rows;
	}

	/**
	 * @param string type
	 *
	 * @return array
	 */
	async getExtensionsByType(type) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension` WHERE `type` = " + this.db.escape(type) );

		return query.rows;
	}

	/**
	 * @param string type
	 * @param string code
	 *
	 * @return array
	 */
	async getExtensionByCode(type, code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "extension` WHERE `type` = " + this.db.escape(type) + " AND `code` = " + this.db.escape(code) + "");

		return query.row;
	}
}