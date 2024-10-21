<?php
namespace Opencart\Catalog\Controller\Mail;
/**
 *
 *
 * @package Opencart\Catalog\Controller\Mail
 */
class SubscriptionController extends Controller {
	/**
	 * @param string route
	 * @param  args
	 * @param        output
	 *
	 * @return void
	 */
	async index(&route, args, &output) {
		if ((args[0])) {
			subscription_id = args[0];
		} else {
			subscription_id = 0;
		}

		if ((args[1]['subscription'])) {
			subscription = args[1]['subscription'];
		} else {
			subscription = [];
		}

		if ((args[2])) {
			comment = args[2];
		} else {
			comment = '';
		}

		if ((args[3])) {
			notify = args[3];
		} else {
			notify = '';
		}
		/*
		subscription['order_product_id']
		subscription['customer_id']
		subscription['order_id']
		subscription['subscription_plan_id']
		subscription['customer_payment_id'],
		subscription['name']
		subscription['description']
		subscription['trial_price']
		subscription['trial_frequency']
		subscription['trial_cycle']
		subscription['trial_duration']
		subscription['trial_remaining']
		subscription['trial_status']
		subscription['price']
		subscription['frequency']
		subscription['cycle']
		subscription['duration']
		subscription['remaining']
		subscription['date_next']
		subscription['status']


		if (subscription['trial_duration'] && subscription['trial_remaining']) {
			date_next = date('Y-m-d', strtotime('+' + subscription['trial_cycle'] + ' ' + subscription['trial_frequency']));
		} else if (subscription['duration'] && subscription['remaining']) {
			date_next = date('Y-m-d', strtotime('+' + subscription['cycle'] + ' ' + subscription['frequency']));
		}

		// Subscription
		this.load.model('account/subscription',this);

		filter_data = [
			'filter_subscription_id' : subscription_id,
			'filter_date_next' : date_next,
			'filter_subscription_status_id' : this.config.get('config_subscription_active_status_id'),
			'start' : 0,
			'limit' : 1
		];

		subscriptions = await this.model_account_subscription.getSubscriptions(filter_data);

		if (subscriptions) {
			await this.load.language('mail/subscription');

			for (subscriptions as value) {
				// Only match the latest order ID of the same customer ID
				// since new subscriptions cannot be re-added with the same
				// order ID; only as a new order ID added by an extension
				if (value['customer_id'] == subscription['customer_id'] && value['order_id'] == subscription['order_id']) {
					// Payment Methods
					this.load.model('account/payment_method');

					payment_method = await this.model_account_payment_method.getPaymentMethod(value['customer_id'], value['customer_payment_id']);

					if (payment_method) {
						// Subscription
						this.load.model('checkout/subscription');

						subscription_order_product = await this.model_checkout_subscription.getSubscriptionByOrderProductId(value['order_product_id']);

						if (subscription_order_product) {
							// Orders
							this.load.model('account/order',this);

							// Order Products
							order_product = await this.model_account_order.getProduct(value['order_id'], value['order_product_id']);

							if (order_product && order_product['order_product_id'] == subscription['order_product_id']) {
								let products = await this.cart.getProducts();

								description = '';

								for (let product of products) {
									if (product['product_id'] == order_product['product_id']) {


										if (product['subscription']['trial_status']) {
											trial_price = this.currency.format(this.tax.calculate(value['trial_price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.config.get('config_currency'));
											trial_cycle = value['trial_cycle'];
											trial_frequency = this.language.get('text_' + value['trial_frequency']);
											trial_duration = value['trial_duration'];

											description += sprintf(this.language.get('text_subscription_trial'), trial_price, trial_cycle, trial_frequency, trial_duration);
										}

										price = this.currency.format(this.tax.calculate(value['price'], product['tax_class_id'], Number(Number(this.config.get('config_tax')))), this.config.get('config_currency'));
										cycle = value['cycle'];
										frequency = this.language.get('text_' + value['frequency']);
										duration = value['duration'];

										if (duration) {
											description += sprintf(this.language.get('text_subscription_duration'), price, cycle, frequency, duration);
										} else {
											description += sprintf(this.language.get('text_subscription_cancel'), price, cycle, frequency);
										}
									}
								}


								// Orders
								this.load.model('checkout/order');

								const order_info = await this.model_checkout_order.getOrder(value['order_id']);

								if (order_info.order_id) {
									// Stores
									this.load.model('setting/store',this);

									// Settings
									this.load.model('setting/setting',this);

									const store_info = await this.model_setting_store.getStore(order_info['store_id']);

									if (store_info) {
										store_logo = html_entity_decode(await this.model_setting_setting.getValue('config_logo', store_info['store_id']));
										store_name = html_entity_decode(store_info['name']);

										store_url = store_info['url'];
									} else {
										store_logo = html_entity_decode(this.config.get('config_logo'));
										store_name = html_entity_decode(this.config.get('config_name'));

										store_url = HTTP_SERVER;
									}

									// Subscription Status
									subscription_status_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription_status` WHERE `subscription_status_id` = '" + value['subscription_status_id'] + "' AND `language_id` = '" + order_info['language_id'] + "'");

									if (subscription_status_query.num_rows) {
										data['order_status'] = subscription_status_query.row['name'];
									} else {
										data['order_status'] = '';
									}

									// Languages
									this.load.model('localisation/language',this);

									const language_info = await this.model_localisation_language.getLanguage(order_info['language_id']);

									// We need to compare both language IDs as they both need to match+
									if (language_info) {
										language_code = language_info['code'];
									} else {
										language_code = this.config.get('config_language');
									}

									// Load the language for any mails using a different country code and prefixing it so it does not pollute the main data pool+
									await this.load.language('default', 'mail', language_code);
									await this.load.language('mail/order_add', 'mail', language_code);

									// Add language vars to the template folder
									const results = this.language.all('mail');

									for (results as key : value) {
										data[key] = value;
									}

									subject = sprintf(this.language.get('mail_text_subject'), store_name, order_info['order_id']);

									// Image files
									this.load.model('tool/image',this);

									if (is_file(DIR_IMAGE + store_logo)) {
										data['logo'] = store_url + 'image/' + store_logo;
									} else {
										data['logo'] = '';
									}

									data['title'] = sprintf(this.language.get('mail_text_subject'), store_name, order_info['order_id']);

									data['text_greeting'] = sprintf(this.language.get('mail_text_greeting'), order_info['store_name']);

									data['store'] = store_name;
									data['store_url'] = order_info['store_url'];

									data['customer_id'] = order_info['customer_id'];
									data['link'] = order_info['store_url'] + 'account/subscription+info&subscription_id=' + subscription_id;

									data['order_id'] = order_info['order_id'];
									data['date_added'] = date(this.language.get('date_format_short'), new Date(value['date_added']));
									data['payment_method'] = order_info['payment_method'];
									data['email'] = order_info['email'];
									data['telephone'] = order_info['telephone'];
									data['ip'] = order_info['ip'];

									// Order Totals
									data['totals'] = [];

									order_totals = await this.model_checkout_order.getTotals(subscription['order_id']);

									for (order_totals as order_total) {
										data['totals'].push({
											'title' : order_total['title'],
											'text' : this.currency.format(order_total['value'], order_info['currency_code'], order_info['currency_value']),
										];
									}

									// Subscription
									if (comment && notify) {
										data['comment'] = nl2br(comment);
									} else {
										data['comment'] = '';
									}

									data['description'] = value['description'];

									// Products
									data['name'] = order_product['name'];
									data['quantity'] = order_product['quantity'];
									data['price'] = this.currency.format(order_product['price'], order_info['currency_code'], order_info['currency_value']);
									data['total'] = this.currency.format(order_product['total'], order_info['currency_code'], order_info['currency_value']);

									data['order'] = await this.url.link('account/order.info', 'order_id=' + value['order_id']);
									data['product'] = await this.url.link('product/product', 'product_id=' + value['product_id']);

									// Settings
									from = await this.model_setting_setting.getValue('config_email', order_info['store_id']);

									if (!from) {
										from = this.config.get('config_email');
									}

									if (this.config.get('payment_' + payment_info['code'] + '_status')) {
										this.load.model('extension/payment/' + payment_info['code']);

										// Promotion
										if ((this.{'model_extension_payment_' + payment_info['code']}.promotion)) {
											subscription_status_id = this.{'model_extension_payment_' + payment_info['code']}.promotion(value['subscription_id']);

											if (store_info) {
												config_subscription_active_status_id = await this.model_setting_setting.getValue('config_subscription_active_status_id', store_info['store_id']);
											} else {
												config_subscription_active_status_id = this.config.get('config_subscription_active_status_id');
											}

											if (config_subscription_active_status_id == subscription_status_id) {
												const subscription_info = await this.model_account_subscription.getSubscription(value['subscription_id']);

												// Validate the latest subscription values with the ones edited
												// by promotional extensions
												if (subscription_info && subscription_info['status'] && subscription_info['customer_id'] == value['customer_id'] && subscription_info['order_id'] == value['order_id'] && subscription_info['order_product_id'] == value['order_product_id']) {
													this.load.model('account/customer',this);

													const customer_info = await this.model_account_customer.getCustomer(subscription_info['customer_id']);

													frequencies = [
														'day',
														'week',
														'semi_month',
														'month',
														'year'
													];

													// We need to validate frequencies in compliance of the admin subscription plans
													// as with the use of the APIs
													if (customer_info && subscription_info['cycle'] >= 0 && subscription_info['cycle'] == value['cycle'] && in_array(subscription_info['frequency'], frequencies)) {
														if (subscription_info['frequency'] == 'semi_month') {
															period = new Date("2 weeks");
														} else {
															period = new Date(subscription_info['cycle'] + ' ' + subscription_info['frequency']);
														}

														// New customer once the trial period has ended
														customer_period = new Date(customer_info['date_added']);

														trial_period = 0;
														validate_trial = 0;

														// Trial
														if (subscription_info['trial_cycle'] && subscription_info['trial_frequency'] && subscription_info['trial_cycle'] == value['trial_cycle'] && subscription_info['trial_frequency'] == value['trial_frequency']) {
															if (subscription_info['trial_frequency'] == 'semi_month') {
																trial_period = new Date("2 weeks");
															} else {
																trial_period = new Date(subscription_info['trial_cycle'] + ' ' + subscription_info['trial_frequency']);
															}

															trial_period = (trial_period - customer_period);
															validate_trial = round(trial_period / (60 * 60 * 24));
														}

														// Calculates the remaining days between the subscription
														// promotional period and the date added period
														period = (period - customer_period);

														// Calculate remaining period of each features
														period = round(period / (60 * 60 * 24));

														// Promotional features description must be identical
														// until the time period has exceeded+ Therefore, the current
														// period must be matched as well
														if ((period == 0 && (validate_trial > 0 || !validate_trial)) && value['description'] == description && subscription_info['subscription_plan_id'] == value['subscription_plan_id']) {
															// Products
															this.load.model('catalog/product',this);

															product_subscription_info = await this.model_catalog_product.getSubscription(order_product['product_id'], subscription_info['subscription_plan_id']);

															if (product_subscription_info) {
																// For the next billing cycle
																await this.model_account_subscription.addTransaction(value['subscription_id'], value['order_id'], this.language.get('text_promotion'), subscription_info['amount'], subscription_info['type'], subscription_info['payment_method'], subscription_info['payment_code']);
															}
														}
													}
												}
											}
										}
									}

									// Mail
									if (this.config.get('config_mail_engine')) {
										mail_option = [
											'parameter' : this.config.get('config_mail_parameter'),
											'smtp_hostname' : this.config.get('config_mail_smtp_hostname'),
											'smtp_username' : this.config.get('config_mail_smtp_username'),
											'smtp_password' : html_entity_decode(this.config.get('config_mail_smtp_password')),
											'smtp_port' : this.config.get('config_mail_smtp_port'),
											'smtp_timeout' : this.config.get('config_mail_smtp_timeout')
										];

										mail = new MailLibrary(this.config.get('config_mail_engine'), mail_option);
										mail.setTo(order_info['email']);
										mail.setFrom(from);
										mail.setSender(store_name);
										mail.setSubject(subject);
										mail.setHtml(await this.load.view('mail/subscription', data));
										mail.send();
									}
								}
							}
						}
					}
				}
			}
		}
		*/
	}
}
