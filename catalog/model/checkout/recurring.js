module.exports = class ModelCheckoutRecurring extends Model {
	async addRecurring(order_id, description, data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "order_recurring` SET `order_id` = '" + order_id + "', `date_added` = NOW(), `status` = 6, `product_id` = '" + data['product_id'] + "', `product_name` = '" + this.db.escape(data['name']) + "', `product_quantity` = '" + this.db.escape(data['quantity']) + "', `recurring_id` = '" + data['recurring']['recurring_id'] + "', `recurring_name` = '" + this.db.escape(data['name']) + "', `recurring_description` = '" + this.db.escape(description) + "', `recurring_frequency` = '" + this.db.escape(data['recurring']['frequency']) + "', `recurring_cycle` = '" + data['recurring']['cycle'] + "', `recurring_duration` = '" + data['recurring']['duration'] + "', `recurring_price` = '" + data['recurring']['price'] + "', `trial` = '" + data['recurring']['trial'] + "', `trial_frequency` = '" + this.db.escape(data['recurring']['trial_frequency']) + "', `trial_cycle` = '" + data['recurring']['trial_cycle'] + "', `trial_duration` = '" + data['recurring']['trial_duration'] + "', `trial_price` = '" + data['recurring']['trial_price'] + "', `reference` = ''");

		return this.db.getLastId();
	}

	async editReference(order_recurring_id, reference) {
		await this.db.query("UPDATE " + DB_PREFIX + "order_recurring SET reference = '" + this.db.escape(reference) + "' WHERE order_recurring_id = '" + order_recurring_id + "'");

		if (this.db.countAffected() > 0) {
			return true;
		} else {
			return false;
		}
	}
}
