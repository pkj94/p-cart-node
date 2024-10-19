module.exports=class ActivityController extends Controller {
	// catalog/model/account/customer/addCustomer/after
	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addCustomer(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : output,
				'name'        : args[0]['firstname'] + ' ' + args[0]['lastname']
			];

			await this.model_account_activity.addActivity('register', activity_data);
		}
	}
	
	// catalog/model/account/customer/editCustomer/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async editCustomer(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : await this.customer.getId(),
				'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName()
			];

			await this.model_account_activity.addActivity('edit', activity_data);
		}
	}
	
	// catalog/model/account/customer/editPassword/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async editPassword(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');
			
			if (await this.customer.isLogged()) {
				activity_data = [
					'customer_id' : await this.customer.getId(),
					'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName()
				];
	
				await this.model_account_activity.addActivity('password', activity_data);
			} else {
				customer_info = await this.model_account_customer.getCustomerByEmail(args[0]);
		
				if (customer_info) {
					activity_data = [
						'customer_id' : customer_info['customer_id'],
						'name'        : customer_info['firstname'] + ' ' + customer_info['lastname']
					];
	
					await this.model_account_activity.addActivity('reset', activity_data);
				}
			}	
		}
	}
	
	// catalog/model/account/customer/deleteLoginAttempts/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async login(&route, args, mixed &output) {
		if ((this.request.get['route']) && (this.request.get['route'] == 'account/login' || this.request.get['route'] == 'checkout/login+save') && this.config.get('config_customer_activity')) {
			customer_info = await this.model_account_customer.getCustomerByEmail(args[0]);

			if (customer_info) {
				this.load.model('account/activity');
	
				activity_data = [
					'customer_id' : customer_info['customer_id'],
					'name'        : customer_info['firstname'] + ' ' + customer_info['lastname']
				];
	
				await this.model_account_activity.addActivity('login', activity_data);
			}
		}	
	}
	
	// catalog/model/account/customer/editCode/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async forgotten(&route, args, mixed &output) {
		if ((this.request.get['route']) && this.request.get['route'] == 'account/forgotten' && this.config.get('config_customer_activity')) {
			this.load.model('account/customer');
			
			customer_info = await this.model_account_customer.getCustomerByEmail(args[0]);

			if (customer_info) {
				this.load.model('account/activity');

				activity_data = [
					'customer_id' : customer_info['customer_id'],
					'name'        : customer_info['firstname'] + ' ' + customer_info['lastname']
				];

				await this.model_account_activity.addActivity('forgotten', activity_data);
			}
		}	
	}
	
	// catalog/model/account/customer/addTransaction/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addTransaction(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/customer');
			
			customer_info = await this.model_account_customer.getCustomer(args[0]);

			if (customer_info) {
				this.load.model('account/activity');
	
				activity_data = [
					'customer_id' : customer_info['customer_id'],
					'name'        : customer_info['firstname'] + ' ' + customer_info['lastname'],
					'order_id'    : args[3]
				];
	
				await this.model_account_activity.addActivity('transaction', activity_data);
			}
		}
	}	
	
	// catalog/model/account/affiliate/addAffiliate/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addAffiliate(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : args[0],
				'name'        : args[1]['firstname'] + ' ' + args[1]['lastname']
			];

			await this.model_account_activity.addActivity('affiliate_add', activity_data);
		}
	}	
	
	// catalog/model/account/affiliate/editAffiliate/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async editAffiliate(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : await this.customer.getId(),
				'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName()
			];

			await this.model_account_activity.addActivity('affiliate_edit', activity_data);
		}
	}
	
	// catalog/model/account/address/addAddress/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addAddress(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : await this.customer.getId(),
				'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName()
			];

			await this.model_account_activity.addActivity('address_add', activity_data);
		}	
	}
	
	// catalog/model/account/address/editAddress/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async editAddress(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : await this.customer.getId(),
				'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName()
			];

			await this.model_account_activity.addActivity('address_edit', activity_data);
		}	
	}
	
	// catalog/model/account/address/deleteAddress/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async deleteAddress(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity')) {
			this.load.model('account/activity');

			activity_data = [
				'customer_id' : await this.customer.getId(),
				'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName()
			];
			
			await this.model_account_activity.addActivity('address_delete', activity_data);
		}
	}
	
	// catalog/model/account/returns/addReturn/after

	/**
	 * @param string route
	 * @param  args
	 * @param mixed  output
	 *
	 * @return void
	 */
	async addReturn(&route, args, mixed &output) {
		if (this.config.get('config_customer_activity') && output) {
			this.load.model('account/activity');

			if (await this.customer.isLogged()) {
				activity_data = [
					'customer_id' : await this.customer.getId(),
					'name'        : await this.customer.getFirstName() + ' ' + await this.customer.getLastName(),
					'return_id'   : output
				];

				await this.model_account_activity.addActivity('return_account', activity_data);
			} else {
				activity_data = [
					'name'      : args[0]['firstname'] + ' ' + args[0]['lastname'],
					'return_id' : output
				];

				await this.model_account_activity.addActivity('return_guest', activity_data);
			}
		}
	}	
	
	// catalog/model/checkout/order/addHistory/before

	/**
	 * @param string route
	 * @param  args
	 *
	 * @return void
	 */
	async addHistory(&route, args) {
		if (this.config.get('config_customer_activity')) {
			// If the last order status id returns 0, and the new order status is not, then we record it as new order
			this.load.model('checkout/order');
			
			order_info = await this.model_checkout_order.getOrder(args[0]);

			if (order_info && !order_info['order_status_id'] && args[1]) {
				this.load.model('account/activity');
	
				if (order_info['customer_id']) {
					activity_data = [
						'customer_id' : order_info['customer_id'],
						'name'        : order_info['firstname'] + ' ' + order_info['lastname'],
						'order_id'    : args[0]
					];
	
					await this.model_account_activity.addActivity('order_account', activity_data);
				} else {
					activity_data = [
						'name'     : order_info['firstname'] + ' ' + order_info['lastname'],
						'order_id' : args[0]
					];
	
					await this.model_account_activity.addActivity('order_guest', activity_data);
				}
			}
		}
	}
}
