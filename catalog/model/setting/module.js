module.exports =class Module extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param module_id
	 *
	 * @return array
	 */
	async getModule(module_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` WHERE `module_id` = '" + module_id + "'");
		
		if (query.row) {
			return JSON.parse(query.row['setting']);
		} else {
			return {};
		}
	}		
}
