module.exports = class Customer extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * @return void
	 */
	async index() {
		let customer = new (require(DIR_SYSTEM + 'library/cart/customer'))(this.registry);
		await customer.init();
		// console.log(this.session.data);
		this.registry.set('customer', customer);

		// Customer Group
		if ((this.session && this.session.data && this.session.data['customer'])) {
			this.config.set('config_customer_group_id', this.session.data['customer']['customer_group_id']);
		} else if (await customer.isLogged()) {
			// Logged in customers
			this.config.set('config_customer_group_id', await customer.getGroupId());
		}
		return true;
	}
}