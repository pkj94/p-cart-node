module.exports = class SubscriptionSaleModel  extends global['\Opencart\System\Engine\Model'] {
	constructor(registry){
		super(registry)
	}
	/**
	 * @param   subscription_id
	 * @param data
	 *
	 * @return void
	 */
	async editSubscription(subscription_id, data) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_plan_id` = '" + data['subscription_plan_id'] + "', `customer_payment_id` = '" + data['customer_payment_id'] + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 * @param customer_payment_id
	 *
	 * @return void
	 */
	async editPaymentMethod(subscription_id, customer_payment_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `customer_payment_id ` = '" + customer_payment_id + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 * @param subscription_plan_id
	 *
	 * @return void
	 */
	async editSubscriptionPlan(subscription_id, subscription_plan_id) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_plan_id` = '" + subscription_plan_id + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 * @param remaining
	 *
	 * @return void
	 */
	async editRemaining(subscription_id, remaining) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `remaining` = '" +  remaining +  "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 * @param trial_remaining
	 *
	 * @return void
	 */
	async editTrialRemaining(subscription_id, trial_remaining) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `trial_remaining` = '" +  trial_remaining +  "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param    subscription_id
	 * @param date_next
	 *
	 * @return void
	 */
	async editDateNext(subscription_id, date_next) {
		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `date_next` = " + this.db.escape(date_next) + " WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 *
	 * @return array
	 */
	async getSubscription(subscription_id) {
		let subscription_data = {};

		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription` WHERE `subscription_id` = '" + subscription_id + "'");

		if (query.num_rows) {
			subscription_data = query.row;

			subscription_data['payment_method'] = (query.row['payment_method'] ? JSON.parse(query.row['payment_method'], true) : '');
			subscription_data['shipping_method'] = (query.row['shipping_method'] ? JSON.parse(query.row['shipping_method'], true) : '');
		}

		return subscription_data;
	}

	/**
	 * @param order_id
	 * @param order_product_id
	 *
	 * @return array
	 */
	async getSubscriptionByOrderProductId(order_id, order_product_id) {
		let query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "subscription` WHERE `order_id` = '" + order_id + "' AND `order_product_id` = '" + order_product_id + "'");

		return query.row;
	}

	/**
	 * @param data
	 *
	 * @return array
	 */
	async getSubscriptions(data) {
		let sql = "SELECT `s`.`subscription_id`, `s`.*, CONCAT(o.`firstname`, ' ', o.`lastname`) AS customer, (SELECT ss.`name` FROM `" + DB_PREFIX + "subscription_status` ss WHERE ss.`subscription_status_id` = s.`subscription_status_id` AND ss.`language_id` = '" + this.config.get('config_language_id') + "') AS subscription_status FROM `" + DB_PREFIX + "subscription` `s` LEFT JOIN `" + DB_PREFIX + "order` `o` ON (`s`.`order_id` = `o`.`order_id`)";

		let implode = [];

		if ((data['filter_subscription_id'])) {
			implode.push("`s`.`subscription_id` = '" + data['filter_subscription_id'] + "'");
		}

		if ((data['filter_order_id'])) {
			implode.push("`s`.`order_id` = '" + data['filter_order_id'] + "'");
		}
		
		if ((data['filter_order_product_id'])) {
			implode.push("`s`.`order_product_id` = '" + data['filter_order_product_id'] + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(o.`firstname`, ' ', o.`lastname`) LIKE " + this.db.escape(data['filter_customer'] + '%') );
		}

		if ((data['filter_date_next'])) {
			implode.push("DATE(`s`.`date_next`) = DATE(" + this.db.escape(data['filter_date_next']) + ")");
		}

		if ((data['filter_subscription_status_id'])) {
			implode.push("`s`.`subscription_status_id` = '" + data['filter_subscription_status_id'] + "'");
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(s.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")");
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(s.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let sort_data = [
			's.subscription_id',
			's.order_id',
			's.reference',
			'customer',
			's.subscription_status',
			's.date_added'
		];

		if (data['sort'] && sort_data.includes(data['sort'],)) {
			sql += " ORDER BY " + data['sort'];
		} else {
			sql += " ORDER BY `s`.`subscription_id`";
		}

		if (data['order'] && (data['order'] == 'DESC')) {
			sql += " DESC";
		} else {
			sql += " ASC";
		}

		if (data['start'] || data['limit']) {
                        data['start'] = data['start']||0;
			if (data['start'] < 0) {
				data['start'] = 0;
			}

			data['limit'] = data['limit']||20;
if (data['limit'] < 1) {
				data['limit'] = 20;
			}

			sql += " LIMIT " + data['start'] + "," + data['limit'];
		}

		let query = await this.db.query(sql);

		return query.rows;
	}

	/**
	 * @param data
	 *
	 * @return int
	 */
	async getTotalSubscriptions(data = {}) {
		let sql = "SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription` `s` LEFT JOIN `" + DB_PREFIX + "order` `o` ON (`s`.`order_id` = o.`order_id`)";

		let implode = [];

		if ((data['filter_subscription_id'])) {
			implode.push("`s`.`subscription_id` = '" + data['filter_subscription_id'] + "'");
		}

		if ((data['filter_order_id'])) {
			implode.push("`s`.`order_id` = '" + data['filter_order_id'] + "'");
		}

		if ((data['filter_customer'])) {
			implode.push("CONCAT(o.`firstname`, ' ', o.`lastname`) LIKE " + this.db.escape(data['filter_customer'] + '%') );
		}

		if ((data['filter_subscription_status_id'])) {
			implode.push("`s`.`subscription_status_id` = '" + data['filter_subscription_status_id'] + "'");
		}

		if ((data['filter_date_from'])) {
			implode.push("DATE(s.`date_added`) >= DATE(" + this.db.escape(data['filter_date_from']) + ")");
		}

		if ((data['filter_date_to'])) {
			implode.push("DATE(s.`date_added`) <= DATE(" + this.db.escape(data['filter_date_to']) + ")");
		}

		if (implode.length) {
			sql += " WHERE " + implode.join(" AND ");
		}

		let query = await this.db.query(sql);

		return query.row['total'];
	}

	/**
	 * @param store_id
	 *
	 * @return int
	 */
	async getTotalSubscriptionsByStoreId(store_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription` WHERE `store_id` = '" + store_id + "'");

		return query.row['total'];
	}

	/**
	 * @param subscription_status_id
	 *
	 * @return int
	 */
	async getTotalSubscriptionsBySubscriptionStatusId(subscription_status_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription` WHERE `subscription_status_id` = '" + subscription_status_id + "'");

		return query.row['total'];
	}

	/**
	 * @param    subscription_id
	 * @param    subscription_status_id
	 * @param comment
	 * @param   notify
	 *
	 * @return void
	 */
	async addHistory(subscription_id, subscription_status_id, comment = '', notify = false) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "subscription_history` SET `subscription_id` = '" + subscription_id + "', `subscription_status_id` = '" + subscription_status_id + "', `comment` = " + this.db.escape(comment) + ", `notify` = '" + notify + "', `date_added` = NOW()");

		await this.db.query("UPDATE `" + DB_PREFIX + "subscription` SET `subscription_status_id` = '" + subscription_status_id + "' WHERE `subscription_id` = '" + subscription_id + "'");
	}

	/**
	 * @param subscription_id
	 * @param start
	 * @param limit
	 *
	 * @return array
	 */
	async getHistories(subscription_id, start = 0, limit = 10) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 10;
		}

		let query = await this.db.query("SELECT sh.`date_added`, ss.`name` AS status, sh.`comment`, sh.`notify` FROM `" + DB_PREFIX + "subscription_history` sh LEFT JOIN `" + DB_PREFIX + "subscription_status` ss ON sh.`subscription_status_id` = ss.`subscription_status_id` WHERE sh.`subscription_id` = '" + subscription_id + "' AND ss.`language_id` = '" + this.config.get('config_language_id') + "' ORDER BY sh.`date_added` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}

	/**
	 * @param subscription_id
	 *
	 * @return int
	 */
	async getTotalHistories(subscription_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription_history` WHERE `subscription_id` = '" + subscription_id + "'");

		return query.row['total'];
	}

	/**
	 * @param subscription_status_id
	 *
	 * @return int
	 */
	async getTotalHistoriesBySubscriptionStatusId(subscription_status_id) {
		let query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "subscription_history` WHERE `subscription_status_id` = '" + subscription_status_id + "'");

		return query.row['total'];
	}
}
