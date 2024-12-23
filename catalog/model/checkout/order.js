module.exports = class Order extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addOrder(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order` SET `invoice_prefix` = " + this.db.escape(data['invoice_prefix']) + ", `store_id` = '" + data['store_id'] + "', `store_name` = " + this.db.escape(data['store_name']) + ", `store_url` = " + this.db.escape(data['store_url']) + ", `customer_id` = '" + data['customer_id'] + "', `customer_group_id` = '" + data['customer_group_id'] + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `custom_field` = " + this.db.escape((data['custom_field']) ? JSON.stringify(data['custom_field']) : '') + ", `payment_address_id` = '" + data['payment_address_id'] + "', `payment_firstname` = " + this.db.escape(data['payment_firstname']) + ", `payment_lastname` = " + this.db.escape(data['payment_lastname']) + ", `payment_company` = " + this.db.escape(data['payment_company']) + ", `payment_address_1` = " + this.db.escape(data['payment_address_1']) + ", `payment_address_2` = " + this.db.escape(data['payment_address_2']) + ", `payment_city` = " + this.db.escape(data['payment_city']) + ", `payment_postcode` = " + this.db.escape(data['payment_postcode']) + ", `payment_country` = " + this.db.escape(data['payment_country']) + ", `payment_country_id` = '" + data['payment_country_id'] + "', `payment_zone` = " + this.db.escape(data['payment_zone']) + ", `payment_zone_id` = '" + data['payment_zone_id'] + "', `payment_address_format` = " + this.db.escape(data['payment_address_format']) + ", `payment_custom_field` = " + this.db.escape((data['payment_custom_field']) ? JSON.stringify(data['payment_custom_field']) : '') + ", `payment_method` = " + this.db.escape(data['payment_method'] ? JSON.stringify(data['payment_method']) : '') + ", `shipping_address_id` = '" + data['shipping_address_id'] + "', `shipping_firstname` = " + this.db.escape(data['shipping_firstname']) + ", `shipping_lastname` = " + this.db.escape(data['shipping_lastname']) + ", `shipping_company` = " + this.db.escape(data['shipping_company']) + ", `shipping_address_1` = " + this.db.escape(data['shipping_address_1']) + ", `shipping_address_2` = " + this.db.escape(data['shipping_address_2']) + ", `shipping_city` = " + this.db.escape(data['shipping_city']) + ", `shipping_postcode` = " + this.db.escape(data['shipping_postcode']) + ", `shipping_country` = " + this.db.escape(data['shipping_country']) + ", `shipping_country_id` = '" + data['shipping_country_id'] + "', `shipping_zone` = " + this.db.escape(data['shipping_zone']) + ", `shipping_zone_id` = '" + data['shipping_zone_id'] + "', `shipping_address_format` = " + this.db.escape(data['shipping_address_format']) + ", `shipping_custom_field` = " + this.db.escape((data['shipping_custom_field']) ? JSON.stringify(data['shipping_custom_field']) : '') + ", `shipping_method` = " + this.db.escape(data['shipping_method'] ? JSON.stringify(data['shipping_method']) : '') + ", `comment` = " + this.db.escape(data['comment']) + ", `total` = '" + data['total'] + "', `affiliate_id` = '" + data['affiliate_id'] + "', `commission` = '" + data['commission'] + "', `marketing_id` = '" + data['marketing_id'] + "', `tracking` = " + this.db.escape(data['tracking']) + ", `language_id` = '" + data['language_id'] + "', `currency_id` = '" + data['currency_id'] + "', `currency_code` = " + this.db.escape(data['currency_code']) + ", `currency_value` = '" + data['currency_value'] + "', `ip` = " + this.db.escape(data['ip']) + ", `forwarded_ip` = " + this.db.escape(data['forwarded_ip']) + ", `user_agent` = " + this.db.escape(data['user_agent']) + ", `accept_language` = " + this.db.escape(data['accept_language']) + ", `date_added` = NOW(), `date_modified` = NOW()");

		const order_id = this.db.getLastId();

		// Products
		if ((data['products'] && data['products'].length)) {
			for (let product of data['products']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "order_product` SET `order_id` = '" + order_id + "', `product_id` = '" + product['product_id'] + "', `master_id` = '" + product['master_id'] + "', `name` = " + this.db.escape(product['name']) + ", `model` = " + this.db.escape(product['model']) + ", `quantity` = '" + product['quantity'] + "', `price` = '" + product['price'] + "', `total` = '" + product['total'] + "', `tax` = '" + product['tax'] + "', `reward` = '" + product['reward'] + "'");

				const order_product_id = this.db.getLastId();

				for (let option of product['option']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "order_option` SET `order_id` = '" + order_id + "', `order_product_id` = '" + order_product_id + "', `product_option_id` = '" + option['product_option_id'] + "', `product_option_value_id` = '" + option['product_option_value_id'] + "', `name` = " + this.db.escape(option['name']) + ", `value` = " + this.db.escape(option['value']) + ", `type` = " + this.db.escape(option['type']) + "");
				}

				// If subscription add details
				if (product['subscription'] && product['subscription'].subscription_plan_id) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "order_subscription` SET `order_id` = '" + order_id + "', `order_product_id` = '" + order_product_id + "', `subscription_plan_id` = '" + product['subscription']['subscription_plan_id'] + "', `trial_price` = '" + product['subscription']['trial_price'] + "', `trial_tax` = '" + product['subscription']['trial_tax'] + "', `trial_frequency` = " + this.db.escape(product['subscription']['trial_frequency']) + ", `trial_cycle` = '" + product['subscription']['trial_cycle'] + "', `trial_duration` = '" + product['subscription']['trial_duration'] + "', `trial_remaining` = '" + product['subscription']['trial_remaining'] + "', `trial_status` = '" + product['subscription']['trial_status'] + "', `price` = '" + product['subscription']['price'] + "', `tax` = '" + product['subscription']['tax'] + "', `frequency` = " + this.db.escape(product['subscription']['frequency']) + ", `cycle` = '" + product['subscription']['cycle'] + "', `duration` = '" + product['subscription']['duration'] + "'");
				}
			}
		}

		// Vouchers
		if ((data['vouchers'] && data['vouchers'].length)) {
			this.load.model('checkout/voucher', this);

			for (let voucher of data['vouchers']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "order_voucher` SET `order_id` = '" + order_id + "', `description` = " + this.db.escape(voucher['description']) + ", `code` = " + this.db.escape(voucher['code']) + ", `from_name` = " + this.db.escape(voucher['from_name']) + ", `from_email` = " + this.db.escape(voucher['from_email']) + ", `to_name` = " + this.db.escape(voucher['to_name']) + ", `to_email` = " + this.db.escape(voucher['to_email']) + ", `voucher_theme_id` = '" + voucher['voucher_theme_id'] + "', `message` = " + this.db.escape(voucher['message']) + ", `amount` = '" + voucher['amount'] + "'");

				const order_voucher_id = this.db.getLastId();

				const voucher_id = await this.model_checkout_voucher.addVoucher(order_id, voucher);

				await this.db.query("UPDATE `" + DB_PREFIX + "order_voucher` SET `voucher_id` = '" + voucher_id + "' WHERE `order_voucher_id` = '" + order_voucher_id + "'");
			}
		}

		// Totals
		if ((data['totals'] && data['totals'].length)) {
			for (let total of data['totals']) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "order_total` SET `order_id` = '" + order_id + "', `extension` = " + this.db.escape(total['extension']) + ", `code` = " + this.db.escape(total['code']) + ", `title` = " + this.db.escape(total['title']) + ", `value` = '" + total['value'] + "', `sort_order` = '" + total['sort_order'] + "'");
			}
		}

		return order_id;
	}

	/**
	 * @param   order_id
	 * @param data
	 *
	 * @return void
	 */
	async editOrder(order_id, data) {
		// 1+ Void the order first
		await this.addHistory(order_id, 0);

		const order_info = await this.getOrder(order_id);

		if (order_info.order_id) {
			// 2+ Merge the old order data with the new data
			for (let [key, value] of Object.entries(order_info)) {
				if (!(data[key])) {
					data[key] = value;
				}
			}

			await this.db.query("UPDATE `" + DB_PREFIX + "order` SET `invoice_prefix` = " + this.db.escape(data['invoice_prefix']) + ", `store_id` = '" + data['store_id'] + "', `store_name` = " + this.db.escape(data['store_name']) + ", `store_url` = " + this.db.escape(data['store_url']) + ", `customer_id` = '" + data['customer_id'] + "', `customer_group_id` = '" + data['customer_group_id'] + "', `firstname` = " + this.db.escape(data['firstname']) + ", `lastname` = " + this.db.escape(data['lastname']) + ", `email` = " + this.db.escape(data['email']) + ", `telephone` = " + this.db.escape(data['telephone']) + ", `custom_field` = " + this.db.escape(JSON.stringify(data['custom_field'])) + ", `payment_address_id` = '" + data['payment_address_id'] + "', `payment_firstname` = " + this.db.escape(data['payment_firstname']) + ", `payment_lastname` = " + this.db.escape(data['payment_lastname']) + ", `payment_company` = " + this.db.escape(data['payment_company']) + ", `payment_address_1` = " + this.db.escape(data['payment_address_1']) + ", `payment_address_2` = " + this.db.escape(data['payment_address_2']) + ", `payment_city` = " + this.db.escape(data['payment_city']) + ", `payment_postcode` = " + this.db.escape(data['payment_postcode']) + ", `payment_country` = " + this.db.escape(data['payment_country']) + ", `payment_country_id` = '" + data['payment_country_id'] + "', `payment_zone` = " + this.db.escape(data['payment_zone']) + ", `payment_zone_id` = '" + data['payment_zone_id'] + "', `payment_address_format` = " + this.db.escape(data['payment_address_format']) + ", `payment_custom_field` = " + this.db.escape((data['payment_custom_field']) ? JSON.stringify(data['payment_custom_field']) : '') + ", `payment_method` = " + this.db.escape(data['payment_method'] ? JSON.stringify(data['payment_method']) : '') + ", `shipping_address_id` = '" + data['shipping_address_id'] + "', `shipping_firstname` = " + this.db.escape(data['shipping_firstname']) + ", `shipping_lastname` = " + this.db.escape(data['shipping_lastname']) + ", `shipping_company` = " + this.db.escape(data['shipping_company']) + ", `shipping_address_1` = " + this.db.escape(data['shipping_address_1']) + ", `shipping_address_2` = " + this.db.escape(data['shipping_address_2']) + ", `shipping_city` = " + this.db.escape(data['shipping_city']) + ", `shipping_postcode` = " + this.db.escape(data['shipping_postcode']) + ", `shipping_country` = " + this.db.escape(data['shipping_country']) + ", `shipping_country_id` = '" + data['shipping_country_id'] + "', `shipping_zone` = " + this.db.escape(data['shipping_zone']) + ", `shipping_zone_id` = '" + data['shipping_zone_id'] + "', `shipping_address_format` = " + this.db.escape(data['shipping_address_format']) + ", `shipping_custom_field` = " + this.db.escape((data['shipping_custom_field']) ? JSON.stringify(data['shipping_custom_field']) : '') + ", `shipping_method` = " + this.db.escape(data['shipping_method'] ? JSON.stringify(data['shipping_method']) : '') + ", `comment` = " + this.db.escape(data['comment']) + ", `total` = '" + data['total'] + "', `affiliate_id` = '" + data['affiliate_id'] + "', `commission` = '" + data['commission'] + "', `date_modified` = NOW() WHERE `order_id` = '" + order_id + "'");

			await this.db.query("DELETE FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");
			await this.db.query("DELETE FROM `" + DB_PREFIX + "order_option` WHERE `order_id` = '" + order_id + "'");
			await this.db.query("DELETE FROM `" + DB_PREFIX + "order_subscription` WHERE `order_id` = '" + order_id + "'");

			// Products
			if ((data['products'] && data['products'].length)) {
				for (let product of data['products']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "order_product` SET `order_id` = '" + order_id + "', `product_id` = '" + product['product_id'] + "', `master_id` = '" + product['master_id'] + "', `name` = " + this.db.escape(product['name']) + ", `model` = " + this.db.escape(product['model']) + ", `quantity` = '" + product['quantity'] + "', `price` = '" + product['price'] + "', `total` = '" + product['total'] + "', `tax` = '" + product['tax'] + "', `reward` = '" + product['reward'] + "'");

					const order_product_id = this.db.getLastId();

					for (let option of product['option']) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "order_option` SET `order_id` = '" + order_id + "', `order_product_id` = '" + order_product_id + "', `product_option_id` = '" + option['product_option_id'] + "', `product_option_value_id` = '" + option['product_option_value_id'] + "', `name` = " + this.db.escape(option['name']) + ", `value` = " + this.db.escape(option['value']) + ", `type` = " + this.db.escape(option['type']) + "");
					}

					if (product['subscription'] && product['subscription'].subscription_plan_id) {
						await this.db.query("INSERT INTO `" + DB_PREFIX + "order_subscription` SET `order_id` = '" + order_id + "', `order_product_id` = '" + order_product_id + "', `subscription_plan_id` = '" + product['subscription']['subscription_plan_id'] + "', `trial_price` = '" + product['subscription']['trial_price'] + "', `trial_tax` = '" + product['subscription']['trial_tax'] + "', `trial_frequency` = " + this.db.escape(product['subscription']['trial_frequency']) + ", `trial_cycle` = '" + product['subscription']['trial_cycle'] + "', `trial_duration` = '" + product['subscription']['trial_duration'] + "', `trial_remaining` = '" + product['subscription']['trial_remaining'] + "', `trial_status` = '" + product['subscription']['trial_status'] + "', `price` = '" + product['subscription']['price'] + "', `tax` = '" + product['subscription']['tax'] + "', `frequency` = " + this.db.escape(product['subscription']['frequency']) + ", `cycle` = '" + product['subscription']['cycle'] + "', `duration` = '" + product['subscription']['duration'] + "'");
					}
				}
			}

			// Gift Voucher
			this.load.model('checkout/voucher', this);

			await this.model_checkout_voucher.deleteVoucherByOrderId(order_id);

			// Vouchers
			await this.db.query("DELETE FROM `" + DB_PREFIX + "order_voucher` WHERE `order_id` = '" + order_id + "'");

			if ((data['vouchers'] && data['vouchers'].length)) {
				for (let voucher of data['vouchers']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "order_voucher` SET `order_id` = '" + order_id + "', `description` = " + this.db.escape(voucher['description']) + ", `code` = " + this.db.escape(voucher['code']) + ", `from_name` = " + this.db.escape(voucher['from_name']) + ", `from_email` = " + this.db.escape(voucher['from_email']) + ", `to_name` = " + this.db.escape(voucher['to_name']) + ", `to_email` = " + this.db.escape(voucher['to_email']) + ", `voucher_theme_id` = '" + voucher['voucher_theme_id'] + "', `message` = " + this.db.escape(voucher['message']) + ", `amount` = '" + voucher['amount'] + "'");

					const order_voucher_id = this.db.getLastId();

					const voucher_id = await this.model_checkout_voucher.addVoucher(order_id, voucher);

					await this.db.query("UPDATE `" + DB_PREFIX + "order_voucher` SET `voucher_id` = '" + voucher_id + "' WHERE `order_voucher_id` = '" + order_voucher_id + "'");
				}
			}

			// Totals
			await this.db.query("DELETE FROM `" + DB_PREFIX + "order_total` WHERE `order_id` = '" + order_id + "'");

			if ((data['totals'] && data['totals'].length)) {
				for (let total of data['totals']) {
					await this.db.query("INSERT INTO `" + DB_PREFIX + "order_total` SET `order_id` = '" + order_id + "', `extension` = " + this.db.escape(total['extension']) + ", `code` = " + this.db.escape(total['code']) + ", `title` = " + this.db.escape(total['title']) + ", `value` = '" + total['value'] + "', `sort_order` = '" + total['sort_order'] + "'");
				}
			}
		}
	}

	/**
	 * @param    order_id
	 * @param string transaction_id
	 *
	 * @return void
	 */
	async editTransactionId(order_id, transaction_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET `transaction_id` = " + this.db.escape(transaction_id) + " WHERE `order_id` = '" + order_id + "'");
	}

	/**
	 * @param    order_id
	 * @param string comment
	 *
	 * @return void
	 */
	async editComment(order_id, comment) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order` SET `comment` = " + this.db.escape(comment) + " WHERE `order_id` = '" + order_id + "'");
	}

	/**
	 * @param order_id
	 *
	 * @return void
	 */
	async deleteOrder(order_id) {
		// Void the order first
		await this.addHistory(order_id, 0);

		await this.db.query("DELETE FROM `" + DB_PREFIX + "order` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_option` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_subscription` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_voucher` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_total` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "order_history` WHERE `order_id` = '" + order_id + "'");
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_transaction` WHERE `order_id` = '" + order_id + "'");

		// Gift Voucher
		this.load.model('checkout/voucher', this);

		await this.model_checkout_voucher.deleteVoucherByOrderId(order_id);
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getOrder(order_id) {
		const order_query = await this.db.query("SELECT *, (SELECT `os`.`name` FROM `" + DB_PREFIX + "order_status` `os` WHERE `os`.`order_status_id` = `o`.`order_status_id` AND `os`.`language_id` = `o`.`language_id`) AS order_status FROM `" + DB_PREFIX + "order` `o` WHERE `o`.`order_id` = '" + order_id + "'");

		if (order_query.num_rows) {
			let order_data = order_query.row;

			this.load.model('localisation/country', this);
			this.load.model('localisation/zone', this);

			order_data['custom_field'] = order_query.row['custom_field'] ? JSON.parse(order_query.row['custom_field']) : {};

			for (let column of ['payment', 'shipping']) {
				const country_info = await this.model_localisation_country.getCountry(order_query.row[column + '_country_id']);

				if (country_info.country_id) {
					order_data[column + '_iso_code_2'] = country_info['iso_code_2'];
					order_data[column + '_iso_code_3'] = country_info['iso_code_3'];
				} else {
					order_data[column + '_iso_code_2'] = '';
					order_data[column + '_iso_code_3'] = '';
				}

				const zone_info = await this.model_localisation_zone.getZone(order_query.row[column + '_zone_id']);

				if (zone_info.zone_id) {
					order_data[column + '_zone_code'] = zone_info['code'];
				} else {
					order_data[column + '_zone_code'] = '';
				}

				// order_data[column + '_custom_field'] = JSON.parse(order_query.row[column + '_custom_field']);

				order_data[column + '_custom_field'] = JSON.parse(order_query.row[column + '_custom_field']);

				// Payment and shipping method details
				order_data[column + '_method'] = JSON.parse(order_query.row[column + '_method']);
			}

			return order_data;
		}

		return {};
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getProduct(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getProducts(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_product` WHERE `order_id` = '" + order_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getOptions(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_option` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscription(order_id, order_product_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_subscription` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getSubscriptions(data) {
		const sql = "SELECT * FROM `" + DB_PREFIX + "subscription`";

		let implode = [];

		if ((data['filter_date_next'])) {
			implode.push("DATE(`date_next`) <= DATE(" + this.db.escape(data['filter_date_next']) + ")");
		}

		if ((data['filter_subscription_status_id'])) {
			implode.push("`subscription_status_id` = '" + data['filter_subscription_status_id'] + "'");
		}

		if (implode) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			'pd+name',
			'p+model',
			'p+price',
			'p+quantity',
			'p+status',
			'p.sort_order'
		];

		if ((data['sort']) && sort_data.includes(data['sort'])) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY o.`order_id`";
		}

		if ((data['order']) && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if ((data['start']) || (data['limit'])) {
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		const query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getVouchers(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_voucher` WHERE `order_id` = '" + order_id + "'");

		return query.rows;
	}

	/**
	 * @param order_id
	 *
	 * @return array
	 */
	async getTotals(order_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_total` WHERE `order_id` = '" + order_id + "' ORDER BY `sort_order` ASC");

		return query.rows;
	}

	/**
	 * @param    order_id
	 * @param    order_status_id
	 * @param string comment
	 * @param bool   notify
	 * @param bool   override
	 *
	 * @return void
	 */
	async addHistory(order_id, order_status_id, comment = '', notify = false, override = false) {
		const order_info = await this.getOrder(order_id);

		if (order_info.order_id) {
			// Load subscription model
			this.load.model('account/customer', this);

			const customer_info = await this.model_account_customer.getCustomer(order_info['customer_id']);

			// Fraud Detection Enable / Disable
			let safe = false;
			if (customer_info.customer_id && customer_info['safe']) {
				safe = true;
			}

			// Only do the fraud check if the customer is not on the safe list and the order status is changing into the complete or process order status
			if (!safe && !override && [...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_status_id)) {
				// Anti-Fraud
				this.load.model('setting/extension', this);

				const extensions = await this.model_setting_extension.getExtensionsByType('fraud');

				for (let extension of extensions) {
					if (Number(this.config.get('fraud_' + extension['code'] + '_status'))) {
						this.load.model('extension/' + extension['extension'] + '/fraud/' + extension['code'], this);

						if ((await this['model_extension_' + extension['extension'] + '_fraud_' + extension['code']].check)) {
							const fraud_status_id = await this['model_extension_' + extension['extension'] + '_fraud_' + extension['code']].check(order_info);

							if (fraud_status_id) {
								order_status_id = fraud_status_id;
							}
						}
					}
				}
			}

			// Products
			const order_products = await this.getProducts(order_id);

			// Totals
			const order_totals = await this.getTotals(order_id);

			// If current order status is not processing or complete but new status is processing or complete then commence completing the order
			if (![...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_info['order_status_id']) && [...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_status_id)) {
				// Redeem coupon, vouchers and reward points
				for (let order_total of order_totals) {
					this.load.model('extension/' + order_total['extension'] + '/total/' + order_total['code'], this);

					if ((this['model_extension_' + order_total['extension'] + '_total_' + order_total['code']].confirm)) {
						// Confirm coupon, vouchers and reward points
						const fraud_status_id = await this['model_extension_' + order_total['extension'] + '_total_' + order_total['code']].confirm(order_info, order_total);

						// If the balance on the coupon, vouchers and reward points is not enough to cover the transaction or has already been used then the fraud order status is returned+
						if (fraud_status_id) {
							order_status_id = fraud_status_id;
						}
					}
				}

				for (let order_product of order_products) {
					// Stock subtraction
					await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `quantity` = (`quantity` - " + order_product['quantity'] + ") WHERE `product_id` = '" + order_product['product_id'] + "' AND `subtract` = '1'");

					// Stock subtraction from master product
					if (order_product['master_id']) {
						await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `quantity` = (`quantity` - " + order_product['quantity'] + ") WHERE `product_id` = '" + order_product['master_id'] + "' AND `subtract` = '1'");
					}

					const order_options = await this.getOptions(order_id, order_product['order_product_id']);

					for (let order_option of order_options) {
						await this.db.query("UPDATE `" + DB_PREFIX + "product_option_value` SET `quantity` = (`quantity` - " + order_product['quantity'] + ") WHERE `product_option_value_id` = '" + order_option['product_option_value_id'] + "' AND `subtract` = '1'");
					}
				}
			}

			// If order status becomes complete status
			if (!this.config.get('config_complete_status').includes(order_info['order_status_id']) && this.config.get('config_complete_status').includes(order_status_id)) {
				// Affiliate add commission if complete status
				if (order_info['affiliate_id'] && Number(this.config.get('config_affiliate_auto'))) {
					// Add commission if sale is linked to affiliate referral+
					this.load.model('account/customer', this);

					if (!await this.model_account_customer.getTotalTransactionsByOrderId(order_id)) {
						await this.model_account_customer.addTransaction(order_info['affiliate_id'], this.language.get('text_order_id') + ' #' + order_id, order_info['commission'], order_id);
					}
				}

				// Add subscription
				this.load.model('checkout/subscription', this);

				for (let order_product of order_products) {
					// Subscription
					const order_subscription_info = await this.getSubscription(order_id, order_product['order_product_id']);

					if (order_subscription_info.order_subscription_id) {
						// Add subscription if one is not setup
						const subscription_info = await this.model_checkout_subscription.getSubscriptionByOrderProductId(order_id, order_product['order_product_id']);
						let subscription_id;
						if (subscription_info.subscription_id) {
							subscription_id = subscription_info['subscription_id'];
						} else {
							subscription_id = await this.model_checkout_subscription.addSubscription({ ...order_subscription_info, ...order_product, ...order_info });
						}

						// Add history and set active subscription
						await this.model_checkout_subscription.addHistory(subscription_id, this.config.get('config_subscription_active_id'));
					}
				}
			}

			// If old order status is the processing or complete status but new status is not then commence restock, and remove coupon, voucher and reward history
			if ([...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_info['order_status_id']) && ![...this.config.get('config_processing_status'), ...this.config.get('config_complete_status')].includes(order_status_id)) {
				// Restock
				for (let order_product of order_products) {
					await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `quantity` = (`quantity` + " + order_product['quantity'] + ") WHERE `product_id` = '" + order_product['product_id'] + "' AND `subtract` = '1'");

					// Restock the master product stock level if product is a variant
					if (order_product['master_id']) {
						await this.db.query("UPDATE `" + DB_PREFIX + "product` SET `quantity` = (`quantity` + " + order_product['quantity'] + ") WHERE `product_id` = '" + order_product['master_id'] + "' AND `subtract` = '1'");
					}

					const order_options = this.getOptions(order_id, order_product['order_product_id']);

					for (let order_option of order_options) {
						await this.db.query("UPDATE `" + DB_PREFIX + "product_option_value` SET `quantity` = (`quantity` + " + order_product['quantity'] + ") WHERE `product_option_value_id` = '" + order_option['product_option_value_id'] + "' AND `subtract` = '1'");
					}
				}

				// Remove coupon, vouchers and reward points history
				for (let order_total of order_totals) {
					this.load.model('extension/' + order_total['extension'] + '/total/' + order_total['code']);

					if ((this['model_extension_' + order_total['extension'] + '_total_' + order_total['code']].unconfirm)) {
						this['model_extension_' + order_total['extension'] + '_total_' + order_total['code']].unconfirm(order_id);
					}
				}
			}

			// If order status is no longer complete status
			if (this.config.get('config_complete_status').includes(order_info['order_status_id']) && !this.config.get('config_complete_status').includes(order_status_id)) {
				// Suspend subscription
				this.load.model('checkout/subscription', this);

				for (let order_product of order_products) {
					// Subscription status set to suspend
					const subscription_info = await this.model_checkout_subscription.getSubscriptionByOrderProductId(order_id, order_product['order_product_id']);

					if (subscription_info.subscription_id) {
						// Add history and set suspended subscription
						await this.model_checkout_subscription.addHistory(subscription_info['subscription_id'], this.config.get('config_subscription_suspended_status_id'));
					}
				}

				// Affiliate remove commission+
				if (order_info['affiliate_id']) {
					this.load.model('account/customer', this);

					await this.model_account_customer.deleteTransactionByOrderId(order_id);
				}
			}

			// Update the DB with the new statuses
			await this.db.query("UPDATE `" + DB_PREFIX + "order` SET `order_status_id` = '" + order_status_id + "', `date_modified` = NOW() WHERE `order_id` = '" + order_id + "'");

			await this.db.query("INSERT INTO `" + DB_PREFIX + "order_history` SET `order_id` = '" + order_id + "', `order_status_id` = '" + order_status_id + "', `notify` = '" + notify + "', `comment` = " + this.db.escape(comment) + ", `date_added` = NOW()");

			await this.cache.delete('product');
		}
	}
}
