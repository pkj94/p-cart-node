module.exports = class ModelSettingModule extends Model {
	async addModule(code, data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "module` SET `name` = '" + this.db.escape(data['name']) + "', `code` = '" + this.db.escape(code) + "', `setting` = '" + this.db.escape(JSON.stringify(data)) + "'");
	}
	
	async editModule(module_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "module` SET `name` = '" + this.db.escape(data['name']) + "', `setting` = '" + this.db.escape(JSON.stringify(data)) + "' WHERE `module_id` = '" + module_id + "'");
	}

	async deleteModule(module_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "module` WHERE `module_id` = '" + module_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_module` WHERE `code` LIKE '%." + module_id + "'");
	}
		
	async getModule(module_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` WHERE `module_id` = '" + module_id + "'");

		if (query.row) {
			return JSON.parse(query.row['setting'], true);
		} else {
			return {};
		}
	}
	
	async getModules() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` ORDER BY `code`");

		return query.rows;
	}	
		
	async getModulesByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` WHERE `code` = '" + this.db.escape(code) + "' ORDER BY `name`");

		return query.rows;
	}	
	
	async deleteModulesByCode(code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "module` WHERE `code` = '" + this.db.escape(code) + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_module` WHERE `code` LIKE '" + this.db.escape(code) + "' OR `code` LIKE '" + this.db.escape(code + '.%') + "'");
	}	
}