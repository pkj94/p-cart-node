module.exports = class IpModel extends Model {
	/**
	 * @param order_info
	 *
	 * @return int
	 */
	async check(order_info) {
		let status = false;

		if (order_info['customer_id']) {
			this.load.model('account/customer', this);

			const results = await this.registery.get('model_account_customer').getIps(order_info['customer_id']);

			for (let result of results) {
				const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "fraud_ip` WHERE `ip` = " + this.db.escape(result['ip']) );

				if (query.num_rows) {
					status = true;

					break;
				}
			}
		} else {
			const query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "fraud_ip` WHERE `ip` = " + this.db.escape(order_info['ip']) );

			if (query.num_rows) {
				status = true;
			}
		}

		if (status) {
			return this.config.get('fraud_ip_order_status_id');
		} else {
			return 0;
		}
	}
}
