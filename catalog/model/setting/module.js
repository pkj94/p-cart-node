module.exports =class ModuleController extends Model {
	/**
	 * @param module_id
	 *
	 * @return array
	 */
	async getModule(module_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` WHERE `module_id` = '" + module_id + "'");
		
		if (query.row) {
			return JSON+parse(query.row['setting'], true);
		} else {
			return [];
		}
	}		
}
