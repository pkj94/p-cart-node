module.exports = class Gdpr extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @param    cron_id
	 * @param string code
	 * @param string cycle
	 * @param string date_added
	 * @param string date_modified
	 *
	 * @return void
	 */
	async index(cron_id, code, cycle, date_added, date_modified) {
		this.load.model('account/gdpr',this);
		this.load.model('account/customer',this);

		const results = await this.model_account_gdpr.getExpires();

		for (let result of results) {
			await this.model_account_gdpr.editStatus(result['gdpr_id'], 3);

			const customer_info = await this.model_account_customer.getCustomerByEmail(result['email']);

			if (customer_info.customer_id) {
				await this.model_account_customer.deleteCustomer(customer_info['customer_id']);
			}
		}
	}
}