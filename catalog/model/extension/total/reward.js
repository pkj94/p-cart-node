module.exports = class ModelExtensionTotalReward extends Model {
	async getTotal(total) {
		if ((this.session.data['reward'])) {
			await this.load.language('extension/total/reward', 'reward');

			let points = await this.customer.getRewardPoints();

			if (this.session.data['reward'] <= points) {
				let discount_total = 0;

				let points_total = 0;

				for (let product of await this.cart.getProducts()) {
					if (product['points']) {
						points_total += product['points'];
					}
				}

				points = Math.min(points, points_total);

				for (let product of await this.cart.getProducts()) {
					let discount = 0;

					if (product['points']) {
						discount = product['total'] * (this.session.data['reward'] / points_total);

						if (product['tax_class_id']) {
							const tax_rates = await this.tax.getRates(product['total'] - (product['total'] - discount), product['tax_class_id']);

							for (let tax_rate of tax_rates) {
								if (tax_rate['type'] == 'P') {
									total['taxes'][tax_rate['tax_rate_id']] -= tax_rate['amount'];
								}
							}
						}
					}

					discount_total += discount;
				}

				total['totals'].push({
					'code': 'reward',
					'title': sprintf(this.language.get('reward').get('text_reward'), this.session.data['reward']),
					'value': -discount_total,
					'sort_order': this.config.get('total_reward_sort_order')
				});

				total['total'] -= discount_total;
			}
		}
		return total;
	}

	async confirm(order_info, order_total) {
		await this.load.language('extension/total/reward');

		let points = 0;

		let start = order_total['title'].indexOf('(') + 1;
		let end = order_total['title'].indexOf(')');

		if (start && end) {
			points = order_total['title'].substr(start, end - start);
		}

		this.load.model('account/customer', this);

		if (await this.model_account_customer.getRewardTotal(order_info['customer_id']) >= points) {
			await this.db.query("INSERT INTO " + DB_PREFIX + "customer_reward SET customer_id = '" + order_info['customer_id'] + "', order_id = '" + order_info['order_id'] + "', description = '" + this.db.escape(sprintf(this.language.get('text_order_id'), order_info['order_id'])) + "', points = '" + -points + "', date_added = NOW()");
		} else {
			return this.config.get('config_fraud_status_id');
		}
	}

	async unconfirm(order_id) {
		await this.db.query("DELETE FROM " + DB_PREFIX + "customer_reward WHERE order_id = '" + order_id + "' AND points < 0");
	}
}
