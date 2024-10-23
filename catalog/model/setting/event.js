module.exports =class Event extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @return array
	 */
	async getEvents() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "event` WHERE `status` = '1' ORDER BY `sort_order` ASC");

		return query.rows;
	}
}
