module.exports =class CustomerGroup extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param customer_group_id
	 *
	 * @return array
	 */
	async getCustomerGroup(customer_group_id) {
		const query = await this.db.query("SELECT DISTINCT * FROM `" + DB_PREFIX + "customer_group` cg LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (cg.`customer_group_id` = cgd.`customer_group_id`) WHERE cg.`customer_group_id` = '" + customer_group_id + "' AND cgd.`language_id` = '" + this.config.get('config_language_id') + "'");

		return query.row;
	}

	/**
	 * @return array
	 */
	async getCustomerGroups() {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_group` cg LEFT JOIN `" + DB_PREFIX + "customer_group_description` cgd ON (cg.`customer_group_id` = cgd.`customer_group_id`) WHERE cgd.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY cg.`sort_order` ASC, cgd.`name` ASC");

		return query.rows;
	}
}
