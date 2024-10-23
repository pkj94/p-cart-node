const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Catalog\Model\Extension\Opencart\Total\Reward'] = class Reward extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		if ((this.session.data['reward'])) {
			await this.load.language('extension/opencart/total/reward', 'reward');

			let points = await this.customer.getRewardPoints();

			if (this.session.data['reward'] <= points) {
				let discount_total = 0;

				let points_total = 0;

				for (let [cart_id,product] of Object.entries(await this.cart.getProducts())) {
					if (product['points']) {
						points_total += product['points'];
					}
				}

				points = Math.min(points, points_total);

				for (let [cart_id,product] of Object.entries(await this.cart.getProducts())) {
					let discount = 0;

					if (product['points']) {
						let discount = product['total'] * (this.session.data['reward'] / points_total);

						if (product['tax_class_id']) {
							const tax_rates = this.tax.getRates(product['total'] - (product['total'] - discount), product['tax_class_id']);

							for (let tax_rate of tax_rates) {
								if (tax_rate['type'] == 'P') {
									taxes[tax_rate['tax_rate_id']] -= tax_rate['amount'];
								}
							}
						}
					}

					discount_total += discount;
				}

				totals.push({
					'extension': 'opencart',
					'code': 'reward',
					'title': sprintf(this.language.get('reward_text_reward'), this.session.data['reward']),
					'value': -discount_total,
					'sort_order': this.config.get('total_reward_sort_order')
				});

				total -= discount_total;
			}
		}
		return { totals, taxes, total }
	}

	/**
	 * @param order_info
	 * @param order_total
	 *
	 * @return int
	 */
	async confirm(order_info, order_total) {
		await this.load.language('extension/opencart/total/reward');

		let points = 0;

		let start = order_total['title'].indexOf('(') + 1;
		let end = order_total['title'].indexOf(')');

		if (start && end) {
			points = order_total['title'].substring(start, end - start);
		}

		this.load.model('account/customer', this);

		if (order_info['customer_id'] && await this.registery.get('model_account_customer').getRewardTotal(order_info['customer_id']) >= points) {
			await this.db.query("INSERT INTO `" + DB_PREFIX + "customer_reward` SET `customer_id` = '" + order_info['customer_id'] + "', `order_id` = '" + order_info['order_id'] + "', `description` = " + this.db.escape(sprintf(this.language.get('text_order_id'), order_info['order_id'])) + ", `points` = '" + - points + "', `date_added` = NOW()");
		} else {
			return this.config.get('config_fraud_status_id');
		}

		return 0;
	}

	/**
	 * @param int order_id
	 *
	 * @return void
	 */
	async unconfirm(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "customer_reward` WHERE `order_id` = '" + order_id + "' AND `points` < '0'");
	}
}
