module.exports = class Startup extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @return mixed
	 */
	async getStartups() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "startup` WHERE `status` = '1' ORDER BY `sort_order` ASC");

		return query.rows;
	}
}