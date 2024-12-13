module.exports = class ModelExtensionTotalCoupon extends Model {
	async getCoupon(code) {
		let status = true;

		const coupon_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon` WHERE code = '" + this.db.escape(code) + "' AND ((date_start = '0000-00-00' OR date_start < NOW()) AND (date_end = '0000-00-00' OR date_end > NOW())) AND status = '1'");

		if (coupon_query.num_rows) {
			if (coupon_query.row['total'] > await this.cart.getSubTotal()) {
				status = false;
			}

			const coupon_total = await this.getTotalCouponHistoriesByCoupon(code);

			if (coupon_query.row['uses_total'] > 0 && (coupon_total >= coupon_query.row['uses_total'])) {
				status = false;
			}

			if (coupon_query.row['logged'] && !await this.customer.getId()) {
				status = false;
			}

			if (await this.customer.getId()) {
				const customer_total = await this.getTotalCouponHistoriesByCustomerId(code, await this.customer.getId());

				if (coupon_query.row['uses_customer'] > 0 && (customer_total >= coupon_query.row['uses_customer'])) {
					status = false;
				}
			}

			// Products
			const coupon_product_data = [];

			const coupon_product_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon_product` WHERE coupon_id = '" + coupon_query.row['coupon_id'] + "'");

			for (let product of coupon_product_query.rows) {
				coupon_product_data.push(product['product_id']);
			}

			// Categories
			const coupon_category_data = [];

			coupon_category_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon_category` cc LEFT JOIN `" + DB_PREFIX + "category_path` cp ON (cc.category_id = cp.path_id) WHERE cc.coupon_id = '" + coupon_query.row['coupon_id'] + "'");

			for (let category of coupon_category_query.rows) {
				coupon_category_data.push(category['category_id']);
			}

			const product_data = [];

			if (coupon_product_data || coupon_category_data) {
				for (let product of await this.cart.getProducts()) {
					if (coupon_product_data.includes(product['product_id'])) {
						product_data.push(product['product_id']);

						continue;
					}

					for (let category_id of coupon_category_data) {
						const coupon_category_query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "product_to_category` WHERE `product_id` = '" + product['product_id'] + "' AND category_id = '" + category_id + "'");

						if (coupon_category_query.row['total']) {
							product_data.push(product['product_id']);

							continue;
						}
					}
				}

				if (!product_data) {
					status = false;
				}
			}
		} else {
			status = false;
		}

		if (status) {
			return {
				'coupon_id': coupon_query.row['coupon_id'],
				'code': coupon_query.row['code'],
				'name': coupon_query.row['name'],
				'type': coupon_query.row['type'],
				'discount': coupon_query.row['discount'],
				'shipping': coupon_query.row['shipping'],
				'total': coupon_query.row['total'],
				'product': product_data,
				'date_start': coupon_query.row['date_start'],
				'date_end': coupon_query.row['date_end'],
				'uses_total': coupon_query.row['uses_total'],
				'uses_customer': coupon_query.row['uses_customer'],
				'status': coupon_query.row['status'],
				'date_added': coupon_query.row['date_added']
			};
		}
	}

	async getTotal(total) {
		if ((this.session.data['coupon'])) {
			await this.load.language('extension/total/coupon', 'coupon');

			const coupon_info = await this.getCoupon(this.session.data['coupon']);

			if (coupon_info.coupon_id) {
				let discount_total = 0;
				let sub_total = 0;
				if (!coupon_info['product']) {
					sub_total = await this.cart.getSubTotal();
				} else {

					for (let product of await this.cart.getProducts()) {
						if (coupon_info['product'].includes(product['product_id'])) {
							sub_total += product['total'];
						}
					}
				}

				if (coupon_info['type'] == 'F') {
					coupon_info['discount'] = Math.min(coupon_info['discount'], sub_total);
				}

				for (let product of await this.cart.getProducts()) {
					let discount = 0;
					let status = false;
					if (!coupon_info['product']) {
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
							const tax_rates = this.tax.getRates(product['total'] - (product['total'] - discount), product['tax_class_id']);

							for (let tax_rate of tax_rates) {
								if (tax_rate['type'] == 'P') {
									total['taxes'][tax_rate['tax_rate_id']] -= tax_rate['amount'];
								}
							}
						}
					}

					discount_total += discount;
				}

				if (coupon_info['shipping'] && (this.session.data['shipping_method'])) {
					if ((this.session.data['shipping_method']['tax_class_id'])) {
						const tax_rates = await this.tax.getRates(this.session.data['shipping_method']['cost'], this.session.data['shipping_method']['tax_class_id']);

						for (let tax_rate of tax_rates) {
							if (tax_rate['type'] == 'P') {
								total['taxes'][tax_rate['tax_rate_id']] -= tax_rate['amount'];
							}
						}
					}

					discount_total += this.session.data['shipping_method']['cost'];
				}

				// If discount greater than total
				if (discount_total > total['total']) {
					discount_total = total['total'];
				}

				if (discount_total > 0) {
					total['totals'].push({
						'code': 'coupon',
						'title': sprintf(this.language.get('coupon').get('text_coupon'), this.session.data['coupon']),
						'value': - discount_total,
						'sort_order': this.config.get('total_coupon_sort_order')
					});

					total['total'] -= discount_total;
				}
			}
		}
		return total;
	}

	async confirm(order_info, order_total) {
		let code = '';

		let start = order_total['title'].indexOf('(') + 1;
		let end = order_total['title'].indexOf(')');

		if (start && end) {
			code = order_total['title'].substr(start, end - start);
		}

		if (code) {
			let status = true;

			const coupon_query = await this.db.query("SELECT * FROM `" + DB_PREFIX + "coupon` WHERE code = '" + this.db.escape(code) + "' AND status = '1'");

			if (coupon_query.num_rows) {
				const coupon_total = await this.getTotalCouponHistoriesByCoupon(code);

				if (coupon_query.row['uses_total'] > 0 && (coupon_total >= coupon_query.row['uses_total'])) {
					status = false;
				}

				if (order_info['customer_id']) {
					const customer_total = await this.getTotalCouponHistoriesByCustomerId(code, order_info['customer_id']);

					if (coupon_query.row['uses_customer'] > 0 && (customer_total >= coupon_query.row['uses_customer'])) {
						status = false;
					}
				}
			} else {
				status = false;
			}

			if (status) {
				await this.db.query("INSERT INTO `" + DB_PREFIX + "coupon_history` SET coupon_id = '" + coupon_query.row['coupon_id'] + "', order_id = '" + order_info['order_id'] + "', customer_id = '" + order_info['customer_id'] + "', amount = '" + order_total['value'] + "', date_added = NOW()");
			} else {
				return this.config.get('config_fraud_status_id');
			}
		}
	}

	async unconfirm(order_id) {
		await this.db.query("DELETE FROM `" + DB_PREFIX + "coupon_history` WHERE order_id = '" + order_id + "'");
	}

	async getTotalCouponHistoriesByCoupon(coupon) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "coupon` c ON (ch.coupon_id = c.coupon_id) WHERE c.code = '" + this.db.escape(coupon) + "'");

		return query.row['total'];
	}

	async getTotalCouponHistoriesByCustomerId(coupon, customer_id) {
		const query = await this.db.query("SELECT COUNT(*) AS total FROM `" + DB_PREFIX + "coupon_history` ch LEFT JOIN `" + DB_PREFIX + "coupon` c ON (ch.coupon_id = c.coupon_id) WHERE c.code = '" + this.db.escape(coupon) + "' AND ch.customer_id = '" + customer_id + "'");

		return query.row['total'];
	}
}
