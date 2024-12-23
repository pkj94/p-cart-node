global['Opencart\Admin\Model\Extension\Opencart\Report\Activity'] = class Activity extends global['\Opencart\System\Engine\Model']  {
	/**
	 * @return array
	 */
	async getActivities() {
		let query = await this.db.query("SELECT `key`, `data`, `date_added` FROM `" + DB_PREFIX + "customer_activity` ORDER BY `date_added` DESC LIMIT 0,5");

		return query.rows;
	}
}
