const strtotime = require("locutus/php/datetime/strtotime");

module.exports = class Subscription extends global['\Opencart\System\Engine\Controller'] {
	/**
	 * Index
	 *
	 * @param    cron_id
	 * @param string code
	 * @param string cycle
	 * @param string date_added
	 * @param string date_modified
	 *
	 * @return void
	 */
	async index(cron_id, code, cycle, date_added, date_modified) {
		this.load.language('cron/subscription');

		// Check the there is an order and the order status is complete and subscription status is active
		let filter_data = {
			'filter_date_next': date('Y-m-d H:i:s'),
			'filter_subscription_status_id': this.config.get('config_subscription_active_status_id'),
			'start': 0,
			'limit': 10
		};

		// Get all
		this.load.model('checkout/subscription', this);
		this.load.model('checkout/order', this);

		const results = await this.model_checkout_subscription.getSubscriptions(filter_data);

		for (let result of results) {
			const order_info = await this.model_checkout_order.getOrder(result['order_id']);

			// Check the there is an order and the order status is complete and subscription status is active
			if (order_info.order_id && this.config.get('config_complete_status').includes(order_info['order_status_id'])) {
				this.load.model('setting/store', this);

				let error = '';

				// 1. Language
				this.load.model('localisation/language', this);

				const language_info = await this.model_localisation_language.getLanguage(result['language_id']);

				if (!language_info.language_id) {
					error = this.language.get('error_language');
				}

				// 2. Currency
				this.load.model('localisation/currency', this);

				const currency_info = await this.model_localisation_currency.getCurrency(result['currency_id']);

				if (!currency_info.currency_id) {
					error = this.language.get('error_currency');
				}
				let store;
				// 3. Create new instance of a store
				if (!error) {
					store = await this.model_setting_store.createStoreInstance(result['store_id'], language_info['code']);

					// Login
					this.load.model('account/customer', this);

					const customer_info = await this.model_account_customer.getCustomer(result['customer_id']);

					if (customer_info.customer_id && await this.customer.login(customer_info['email'], '', true)) {
						// Add customer details into session
						store.session.data['customer'] = {
							'customer_id': customer_info['customer_id'],
							'customer_group_id': customer_info['customer_group_id'],
							'firstname': customer_info['firstname'],
							'lastname': customer_info['lastname'],
							'email': customer_info['email'],
							'telephone': customer_info['telephone'],
							'custom_field': customer_info['custom_field']
						};
					} else {
						error = this.language.get('error_customer');
					}
				}

				// 4. Add product
				if (!error) {
					this.load.model('catalog/product', this);

					const product_info = await this.model_checkout_order.getProduct(result['product_id']);

					if (product_info.product_id) {
						let option_data = {};

						const order_options = await this.model_account_order.getOptions(result['order_id'], result['order_product_id']);

						for (let order_option of order_options) {
							if (order_option['type'] == 'select' || order_option['type'] == 'radio' || order_option['type'] == 'image') {
								option_data[order_option['product_option_id']] = order_option['product_option_value_id'];
							} else if (order_option['type'] == 'checkbox') {
								option_data[order_option['product_option_id']].push(order_option['product_option_value_id']);
							} else if (order_option['type'] == 'text' || order_option['type'] == 'textarea' || order_option['type'] == 'date' || order_option['type'] == 'datetime' || order_option['type'] == 'time') {
								option_data[order_option['product_option_id']] = order_option['value'];
							} else if (order_option['type'] == 'file') {
								option_data[order_option['product_option_id']] = order_option['value'];
							}
						}

						store.cart.add(result['product_id'], result['quantity'], option_data);
					} else {
						error = this.language.get('error_product');
					}
				}

				// 5. Add Shipping Address
				let shipping_address_info;
				if (!error && await store.cart.hasShipping()) {
					this.load.model('account/address', this);

					shipping_address_info = await this.model_account_address.getAddress(result['customer_id'], result['shipping_address_id']);

					if (shipping_address_info.address_id) {
						store.session.data['shipping_address'] = shipping_address_info;
					} else {
						error = this.language.get('error_shipping_address');
					}

					// 5. Shipping Methods
					let shipping_methods;
					if (!error) {
						this.load.model('checkout/shipping_method', this);

						shipping_methods = await this.model_checkout_shipping_method.getMethods(shipping_address_info);

						// Validate shipping method
						if ((order_info['shipping_method']['code']) && shipping_methods) {
							let shipping = order_info['shipping_method']['code'].split('.');

							if ((shipping[0]) && (shipping[1]) && (shipping_methods[shipping[0]]['quote'][shipping[1]])) {
								store.session.data['shipping_method'] = shipping_methods[shipping[0]]['quote'][shipping[1]];
							} else {
								error = this.language.get('error_shipping_method');
							}
						} else {
							error = this.language.get('error_shipping_method');
						}
					}
				}

				// 6. Payment Address
				let payment_address = [];
				let payment_address_info;
				if (!error && Number(this.config.get('config_checkout_payment_address'))) {
					this.load.model('account/address', this);

					payment_address_info = await this.model_account_address.getAddress(order_info['customer_id'], result['payment_address_id']);

					if (payment_address_info.address_id) {
						store.session.data['payment_address'] = payment_address_info;
					} else {
						error = this.language.get('error_payment_address');
					}
				}

				// 7. Payment Methods
				let payment;
				let payment_methods;
				if (!error) {
					this.load.model('checkout/payment_method', this);

					payment_methods = await this.model_checkout_payment_method.getMethods(payment_address);

					// Validate payment methods
					if ((order_info['payment_method']['code']) && payment_methods) {
						payment = order_info['payment_method']['code'].split('.');

						if ((payment[0]) && (payment[1]) && (payment_methods[payment[0]]['option'][payment[1]])) {
							store.session.data['payment_method'] = payment_methods[payment[0]]['option'][payment[1]];
						} else {
							error = this.language.get('error_payment_method');
						}
					} else {
						error = this.language.get('error_payment_method');
					}
				}
				const order_data = {}
				if (!error) {
					this.load.model('marketing/marketing', this);

					const marketing_info = await this.model_marketing_marketing.getMarketingByCode(this.session.data['tracking']);
					order_data['language_id'] = this.config.get('config_language_id');
				}

				if (!error) {
					// Subscription
					order_data['subscription_id'] = order_info['subscription_id'];

					// Store Details
					order_data['invoice_prefix'] = order_info['invoice_prefix'];
					order_data['store_id'] = order_info['store_id'];
					order_data['store_name'] = order_info['store_name'];
					order_data['store_url'] = order_info['store_url'];

					// Customer Details
					order_data['customer_id'] = customer_info['customer_id'];
					order_data['customer_group_id'] = customer_info['customer_group_id'];
					order_data['firstname'] = customer_info['firstname'];
					order_data['lastname'] = customer_info['lastname'];
					order_data['email'] = customer_info['email'];
					order_data['telephone'] = customer_info['telephone'];
					order_data['custom_field'] = customer_info['custom_field'];

					// Payment Details
					if (payment_address_info.address_id) {
						order_data['payment_address_id'] = payment_address_info['address_id'];
						order_data['payment_firstname'] = payment_address_info['firstname'];
						order_data['payment_lastname'] = payment_address_info['lastname'];
						order_data['payment_company'] = payment_address_info['company'];
						order_data['payment_address_1'] = payment_address_info['address_1'];
						order_data['payment_address_2'] = payment_address_info['address_2'];
						order_data['payment_city'] = payment_address_info['city'];
						order_data['payment_postcode'] = payment_address_info['postcode'];
						order_data['payment_zone'] = payment_address_info['zone'];
						order_data['payment_zone_id'] = payment_address_info['zone_id'];
						order_data['payment_country'] = payment_address_info['country'];
						order_data['payment_country_id'] = payment_address_info['country_id'];
						order_data['payment_address_format'] = payment_address_info['address_format'];
						order_data['payment_custom_field'] = payment_address_info['custom_field'];
					} else {
						order_data['payment_address_id'] = 0;
						order_data['payment_firstname'] = '';
						order_data['payment_lastname'] = '';
						order_data['payment_company'] = '';
						order_data['payment_address_1'] = '';
						order_data['payment_address_2'] = '';
						order_data['payment_city'] = '';
						order_data['payment_postcode'] = '';
						order_data['payment_zone'] = '';
						order_data['payment_zone_id'] = 0;
						order_data['payment_country'] = '';
						order_data['payment_country_id'] = 0;
						order_data['payment_address_format'] = '';
						order_data['payment_custom_field'] = [];
					}

					order_data['payment_method'] = this.session.data['payment_method'];

					// Shipping Details
					if (await store.cart.hasShipping()) {
						order_data['shipping_address_id'] = shipping_address_info['address_id'];
						order_data['shipping_firstname'] = shipping_address_info['firstname'];
						order_data['shipping_lastname'] = shipping_address_info['lastname'];
						order_data['shipping_company'] = shipping_address_info['company'];
						order_data['shipping_address_1'] = shipping_address_info['address_1'];
						order_data['shipping_address_2'] = shipping_address_info['address_2'];
						order_data['shipping_city'] = shipping_address_info['city'];
						order_data['shipping_postcode'] = shipping_address_info['postcode'];
						order_data['shipping_zone'] = shipping_address_info['zone'];
						order_data['shipping_zone_id'] = shipping_address_info['zone_id'];
						order_data['shipping_country'] = shipping_address_info['country'];
						order_data['shipping_country_id'] = shipping_address_info['country_id'];
						order_data['shipping_address_format'] = shipping_address_info['address_format'];
						order_data['shipping_custom_field'] = shipping_address_info['custom_field'];

						order_data['shipping_method'] = payment_methods[payment[0]]['option'][payment[1]];
					} else {
						order_data['shipping_address_id'] = 0;
						order_data['shipping_firstname'] = '';
						order_data['shipping_lastname'] = '';
						order_data['shipping_company'] = '';
						order_data['shipping_address_1'] = '';
						order_data['shipping_address_2'] = '';
						order_data['shipping_city'] = '';
						order_data['shipping_postcode'] = '';
						order_data['shipping_zone'] = '';
						order_data['shipping_zone_id'] = 0;
						order_data['shipping_country'] = '';
						order_data['shipping_country_id'] = 0;
						order_data['shipping_address_format'] = '';
						order_data['shipping_custom_field'] = [];

						order_data['shipping_method'] = [];
					}

					// Products
					order_data['products'] = [];

					let products = await this.model_checkout_cart.getProducts();

					for (let product of products) {
						order_data['products'].push({
							'product_id': product['product_id'],
							'master_id': product['master_id'],
							'name': product['name'],
							'model': product['model'],
							'option': product['option'],
							'subscription': [],
							'download': product['download'],
							'quantity': product['quantity'],
							'subtract': product['subtract'],
							'price': product['price'],
							'total': product['total'],
							'tax': this.tax.getTax(product['price'], product['tax_class_id']),
							'reward': product['reward']
						});
					}

					// Vouchers can not be in subscriptions
					order_data['vouchers'] = [];

					// Order Totals
					let totals = [];
					let taxes = await store.cart.getTaxes();
					let total = 0;

					store.load.model('checkout/cart', this);

					const totalData = await store.model_checkout_cart.getTotals(totals, taxes, total);
					totals = totalData.totals;
					taxes = totalData.taxes;
					total = totalData.total;
					let total_data = {
						'totals': totals,
						'taxes': taxes,
						'total': total
					};

					order_data = { ...order_data, ...total_data };

					order_data['affiliate_id'] = 0;
					order_data['commission'] = 0;
					order_data['marketing_id'] = 0;
					order_data['tracking'] = '';

					if ((this.session.data['tracking'])) {
						let subtotal = await this.cart.getSubTotal();

						// Affiliate
						if (this.config.get('config_affiliate_status')) {
							this.load.model('account/affiliate', this);

							const affiliate_info = await this.model_account_affiliate.getAffiliateByTracking(this.session.data['tracking']);

							if (affiliate_info.customer_id) {
								order_data['affiliate_id'] = affiliate_info['customer_id'];
								order_data['commission'] = (subtotal / 100) * affiliate_info['commission'];
								order_data['tracking'] = this.session.data['tracking'];
							}
						}

						this.load.model('marketing/marketing', this);

						const marketing_info = await this.model_marketing_marketing.getMarketingByCode(this.session.data['tracking']);

						if (marketing_info.marketing_id) {
							order_data['marketing_id'] = marketing_info['marketing_id'];
						}
					}

					// Language
					order_data['language_id'] = language_info['language_id'];
					order_data['language_code'] = language_info['code'];

					// Currency
					order_data['currency_id'] = currency_info['currency_id'];
					order_data['currency_code'] = currency_info['code'];
					order_data['currency_value'] = currency_info['value'];


					order_data['ip'] = result['ip'];
					order_data['forwarded_ip'] = result['forwarded_ip'];
					order_data['user_agent'] = result['user_agent'];
					order_data['accept_language'] = result['accept_language'];
				}
				let amount = result['price'];
				if (result['trial_status'] && (!result['trial_duration'] || result['trial_remaining'])) {
					amount = result['trial_price'];
				} else if (!result['duration'] || result['remaining']) {
					amount = result['price'];
				}

				let subscription_status_id = this.config.get('config_subscription_status_id');

				// Get the payment method used by the subscription
				// Check payment status
				//this.load.model('extension/payment/' + payment_info['code']);

				/*
				if (product['subscription']) {
					if (product['subscription']['trial_duration'] && product['subscription']['trial_remaining']) {
						date_next = date('Y-m-d', strtotime('+' + product['subscription']['trial_cycle'] + ' ' + product['subscription']['trial_frequency']));
					} else if (product['subscription']['duration'] && product['subscription']['remaining']) {
						date_next = date('Y-m-d', strtotime('+' + product['subscription']['cycle'] + ' ' + product['subscription']['frequency']));
					}

					subscription_data = [
						'subscription_plan_id' : product['subscription']['subscription_plan_id'],
						'name'                 : product['subscription']['name'],
						'trial_price'          : product['subscription']['trial_price'],
						'trial_frequency'      : product['subscription']['trial_frequency'],
						'trial_cycle'          : product['subscription']['trial_cycle'],
						'trial_duration'       : product['subscription']['trial_duration'],
						'trial_remaining'      : product['subscription']['trial_remaining'],
						'trial_status'         : product['subscription']['trial_status'],
						'price'                : product['subscription']['price'],
						'frequency'            : product['subscription']['frequency'],
						'cycle'                : product['subscription']['cycle'],
						'duration'             : product['subscription']['duration'],
						'remaining'            : product['subscription']['duration'],
						'date_next'            : date_next
					];
				}
				*/
				// Transaction
				if (this.config.get('config_subscription_active_status_id') == subscription_status_id) {
					let date_next = date('Y-m-d', strtotime('+' + result['cycle'] + ' ' + result['frequency']));
					if (result['trial_duration'] && result['trial_remaining']) {
						date_next = date('Y-m-d', strtotime('+' + result['trial_cycle'] + ' ' + result['trial_frequency']));
					} else if (result['duration'] && result['remaining']) {
						date_next = date('Y-m-d', strtotime('+' + result['cycle'] + ' ' + result['frequency']));
					}

					let filter_data = {
						'filter_date_next': date_next,
						'filter_subscription_status_id': subscription_status_id,
						'start': 0,
						'limit': 1
					};

					const subscriptions = await this.model_account_subscription.getSubscriptions(filter_data);

					if (subscriptions.length) {
						// Only match the latest order ID of the same customer ID
						// since new subscriptions cannot be re-added with the same
						// order ID; only as a new order ID added by an extension
						for (let subscription of subscriptions) {
							if (subscription['customer_id'] == result['customer_id'] && (subscription['subscription_id'] != result['subscription_id']) && (subscription['order_id'] != result['order_id']) && (subscription['order_product_id'] != result['order_product_id'])) {
								const subscription_info = await this.model_account_subscription.getSubscription(subscription['subscription_id']);

								if (subscription_info.subscription_plan_id) {
									// this.model_account_subscription.addTransaction(subscription['subscription_id'], subscription['order_id'], this.language.get('text_success'), amount, subscription_info['type'], subscription_info['payment_method'], subscription_info['payment_code']);
								}
							}
						}
					}
				}
			}
		}

		/*
		// Failed if payment method does not have recurring payment method

		subscription_status_id = this.config.get('config_subscription_failed_status_id');

		this.model_checkout_subscription.addHistory(result['subscription_id'], subscription_status_id, this.language.get('error_recurring'), true);

		subscription_status_id = this.config.get('config_subscription_failed_status_id');

		this.model_checkout_subscription.addHistory(result['subscription_id'], subscription_status_id, this.language.get('error_extension'), true);

		this.model_checkout_subscription.addHistory(result['subscription_id'], subscription_status_id, sprintf(this.language.get('error_payment'), ''), true);

		// History
		if (result['subscription_status_id'] != subscription_status_id) {
			await this.model_checkout_subscription.addHistory(result['subscription_id'], subscription_status_id, 'payment extension ' + result['payment_code'] + ' could not be loaded', true);
		}

		// Success
		if (this.config.get('config_subscription_active_status_id') == subscription_status_id) {
			// Trial
			if (result['trial_status'] && (!result['trial_duration'] || result['trial_remaining'])) {
				if (result['trial_duration'] && result['trial_remaining']) {
					await this.model_account_subscription.editTrialRemaining(result['subscription_id'], result['trial_remaining'] - 1);
				}
			} else if (!result['duration'] || result['remaining']) {
				// Subscription
				if (result['duration'] && result['remaining']) {
					await this.model_account_subscription.editRemaining(result['subscription_id'], result['remaining'] - 1);
				}
			}
		}
		*/
	}
}
