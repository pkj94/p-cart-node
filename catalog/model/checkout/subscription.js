const strtotime = require('locutus/php/datetime/strtotime');
module.exports = class Subscription extends global['OpencartSystemEngineModel'] {
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
			date_next = date('Y-m-d', strtotime('+' + data['trial_cycle'] + ' ' + data['trial_frequency']) * 1000);
		} else {
			date_next = date('Y-m-d', strtotime('+' + data['cycle'] + ' ' + data['frequency']) * 1000);
		}

		await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription` SET `order_product_id` = " + this.db.quote(data['order_product_id']) + ", `order_id` = " + this.db.quote(data['order_id']) + ", `store_id` = " + this.db.quote(data['store_id']) + ", `customer_id` = " + this.db.quote(data['customer_id']) + ", `payment_address_id` = " + this.db.quote(data['payment_address_id']) + ", `payment_method` = " + this.db.escape(data['payment_method'] ? JSON.stringify(data['payment_method']) : '') + ", `shipping_address_id` = " + this.db.quote(data['shipping_address_id']) + ", `shipping_method` = " + this.db.escape(data['shipping_method'] ? JSON.stringify(data['shipping_method']) : '') + ", `product_id` = " + this.db.quote(data['product_id']) + ", `quantity` = " + this.db.quote(data['quantity']) + ", `subscription_plan_id` = " + this.db.quote(data['subscription_plan_id']) + ", \t\t\t`trial_price` = " + this.db.quote(data['trial_price']) + ", \t\t\t`trial_frequency` = " + this.db.escape(data['trial_frequency']) + ", \t\t\t`trial_cycle` = " + this.db.quote(data['trial_cycle']) + ", \t\t\t`trial_duration` = " + this.db.quote(data['trial_duration']) + ", \t\t\t`trial_remaining` = " + this.db.quote(trial_remaining) + ", \t\t\t`trial_status` = " + this.db.quote(data['trial_status']) + ", \t\t\t`price` = " + this.db.quote(data['price']) + ", \t\t\t`frequency` = " + this.db.escape(data['frequency']) + ", \t\t\t`cycle` = " + this.db.quote(data['cycle']) + ", \t\t\t`duration` = " + this.db.quote(data['duration']) + ", \t\t\t`remaining` = " + this.db.quote(trial_remaining) + ", \t\t\t`date_next` = " + this.db.escape(date_next) + ", \t\t\t`comment` = " + this.db.escape(data['comment']) + ", \t\t\t`affiliate_id` = " + this.db.quote(data['affiliate_id']) + ", \t\t\t`marketing_id` = " + this.db.quote(data['marketing_id']) + ", \t\t\t`tracking` = " + this.db.escape(data['tracking']) + ", \t\t\t`language_id` = " + this.db.quote(data['language_id']) + ", \t\t\t`currency_id` = " + this.db.quote(data['currency_id']) + ", \t\t\t`ip` = " + this.db.escape(data['ip']) + ", \t\t\t`forwarded_ip` = " + this.db.escape(data['forwarded_ip']) + ", \t\t\t`user_agent` = " + this.db.escape(data['user_agent']) + ", \t\t\t`accept_language` = " + this.db.escape(data['accept_language']) + ", \t\t\t`date_added` = NOW(), \t\t\t`date_modified` = NOW() \t\t");

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
			date_next = date('Y-m-d', strtotime('+' + data['trial_cycle'] + ' ' + data['trial_frequency']) * 1000);
		} else {
			date_next = date('Y-m-d', strtotime('+' + data['cycle'] + ' ' + data['frequency']) * 1000);
		}

		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET  \t\t\t`order_product_id` = " + this.db.quote(data['order_product_id']) + ", \t\t\t`order_id` = " + this.db.quote(data['order_id']) + ", \t\t\t`store_id` = " + this.db.quote(data['store_id']) + ", \t\t\t`customer_id` = " + this.db.quote(data['customer_id']) + ", \t\t\t`payment_address_id` = " + this.db.quote(data['payment_address_id']) + ", \t\t\t`payment_method` = " + this.db.escape(data['payment_method'] ? JSON.stringify(data['payment_method']) : '') + ", \t\t\t`shipping_address_id` = " + this.db.quote(data['shipping_address_id']) + ", \t\t\t`shipping_method` = " + this.db.escape(data['shipping_method'] ? JSON.stringify(data['shipping_method']) : '') + ", \t\t\t`product_id` = " + this.db.quote(data['product_id']) + ", \t\t\t`subscription_plan_id` = " + this.db.quote(data['subscription_plan_id']) + ", \t\t\t`trial_price` = " + this.db.quote(data['trial_price']) + ", \t\t\t`trial_frequency` = " + this.db.escape(data['trial_frequency']) + ", \t\t\t`trial_cycle` = " + this.db.quote(data['trial_cycle']) + ", \t\t\t`trial_duration` = " + this.db.quote(data['trial_duration']) + ", \t\t\t`trial_remaining` = " + this.db.quote(trial_remaining) + ", \t\t\t`trial_status` = " + this.db.quote(data['trial_status']) + ", \t\t\t`price` = " + this.db.quote(data['price']) + ", \t\t\t`frequency` = " + this.db.escape(data['frequency']) + ", \t\t\t`cycle` = " + this.db.quote(data['cycle']) + ", \t\t\t`duration` = " + this.db.quote(data['duration']) + ", \t\t\t`remaining` = " + this.db.quote(remaining) + ", \t\t\t`date_next` = " + this.db.escape(date_next) + ", \t\t\t`comment` = " + this.db.escape(data['comment']) + ", \t\t\t`affiliate_id` = " + this.db.quote(data['affiliate_id']) + ", \t\t\t`marketing_id` = " + this.db.quote(data['marketing_id']) + ", \t\t\t`tracking` = " + this.db.escape(data['tracking']) + ", \t\t\t`language_id` = " + this.db.quote(data['language_id']) + ", \t\t\t`currency_id` = " + this.db.quote(data['currency_id']) + ", \t\t\t`ip` = " + this.db.escape(data['ip']) + ", \t\t\t`forwarded_ip` = " + this.db.escape(data['forwarded_ip']) + ", \t\t\t`user_agent` = " + this.db.escape(data['user_agent']) + ", \t\t\t`accept_language` = " + this.db.escape(data['accept_language']) + ", \t\t\t`date_modified` = NOW() \t\t\tWHERE`subscription_id` = " + this.db.quote(subscription_id) + " \t\t");
	}

	/**
	 * @param order_id
	 *
	 * @return void
	 */
	async deleteSubscriptionByOrderId(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "subscription` WHERE `order_id` = " + this.db.quote(order_id));
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscriptionByOrderProductId(order_id, order_product_id) {
		subscription_data = [];

		const query = await this.db.query("SELECT * FROM  `" + DB_PREFIX + "subscription` WHERE `order_id` = " + this.db.quote(order_id) + " AND `order_product_id` = " + this.db.quote(order_product_id));

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
	async addHistory(subscription_id, subscription_status_id, comment = '', notify = false) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_history` SET `subscription_id` = " + this.db.quote(subscription_id) + ", `subscription_status_id` = " + this.db.quote(subscription_status_id) + ", `comment` = " + this.db.escape(comment) + ", `notify` = " + this.db.quote(notify) + ", `date_added` = NOW()");

		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_status_id` = " + this.db.quote(subscription_status_id) + " WHERE `subscription_id` = " + this.db.quote(subscription_id));
	}

	/**
	 * @param  subscription_id
	 * @param bool subscription_status_id
	 *
	 * @return void
	 */
	async editSubscriptionStatus(subscription_id, subscription_status_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_status_id` = " + this.db.quote(subscription_status_id) + " WHERE `subscription_id` = " + this.db.quote(subscription_id));
	}

	/**
	 * @param subscription_id
	 * @param trial_remaining
	 *
	 * @return void
	 */
	async editTrialRemaining(subscription_id, trial_remaining) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `trial_remaining` = " + this.db.quote(trial_remaining) + " WHERE `subscription_id` = " + this.db.quote(subscription_id));
	}

	/**
	 * @param    subscription_id
	 * @param string date_next
	 *
	 * @return void
	 */
	async editDateNext(subscription_id, date_next) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `date_next` = " + this.db.escape(date_next) + " WHERE `subscription_id` = " + this.db.quote(subscription_id));
	}
}