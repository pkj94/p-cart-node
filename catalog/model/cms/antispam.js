module.exports = class Antispam extends global['OpencartSystemEngineModel'] {
	/**
	 * Number of anti-spam keywords (Admin > Catalog > Anti-Spam) found in the comment
	 *
	 * @param string comment
	 *
	 * @return int
	 */
	async getSpam(comment) {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "antispam` WHERE `keyword` != '' AND " + this.db.escape(oc_strtolower(comment)) + " LIKE CONCAT('%', LOWER(`keyword`), '%')");

		return Number(query.row['total']) || 0;
	}
}
