const sprintf = require("locutus/php/strings/sprintf");

global['\Opencart\Catalog\Model\Extension\Opencart\Total\Coupon'] = class Coupon extends global['\Opencart\System\Engine\Model'] {
	/**
	 * @param totals
	 * @param taxes
	 * @param float total
	 *
	 * @return void
	 */
	async getTotal(totals, taxes, total) {
		if ((this.session.data['coupon'])) {
			await this.load.language('extension/opencart/total/coupon', 'coupon');

			this.load.model('marketing/coupon', this);

			const coupon_info = await this.model_marketing_coupon.getCoupon(this.session.data['coupon']);
			if (coupon_info.coupon_id) {
				let discount_total = 0;

				let products = await this.cart.getProducts();
				let sub_total = 0;
				if (!coupon_info['product'].length) {
					sub_total = await this.cart.getSubTotal();
				} else {
					sub_total = 0;

					for (let [cart_id, product] of Object.entries(products)) {
						if (coupon_info['product'].includes(product['product_id'])) {
							sub_total += product['total'];
						}
					}
				}

				if (coupon_info['type'] == 'F') {
					coupon_info['discount'] = Math.min(coupon_info.discount, sub_total);
				}

				for (let [cart_id, product] of Object.entries(products)) {
					let discount = 0;
					let status = false;
					if (!coupon_info['product'].length) {
						status = true;
					} else {
						status = coupon_info['product'].includes(product['product_id']);
					}

					if (status) {
						if (coupon_info['type'] == 'F') {
							discount = coupon_info['discount'] * (product['total'] / sub_total);
						} else if (coupon_info['type'] == 'P') {
							discount = product['total'] / 100 * coupon_info['discount'];
						}

						if (product['tax_class_id']) {
							let tax_rates = await this.tax.getRates(product['total'] - (product['total'] - discount), product['tax_class_id']);

							for (let tax_rate of tax_rates) {
								if (tax_rate['type'] == 'P') {
									taxes[tax_rate['tax_rate_id']] -= tax_rate['amount'];
								}
							}
						}
					}

					discount_total += discount;
				}

				if (coupon_info['shipping'] && (this.session.data['shipping_method']['cost']) && (this.session.data['shipping_method']['tax_class_id'])) {
					if (this.session.data['shipping_method']['tax_class_id'].length) {
						let tax_rates = await this.tax.getRates(this.session.data['shipping_method']['cost'], this.session.data['shipping_method']['tax_class_id']);

						for (let tax_rate of tax_rates) {
							if (tax_rate['type'] == 'P') {
								taxes[tax_rate['tax_rate_id']] -= tax_rate['amount'];
							}
						}
					}

					discount_total += this.session.data['shipping_method']['cost'];
				}

				// If discount greater than total
				if (discount_total > total) {
					discount_total = total;
				}

				if (discount_total > 0) {
					totals.push({
						'extension': 'opencart',
						'code': 'coupon',
						'title': sprintf(this.language.get('coupon_text_coupon'), this.session.data['coupon']),
						'value': -discount_total,
						'sort_order': this.config.get('total_coupon_sort_order')
					});

					total = total - discount_total;
				}
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
		let code = '';

		let start = order_total['title'].indexOf('(') + 1;
		let end = order_total['title'].indexOf(')');

		if (start && end) {
			code = order_total['title'].substring(start, end - start);
		}
		let status = false
		if (code) {
			status = true;

			const coupon_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon` WHERE `code` = " + this.db.escape(code) + " AND `status` = '1'");

			if (coupon_query.num_rows) {
				this.load.model('marketing/coupon', this);

				const coupon_total = await this.model_marketing_coupon.getTotalHistoriesByCoupon(code);

				if (coupon_query.row['uses_total'] > 0 && (coupon_total >= coupon_query.row['uses_total'])) {
					status = false;
				}

				if (order_info['customer_id']) {
					const customer_total = await this.model_marketing_coupon.getTotalHistoriesByCustomerId(code, order_info['customer_id']);

					if (coupon_query.row['uses_customer'] > 0 && (customer_total >= coupon_query.row['uses_customer'])) {
						status = false;
					}
				}
			} else {
				status = false;
			}

			if (status) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon_history` SET `coupon_id` = '" + coupon_query.row['coupon_id'] + "', `order_id` = '" + order_info['order_id'] + "', `customer_id` = '" + order_info['customer_id'] + "', `amount` = '" + order_total['value'] + "', `date_added` = NOW()");
			} else {
				return this.config.get('config_fraud_status_id');
			}
		}

		return 0;
	}

	/**
	 * @param int order_id
	 *
	 * @return void
	 */
	async unconfirm(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_history` WHERE `order_id` = '" + order_id + "'");
	}
}
