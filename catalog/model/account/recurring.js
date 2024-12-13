module.exports = class ModelAccountRecurring extends Model {
	async getOrderRecurring(order_recurring_id) {
		const query = await this.db.query("SELECT `or`.*,`o`.`payment_method`,`o`.`payment_code`,`o`.`currency_code` FROM `" + DB_PREFIX + "order_recurring` `or` LEFT JOIN `" + DB_PREFIX + "order` `o` ON `or`.`order_id` = `o`.`order_id` WHERE `or`.`order_recurring_id` = '" + order_recurring_id + "' AND `o`.`customer_id` = '" + await this.customer.getId() + "'");

		return query.row;
	}

	async getOrderRecurrings(start = 0, limit = 20) {
		if (start < 0) {
			start = 0;
		}

		if (limit < 1) {
			limit = 1;
		}

		const query = await this.db.query("SELECT `or`.*,`o`.`payment_method`,`o`.`currency_id`,`o`.`currency_value` FROM `" + DB_PREFIX + "order_recurring` `or` LEFT JOIN `" + DB_PREFIX + "order` `o` ON `or`.`order_id` = `o`.`order_id` WHERE `o`.`customer_id` = '" + await this.customer.getId() + "' ORDER BY `o`.`order_id` DESC LIMIT " + start + "," + limit);

		return query.rows;
	}
	
	async getOrderRecurringByReference(reference) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_recurring` WHERE `reference` = '" + this.db.escape(reference) + "'");

		return query.row;
	}

	async getOrderRecurringTransactions(order_recurring_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "order_recurring_transaction` WHERE `order_recurring_id` = '" + order_recurring_id + "'");

		return query.rows;
	}

	async getTotalOrderRecurrings() {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "order_recurring` `or` LEFT JOIN `" + DB_PREFIX + "order` `o` ON `or`.`order_id` = `o`.`order_id` WHERE `o`.`customer_id` = '" + await this.customer.getId() + "'");

		return query.row['total'];
	}
	
	async addOrderRecurringTransaction(order_recurring_id, type) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring_transaction` SET `order_recurring_id` = '" + order_recurring_id + "', `date_added` = NOW(), `type` = '" + type + "'");
	}	
	
	async editOrderRecurringStatus(order_recurring_id, status) {
		await this.db.query("UPDATE `" + DB_PREFIX + "order_recurring` SET `status` = '" + status + "' WHERE `order_recurring_id` = '" + order_recurring_id + "'");
	}	
}