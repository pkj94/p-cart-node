module.exports = class ModelExtensionTotalCredit extends Model {
	async getTotal(total) {
		await this.load.language('extension/total/credit');

		let balance = await this.customer.getBalance();

		if (balance) {
			let credit = Math.min(balance, total['total']);

			if (credit > 0) {
				total['totals'].push({
					'code': 'credit',
					'title': this.language.get('text_credit'),
					'value': - credit,
					'sort_order': this.config.get('total_credit_sort_order')
				});

				total['total'] -= credit;
			}
		}
		return total;
	}

	async confirm(order_info, order_total) {
		await this.load.language('extension/total/credit');

		if (order_info['customer_id']) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "customer_transaction SET customer_id = '" + order_info['customer_id'] + "', order_id = '" + order_info['order_id'] + "', description = '" + this.db.escape(sprintf(this.language.get('text_order_id'), order_info['order_id'])) + "', amount = '" + order_total['value'] + "', date_added = NOW()");
		}
	}

	async unconfirm(order_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_transaction WHERE order_id = '" + order_id + "'");
	}
}
