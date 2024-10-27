const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Catalog\Model\Extension\Opencart\Total\Credit'] = class Credit extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		await this.load.language('extension/opencart/total/credit');

		let balance = await this.customer.getBalance();

		if (balance) {
			let credit = Math.min(balance, total);

			if (credit > 0) {
				totals.push({
					'extension': 'opencart',
					'code': 'credit',
					'title': this.language.get('text_credit'),
					'value': -credit,
					'sort_order': this.config.get('total_credit_sort_order')
				});

				total = total - credit;
			}
		}
		return { totals, taxes, total }
	}

	/**
	 * @param order_info
	 * @param order_total
	 *
	 * @return void
	 */
	async confirm(order_info, order_total) {
		await this.load.language('extension/opencart/total/credit');

		if (order_info['customer_id']) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_transaction` SET `customer_id` = '" + order_info['customer_id'] + "', `order_id` = '" + order_info['order_id'] + "', `description` = " + this.db.escape(sprintf(this.language.get('text_order_id'), order_info['order_id'])) + ", `amount` = '" + order_total['value'] + "', `date_added` = NOW()");
		}
	}

	/**
	 * @param int order_id
	 *
	 * @return void
	 */
	async unconfirm(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_transaction` WHERE `order_id` = '" + order_id + "'");
	}
}
