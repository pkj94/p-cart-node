module.exports = class ModelCheckoutOrder extends Model {
	async addOrder(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order` SET invoice_prefix = '" + this.db.escape(data['invoice_prefix']) + "', store_id = '" + data['store_id'] + "', store_name = '" + this.db.escape(data['store_name']) + "', store_url = '" + this.db.escape(data['store_url']) + "', customer_id = '" + data['customer_id'] + "', customer_group_id = '" + data['customer_group_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', custom_field = '" + this.db.escape((data['custom_field']) ? JSON.stringify(data['custom_field']) : '') + "', payment_firstname = '" + this.db.escape(data['payment_firstname']) + "', payment_lastname = '" + this.db.escape(data['payment_lastname']) + "', payment_company = '" + this.db.escape(data['payment_company']) + "', payment_address_1 = '" + this.db.escape(data['payment_address_1']) + "', payment_address_2 = '" + this.db.escape(data['payment_address_2']) + "', payment_city = '" + this.db.escape(data['payment_city']) + "', payment_postcode = '" + this.db.escape(data['payment_postcode']) + "', payment_country = '" + this.db.escape(data['payment_country']) + "', payment_country_id = '" + data['payment_country_id'] + "', payment_zone = '" + this.db.escape(data['payment_zone']) + "', payment_zone_id = '" + data['payment_zone_id'] + "', payment_address_format = '" + this.db.escape(data['payment_address_format']) + "', payment_custom_field = '" + this.db.escape((data['payment_custom_field']) ? JSON.stringify(data['payment_custom_field']) : '') + "', payment_method = '" + this.db.escape(data['payment_method']) + "', payment_code = '" + this.db.escape(data['payment_code']) + "', shipping_firstname = '" + this.db.escape(data['shipping_firstname']) + "', shipping_lastname = '" + this.db.escape(data['shipping_lastname']) + "', shipping_company = '" + this.db.escape(data['shipping_company']) + "', shipping_address_1 = '" + this.db.escape(data['shipping_address_1']) + "', shipping_address_2 = '" + this.db.escape(data['shipping_address_2']) + "', shipping_city = '" + this.db.escape(data['shipping_city']) + "', shipping_postcode = '" + this.db.escape(data['shipping_postcode']) + "', shipping_country = '" + this.db.escape(data['shipping_country']) + "', shipping_country_id = '" + data['shipping_country_id'] + "', shipping_zone = '" + this.db.escape(data['shipping_zone']) + "', shipping_zone_id = '" + data['shipping_zone_id'] + "', shipping_address_format = '" + this.db.escape(data['shipping_address_format']) + "', shipping_custom_field = '" + this.db.escape((data['shipping_custom_field']) ? JSON.stringify(data['shipping_custom_field']) : '') + "', shipping_method = '" + this.db.escape(data['shipping_method']) + "', shipping_code = '" + this.db.escape(data['shipping_code']) + "', comment = '" + this.db.escape(data['comment']) + "', total = '" + data['total'] + "', affiliate_id = '" + data['affiliate_id'] + "', commission = '" + data['commission'] + "', marketing_id = '" + data['marketing_id'] + "', tracking = '" + this.db.escape(data['tracking']) + "', language_id = '" + data['language_id'] + "', currency_id = '" + data['currency_id'] + "', currency_code = '" + this.db.escape(data['currency_code']) + "', currency_value = '" + data['currency_value'] + "', ip = '" + this.db.escape(data['ip']) + "', forwarded_ip = '" + this.db.escape(data['forwarded_ip']) + "', user_agent = '" + this.db.escape(data['user_agent']) + "', accept_language = '" + this.db.escape(data['accept_language']) + "', date_added = NOW(), date_modified = NOW()");

		const order_id = this.db.getLastId();

		// Products
		if ((data['products'].length)) {
			for (let product of data['products']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_product SET order_id = '" + order_id + "', product_id = '" + product['product_id'] + "', name = '" + this.db.escape(product['name']) + "', model = '" + this.db.escape(product['model']) + "', quantity = '" + product['quantity'] + "', price = '" + product['price'] + "', total = '" + product['total'] + "', tax = '" + product['tax'] + "', reward = '" + product['reward'] + "'");

				const order_product_id = this.db.getLastId();

				for (let option of product['option']) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "order_option SET order_id = '" + order_id + "', order_product_id = '" + order_product_id + "', product_option_id = '" + option['product_option_id'] + "', product_option_value_id = '" + option['product_option_value_id'] + "', name = '" + this.db.escape(option['name']) + "', `value` = '" + this.db.escape(option['value']) + "', `type` = '" + this.db.escape(option['type']) + "'");
				}
			}
		}

		// Gift Voucher
		this.load.model('extension/total/voucher', this);

		// Vouchers
		if ((data['vouchers'].length)) {
			for (let voucher of data['vouchers']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_voucher SET order_id = '" + order_id + "', description = '" + this.db.escape(voucher['description']) + "', code = '" + this.db.escape(voucher['code']) + "', from_name = '" + this.db.escape(voucher['from_name']) + "', from_email = '" + this.db.escape(voucher['from_email']) + "', to_name = '" + this.db.escape(voucher['to_name']) + "', to_email = '" + this.db.escape(voucher['to_email']) + "', voucher_theme_id = '" + voucher['voucher_theme_id'] + "', message = '" + this.db.escape(voucher['message']) + "', amount = '" + voucher['amount'] + "'");

				const order_voucher_id = this.db.getLastId();

				const voucher_id = await this.model_extension_total_voucher.addVoucher(order_id, voucher);

				await this.db.query("UPDATE " + DB_PREFIX + "order_voucher SET voucher_id = '" + voucher_id + "' WHERE order_voucher_id = '" + order_voucher_id + "'");
			}
		}

		// Totals
		if ((data['totals'].length)) {
			for (let total of data['totals']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_total SET order_id = '" + order_id + "', code = '" + this.db.escape(total['code']) + "', title = '" + this.db.escape(total['title']) + "', `value` = '" + total['value'] + "', sort_order = '" + total['sort_order'] + "'");
			}
		}

		return order_id;
	}

	async editOrder(order_id, data) {
		// Void the order first
		await this.addOrderHistory(order_id, 0);

		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET invoice_prefix = '" + this.db.escape(data['invoice_prefix']) + "', store_id = '" + data['store_id'] + "', store_name = '" + this.db.escape(data['store_name']) + "', store_url = '" + this.db.escape(data['store_url']) + "', customer_id = '" + data['customer_id'] + "', customer_group_id = '" + data['customer_group_id'] + "', firstname = '" + this.db.escape(data['firstname']) + "', lastname = '" + this.db.escape(data['lastname']) + "', email = '" + this.db.escape(data['email']) + "', telephone = '" + this.db.escape(data['telephone']) + "', custom_field = '" + this.db.escape(JSON.stringify(data['custom_field'])) + "', payment_firstname = '" + this.db.escape(data['payment_firstname']) + "', payment_lastname = '" + this.db.escape(data['payment_lastname']) + "', payment_company = '" + this.db.escape(data['payment_company']) + "', payment_address_1 = '" + this.db.escape(data['payment_address_1']) + "', payment_address_2 = '" + this.db.escape(data['payment_address_2']) + "', payment_city = '" + this.db.escape(data['payment_city']) + "', payment_postcode = '" + this.db.escape(data['payment_postcode']) + "', payment_country = '" + this.db.escape(data['payment_country']) + "', payment_country_id = '" + data['payment_country_id'] + "', payment_zone = '" + this.db.escape(data['payment_zone']) + "', payment_zone_id = '" + data['payment_zone_id'] + "', payment_address_format = '" + this.db.escape(data['payment_address_format']) + "', payment_custom_field = '" + this.db.escape(JSON.stringify(data['payment_custom_field'])) + "', payment_method = '" + this.db.escape(data['payment_method']) + "', payment_code = '" + this.db.escape(data['payment_code']) + "', shipping_firstname = '" + this.db.escape(data['shipping_firstname']) + "', shipping_lastname = '" + this.db.escape(data['shipping_lastname']) + "', shipping_company = '" + this.db.escape(data['shipping_company']) + "', shipping_address_1 = '" + this.db.escape(data['shipping_address_1']) + "', shipping_address_2 = '" + this.db.escape(data['shipping_address_2']) + "', shipping_city = '" + this.db.escape(data['shipping_city']) + "', shipping_postcode = '" + this.db.escape(data['shipping_postcode']) + "', shipping_country = '" + this.db.escape(data['shipping_country']) + "', shipping_country_id = '" + data['shipping_country_id'] + "', shipping_zone = '" + this.db.escape(data['shipping_zone']) + "', shipping_zone_id = '" + data['shipping_zone_id'] + "', shipping_address_format = '" + this.db.escape(data['shipping_address_format']) + "', shipping_custom_field = '" + this.db.escape(JSON.stringify(data['shipping_custom_field'])) + "', shipping_method = '" + this.db.escape(data['shipping_method']) + "', shipping_code = '" + this.db.escape(data['shipping_code']) + "', comment = '" + this.db.escape(data['comment']) + "', total = '" + data['total'] + "', affiliate_id = '" + data['affiliate_id'] + "', commission = '" + data['commission'] + "', date_modified = NOW() WHERE order_id = '" + order_id + "'");

		await this.db.query("DELETE FROM " + DB_PREFIX + "order_product WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM " + DB_PREFIX + "order_option WHERE order_id = '" + order_id + "'");

		// Products
		if ((data['products'].length)) {
			for (let product of data['products']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_product SET order_id = '" + order_id + "', product_id = '" + product['product_id'] + "', name = '" + this.db.escape(product['name']) + "', model = '" + this.db.escape(product['model']) + "', quantity = '" + product['quantity'] + "', price = '" + product['price'] + "', total = '" + product['total'] + "', tax = '" + product['tax'] + "', reward = '" + product['reward'] + "'");

				const order_product_id = this.db.getLastId();

				for (let option of product['option']) {
					await this.db.query("INSERT INTO " + DB_PREFIX + "order_option SET order_id = '" + order_id + "', order_product_id = '" + order_product_id + "', product_option_id = '" + option['product_option_id'] + "', product_option_value_id = '" + option['product_option_value_id'] + "', name = '" + this.db.escape(option['name']) + "', `value` = '" + this.db.escape(option['value']) + "', `type` = '" + this.db.escape(option['type']) + "'");
				}
			}
		}

		// Gift Voucher
		this.load.model('extension/total/voucher', this);

		await this.model_extension_total_voucher.disableVoucher(order_id);

		// Vouchers
		await this.db.query("DELETE FROM " + DB_PREFIX + "order_voucher WHERE order_id = '" + order_id + "'");

		if ((data['vouchers'].length)) {
			for (let voucher of data['vouchers']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_voucher SET order_id = '" + order_id + "', description = '" + this.db.escape(voucher['description']) + "', code = '" + this.db.escape(voucher['code']) + "', from_name = '" + this.db.escape(voucher['from_name']) + "', from_email = '" + this.db.escape(voucher['from_email']) + "', to_name = '" + this.db.escape(voucher['to_name']) + "', to_email = '" + this.db.escape(voucher['to_email']) + "', voucher_theme_id = '" + voucher['voucher_theme_id'] + "', message = '" + this.db.escape(voucher['message']) + "', amount = '" + voucher['amount'] + "'");

				const order_voucher_id = this.db.getLastId();

				const voucher_id = await this.model_extension_total_voucher.addVoucher(order_id, voucher);

				await this.db.query("UPDATE " + DB_PREFIX + "order_voucher SET voucher_id = '" + voucher_id + "' WHERE order_voucher_id = '" + order_voucher_id + "'");
			}
		}

		// Totals
		await this.db.query("DELETE FROM " + DB_PREFIX + "order_total WHERE order_id = '" + order_id + "'");

		if ((data['totals'].length)) {
			for (let total of data['totals']) {
				await this.db.query("INSERT INTO " + DB_PREFIX + "order_total SET order_id = '" + order_id + "', code = '" + this.db.escape(total['code']) + "', title = '" + this.db.escape(total['title']) + "', `value` = '" + total['value'] + "', sort_order = '" + total['sort_order'] + "'");
			}
		}
	}

	async deleteOrder(order_id) {
		// Void the order first
		this.addOrderHistory(order_id, 0);

		await this.db.query("DELETE FROM `" + DB_PREFIX + "order` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_product` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_option` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_voucher` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_total` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_history` WHERE order_id = '" + order_id + "'");
		await this.db.query("DELETE `or`, ort FROM `" + DB_PREFIX + "order_recurring` `or`, `" + DB_PREFIX + "order_recurring_transaction` `ort` WHERE order_id = '" + order_id + "' AND ort.order_recurring_id = `or`.order_recurring_id");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_transaction` WHERE order_id = '" + order_id + "'");

		// Gift Voucher
		this.load.model('extension/total/voucher', this);

		await this.model_extension_total_voucher.disableVoucher(order_id);
	}

	async getOrder(order_id) {
		order_query = await this.db.query("SELECT *, (SELECT os.name FROM `" + DB_PREFIX + "order_status` os WHERE os.order_status_id = o.order_status_id AND os.language_id = o.language_id) AS order_status FROM `" + DB_PREFIX + "order` o WHERE o.order_id = '" + order_id + "'");

		if (order_query.num_rows) {
			let country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + order_query.row['payment_country_id'] + "'");
			let payment_iso_code_2 = '';
			let payment_iso_code_3 = '';
			if (country_query.num_rows) {
				payment_iso_code_2 = country_query.row['iso_code_2'];
				payment_iso_code_3 = country_query.row['iso_code_3'];
			}
			let zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + order_query.row['payment_zone_id'] + "'");
			let payment_zone_code = '';
			if (zone_query.num_rows) {
				payment_zone_code = zone_query.row['code'];
			}

			country_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "country` WHERE country_id = '" + order_query.row['shipping_country_id'] + "'");
			let shipping_iso_code_2 = '';
			let shipping_iso_code_3 = '';
			if (country_query.num_rows) {
				shipping_iso_code_2 = country_query.row['iso_code_2'];
				shipping_iso_code_3 = country_query.row['iso_code_3'];
			}

			zone_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "zone` WHERE zone_id = '" + order_query.row['shipping_zone_id'] + "'");
			let shipping_zone_code = '';
			if (zone_query.num_rows) {
				shipping_zone_code = zone_query.row['code'];
			}

			this.load.model('localisation/language', this);

			const language_info = await this.model_localisation_language.getLanguage(order_query.row['language_id']);
			let language_code = this.config.get('config_language');
			if (language_info.language_id) {
				language_code = language_info['code'];
			}

			return {
				'order_id': order_query.row['order_id'],
				'invoice_no': order_query.row['invoice_no'],
				'invoice_prefix': order_query.row['invoice_prefix'],
				'store_id': order_query.row['store_id'],
				'store_name': order_query.row['store_name'],
				'store_url': order_query.row['store_url'],
				'customer_id': order_query.row['customer_id'],
				'firstname': order_query.row['firstname'],
				'lastname': order_query.row['lastname'],
				'email': order_query.row['email'],
				'telephone': order_query.row['telephone'],
				'custom_field': JSON.parse(order_query.row['custom_field'],),
				'payment_firstname': order_query.row['payment_firstname'],
				'payment_lastname': order_query.row['payment_lastname'],
				'payment_company': order_query.row['payment_company'],
				'payment_address_1': order_query.row['payment_address_1'],
				'payment_address_2': order_query.row['payment_address_2'],
				'payment_postcode': order_query.row['payment_postcode'],
				'payment_city': order_query.row['payment_city'],
				'payment_zone_id': order_query.row['payment_zone_id'],
				'payment_zone': order_query.row['payment_zone'],
				'payment_zone_code': payment_zone_code,
				'payment_country_id': order_query.row['payment_country_id'],
				'payment_country': order_query.row['payment_country'],
				'payment_iso_code_2': payment_iso_code_2,
				'payment_iso_code_3': payment_iso_code_3,
				'payment_address_format': order_query.row['payment_address_format'],
				'payment_custom_field': JSON.parse(order_query.row['payment_custom_field']),
				'payment_method': order_query.row['payment_method'],
				'payment_code': order_query.row['payment_code'],
				'shipping_firstname': order_query.row['shipping_firstname'],
				'shipping_lastname': order_query.row['shipping_lastname'],
				'shipping_company': order_query.row['shipping_company'],
				'shipping_address_1': order_query.row['shipping_address_1'],
				'shipping_address_2': order_query.row['shipping_address_2'],
				'shipping_postcode': order_query.row['shipping_postcode'],
				'shipping_city': order_query.row['shipping_city'],
				'shipping_zone_id': order_query.row['shipping_zone_id'],
				'shipping_zone': order_query.row['shipping_zone'],
				'shipping_zone_code': shipping_zone_code,
				'shipping_country_id': order_query.row['shipping_country_id'],
				'shipping_country': order_query.row['shipping_country'],
				'shipping_iso_code_2': shipping_iso_code_2,
				'shipping_iso_code_3': shipping_iso_code_3,
				'shipping_address_format': order_query.row['shipping_address_format'],
				'shipping_custom_field': JSON.parse(order_query.row['shipping_custom_field']),
				'shipping_method': order_query.row['shipping_method'],
				'shipping_code': order_query.row['shipping_code'],
				'comment': order_query.row['comment'],
				'total': order_query.row['total'],
				'order_status_id': order_query.row['order_status_id'],
				'order_status': order_query.row['order_status'],
				'affiliate_id': order_query.row['affiliate_id'],
				'commission': order_query.row['commission'],
				'language_id': order_query.row['language_id'],
				'language_code': language_code,
				'currency_id': order_query.row['currency_id'],
				'currency_code': order_query.row['currency_code'],
				'currency_value': order_query.row['currency_value'],
				'ip': order_query.row['ip'],
				'forwarded_ip': order_query.row['forwarded_ip'],
				'user_agent': order_query.row['user_agent'],
				'accept_language': order_query.row['accept_language'],
				'date_added': order_query.row['date_added'],
				'date_modified': order_query.row['date_modified']
			};
		} else {
			return false;
		}
	}

	async getOrderProducts(order_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_product WHERE order_id = '" + order_id + "'");

		return query.rows;
	}

	async getOrderOptions(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_option WHERE order_id = '" + order_id + "' AND order_product_id = '" + order_product_id + "'");

		return query.rows;
	}

	async getOrderVouchers(order_id) {
		const query = await this.db.query("SELECT * FROM " + DB_PREFIX + "order_voucher WHERE order_id = '" + order_id + "'");

		return query.rows;
	}

	async getOrderTotals(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_total` WHERE order_id = '" + order_id + "' ORDER BY sort_order ASC");

		return query.rows;
	}

	async addOrderHistory(order_id, order_status_id, comment = '', notify = false, override = false) {
		const order_info = await this.getOrder(order_id);

		if (order_info) {
			// Fraud Detection
			this.load.model('account/customer', this);

			const customer_info = await this.model_account_customer.getCustomer(order_info['customer_id']);
			let safe = false;
			if (customer_info && customer_info['safe']) {
				safe = true;
			}

			// Only do the fraud check if the customer is not on the safe list and the order status is changing into the complete or process order status
			if (!safe && !override && [...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_status_id)) {
				// Anti-Fraud
				this.load.model('setting/extension', this);

				const extensions = await this.model_setting_extension.getExtensions('fraud');

				for (let extension of extensions) {
					if (Number(this.config.get('fraud_' + extension['code'] + '_status'))) {
						this.load.model('extension/fraud/' + extension['code'], this);

						if (typeof this['model_extension_fraud_' + extension['code']].check != 'undefined') {
							const fraud_status_id = this['model_extension_fraud_' + extension['code']].check(order_info);

							if (fraud_status_id) {
								order_status_id = fraud_status_id;
							}
						}
					}
				}
			}

			// If current order status is not processing or complete but new status is processing or complete then commence completing the order
			if (![...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_info['order_status_id']) && [...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_status_id)) {
				// Redeem coupon, vouchers and reward points
				const order_totals = await this.getOrderTotals(order_id);

				for (let order_total of order_totals) {
					this.load.model('extension/total/' + order_total['code'], this);

					if (typeof this['model_extension_total_' + order_total['code']].confirm != 'undefined') {
						// Confirm coupon, vouchers and reward points
						const fraud_status_id = this['model_extension_total_' + order_total['code']].confirm(order_info, order_total);

						// If the balance on the coupon, vouchers and reward points is not enough to cover the transaction or has already been used then the fraud order status is returned.
						if (fraud_status_id) {
							order_status_id = fraud_status_id;
						}
					}
				}

				// Stock subtraction
				const order_products = await this.getOrderProducts(order_id);

				for (let order_product of order_products) {
					await this.db.query("UPDATE " + DB_PREFIX + "product SET quantity = (quantity - " + order_product['quantity'] + ") WHERE product_id = '" + order_product['product_id'] + "' AND subtract = '1'");

					const order_options = await this.getOrderOptions(order_id, order_product['order_product_id']);

					for (let order_option of order_options) {
						await this.db.query("UPDATE " + DB_PREFIX + "product_option_value SET quantity = (quantity - " + order_product['quantity'] + ") WHERE product_option_value_id = '" + order_option['product_option_value_id'] + "' AND subtract = '1'");
					}
				}

				// Add commission if sale is linked to affiliate referral.
				if (order_info['affiliate_id'] && this.config.get('config_affiliate_auto')) {
					this.load.model('account/customer', this);

					if (!await this.model_account_customer.getTotalTransactionsByOrderId(order_id)) {
						await this.model_account_customer.addTransaction(order_info['affiliate_id'], this.language.get('text_order_id') + ' #' + order_id, order_info['commission'], order_id);
					}
				}
			}

			// Update the DB with the new statuses
			await this.db.query("UPDATE `" + DB_PREFIX + "order` SET order_status_id = '" + order_status_id + "', date_modified = NOW() WHERE order_id = '" + order_id + "'");

			await this.db.query("INSERT INTO " + DB_PREFIX + "order_history SET order_id = '" + order_id + "', order_status_id = '" + order_status_id + "', notify = '" + notify + "', comment = '" + this.db.escape(comment) + "', date_added = NOW()");

			// If old order status is the processing or complete status but new status is not then commence restock, and remove coupon, voucher and reward history
			if ([...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_info['order_status_id']) && ![...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_status_id)) {
				// Restock
				const order_products = await this.getOrderProducts(order_id);

				for (let order_product of order_products) {
					await this.db.query("UPDATE `" + DB_PREFIX + "product` SET quantity = (quantity + " + order_product['quantity'] + ") WHERE product_id = '" + order_product['product_id'] + "' AND subtract = '1'");

					const order_options = await this.getOrderOptions(order_id, order_product['order_product_id']);

					for (let order_option of order_options) {
						await this.db.query("UPDATE " + DB_PREFIX + "product_option_value SET quantity = (quantity + " + order_product['quantity'] + ") WHERE product_option_value_id = '" + order_option['product_option_value_id'] + "' AND subtract = '1'");
					}
				}

				// Remove coupon, vouchers and reward points history
				const order_totals = await this.getOrderTotals(order_id);

				for (let order_total of order_totals) {
					this.load.model('extension/total/' + order_total['code'], this);

					if (typeof this['model_extension_total_' + order_total['code']].unconfirm != 'undefined') {
						this['model_extension_total_' + order_total['code']].unconfirm(order_id);
					}
				}

				// Remove commission if sale is linked to affiliate referral.
				if (order_info['affiliate_id']) {
					this.load.model('account/customer', this);

					await this.model_account_customer.deleteTransactionByOrderId(order_id);
				}
			}

			await this.cache.delete('product');
		}
	}
}