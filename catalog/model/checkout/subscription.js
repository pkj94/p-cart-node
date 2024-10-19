module.exports=class SubscriptionModel extends Model {
	/**
	 * @param data
	 *
	 * @return int
	 */
	async addSubscription(data) {
		if (data['trial_status'] && data['trial_duration']) {
			trial_remaining = data['trial_duration'] - 1;
			remaining = data['duration'];
		} else if (data['duration']) {
			trial_remaining = data['trial_duration'];
			remaining = data['duration'] - 1;
		} else {
			trial_remaining = data['trial_duration'];
			remaining = data['duration'];
		}

		if (data['trial_status'] && data['trial_duration']) {
			date_next = date('Y-m-d', strtotime('+' + data['trial_cycle'] + ' ' + data['trial_frequency']));
		} else {
			date_next = date('Y-m-d', strtotime('+' + data['cycle'] + ' ' + data['frequency']));
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription` SET 
			`order_product_id` = '" + data['order_product_id'] + "', 
			`order_id` = '" + data['order_id'] + "',
			`store_id` = '" + data['store_id'] + "', 
			`customer_id` = '" + data['customer_id'] + "', 
			`payment_address_id` = '" + data['payment_address_id'] + "', 
			`payment_method` = " + this.db.escape(data['payment_method'] ? json_encode(data['payment_method']) : '') + ", 
			`shipping_address_id` = '" + data['shipping_address_id'] + "', 
			`shipping_method` = " + this.db.escape(data['shipping_method'] ? json_encode(data['shipping_method']) : '') + ", 
			`product_id` = '" + data['product_id'] + "', 
			`quantity` = '" + data['quantity'] + "', 
			`subscription_plan_id` = '" + data['subscription_plan_id'] + "', 
			`trial_price` = '" + data['trial_price'] + "', 
			`trial_frequency` = " + this.db.escape(data['trial_frequency']) + ", 
			`trial_cycle` = '" + data['trial_cycle'] + "', 
			`trial_duration` = '" + data['trial_duration'] + "', 
			`trial_remaining` = '" + trial_remaining + "', 
			`trial_status` = '" + data['trial_status'] + "', 
			`price` = '" + data['price'] + "', 
			`frequency` = " + this.db.escape(data['frequency']) + ", 
			`cycle` = '" + data['cycle'] + "', 
			`duration` = '" + data['duration'] + "', 
			`remaining` = '" + trial_remaining + "', 
			`date_next` = " + this.db.escape(date_next) + ", 
			`comment` = " + this.db.escape(data['comment']) + ", 
			`affiliate_id` = '" + data['affiliate_id'] + "', 
			`marketing_id` = '" + data['marketing_id'] + "', 
			`tracking` = " + this.db.escape(data['tracking']) + ", 
			`language_id` = '" + data['language_id'] + "', 
			`currency_id` = '" + data['currency_id'] + "', 
			`ip` = " + this.db.escape(data['ip']) + ", 
			`forwarded_ip` = " + this.db.escape(data['forwarded_ip']) + ", 
			`user_agent` = " + this.db.escape(data['user_agent']) + ", 
			`accept_language` = " + this.db.escape(data['accept_language']) + ", 
			`date_added` = NOW(), 
			`date_modified` = NOW()
		");

		return this.db.getLastId();
	}

	/**
	 * @param   subscription_id
	 * @param data
	 *
	 * @return void
	 */
	async editSubscription(subscription_id, data) {
		if (data['trial_status'] && data['trial_duration']) {
			trial_remaining = data['trial_duration'] - 1;
			remaining = data['duration'];
		} else if (data['duration']) {
			trial_remaining = data['trial_duration'];
			remaining = data['duration'] - 1;
		} else {
			trial_remaining = data['trial_duration'];
			remaining = data['duration'];
		}

		if (data['trial_status'] && data['trial_duration']) {
			date_next = date('Y-m-d', strtotime('+' + data['trial_cycle'] + ' ' + data['trial_frequency']));
		} else {
			date_next = date('Y-m-d', strtotime('+' + data['cycle'] + ' ' + data['frequency']));
		}

		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET 
			`order_product_id` = '" + data['order_product_id'] + "', 
			`order_id` = '" + data['order_id'] + "', 
			`store_id` = '" + data['store_id'] + "', 
			`customer_id` = '" + data['customer_id'] + "', 
			`payment_address_id` = '" + data['payment_address_id'] + "', 
			`payment_method` = " + this.db.escape(data['payment_method'] ? json_encode(data['payment_method']) : '') + ", 
			`shipping_address_id` = '" + data['shipping_address_id'] + "', 
			`shipping_method` = " + this.db.escape(data['shipping_method'] ? json_encode(data['shipping_method']) :  '') + ",
			`product_id` = '" + data['product_id'] + "', 
			`subscription_plan_id` = '" + data['subscription_plan_id'] + "', 
			`trial_price` = '" + data['trial_price'] + "', 
			`trial_frequency` = " + this.db.escape(data['trial_frequency']) + ", 
			`trial_cycle` = '" + data['trial_cycle'] + "', 
			`trial_duration` = '" + data['trial_duration'] + "', 
			`trial_remaining` = '" + trial_remaining + "', 
			`trial_status` = '" + data['trial_status'] + "', 
			`price` = '" + data['price'] + "', 
			`frequency` = " + this.db.escape(data['frequency']) + ", 
			`cycle` = '" + data['cycle'] + "', 
			`duration` = '" + data['duration'] + "', 
			`remaining` = '" + remaining + "', 
			`date_next` = " + this.db.escape(date_next) + ", 
			`comment` = " + this.db.escape(data['comment']) + ", 
			`affiliate_id` = '" + data['affiliate_id'] + "', 
			`marketing_id` = '" + data['marketing_id'] + "', 
			`tracking` = " + this.db.escape(data['tracking']) + ", 
			`language_id` = '" + data['language_id'] + "', 
			`currency_id` = '" + data['currency_id'] + "', 
			`ip` = " + this.db.escape(data['ip']) + ", 
			`forwarded_ip` = " + this.db.escape(data['forwarded_ip']) + ", 
			`user_agent` = " + this.db.escape(data['user_agent']) + ", 
			`accept_language` = " + this.db.escape(data['accept_language']) + ", 
			`date_modified` = NOW()
			WHERE `subscription_id` = '" + subscription_id + "'
		");
	}

	/**
	 * @param order_id
	 *
	 * @return void
	 */
	async deleteSubscriptionByOrderId(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription` WHERE `order_id` = '" + order_id + "'");
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscriptionByOrderProductId(order_id, order_product_id) {
		subscription_data = [];

		const query = await this.db.query("SELECT * FROM  `" + DB_PREFIX + "subscription` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		if (query.num_rows) {
			subscription_data = query.row;

			subscription_data['payment_method'] = (query.row['payment_method'] ? JSON.parse(query.row['payment_method'], true) : '');
			subscription_data['shipping_method'] = (query.row['shipping_method'] ? JSON.parse(query.row['shipping_method'], true) : '');
		}

		return subscription_data;
	}

	/**
	 * @param    subscription_id
	 * @param    subscription_status_id
	 * @param string comment
	 * @param bool   notify
	 *
	 * @return void
	 */
	async addHistory(subscription_id, subscription_status_id, comment = '', bool notify = false) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_history` SET `subscription_id` = '" + subscription_id + "', `subscription_status_id` = '" + subscription_status_id + "', `comment` = " + this.db.escape(comment) + ", `notify` = '" + notify + "', `date_added` = NOW()");

		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_status_id` = '" + subscription_status_id + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param  subscription_id
	 * @param bool subscription_status_id
	 *
	 * @return void
	 */
	async editSubscriptionStatus(subscription_id, bool subscription_status_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_status_id` = '" + subscription_status_id + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 * @param trial_remaining
	 *
	 * @return void
	 */
	async editTrialRemaining(subscription_id, trial_remaining) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `trial_remaining` = '" + trial_remaining + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param    subscription_id
	 * @param string date_next
	 *
	 * @return void
	 */
	async editDateNext(subscription_id, date_next) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `date_next` = " + this.db.escape(date_next) + " WHERE `subscription_id` = '" + subscription_id + "'");
	}
}