module.exports = class Startup extends global['OpencartSystemEngineModel'] {
	/**
	 * @return mixed
	 */
	async getStartups() {
		// Read on every request, so kept in the cache; admin/model/setting/startup.js clears it on change
		let startup_data = await this.cache.get('startup.enabled');

		if (!startup_data) {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "startup` WHERE `status` = '1' ORDER BY `sort_order` ASC");
			startup_data = query.rows;

			await this.cache.set('startup.enabled', startup_data);
		}

		return startup_data;
	}
}