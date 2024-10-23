module.exports = class ModuleSettingModel extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param code
	 * @param  data
	 *
	 * @return int
	 */
	async addModule(code, data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "module` SET `name` = " + this.db.escape(data['name']) + ", `code` = " + this.db.escape(code) + ", `setting` = " + this.db.escape(JSON.stringify(data)));

		const module_id = this.db.getLastId();

		return module_id;
	}

	/**
	 * @param   module_id
	 * @param data
	 *
	 * @return void
	 */
	async editModule(module_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "module` SET `name` = " + this.db.escape(data['name']) + ", `setting` = " + this.db.escape(JSON.stringify(data)) + " WHERE `module_id` = '" + module_id + "'");
	}

	/**
	 * @param module_id
	 *
	 * @return void
	 */
	async deleteModule(module_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "module` WHERE `module_id` = '" + module_id + "'");
	}

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

	/**
	 * @return array
	 */
	async getModules() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` ORDER BY `code`");

		return query.rows;
	}

	/**
	 * @param code
	 *
	 * @return array
	 */
	async getModulesByCode(code) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "module` WHERE `code` = " + this.db.escape(code) + " ORDER BY `name`");

		return query.rows;
	}

	/**
	 * @param code
	 *
	 * @return void
	 */
	async deleteModulesByCode(code) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "module` WHERE `code` = " + this.db.escape(code));
		await this.db.query("DELETE FROM `" + DB_PREFIX + "layout_module` WHERE `code` = " + this.db.escape(code) + " OR `code` LIKE " + this.db.escape(code + '+%'));
	}
}
