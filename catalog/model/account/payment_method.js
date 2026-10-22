module.exports =class PaymentMethod extends global['OpencartSystemEngineModel'] {
	/**
	 * @param data
	 *
	 * @return void
	 */
	async addPaymentMethod(data) {
		await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_payment` SET \n\t\t`customer_id` = " + this.db.quote((await this.customer.getId())) + ", \n\t\t`name` = " + this.db.quote((await this.customer.getId())) + ", \n\t\t`image` = " + this.db.escape(data['image']) + ", \n\t\t`type` = " + this.db.escape(data['type']) + ", \n\t\t`extension` = " + this.db.escape(data['extension']) + ", \n\t\t`code` = " + this.db.escape(data['code']) + ", \n\t\t`token` = " + this.db.escape(data['token']) + ", \n\t\t`date_expire` = " + this.db.escape(data['date_expire']) + ", `default` = " + this.db.quote(data['default']) + ", `status` = '1', `date_added` = NOW()");
	}

	/**
	 * @param customer_payment_id
	 *
	 * @return void
	 */
	async deletePaymentMethod(customer_payment_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_payment` WHERE `customer_id` = " + this.db.quote((await this.customer.getId())) + " AND `customer_payment_id` = " + this.db.quote(customer_payment_id));
	}

	/**
	 * @param customer_id
	 * @param customer_payment_id
	 *
	 * @return array
	 */
	async getPaymentMethod(customer_id, customer_payment_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_payment` WHERE `customer_id` = " + this.db.quote(customer_id) + " AND `customer_payment_id` = " + this.db.quote(customer_payment_id));

		return query.row;
	}

	/**
	 * @param customer_id
	 *
	 * @return array
	 */
	async getPaymentMethods(customer_id) {
		const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "customer_payment` WHERE `customer_id` = " + this.db.quote(customer_id));

		return query.rows;
	}

	/**
	 * @return int
	 */
	async getTotalPaymentMethods() {
		const query = await this.db.query("SELECT COUNT(*) AS `total` FROM `" + DB_PREFIX + "customer_payment` WHERE `customer_id` = " + this.db.quote((await this.customer.getId())));

		return query.row['total'];
	}
}
