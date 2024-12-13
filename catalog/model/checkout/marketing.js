module.exports = class ModelCheckoutMarketing extends Model {
	async getMarketingByCode(code) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "marketing WHERE code = '" + this.db.escape(code) + "'");

		return query.row;
	}
}