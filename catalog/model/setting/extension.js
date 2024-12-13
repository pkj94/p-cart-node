module.exports = class ModelSettingExtension extends Model {
	async getExtensions(type) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "extension WHERE `type` = '" + this.db.escape(type) + "'");

		return query.rows;
	}
}