module.exports = class CustomerController extends Controller {
	/**
	 * @return void
	 */
	async index() {
		this.registry.set('customer', new (require(DIR_SYSTEM + 'library/cart/customer'))(this.registry));

		// Customer Group
		if ((this.session && this.session.data && this.session.data['customer'])) {
			this.config.set('config_customer_group_id', this.session.data['customer']['customer_group_id']);
		} else if (await this.registry.get('customer').isLogged()) {
			// Logged in customers
			this.config.set('config_customer_group_id', await this.registry.get('customer').getGroupId());
		}
		return true;
	}
}