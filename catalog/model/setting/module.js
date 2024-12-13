module.exports = class ModelSettingModule extends Model {
	async getModule(module_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "module WHERE module_id = '" + module_id + "'");

		if (query.row) {
			return JSON.parse(query.row['setting']);
		} else {
			return {};
		}
	}
}